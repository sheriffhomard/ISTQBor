import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, CheckCircle2, Compass, Flame, Layers, Sparkles } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import { computeReadinessReport } from '../../services/readinessService';
import { isCardDue } from '../../services/fsrsService';
import { evaluateQuestionAnswer } from '../../services/quizEngine';
import type { AppLanguage, Question, UserQuestionAnswer } from '../../types/domain';

interface DashboardViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  certificationId,
  versionId,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const certification = useLiveQuery(() => db.certifications.get(certificationId), [certificationId]);
  const version = useLiveQuery(() => db.syllabusVersions.get(versionId), [versionId]);
  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const lessons =
    useLiveQuery(() => db.lessons.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const lessonProgress =
    useLiveQuery(
      () => db.lessonProgress.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const flashcards =
    useLiveQuery(() => db.flashcards.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const flashcardStates =
    useLiveQuery(
      () => db.flashcardStates.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const questions =
    useLiveQuery(() => db.questions.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const quizAttempts =
    useLiveQuery(
      () => db.quizAttempts.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const examAttempts =
    useLiveQuery(
      () => db.examAttempts.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const studySessions =
    useLiveQuery(
      () => db.studySessions.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const plannedActivities =
    useLiveQuery(
      () => db.plannedActivities.where('planId').equals(`plan-${versionId}`).toArray(),
      [versionId],
    ) ?? [];
  const latestDiagnostic =
    useLiveQuery(
      async () => {
        const list = await db.diagnosticResults.where('versionId').equals(versionId).toArray();
        return list.sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
      },
      [versionId],
    );

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyRecord = useLiveQuery(() => db.dailyChallenges.get(todayStr), [todayStr]);

  // Daily challenge & Initial Diagnostic modal states
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeSelected, setChallengeSelected] = useState<string[]>([]);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [diagOpen, setDiagOpen] = useState(false);
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const [diagIdx, setDiagIdx] = useState(0);

  const readiness = useMemo(
    () =>
      computeReadinessReport({
        chapters,
        lessons,
        lessonProgress,
        flashcards,
        flashcardStates,
        questions,
        quizAttempts,
        examAttempts,
        studySessions,
      }),
    [
      chapters,
      lessons,
      lessonProgress,
      flashcards,
      flashcardStates,
      questions,
      quizAttempts,
      examAttempts,
      studySessions,
    ],
  );

  const dueCardsCount = useMemo(() => {
    const stateMap = new Map(flashcardStates.map((s) => [s.cardId, s]));
    const now = new Date();
    return flashcards.filter((c) => isCardDue(stateMap.get(c.id), now)).length;
  }, [flashcards, flashcardStates]);

  // Deterministic question of the day based on date string
  const dailyQuestion: Question | undefined = useMemo(() => {
    const eligible = questions.filter(
      (q) => q.type === 'single_choice' || q.type === 'scenario' || q.type === 'true_false',
    );
    if (eligible.length === 0) return undefined;
    const seed = todayStr.split('-').reduce((acc, part) => acc + Number(part), 0);
    return eligible[seed % eligible.length];
  }, [questions, todayStr]);

  // Diagnostic sample: 1 question per chapter
  const diagnosticQuestions = useMemo(() => {
    const chosen: Question[] = [];
    for (const ch of chapters) {
      const q = questions.find(
        (item) =>
          item.chapterId === ch.id &&
          (item.type === 'single_choice' || item.type === 'true_false' || item.type === 'scenario'),
      );
      if (q) chosen.push(q);
    }
    return chosen;
  }, [chapters, questions]);

  // 14-day activity chart from real studySessions
  const activitySeries = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const s of studySessions) {
      byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.minutesSpent);
    }
    const rows: Array<{ day: string; minutes: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      rows.push({
        day: iso.slice(5),
        minutes: byDate.get(iso) ?? 0,
      });
    }
    return rows;
  }, [studySessions]);

  const upcomingTasks = useMemo(
    () =>
      plannedActivities
        .filter((a) => !a.completed)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [plannedActivities],
  );

  const handleSubmitDaily = async () => {
    if (!dailyQuestion || challengeSelected.length === 0) return;
    const ans: UserQuestionAnswer = { type: 'options', selectedOptionIds: challengeSelected };
    const isCorrect = evaluateQuestionAnswer(dailyQuestion, ans);
    setChallengeFeedback(isCorrect ? 'correct' : 'wrong');
    await db.dailyChallenges.put({
      date: todayStr,
      questionId: dailyQuestion.id,
      answeredCorrectly: isCorrect,
      completedAt: new Date().toISOString(),
    });
    await db.studySessions.put({
      id: `sess-daily-${todayStr}`,
      date: todayStr,
      certificationId,
      versionId,
      activityType: 'quiz',
      minutesSpent: 2,
      createdAt: new Date().toISOString(),
    });
  };

  const handleFinishDiagnostic = async () => {
    if (diagnosticQuestions.length === 0) return;
    let correct = 0;
    const weakChapters: string[] = [];
    const correctIds: string[] = [];
    const incorrectIds: string[] = [];
    const formattedAnswers: Record<string, UserQuestionAnswer> = {};

    for (const q of diagnosticQuestions) {
      const selected = diagAnswers[q.id];
      const ans: UserQuestionAnswer = {
        type: 'options',
        selectedOptionIds: selected ? [selected] : [],
      };
      formattedAnswers[q.id] = ans;
      if (evaluateQuestionAnswer(q, ans)) {
        correct++;
        correctIds.push(q.id);
      } else {
        incorrectIds.push(q.id);
        weakChapters.push(q.chapterId);
      }
    }

    const percent = Math.round((correct / diagnosticQuestions.length) * 100);
    const now = new Date().toISOString();

    await db.transaction(
      'rw',
      [db.diagnosticResults, db.quizAttempts, db.studySessions],
      async () => {
        await db.diagnosticResults.put({
          id: `diag-${Date.now()}`,
          certificationId,
          versionId,
          completedAt: now,
          overallPercent: percent,
          weakChapterIds: weakChapters,
          recommendedAction:
            weakChapters.length > 0
              ? {
                  fr: `Priorisez les chapitres avec lacunes (${weakChapters.length} chapitre(s) à revoir).`,
                  en: `Prioritize chapters with identified gaps (${weakChapters.length} chapter(s) to review).`,
                }
              : {
                  fr: 'Excellente base initiale : passez aux flashcards FSRS et à un examen blanc.',
                  en: 'Strong baseline: move to FSRS flashcards and a full mock exam.',
                },
        });
        await db.quizAttempts.put({
          id: `quiz-diag-${Date.now()}`,
          certificationId,
          versionId,
          mode: 'diagnostic',
          questionIds: diagnosticQuestions.map((q) => q.id),
          answers: formattedAnswers,
          correctQuestionIds: correctIds,
          incorrectQuestionIds: incorrectIds,
          scorePercent: percent,
          durationSeconds: diagnosticQuestions.length * 45,
          completedAt: now,
        });
        await db.studySessions.put({
          id: `sess-diag-${Date.now()}`,
          date: todayStr,
          certificationId,
          versionId,
          activityType: 'quiz',
          minutesSpent: 5,
          createdAt: now,
        });
      },
    );

    setDiagOpen(false);
    setDiagIdx(0);
    setDiagAnswers({});
  };

  return (
    <div className="space-y-8">
      {/* Header & Active Certification Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            {certification?.code ?? 'CTFL'} · {version?.versionNumber ?? 'v4.0'} ·{' '}
            {t(`status.${version?.status ?? 'active'}`)}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('certifications')}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            {t('dashboard.changeCertification')}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:bg-[#13294B] dark:hover:bg-sky-500 transition-colors whitespace-nowrap"
          >
            {t('exams.startNewExam')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* KPI Strip (Single-Elevation Cards with tabular-nums) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('dashboard.cardsDue')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {dueCardsCount}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('flashcards')}
              className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              {t('common.start')} →
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {readiness.cardsMastered} / {readiness.totalCards} {t('flashcards.masteredCards').toLowerCase()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('dashboard.lessonsDone')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {readiness.lessonsCompleted}/{readiness.totalLessons}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('syllabus')}
              className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              {t('nav.syllabus')} →
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tText(certification?.name, lang)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('dashboard.avgQuizScore')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {readiness.averageQuizPercent !== null ? `${readiness.averageQuizPercent}%` : '—'}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('quizzes')}
              className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              {t('nav.quizzes')} →
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {quizAttempts.length} {lang === 'fr' ? 'session(s) enregistrée(s)' : 'recorded session(s)'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('dashboard.studyStreak')}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <Flame className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {readiness.studyStreakDays}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.days')}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {readiness.totalStudyMinutes} {t('common.minutes')} · {t('dashboard.studyMinutes').toLowerCase()}
          </p>
        </div>
      </div>

      {/* Readiness Index + Daily Challenge / Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('dashboard.readinessIndex')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('dashboard.readinessExplainTitle')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold font-mono tabular-nums text-[#0B192C] dark:text-sky-400">
                {readiness.overallIndex !== null ? `${readiness.overallIndex}/100` : '—'}
              </div>
            </div>
          </div>

          {!readiness.hasRecordedActivity ? (
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              {t('dashboard.readinessNoActivity')}
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {readiness.factors.map((factor) => {
                const labelMap = {
                  syllabus: t('dashboard.factorSyllabus'),
                  fsrs: t('dashboard.factorFsrs'),
                  quiz: t('dashboard.factorQuiz'),
                  exam: t('dashboard.factorExam'),
                };
                const pct = factor.score ?? 0;
                return (
                  <div
                    key={factor.key}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {labelMap[factor.key]} ({Math.round(factor.weight * 100)}%)
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {factor.score !== null ? `${factor.score}%` : '—'}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-sky-600 dark:bg-sky-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 14-day Activity Chart */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {t('dashboard.recentActivity')}
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activitySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" width={32} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Side Column: Daily Challenge & Initial Diagnostic */}
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>{t('dashboard.dailyChallenge')}</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {todayStr} · {certification?.code}
            </p>
            {dailyRecord ? (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {t('dashboard.dailyChallengeDone')} (
                  {dailyRecord.answeredCorrectly
                    ? lang === 'fr'
                      ? 'Réussi'
                      : 'Correct'
                    : lang === 'fr'
                      ? 'À revoir'
                      : 'Needs review'}
                  )
                </span>
              </div>
            ) : (
              <button
                type="button"
                disabled={!dailyQuestion}
                onClick={() => {
                  setChallengeSelected([]);
                  setChallengeFeedback(null);
                  setChallengeOpen(true);
                }}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {t('dashboard.dailyChallengeStart')}
              </button>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Compass className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>{t('dashboard.diagnosticTitle')}</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {t('dashboard.diagnosticDesc')}
            </p>
            {latestDiagnostic && (
              <p className="mt-2 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {lang === 'fr' ? 'Dernier score' : 'Latest score'}: {latestDiagnostic.overallPercent}%
              </p>
            )}
            <button
              type="button"
              disabled={diagnosticQuestions.length === 0}
              onClick={() => {
                setDiagIdx(0);
                setDiagAnswers({});
                setDiagOpen(true);
              }}
              className="mt-4 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              {t('dashboard.diagnosticStart')}
            </button>
          </section>

          {/* Upcoming Planner */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>{t('dashboard.upcomingTasks')}</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline"
              >
                {t('nav.planner')}
              </button>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t('dashboard.noTasksYet')}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="text-xs flex items-center justify-between gap-2 py-1.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                  >
                    <span className="truncate text-slate-800 dark:text-slate-200">
                      {tText(task.title, lang)}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 shrink-0">
                      {task.date.slice(5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Weaknesses Section */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('dashboard.weakObjectives')}
        </h2>
        {readiness.chapterWeaknesses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.noWeaknessesYet')}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {readiness.chapterWeaknesses.slice(0, 3).map((w) => (
              <div
                key={w.chapterId}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {lang === 'fr' ? `Chapitre ${w.chapterCode}` : `Chapter ${w.chapterCode}`}
                  </span>
                  <span className="font-mono tabular-nums">{w.attemptsCount} q.</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {tText(w.title, lang)}
                </div>
                <div className="mt-2 text-xl font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
                  {w.accuracyPercent}%
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily Challenge Modal */}
      {challengeOpen && dailyQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
              {dailyQuestion.objectiveId} · {dailyQuestion.kLevel}
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
              {tText(dailyQuestion.stem, lang)}
            </h3>
            <div className="mt-4 space-y-2">
              {dailyQuestion.options.map((opt) => {
                const active = challengeSelected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChallengeSelected([opt.id])}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      active
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tText(opt.text, lang)}
                  </button>
                );
              })}
            </div>

            {challengeFeedback && (
              <div className="mt-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200">
                <p className="font-semibold mb-1">
                  {challengeFeedback === 'correct'
                    ? t('quizzes.correctFeedback')
                    : t('quizzes.incorrectFeedback')}
                </p>
                <p>{tText(dailyQuestion.explanation, lang)}</p>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setChallengeOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {t('app.close')}
              </button>
              {!challengeFeedback && (
                <button
                  type="button"
                  onClick={() => void handleSubmitDaily()}
                  className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
                >
                  {t('common.submit')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Initial Diagnostic Modal */}
      {diagOpen && diagnosticQuestions[diagIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span>{t('dashboard.diagnosticTitle')}</span>
              <span>
                {diagIdx + 1} / {diagnosticQuestions.length}
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              {tText(diagnosticQuestions[diagIdx]!.stem, lang)}
            </h3>
            <div className="mt-4 space-y-2">
              {diagnosticQuestions[diagIdx]!.options.map((opt) => {
                const selected = diagAnswers[diagnosticQuestions[diagIdx]!.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDiagAnswers((prev) => ({
                        ...prev,
                        [diagnosticQuestions[diagIdx]!.id]: opt.id,
                      }))
                    }
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      selected
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tText(opt.text, lang)}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() => setDiagOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {t('common.cancel')}
              </button>
              {diagIdx < diagnosticQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setDiagIdx((i) => i + 1)}
                  className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
                >
                  {t('common.next')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleFinishDiagnostic()}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-xs font-medium text-white"
                >
                  {t('common.finish')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
