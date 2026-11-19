import { describe, expect, it } from 'vitest';
import { computeReadinessReport } from '../../src/services/readinessService';
import { generateStudySchedule, rescheduleOverdueActivities } from '../../src/services/plannerService';
import { CTFL_V4_CHAPTERS } from '../../src/data/syllabi_ctfl_v4';
import { CTFL_V4_LESSONS } from '../../src/data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../../src/data/flashcards_ctfl_v4';
import { CTFL_V4_QUESTIONS } from '../../src/data/questions_ctfl_v4';

describe('Readiness Index & Study Planner', () => {
  it('returns null readiness index when zero activity has been recorded', () => {
    const report = computeReadinessReport({
      chapters: CTFL_V4_CHAPTERS,
      lessons: CTFL_V4_LESSONS,
      lessonProgress: [],
      flashcards: SEED_FLASHCARDS,
      flashcardStates: [],
      questions: CTFL_V4_QUESTIONS,
      quizAttempts: [],
      examAttempts: [],
      studySessions: [],
    });

    expect(report.hasRecordedActivity).toBe(false);
    expect(report.overallIndex).toBeNull();
    expect(report.studyStreakDays).toBe(0);
  });

  it('computes readiness index deterministically from recorded lessons and quiz attempts', () => {
    const report = computeReadinessReport({
      chapters: CTFL_V4_CHAPTERS,
      lessons: CTFL_V4_LESSONS,
      lessonProgress: [
        {
          id: 'ctfl-v4.0::lesson-ctfl4-ch1',
          certificationId: 'ctfl',
          versionId: 'ctfl-v4.0',
          lessonId: 'lesson-ctfl4-ch1',
          chapterId: 'ctfl-v4.0-ch1',
          completed: true,
          readingSeconds: 600,
          lastReadAt: '2026-11-19T08:00:00.000Z',
        },
      ],
      flashcards: SEED_FLASHCARDS,
      flashcardStates: [],
      questions: CTFL_V4_QUESTIONS,
      quizAttempts: [
        {
          id: 'q1',
          certificationId: 'ctfl',
          versionId: 'ctfl-v4.0',
          mode: 'free',
          questionIds: ['q-ctfl4-ch1-01'],
          answers: {},
          correctQuestionIds: ['q-ctfl4-ch1-01'],
          incorrectQuestionIds: [],
          scorePercent: 100,
          durationSeconds: 30,
          completedAt: '2026-11-19T08:05:00.000Z',
        },
      ],
      examAttempts: [],
      studySessions: [
        {
          id: 's1',
          date: new Date().toISOString().slice(0, 10),
          certificationId: 'ctfl',
          versionId: 'ctfl-v4.0',
          activityType: 'quiz',
          minutesSpent: 15,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(report.hasRecordedActivity).toBe(true);
    expect(report.overallIndex).toBeGreaterThan(0);
    expect(report.lessonsCompleted).toBe(1);
    expect(report.averageQuizPercent).toBe(100);
    expect(report.studyStreakDays).toBe(1);
  });

  it('generates study schedule and reschedules overdue items cleanly', () => {
    const { plan, activities } = generateStudySchedule({
      certificationId: 'ctfl',
      versionId: 'ctfl-v4.0',
      targetDate: '2026-12-10',
      dailyMinutes: 30,
      availableDays: [1, 2, 3, 4, 5],
      weeklyGoalMinutes: 150,
      chapters: CTFL_V4_CHAPTERS,
      lessons: CTFL_V4_LESSONS,
      lessonProgress: [],
      flashcardStates: [],
      startDate: new Date('2026-11-19T10:00:00.000Z'),
    });

    expect(plan.id).toBe('plan-ctfl-v4.0');
    expect(activities.some((a) => a.type === 'lesson')).toBe(true);
    expect(activities.some((a) => a.type === 'mock_exam')).toBe(true);

    const overdue = [
      {
        ...activities[0]!,
        date: '2026-11-01',
        completed: false,
      },
    ];
    const rescheduled = rescheduleOverdueActivities(
      overdue,
      [1, 2, 3, 4, 5],
      new Date('2026-11-19T10:00:00.000Z'),
    );
    expect(rescheduled[0]!.date >= '2026-11-19').toBe(true);
  });
});
