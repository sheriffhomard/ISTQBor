import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import { isCardDue } from '../../services/fsrsService';
import { generateStudySchedule, rescheduleOverdueActivities } from '../../services/plannerService';
import type { AppLanguage } from '../../types/domain';

interface PlannerViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  lang,
  certificationId,
  versionId,
}) => {
  const { t } = useTranslation();
  const planId = `plan-${versionId}`;

  const plan = useLiveQuery(() => db.studyPlans.get(planId), [planId]);
  const activities =
    useLiveQuery(
      () => db.plannedActivities.where('planId').equals(planId).sortBy('date'),
      [planId],
    ) ?? [];
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
  const flashcardStates =
    useLiveQuery(
      () => db.flashcardStates.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];

  const defaultTarget = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  }, []);

  const [targetDate, setTargetDate] = useState(plan?.targetDate ?? defaultTarget);
  const [dailyMinutes, setDailyMinutes] = useState(plan?.dailyMinutes ?? 30);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(plan?.weeklyGoalMinutes ?? 150);
  const [availableDays, setAvailableDays] = useState<number[]>(
    plan?.availableDays ?? [1, 2, 3, 4, 5],
  );

  const dueCount = useMemo(() => {
    const now = new Date();
    return flashcardStates.filter((s) => isCardDue(s, now)).length;
  }, [flashcardStates]);

  const weekdays = t('weekdays', { returnObjects: true }) as string[];

  const toggleDay = (dayIndex: number) => {
    setAvailableDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort(),
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { plan: nextPlan, activities: nextActivities } = generateStudySchedule({
      certificationId,
      versionId,
      targetDate,
      dailyMinutes,
      availableDays,
      weeklyGoalMinutes,
      chapters,
      lessons,
      lessonProgress,
      flashcardStates,
    });

    await db.transaction('rw', [db.studyPlans, db.plannedActivities], async () => {
      await db.studyPlans.put(nextPlan);
      await db.plannedActivities.where('planId').equals(planId).delete();
      await db.plannedActivities.bulkPut(nextActivities);
    });
  };

  const handleReschedule = async () => {
    const updated = rescheduleOverdueActivities(activities, availableDays);
    await db.plannedActivities.bulkPut(updated);
  };

  const toggleActivityDone = async (id: string, current: boolean) => {
    await db.plannedActivities.update(id, {
      completed: !current,
      completedAt: !current ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('planner.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('planner.subtitle')}</p>
      </div>

      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('planner.targetDate')}
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
            />
          </label>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('planner.dailyMinutes')}
            <input
              type="number"
              min={10}
              max={240}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
            />
          </label>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('planner.weeklyGoal')}
            <input
              type="number"
              min={30}
              max={1500}
              value={weeklyGoalMinutes}
              onChange={(e) => setWeeklyGoalMinutes(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tabular-nums"
            />
          </label>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('planner.availableDays')}
          </div>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((dayLabel, idx) => {
              const active = availableDays.includes(idx);
              return (
                <button
                  key={dayLabel}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {dayLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-sky-800 dark:text-sky-300">
            {t('planner.fsrsBacklogBanner', { count: dueCount })}
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                type="button"
                onClick={() => void handleReschedule()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('planner.rescheduleOverdue')}
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {t('planner.generatePlan')}
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('planner.noPlan')}</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((act) => (
              <div
                key={act.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <button
                  type="button"
                  onClick={() => void toggleActivityDone(act.id, act.completed)}
                  className="flex items-center gap-3 text-left min-w-0"
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      act.completed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <div
                      className={`font-medium truncate ${
                        act.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tText(act.title, lang)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {act.type} · {act.estimatedMinutes} {t('common.minutes')}
                    </div>
                  </div>
                </button>
                <span className="font-mono tabular-nums text-slate-500 shrink-0">{act.date}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
