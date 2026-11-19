import React, { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Play, RotateCcw, Star, XCircle } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import {
  evaluateQuestionAnswer,
  selectQuizQuestions,
  type QuizMode,
} from '../../services/quizEngine';
import type {
  AppLanguage,
  Question,
  QuestionDifficulty,
  UserQuestionAnswer,
} from '../../types/domain';

interface QuizzesViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
  initialChapterId?: string;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  lang,
  certificationId,
  versionId,
  initialChapterId,
}) => {
  const { t } = useTranslation();

  const questions =
    useLiveQuery(() => db.questions.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const objectives =
    useLiveQuery(
      () => db.learningObjectives.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const preferences = useLiveQuery(() => db.questionPreferences.toArray(), []) ?? [];

  const prefMap = useMemo(
    () => new Map(preferences.map((p) => [p.questionId, p])),
    [preferences],
  );

  const [mode, setMode] = useState<QuizMode>(initialChapterId ? 'chapter' : 'free');
  const [chapterId, setChapterId] = useState<string>(initialChapterId ?? '');
  const [objectiveId, setObjectiveId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');

  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserQuestionAnswer>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [sessionFinished, setSessionFinished] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (sessionQuestions.length === 0 || sessionFinished) return;
    const timer = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [sessionQuestions.length, sessionFinished]);

  const startSession = () => {
    const selected = selectQuizQuestions(questions, prefMap, {
      mode,
      chapterId: chapterId || chapters[0]?.id,
      objectiveId: objectiveId || objectives[0]?.id,
      difficulty,
      limit: 12,
    });
    setSessionQuestions(selected);
    setActiveIdx(0);
    setAnswers({});
    setCheckedIds({});
    setSessionFinished(false);
    setElapsedSec(0);
  };

  const currentQuestion = sessionQuestions[activeIdx];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isChecked = currentQuestion ? Boolean(checkedIds[currentQuestion.id]) : false;

  const toggleOption = (q: Question, optionId: string) => {
    if (checkedIds[q.id]) return;
    const prev = answers[q.id];
    const currentSelected = prev?.type === 'options' ? prev.selectedOptionIds : [];

    let nextSelected: string[];
    if (q.type === 'multiple_choice') {
      nextSelected = currentSelected.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...currentSelected, optionId];
    } else {
      nextSelected = [optionId];
    }
    setAnswers((p) => ({ ...p, [q.id]: { type: 'options', selectedOptionIds: nextSelected } }));
  };

  const handleCheckCurrent = async () => {
    if (!currentQuestion) return;
    const ok = evaluateQuestionAnswer(currentQuestion, currentAnswer);
    setCheckedIds((prev) => ({ ...prev, [currentQuestion.id]: true }));

    const existing = prefMap.get(currentQuestion.id);
    await db.questionPreferences.put({
      questionId: currentQuestion.id,
      isFavorite: existing?.isFavorite ?? false,
      timesCorrect: (existing?.timesCorrect ?? 0) + (ok ? 1 : 0),
      timesIncorrect: (existing?.timesIncorrect ?? 0) + (ok ? 0 : 1),
      lastAttemptAt: new Date().toISOString(),
    });
  };

  const handleToggleFavorite = async (qId: string) => {
    const existing = prefMap.get(qId);
    await db.questionPreferences.put({
      questionId: qId,
      isFavorite: !(existing?.isFavorite ?? false),
      timesCorrect: existing?.timesCorrect ?? 0,
      timesIncorrect: existing?.timesIncorrect ?? 0,
      lastAttemptAt: existing?.lastAttemptAt,
    });
  };

  const handleFinishSession = async () => {
    const correctIds: string[] = [];
    const incorrectIds: string[] = [];

    for (const q of sessionQuestions) {
      if (evaluateQuestionAnswer(q, answers[q.id])) {
        correctIds.push(q.id);
      } else {
        incorrectIds.push(q.id);
      }
    }
    const scorePercent =
      sessionQuestions.length > 0
        ? Math.round((correctIds.length / sessionQuestions.length) * 100)
        : 0;

    const now = new Date().toISOString();
    await db.quizAttempts.put({
      id: `quiz-${versionId}-${Date.now()}`,
      certificationId,
      versionId,
      mode,
      questionIds: sessionQuestions.map((q) => q.id),
      answers,
      correctQuestionIds: correctIds,
      incorrectQuestionIds: incorrectIds,
      scorePercent,
      durationSeconds: elapsedSec,
      completedAt: now,
    });
    await db.studySessions.put({
      id: `sess-quiz-${Date.now()}`,
      date: now.slice(0, 10),
      certificationId,
      versionId,
      activityType: 'quiz',
      minutesSpent: Math.max(1, Math.round(elapsedSec / 60)),
      createdAt: now,
    });
    setSessionFinished(true);
  };

  const finishedCorrectCount = sessionQuestions.filter((q) =>
    evaluateQuestionAnswer(q, answers[q.id]),
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('quizzes.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('quizzes.subtitle')}</p>
      </div>

      {/* Configurator when no active session */}
      {sessionQuestions.length === 0 ? (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            {(
              [
                'free',
                'timed',
                'chapter',
                'objective',
                'difficulty',
                'missed',
                'favorites',
                'random',
                'adaptive',
              ] as const
            ).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t(`quizzes.modes.${m}`)}
              </button>
            ))}
          </div>

          {mode === 'chapter' && (
            <select
              value={chapterId || chapters[0]?.id || ''}
              onChange={(e) => setChapterId(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}. {tText(c.title, lang)}
                </option>
              ))}
            </select>
          )}

          {mode === 'objective' && (
            <select
              value={objectiveId || objectives[0]?.id || ''}
              onChange={(e) => setObjectiveId(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm max-w-md"
            >
              {objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} · {tText(o.title, lang)}
                </option>
              ))}
            </select>
          )}

          {mode === 'difficulty' && (
            <div className="flex items-center gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-medium ${
                    difficulty === d
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {t(`quizzes.difficulty.${d}`)}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {questions.length} {t('common.questions')} disponibles
            </span>
            <button
              type="button"
              disabled={questions.length === 0}
              onClick={startSession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.start')}
            </button>
          </div>
        </section>
      ) : sessionFinished ? (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('quizzes.sessionSummary')}
              </h2>
              <p className="text-xs text-slate-500 font-mono tabular-nums mt-1">
                {finishedCorrectCount} / {sessionQuestions.length} ·{' '}
                {Math.round((finishedCorrectCount / sessionQuestions.length) * 100)}% ·{' '}
                {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSessionQuestions([])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('quizzes.restartQuiz')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessionQuestions.map((q, idx) => {
              const ok = evaluateQuestionAnswer(q, answers[q.id]);
              return (
                <div key={q.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    {ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                    <span className="text-slate-900 dark:text-white">
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
      ) : currentQuestion ? (
        <section className="max-w-3xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="font-mono tabular-nums">
              {activeIdx + 1} / {sessionQuestions.length} · {currentQuestion.objectiveId} ·{' '}
              {currentQuestion.kLevel ?? 'K2'} · {t(`quizzes.types.${currentQuestion.type}`)}
            </div>
            <div className="flex items-center gap-3">
              {mode === 'timed' && (
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-sky-700 dark:text-sky-400">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleToggleFavorite(currentQuestion.id)}
                className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 ${
                  prefMap.get(currentQuestion.id)?.isFavorite ? 'text-amber-500' : 'text-slate-400'
                }`}
                aria-label={t('common.favorite')}
              >
                <Star
                  className="h-3.5 w-3.5"
                  fill={prefMap.get(currentQuestion.id)?.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {tText(currentQuestion.stem, lang)}
          </h2>

          {/* Question Type Renderers */}
          {currentQuestion.type === 'calculation' && currentQuestion.numericAnswer ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                disabled={isChecked}
                value={currentAnswer?.type === 'numeric' ? currentAnswer.value : ''}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: { type: 'numeric', value: e.target.value },
                  }))
                }
                placeholder={t('quizzes.numericPlaceholder')}
                className="w-48 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
              />
              {currentQuestion.numericAnswer.unit && (
                <span className="text-xs text-slate-500 font-mono">
                  {currentQuestion.numericAnswer.unit}
                </span>
              )}
            </div>
          ) : currentQuestion.type === 'matching' && currentQuestion.matchingPairs ? (
            <div className="space-y-3">
              {currentQuestion.matchingPairs.map((pair) => {
                const selectedMap =
                  currentAnswer?.type === 'matching' ? currentAnswer.pairs : {};
                return (
                  <div
                    key={pair.id}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      {tText(pair.left, lang)}
                    </div>
                    <select
                      disabled={isChecked}
                      value={selectedMap[pair.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: {
                            type: 'matching',
                            pairs: { ...selectedMap, [pair.id]: e.target.value },
                          },
                        }))
                      }
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="">—</option>
                      {currentQuestion.matchingPairs!.map((target) => (
                        <option key={target.id} value={target.id}>
                          {tText(target.right, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt) => {
                const selectedIds =
                  currentAnswer?.type === 'options' ? currentAnswer.selectedOptionIds : [];
                const isSelected = selectedIds.includes(opt.id);
                const isRightOption = currentQuestion.correctOptionIds.includes(opt.id);

                let style =
                  'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600';
                if (isChecked) {
                  if (isRightOption) {
                    style =
                      'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
                  } else if (isSelected && !isRightOption) {
                    style =
                      'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                  }
                } else if (isSelected) {
                  style =
                    'border-sky-600 bg-sky-50/70 dark:bg-sky-950/50 text-slate-900 dark:text-white';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleOption(currentQuestion, opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors flex items-start gap-3 ${style}`}
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

          {/* Immediate Explanation in Practice Mode */}
          {isChecked && (
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {evaluateQuestionAnswer(currentQuestion, currentAnswer) ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    ✓ {t('quizzes.correctFeedback')}
                  </span>
                ) : (
                  <span className="text-rose-700 dark:text-rose-400">
                    ✕ {t('quizzes.incorrectFeedback')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {tText(currentQuestion.explanation, lang)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSessionQuestions([])}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {t('common.back')}
            </button>

            <div className="flex items-center gap-2.5">
              {!isChecked && (
                <button
                  type="button"
                  onClick={() => void handleCheckCurrent()}
                  className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
                >
                  {t('quizzes.checkAnswer')}
                </button>
              )}
              {activeIdx < sessionQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => i + 1)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  {t('common.next')} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleFinishSession()}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-xs font-medium text-white"
                >
                  {t('quizzes.finishQuiz')}
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
