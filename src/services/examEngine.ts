import type {
  Chapter,
  ExamAttempt,
  ExamScoreBreakdown,
  Question,
  SyllabusVersion,
  UserQuestionAnswer,
} from '../types/domain';
import { evaluateQuestionAnswer } from './quizEngine';

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function buildMockExamQuestions(
  version: SyllabusVersion,
  questions: Question[],
  requestedCount?: number,
): { selectedQuestions: Question[]; usedOfficialDistribution: boolean } {
  const examConfig = version.examConfig;
  const targetCount = requestedCount ?? examConfig.questionCount ?? Math.min(20, questions.length);

  if (
    examConfig.hasOfficialDistribution &&
    examConfig.chapterQuestionDistribution &&
    targetCount === examConfig.questionCount
  ) {
    const selected: Question[] = [];
    const usedIds = new Set<string>();

    for (const [chapterId, quota] of Object.entries(examConfig.chapterQuestionDistribution)) {
      const chapterPool = shuffleArray(questions.filter((q) => q.chapterId === chapterId));
      for (const q of chapterPool.slice(0, quota)) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }

    if (selected.length < targetCount) {
      const remaining = shuffleArray(questions.filter((q) => !usedIds.has(q.id)));
      selected.push(...remaining.slice(0, targetCount - selected.length));
    }

    return {
      selectedQuestions: shuffleArray(selected),
      usedOfficialDistribution: selected.length === targetCount,
    };
  }

  const shuffled = shuffleArray(questions);
  return {
    selectedQuestions: shuffled.slice(0, Math.min(targetCount, shuffled.length)),
    usedOfficialDistribution: false,
  };
}

export function createExamAttempt(params: {
  version: SyllabusVersion;
  questions: Question[];
  requestedCount?: number;
  requestedMinutes?: number;
  nonNativeExtraTime?: boolean;
}): ExamAttempt {
  const { version, questions, requestedCount, requestedMinutes, nonNativeExtraTime } = params;
  const { selectedQuestions, usedOfficialDistribution } = buildMockExamQuestions(
    version,
    questions,
    requestedCount,
  );

  const baseMinutes = requestedMinutes ?? version.examConfig.durationMinutes ?? 45;
  const extraFactor =
    nonNativeExtraTime && version.examConfig.nonNativeExtraPercent
      ? 1 + version.examConfig.nonNativeExtraPercent / 100
      : 1;
  const durationLimitSeconds = Math.round(baseMinutes * extraFactor * 60);

  const now = new Date().toISOString();
  return {
    id: `exam-${version.id}-${Date.now()}`,
    certificationId: version.certificationId,
    versionId: version.id,
    title: `${version.versionNumber} Mock Exam`,
    isOfficialDistributionUsed: usedOfficialDistribution,
    durationLimitSeconds,
    passingThresholdPercent: version.examConfig.isVerified
      ? version.examConfig.passingScorePercent
      : null,
    questionIds: selectedQuestions.map((q) => q.id),
    answers: {},
    flaggedIds: [],
    currentIndex: 0,
    elapsedSeconds: 0,
    status: 'in_progress',
    startedAt: now,
    updatedAt: now,
  };
}

export function gradeExamAttempt(
  attempt: ExamAttempt,
  questionsById: Map<string, Question>,
  chaptersById: Map<string, Chapter>,
  answersOverride?: Record<string, UserQuestionAnswer>,
): ExamScoreBreakdown {
  const answers = answersOverride ?? attempt.answers;
  let answeredCount = 0;
  let correctCount = 0;

  const chapterStats = new Map<string, { total: number; correct: number }>();
  const kLevelStats = new Map<string, { total: number; correct: number }>();

  for (const qId of attempt.questionIds) {
    const q = questionsById.get(qId);
    if (!q) continue;

    const ans = answers[qId];
    if (ans) {
      if (
        (ans.type === 'options' && ans.selectedOptionIds.length > 0) ||
        (ans.type === 'numeric' && ans.value.trim().length > 0) ||
        (ans.type === 'matching' && Object.keys(ans.pairs).length > 0)
      ) {
        answeredCount++;
      }
    }

    const isCorrect = evaluateQuestionAnswer(q, ans);
    if (isCorrect) correctCount++;

    const chStat = chapterStats.get(q.chapterId) ?? { total: 0, correct: 0 };
    chStat.total += 1;
    if (isCorrect) chStat.correct += 1;
    chapterStats.set(q.chapterId, chStat);

    const kKey = q.kLevel ?? 'N/A';
    const kStat = kLevelStats.get(kKey) ?? { total: 0, correct: 0 };
    kStat.total += 1;
    if (isCorrect) kStat.correct += 1;
    kLevelStats.set(kKey, kStat);
  }

  const totalQuestions = attempt.questionIds.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed =
    attempt.passingThresholdPercent !== null
      ? scorePercent >= attempt.passingThresholdPercent
      : null;

  const byChapter = Array.from(chapterStats.entries()).map(([chapterId, stat]) => {
    const chapter = chaptersById.get(chapterId);
    return {
      chapterId,
      chapterCode: chapter?.code ?? chapterId,
      title: chapter?.title ?? { fr: chapterId, en: chapterId },
      total: stat.total,
      correct: stat.correct,
    };
  });
  byChapter.sort((a, b) => a.chapterCode.localeCompare(b.chapterCode));

  const byKLevel = Array.from(kLevelStats.entries())
    .map(([kLevel, stat]) => ({ kLevel, total: stat.total, correct: stat.correct }))
    .sort((a, b) => a.kLevel.localeCompare(b.kLevel));

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    earnedPoints: correctCount,
    totalPoints: totalQuestions,
    scorePercent,
    passed,
    passingThresholdPercent: attempt.passingThresholdPercent,
    byChapter,
    byKLevel,
  };
}
