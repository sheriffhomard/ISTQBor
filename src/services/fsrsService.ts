import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from 'ts-fsrs';
import { db, type IstqbAcademyDB } from '../db/database';
import type { Flashcard, FlashcardReviewState, ReviewLogEntry } from '../types/domain';

const scheduler = fsrs({
  enable_fuzz: true,
  maximum_interval: 365,
});

export type FsrsRatingValue = 1 | 2 | 3 | 4;

export function createInitialFlashcardState(
  card: Pick<Flashcard, 'id' | 'certificationId' | 'versionId'>,
  now = new Date(),
): FlashcardReviewState {
  const empty = createEmptyCard(now);
  return {
    cardId: card.id,
    certificationId: card.certificationId,
    versionId: card.versionId,
    due: empty.due.toISOString(),
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsedDays: 0,
    scheduledDays: empty.scheduled_days,
    learningSteps: empty.learning_steps,
    reps: empty.reps,
    lapses: empty.lapses,
    state: empty.state,
    isFavorite: false,
    totalCorrect: 0,
    totalIncorrect: 0,
  };
}

function toFsrsCard(state: FlashcardReviewState): Card {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps ?? 0,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state as State,
    last_review: state.lastReview ? new Date(state.lastReview) : undefined,
  };
}

function ratingToEnum(value: FsrsRatingValue): Grade {
  switch (value) {
    case 1:
      return Rating.Again;
    case 2:
      return Rating.Hard;
    case 3:
      return Rating.Good;
    case 4:
      return Rating.Easy;
  }
}

export function previewIntervals(
  currentState: FlashcardReviewState,
  now = new Date(),
): Record<FsrsRatingValue, number> {
  const card = toFsrsCard(currentState);
  const outcomes = scheduler.repeat(card, now);
  return {
    1: Math.max(0, outcomes[Rating.Again].card.scheduled_days),
    2: Math.max(0, outcomes[Rating.Hard].card.scheduled_days),
    3: Math.max(0, outcomes[Rating.Good].card.scheduled_days),
    4: Math.max(0, outcomes[Rating.Easy].card.scheduled_days),
  };
}

export function scheduleFlashcardReview(
  currentState: FlashcardReviewState,
  rating: FsrsRatingValue,
  now = new Date(),
): { nextState: FlashcardReviewState; log: ReviewLogEntry } {
  const card = toFsrsCard(currentState);
  const ratingEnum = ratingToEnum(rating);
  const outcome = scheduler.next(card, now, ratingEnum);
  const nextCard = outcome.card;
  const isCorrect = rating >= 3;

  const nextState: FlashcardReviewState = {
    ...currentState,
    due: nextCard.due.toISOString(),
    stability: nextCard.stability,
    difficulty: nextCard.difficulty,
    elapsedDays: currentState.lastReview
      ? Math.max(0, Math.round((now.getTime() - new Date(currentState.lastReview).getTime()) / 86400000))
      : 0,
    scheduledDays: nextCard.scheduled_days,
    learningSteps: nextCard.learning_steps,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    state: nextCard.state,
    lastReview: now.toISOString(),
    totalCorrect: currentState.totalCorrect + (isCorrect ? 1 : 0),
    totalIncorrect: currentState.totalIncorrect + (isCorrect ? 0 : 1),
  };

  const log: ReviewLogEntry = {
    id: `rev-${currentState.cardId}-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    cardId: currentState.cardId,
    certificationId: currentState.certificationId,
    versionId: currentState.versionId,
    rating,
    stateBefore: currentState.state,
    stateAfter: nextCard.state,
    reviewedAt: now.toISOString(),
  };

  return { nextState, log };
}

export async function recordFlashcardReview(
  card: Flashcard,
  rating: FsrsRatingValue,
  targetDb: IstqbAcademyDB = db,
  now = new Date(),
): Promise<FlashcardReviewState> {
  return targetDb.transaction(
    'rw',
    [targetDb.flashcardStates, targetDb.reviewLogs, targetDb.studySessions],
    async () => {
      const existing =
        (await targetDb.flashcardStates.get(card.id)) ?? createInitialFlashcardState(card, now);
      const { nextState, log } = scheduleFlashcardReview(existing, rating, now);
      await targetDb.flashcardStates.put(nextState);
      await targetDb.reviewLogs.put(log);

      const dateStr = now.toISOString().slice(0, 10);
      await targetDb.studySessions.put({
        id: `sess-fc-${dateStr}-${now.getTime()}`,
        date: dateStr,
        certificationId: card.certificationId,
        versionId: card.versionId,
        activityType: 'flashcards',
        minutesSpent: 1,
        createdAt: now.toISOString(),
      });
      return nextState;
    },
  );
}

export function isCardDue(state: FlashcardReviewState | undefined, now = new Date()): boolean {
  if (!state) return true;
  return new Date(state.due).getTime() <= now.getTime();
}

export function isCardMastered(state: FlashcardReviewState | undefined): boolean {
  if (!state) return false;
  return state.state === State.Review && state.scheduledDays >= 7 && state.lapses <= 2;
}
