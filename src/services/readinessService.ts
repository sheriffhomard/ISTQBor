import type {
  Chapter,
  ExamAttempt,
  Flashcard,
  FlashcardReviewState,
  Lesson,
  LessonProgress,
  Question,
  QuizAttempt,
  StudySessionLog,
} from '../types/domain';
import { isCardMastered } from './fsrsService';

export interface ReadinessFactor {
  key: 'syllabus' | 'fsrs' | 'quiz' | 'exam';
  score: number | null; // null = no recorded data yet
  weight: number;
  recordedCount: number;
  totalCount: number;
}

export interface ReadinessReport {
  overallIndex: number | null; // null when zero real activity exists
  hasRecordedActivity: boolean;
  factors: ReadinessFactor[];
  lessonsCompleted: number;
  totalLessons: number;
  cardsMastered: number;
  totalCards: number;
  averageQuizPercent: number | null;
  latestExamPercent: number | null;
  studyStreakDays: number;
  totalStudyMinutes: number;
  chapterWeaknesses: Array<{
    chapterId: string;
    chapterCode: string;
    title: { fr: string; en: string };
    accuracyPercent: number;
    attemptsCount: number;
  }>;
}

export function computeStudyStreak(sessions: StudySessionLog[], today = new Date()): number {
  if (sessions.length === 0) return 0;
  const activeDates = new Set(sessions.map((s) => s.date));

  let streak = 0;
  const cursor = new Date(today);
  const todayStr = cursor.toISOString().slice(0, 10);

  if (!activeDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeReadinessReport(params: {
  chapters: Chapter[];
  lessons: Lesson[];
  lessonProgress: LessonProgress[];
  flashcards: Flashcard[];
  flashcardStates: FlashcardReviewState[];
  questions: Question[];
  quizAttempts: QuizAttempt[];
  examAttempts: ExamAttempt[];
  studySessions: StudySessionLog[];
}): ReadinessReport {
  const {
    chapters,
    lessons,
    lessonProgress,
    flashcards,
    flashcardStates,
    questions,
    quizAttempts,
    examAttempts,
    studySessions,
  } = params;

  const lessonIds = new Set(lessons.map((l) => l.id));
  const lessonsCompleted = lessonProgress.filter(
    (p) => p.completed && lessonIds.has(p.lessonId),
  ).length;
  const totalLessons = lessons.length;
  const syllabusScore =
    totalLessons > 0 && lessonsCompleted > 0
      ? Math.round((lessonsCompleted / totalLessons) * 100)
      : lessonsCompleted === 0
        ? null
        : 0;

  const stateMap = new Map(flashcardStates.map((s) => [s.cardId, s]));
  const totalCards = flashcards.length;
  const reviewedCards = flashcards.filter((c) => (stateMap.get(c.id)?.reps ?? 0) > 0);
  const cardsMastered = flashcards.filter((c) => isCardMastered(stateMap.get(c.id))).length;

  let fsrsScore: number | null = null;
  if (reviewedCards.length > 0 && totalCards > 0) {
    const coverageRatio = reviewedCards.length / totalCards;
    const totalCorrect = reviewedCards.reduce(
      (acc, c) => acc + (stateMap.get(c.id)?.totalCorrect ?? 0),
      0,
    );
    const totalAttempts = reviewedCards.reduce(
      (acc, c) =>
        acc + (stateMap.get(c.id)?.totalCorrect ?? 0) + (stateMap.get(c.id)?.totalIncorrect ?? 0),
      0,
    );
    const retention = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    fsrsScore = Math.round((coverageRatio * 0.5 + retention * 0.5) * 100);
  }

  const averageQuizPercent =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => acc + q.scorePercent, 0) / quizAttempts.length,
        )
      : null;

  const completedExams = examAttempts
    .filter((e) => e.status === 'completed' && e.scoreResult)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  const latestExamPercent =
    completedExams.length > 0 ? (completedExams[0]?.scoreResult?.scorePercent ?? null) : null;

  const factors: ReadinessFactor[] = [
    {
      key: 'syllabus',
      score: syllabusScore,
      weight: 0.2,
      recordedCount: lessonsCompleted,
      totalCount: totalLessons,
    },
    {
      key: 'fsrs',
      score: fsrsScore,
      weight: 0.25,
      recordedCount: reviewedCards.length,
      totalCount: totalCards,
    },
    {
      key: 'quiz',
      score: averageQuizPercent,
      weight: 0.25,
      recordedCount: quizAttempts.length,
      totalCount: quizAttempts.length,
    },
    {
      key: 'exam',
      score: latestExamPercent,
      weight: 0.3,
      recordedCount: completedExams.length,
      totalCount: completedExams.length,
    },
  ];

  const hasRecordedActivity = factors.some((f) => f.score !== null);

  let overallIndex: number | null = null;
  if (hasRecordedActivity) {
    const weightedSum = factors.reduce((acc, f) => acc + (f.score ?? 0) * f.weight, 0);
    overallIndex = Math.round(weightedSum);
  }

  // Chapter weaknesses calculated strictly from real quiz & exam records
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const chapterPerf = new Map<string, { correct: number; total: number }>();

  for (const quiz of quizAttempts) {
    for (const qId of quiz.correctQuestionIds) {
      const q = questionMap.get(qId);
      if (!q) continue;
      const cur = chapterPerf.get(q.chapterId) ?? { correct: 0, total: 0 };
      cur.correct += 1;
      cur.total += 1;
      chapterPerf.set(q.chapterId, cur);
    }
    for (const qId of quiz.incorrectQuestionIds) {
      const q = questionMap.get(qId);
      if (!q) continue;
      const cur = chapterPerf.get(q.chapterId) ?? { correct: 0, total: 0 };
      cur.total += 1;
      chapterPerf.set(q.chapterId, cur);
    }
  }

  for (const exam of completedExams) {
    for (const ch of exam.scoreResult?.byChapter ?? []) {
      const cur = chapterPerf.get(ch.chapterId) ?? { correct: 0, total: 0 };
      cur.correct += ch.correct;
      cur.total += ch.total;
      chapterPerf.set(ch.chapterId, cur);
    }
  }

  const chapterWeaknesses = chapters
    .map((ch) => {
      const perf = chapterPerf.get(ch.id);
      if (!perf || perf.total === 0) return null;
      return {
        chapterId: ch.id,
        chapterCode: ch.code,
        title: ch.title,
        accuracyPercent: Math.round((perf.correct / perf.total) * 100),
        attemptsCount: perf.total,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent);

  const studyStreakDays = computeStudyStreak(studySessions);
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.minutesSpent, 0);

  return {
    overallIndex,
    hasRecordedActivity,
    factors,
    lessonsCompleted,
    totalLessons,
    cardsMastered,
    totalCards,
    averageQuizPercent,
    latestExamPercent,
    studyStreakDays,
    totalStudyMinutes,
    chapterWeaknesses,
  };
}
