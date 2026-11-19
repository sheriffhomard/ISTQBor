import type {
  Chapter,
  FlashcardReviewState,
  Lesson,
  LessonProgress,
  PlannedActivity,
  StudyPlan,
} from '../types/domain';
import { isCardDue } from './fsrsService';

function addDays(baseDate: Date, offset: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function generateStudySchedule(params: {
  certificationId: string;
  versionId: string;
  targetDate: string;
  dailyMinutes: number;
  availableDays: number[];
  weeklyGoalMinutes: number;
  chapters: Chapter[];
  lessons: Lesson[];
  lessonProgress: LessonProgress[];
  flashcardStates: FlashcardReviewState[];
  startDate?: Date;
}): { plan: StudyPlan; activities: PlannedActivity[] } {
  const start = params.startDate ?? new Date();
  const startStr = start.toISOString().slice(0, 10);
  const nowIso = start.toISOString();
  const planId = `plan-${params.versionId}`;

  const plan: StudyPlan = {
    id: planId,
    certificationId: params.certificationId,
    versionId: params.versionId,
    targetDate: params.targetDate,
    dailyMinutes: Math.max(10, params.dailyMinutes),
    availableDays: params.availableDays.length > 0 ? params.availableDays : [1, 2, 3, 4, 5],
    weeklyGoalMinutes: params.weeklyGoalMinutes,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const targetMs = Math.max(start.getTime(), new Date(params.targetDate).getTime());
  const daysSpan = Math.min(90, Math.max(7, Math.ceil((targetMs - start.getTime()) / 86400000)));

  const studyDates: string[] = [];
  for (let i = 0; i <= daysSpan; i++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + i);
    if (plan.availableDays.includes(candidate.getDay())) {
      studyDates.push(candidate.toISOString().slice(0, 10));
    }
  }
  if (studyDates.length === 0) {
    studyDates.push(startStr);
  }

  const completedLessonIds = new Set(
    params.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId),
  );
  const remainingLessons = [...params.lessons]
    .sort((a, b) => a.order - b.order)
    .filter((l) => !completedLessonIds.has(l.id));

  const dueCardsCount = params.flashcardStates.filter((s) => isCardDue(s, start)).length;

  const activities: PlannedActivity[] = [];
  let lessonCursor = 0;

  studyDates.forEach((dateStr, idx) => {
    // Integrate FSRS due backlog at the start and regularly
    if (idx === 0 && dueCardsCount > 0) {
      activities.push({
        id: `act-${planId}-${dateStr}-fsrs-init`,
        planId,
        date: dateStr,
        type: 'flashcards',
        title: {
          fr: `Répétition espacée FSRS (${dueCardsCount} cartes dues)`,
          en: `FSRS Spaced Repetition (${dueCardsCount} cards due)`,
        },
        estimatedMinutes: Math.min(25, Math.max(10, Math.round(dueCardsCount * 0.8))),
        completed: false,
      });
    }

    if (lessonCursor < remainingLessons.length) {
      const lesson = remainingLessons[lessonCursor++]!;
      activities.push({
        id: `act-${planId}-${dateStr}-lesson-${lesson.id}`,
        planId,
        date: dateStr,
        type: 'lesson',
        title: lesson.title,
        targetId: lesson.id,
        estimatedMinutes: Math.min(plan.dailyMinutes, lesson.estimatedMinutes),
        completed: false,
      });

      const chapter = params.chapters.find((c) => c.id === lesson.chapterId);
      activities.push({
        id: `act-${planId}-${dateStr}-quiz-${lesson.chapterId}`,
        planId,
        date: dateStr,
        type: 'quiz',
        title: {
          fr: `QCM ciblé : Chapitre ${chapter?.code ?? ''}`,
          en: `Targeted Quiz: Chapter ${chapter?.code ?? ''}`,
        },
        targetId: lesson.chapterId,
        estimatedMinutes: 15,
        completed: false,
      });
    } else if (idx === studyDates.length - 1 || idx % 5 === 4) {
      activities.push({
        id: `act-${planId}-${dateStr}-mock-${idx}`,
        planId,
        date: dateStr,
        type: 'mock_exam',
        title: {
          fr: 'Examen blanc complet chronométré',
          en: 'Full timed mock exam',
        },
        estimatedMinutes: 60,
        completed: false,
      });
    } else {
      activities.push({
        id: `act-${planId}-${dateStr}-review-${idx}`,
        planId,
        date: dateStr,
        type: 'flashcards',
        title: {
          fr: 'Session FSRS & consolidation des lacunes',
          en: 'FSRS review & gap consolidation',
        },
        estimatedMinutes: Math.min(20, plan.dailyMinutes),
        completed: false,
      });
    }
  });

  // Ensure at least one mock exam before target date
  if (!activities.some((a) => a.type === 'mock_exam') && studyDates.length > 0) {
    const finalDate = studyDates[studyDates.length - 1] ?? addDays(start, 7);
    activities.push({
      id: `act-${planId}-${finalDate}-mock-final`,
      planId,
      date: finalDate,
      type: 'mock_exam',
      title: {
        fr: 'Examen blanc final de validation',
        en: 'Final readiness mock exam',
      },
      estimatedMinutes: 60,
      completed: false,
    });
  }

  return { plan, activities };
}

export function rescheduleOverdueActivities(
  activities: PlannedActivity[],
  availableDays: number[],
  fromDate = new Date(),
): PlannedActivity[] {
  const todayStr = fromDate.toISOString().slice(0, 10);
  const validDays = availableDays.length > 0 ? availableDays : [1, 2, 3, 4, 5];

  let nextAvailableCursor = 0;
  const getNextStudyDate = (): string => {
    for (let safety = 0; safety < 60; safety++) {
      const d = new Date(fromDate);
      d.setDate(d.getDate() + nextAvailableCursor);
      nextAvailableCursor++;
      if (validDays.includes(d.getDay())) {
        return d.toISOString().slice(0, 10);
      }
    }
    return todayStr;
  };

  return activities.map((act) => {
    if (!act.completed && act.date < todayStr) {
      return {
        ...act,
        date: getNextStudyDate(),
      };
    }
    return act;
  });
}
