import { describe, expect, it } from 'vitest';
import {
  createInitialFlashcardState,
  isCardDue,
  isCardMastered,
  previewIntervals,
  scheduleFlashcardReview,
} from '../../src/services/fsrsService';

describe('FSRS Service', () => {
  const sampleCard = {
    id: 'fc-test-1',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
  };

  it('creates an initial new card state that is immediately due', () => {
    const now = new Date('2026-11-19T10:00:00.000Z');
    const state = createInitialFlashcardState(sampleCard, now);
    expect(state.reps).toBe(0);
    expect(state.lapses).toBe(0);
    expect(isCardDue(state, now)).toBe(true);
    expect(isCardMastered(state)).toBe(false);
  });

  it('schedules longer intervals for Easy than Again and tracks stats accurately', () => {
    const t0 = new Date('2026-11-19T10:00:00.000Z');
    const initial = createInitialFlashcardState(sampleCard, t0);
    const intervals = previewIntervals(initial, t0);
    expect(intervals[4]).toBeGreaterThanOrEqual(intervals[1]);

    const { nextState: easyState, log } = scheduleFlashcardReview(initial, 4, t0);
    expect(easyState.reps).toBe(1);
    expect(easyState.totalCorrect).toBe(1);
    expect(easyState.totalIncorrect).toBe(0);
    expect(log.rating).toBe(4);
    expect(new Date(easyState.due).getTime()).toBeGreaterThan(t0.getTime());

    const t1 = new Date('2026-11-20T10:00:00.000Z');
    const { nextState: againState } = scheduleFlashcardReview(easyState, 1, t1);
    expect(againState.totalIncorrect).toBe(1);
    expect(againState.totalCorrect).toBe(1);
  });
});
