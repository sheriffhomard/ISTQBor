import type { Question, QuestionPreference, UserQuestionAnswer } from '../types/domain';

export function evaluateQuestionAnswer(
  question: Question,
  answer: UserQuestionAnswer | undefined,
): boolean {
  if (!answer) return false;

  if (question.type === 'calculation' && question.numericAnswer) {
    if (answer.type !== 'numeric') return false;
    const cleaned = answer.value.trim().replace(',', '.');
    if (!cleaned) return false;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return false;
    return Math.abs(parsed - question.numericAnswer.expected) <= question.numericAnswer.tolerance;
  }

  if (question.type === 'matching' && question.matchingPairs) {
    if (answer.type !== 'matching') return false;
    return question.matchingPairs.every((pair) => answer.pairs[pair.id] === pair.id);
  }

  if (answer.type !== 'options') return false;
  const expectedSet = new Set(question.correctOptionIds);
  const selectedSet = new Set(answer.selectedOptionIds);
  if (expectedSet.size === 0 || expectedSet.size !== selectedSet.size) return false;
  for (const id of expectedSet) {
    if (!selectedSet.has(id)) return false;
  }
  return true;
}

export type QuizMode =
  | 'free'
  | 'timed'
  | 'chapter'
  | 'objective'
  | 'difficulty'
  | 'missed'
  | 'favorites'
  | 'random'
  | 'adaptive';

export interface QuizFilterOptions {
  mode: QuizMode;
  chapterId?: string;
  objectiveId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
}

export function selectQuizQuestions(
  allQuestions: Question[],
  preferencesMap: Map<string, QuestionPreference>,
  options: QuizFilterOptions,
): Question[] {
  let pool = [...allQuestions];

  if (options.mode === 'chapter' && options.chapterId) {
    pool = pool.filter((q) => q.chapterId === options.chapterId);
  } else if (options.mode === 'objective' && options.objectiveId) {
    pool = pool.filter((q) => q.objectiveId === options.objectiveId);
  } else if (options.mode === 'difficulty' && options.difficulty) {
    pool = pool.filter((q) => q.difficulty === options.difficulty);
  } else if (options.mode === 'missed') {
    pool = pool.filter((q) => {
      const pref = preferencesMap.get(q.id);
      return pref && pref.timesIncorrect > pref.timesCorrect;
    });
  } else if (options.mode === 'favorites') {
    pool = pool.filter((q) => preferencesMap.get(q.id)?.isFavorite);
  }

  if (options.mode === 'adaptive') {
    pool.sort((a, b) => {
      const prefA = preferencesMap.get(a.id);
      const prefB = preferencesMap.get(b.id);
      const scoreA = prefA ? prefA.timesIncorrect * 3 - prefA.timesCorrect : 1;
      const scoreB = prefB ? prefB.timesIncorrect * 3 - prefB.timesCorrect : 1;
      return scoreB - scoreA;
    });
  } else {
    // Deterministic Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i]!;
      pool[i] = pool[j]!;
      pool[j] = tmp;
    }
  }

  const limit = options.limit ?? 15;
  return pool.slice(0, Math.min(limit, pool.length));
}
