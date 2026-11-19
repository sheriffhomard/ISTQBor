import React, { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Flag, Play, Printer, RotateCcw, XCircle } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import { createExamAttempt, gradeExamAttempt } from '../../services/examEngine';
import { evaluateQuestionAnswer } from '../../services/quizEngine';
import type { AppLanguage, ExamAttempt, UserQuestionAnswer } from '../../types/domain';

interface ExamsViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ lang, versionId }) => {
  const { t } = useTranslation();

  const version = useLiveQuery(() => db.syllabusVersions.get(versionId), [versionId]);
  const questions =
    useLiveQuery(() => db.questions.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const attempts =
    useLiveQuery(
      async () => {
        const list = await db.examAttempts.where('versionId').equals(versionId).toArray();
        return list.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
      },
      [versionId],
    ) ?? [];

  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');
  const completedAttempts = attempts.filter((a) => a.status === 'completed');

  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [inspectAttemptId, setInspectAttemptId] = useState<string | null>(null);

  const [requestedCount, setRequestedCount] = useState<number>(40);
  const [requestedMinutes, setRequestedMinutes] = useState<number>(60);
  const [nonNativeExtra, setNonNativeExtra] = useState<boolean>(false);

  useEffect(() => {
    if (!version) return;
    const defaultCount = Math.min(
      version.examConfig.questionCount ?? 20,
      Math.max(1, questions.length),
    );
    setRequestedCount(defaultCount);
    setRequestedMinutes(version.examConfig.durationMinutes ?? 45);
  }, [version, questions.length]);

  const activeAttempt = attempts.find((a) => a.id === activeAttemptId);
  const inspectedAttempt = attempts.find((a) => a.id === inspectAttemptId);

  const questionsById = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions],
  );
  const chaptersById = useMemo(
    () => new Map(chapters.map((c) => [c.id, c])),
    [chapters],
  );

  // Continuous timer + periodic auto-save in IndexedDB
  useEffect(() => {
    if (!activeAttempt || activeAttempt.status !== 'in_progress') return;
    const timer = window.setInterval(() => {
      const nextElapsed = activeAttempt.elapsedSeconds + 1;
      void db.examAttempts.update(activeAttempt.id, {
        elapsedSeconds: nextElapsed,
        updatedAt: new Date().toISOString(),
      });
      if (nextElapsed >= activeAttempt.durationLimitSeconds) {
        void submitAttempt(activeAttempt);
      }
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttempt?.id, activeAttempt?.elapsedSeconds, activeAttempt?.status]);

  const handleStartExam = async () => {
    if (!version || questions.length === 0) return;
    const newAttempt = createExamAttempt({
      version,
      questions,
      requestedCount: Math.min(requestedCount, questions.length),
      requestedMinutes,
      nonNativeExtraTime: nonNativeExtra,
    });
    await db.examAttempts.put(newAttempt);
    setInspectAttemptId(null);
    setActiveAttemptId(newAttempt.id);
  };

  const updateAnswer = async (
    attempt: ExamAttempt,
    questionId: string,
    answer: UserQuestionAnswer,
  ) => {
    const nextAnswers = { ...attempt.answers, [questionId]: answer };
    await db.examAttempts.update(attempt.id, {
      answers: nextAnswers,
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleFlag = async (attempt: ExamAttempt, questionId: string) => {
    const exists = attempt.flaggedIds.includes(questionId);
    const nextFlagged = exists
      ? attempt.flaggedIds.filter((id) => id !== questionId)
      : [...attempt.flaggedIds, questionId];
    await db.examAttempts.update(attempt.id, {
      flaggedIds: nextFlagged,
      updatedAt: new Date().toISOString(),
    });
  };

  const setCurrentIndex = async (attempt: ExamAttempt, idx: number) => {
    await db.examAttempts.update(attempt.id, {
      currentIndex: idx,
      updatedAt: new Date().toISOString(),
    });
  };

  const submitAttempt = async (attempt: ExamAttempt) => {
    const scoreResult = gradeExamAttempt(attempt, questionsById, chaptersById);
    const now = new Date().toISOString();
    await db.transaction('rw', [db.examAttempts, db.studySessions], async () => {
      await db.examAttempts.update(attempt.id, {
        status: 'completed',
        completedAt: now,
        updatedAt: now,
        scoreResult,
      });
      await db.studySessions.put({
        id: `sess-exam-${attempt.id}`,
        date: now.slice(0, 10),
        certificationId: attempt.certificationId,
        versionId: attempt.versionId,
        activityType: 'exam',
        minutesSpent: Math.max(1, Math.round(attempt.elapsedSeconds / 60)),
        createdAt: now,
      });
    });
    setActiveAttemptId(null);
    setInspectAttemptId(attempt.id);
  };

  // Active Exam Runner UI
  if (activeAttempt && activeAttempt.status === 'in_progress') {
    const qId = activeAttempt.questionIds[activeAttempt.currentIndex];
    const q = qId ? questionsById.get(qId) : undefined;
    const ans = qId ? activeAttempt.answers[qId] : undefined;
    const remainingSec = Math.max(0, activeAttempt.durationLimitSeconds - activeAttempt.elapsedSeconds);
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const isFlagged = qId ? activeAttempt.flaggedIds.includes(qId) : false;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
              {activeAttempt.title} ·{' '}
              {activeAttempt.isOfficialDistributionUsed
                ? t('exams.officialDistributionUsed')
                : t('exams.customDistributionNotice')}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Question {activeAttempt.currentIndex + 1} / {activeAttempt.questionIds.length}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              aria-live="polite"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white"
            >
              <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => setActiveAttemptId(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => void submitAttempt(activeAttempt)}
              className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
            >
              {t('exams.submitExam')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question Stage */}
          {q && (
            <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">
                  {q.objectiveId} · {q.kLevel ?? 'K2'}
                </span>
                <button
                  type="button"
                  onClick={() => void toggleFlag(activeAttempt, q.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${
                    isFlagged
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                  {isFlagged ? t('exams.unflagQuestion') : t('exams.flagQuestion')}
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                {tText(q.stem, lang)}
              </h2>

              {q.type === 'calculation' && q.numericAnswer ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ans?.type === 'numeric' ? ans.value : ''}
                    onChange={(e) =>
                      void updateAnswer(activeAttempt, q.id, {
                        type: 'numeric',
                        value: e.target.value,
                      })
                    }
                    placeholder={t('quizzes.numericPlaceholder')}
                    className="w-48 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
                  />
                  {q.numericAnswer.unit && (
                    <span className="text-xs font-mono text-slate-500">{q.numericAnswer.unit}</span>
                  )}
                </div>
              ) : q.type === 'matching' && q.matchingPairs ? (
                <div className="space-y-2.5">
                  {q.matchingPairs.map((pair) => {
                    const pairsMap = ans?.type === 'matching' ? ans.pairs : {};
                    return (
                      <div
                        key={pair.id}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        <div className="text-xs font-medium">{tText(pair.left, lang)}</div>
                        <select
                          value={pairsMap[pair.id] ?? ''}
                          onChange={(e) =>
                            void updateAnswer(activeAttempt, q.id, {
                              type: 'matching',
                              pairs: { ...pairsMap, [pair.id]: e.target.value },
                            })
                          }
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="">—</option>
                          {q.matchingPairs!.map((tgt) => (
                            <option key={tgt.id} value={tgt.id}>
                              {tText(tgt.right, lang)}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const selected = ans?.type === 'options' ? ans.selectedOptionIds : [];
                    const isSelected = selected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const next =
                            q.type === 'multiple_choice'
                              ? isSelected
                                ? selected.filter((i) => i !== opt.id)
                                : [...selected, opt.id]
                              : [opt.id];
                          void updateAnswer(activeAttempt, q.id, {
                            type: 'options',
                            selectedOptionIds: next,
                          });
                        }}
                        className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors flex items-start gap-3 ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/50 text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-mono text-xs uppercase font-semibold opacity-70 mt-0.5">
                          {opt.id}
                        </span>
                        <span>{tText(opt.text, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={activeAttempt.currentIndex === 0}
                  onClick={() =>
                    void setCurrentIndex(activeAttempt, Math.max(0, activeAttempt.currentIndex - 1))
                  }
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium disabled:opacity-40"
                >
                  ← {t('common.previous')}
                </button>
                <button
                  type="button"
                  disabled={activeAttempt.currentIndex >= activeAttempt.questionIds.length - 1}
                  onClick={() =>
                    void setCurrentIndex(
                      activeAttempt,
                      Math.min(
                        activeAttempt.questionIds.length - 1,
                        activeAttempt.currentIndex + 1,
                      ),
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white disabled:opacity-40"
                >
                  {t('common.next')} →
                </button>
              </div>
            </div>
          )}

          {/* Question Navigator Grid */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('exams.questionNavigator')}
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2">
              {activeAttempt.questionIds.map((id, idx) => {
                const answered = Boolean(activeAttempt.answers[id]);
                const flagged = activeAttempt.flaggedIds.includes(id);
                const current = idx === activeAttempt.currentIndex;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => void setCurrentIndex(activeAttempt, idx)}
                    className={`h-9 rounded-lg border text-xs font-mono tabular-nums font-medium relative ${
                      current
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : flagged
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100'
                          : answered
                            ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Detailed Post-Exam Report View
  if (inspectedAttempt && inspectedAttempt.scoreResult) {
    const res = inspectedAttempt.scoreResult;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {inspectedAttempt.title} — {res.scorePercent}%
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono tabular-nums">
              {res.correctCount} / {res.totalQuestions} ·{' '}
              {res.passed === true
                ? t('exams.passed')
                : res.passed === false
                  ? t('exams.failed')
                  : t('exams.notEvaluated')}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              {t('exams.exportPdfReport')}
            </button>
            <button
              type="button"
              onClick={() => setInspectAttemptId(null)}
              className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
            >
              {t('common.back')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('exams.breakdownByChapter')}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {res.byChapter.map((ch) => (
                <div key={ch.chapterId} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">
                    {ch.chapterCode}. {tText(ch.title, lang)}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {ch.correct}/{ch.total} ({Math.round((ch.correct / ch.total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('exams.breakdownByKLevel')}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {res.byKLevel.map((k) => (
                <div key={k.kLevel} className="py-2.5 flex items-center justify-between">
                  <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                    {k.kLevel}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {k.correct}/{k.total} ({Math.round((k.correct / k.total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t('exams.reviewAnswers')}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {inspectedAttempt.questionIds.map((qId, idx) => {
              const q = questionsById.get(qId);
              if (!q) return null;
              const ok = evaluateQuestionAnswer(q, inspectedAttempt.answers[qId]);
              return (
                <div key={qId} className="py-4 text-xs space-y-1.5">
                  <div className="flex items-start gap-2 font-semibold text-slate-900 dark:text-white">
                    {ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>
                      {idx + 1}. {tText(q.stem, lang)}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 pl-6">
                    {tText(q.explanation, lang)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Lobby / Configurator View
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('exams.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('exams.subtitle')}</p>
      </div>

      {inProgressAttempt && (
        <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('exams.resumePrompt')}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums mt-0.5">
              {inProgressAttempt.title} · Question {inProgressAttempt.currentIndex + 1}/
              {inProgressAttempt.questionIds.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveAttemptId(inProgressAttempt.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('common.resume')}
          </button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          {version?.examConfig.hasOfficialDistribution
            ? t('exams.officialDistributionUsed')
            : t('exams.customDistributionNotice')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('exams.questionCountLabel')} (max {questions.length})
            <input
              type="number"
              min={1}
              max={Math.max(1, questions.length)}
              value={requestedCount}
              onChange={(e) => setRequestedCount(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
            />
          </label>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('exams.durationLabel')}
            <input
              type="number"
              min={5}
              max={180}
              value={requestedMinutes}
              onChange={(e) => setRequestedMinutes(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
            />
          </label>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={nonNativeExtra}
            onChange={(e) => setNonNativeExtra(e.target.checked)}
            className="rounded border-slate-300 accent-sky-600"
          />
          <span>{t('exams.nonNativeRule')}</span>
        </label>

        <button
          type="button"
          disabled={questions.length === 0}
          onClick={() => void handleStartExam()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          {t('exams.startNewExam')}
        </button>
      </section>

      {/* History Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          {t('exams.historyTitle')}
        </h2>
        {completedAttempts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.noResults')}</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {completedAttempts.map((att) => (
              <div
                key={att.id}
                className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{att.title}</div>
                  <div className="text-slate-500 font-mono tabular-nums">
                    {att.completedAt?.slice(0, 10)} · {att.scoreResult?.correctCount}/
                    {att.scoreResult?.totalQuestions}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
                    {att.scoreResult?.scorePercent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectAttemptId(att.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t('exams.reviewAnswers')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
