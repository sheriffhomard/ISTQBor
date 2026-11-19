import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle2, GitCompare, Network, FileText } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import { PedagogicalDiagram } from '../../components/PedagogicalDiagram';
import type { AppLanguage } from '../../types/domain';

interface SyllabusViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
  onNavigateFlashcards: (chapterId: string) => void;
  onNavigateQuizzes: (chapterId: string) => void;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  lang,
  certificationId,
  versionId,
  onNavigateFlashcards,
  onNavigateQuizzes,
}) => {
  const { t } = useTranslation();

  const cert = useLiveQuery(() => db.certifications.get(certificationId), [certificationId]);
  const versions =
    useLiveQuery(
      () => db.syllabusVersions.where('certificationId').equals(certificationId).toArray(),
      [certificationId],
    ) ?? [];
  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const allChapters = useLiveQuery(() => db.chapters.toArray(), []) ?? [];
  const allVersions = useLiveQuery(() => db.syllabusVersions.toArray(), []) ?? [];
  const objectives =
    useLiveQuery(
      () => db.learningObjectives.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const lessons =
    useLiveQuery(
      () => db.lessons.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const lessonProgress =
    useLiveQuery(
      () => db.lessonProgress.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];

  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'lesson' | 'summary' | 'mindmap' | 'compare'>('lesson');
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});
  const [compareVersionA, setCompareVersionA] = useState<string>('ctfl-v4.0');
  const [compareVersionB, setCompareVersionB] = useState<string>('ctfl-v3.1');

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) ?? chapters[0];
  const activeLesson = lessons.find((l) => l.chapterId === activeChapter?.id);
  const chapterObjectives = useMemo(
    () => objectives.filter((o) => o.chapterId === activeChapter?.id),
    [objectives, activeChapter],
  );
  const progressMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress],
  );

  const toggleLessonComplete = async (lessonId: string, chapterId: string, minutes: number) => {
    const id = `${versionId}::${lessonId}`;
    const existing = await db.lessonProgress.get(id);
    const nextCompleted = !(existing?.completed ?? false);
    const now = new Date().toISOString();
    await db.lessonProgress.put({
      id,
      certificationId,
      versionId,
      lessonId,
      chapterId,
      completed: nextCompleted,
      readingSeconds: (existing?.readingSeconds ?? 0) + minutes * 60,
      lastReadAt: now,
    });
    if (nextCompleted) {
      await db.studySessions.put({
        id: `sess-lesson-${lessonId}-${Date.now()}`,
        date: now.slice(0, 10),
        certificationId,
        versionId,
        activityType: 'lesson',
        minutesSpent: Math.max(5, Math.round(minutes / 2)),
        createdAt: now,
      });
    }
  };

  const versionAChapters = useMemo(
    () => allChapters.filter((c) => c.versionId === compareVersionA).sort((a, b) => a.order - b.order),
    [allChapters, compareVersionA],
  );
  const versionBChapters = useMemo(
    () => allChapters.filter((c) => c.versionId === compareVersionB).sort((a, b) => a.order - b.order),
    [allChapters, compareVersionB],
  );

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            {cert?.code} · {versions.find((v) => v.id === versionId)?.versionNumber ?? versionId}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('syllabus.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 self-start">
          {(
            [
              { id: 'lesson', label: t('syllabus.lessonView'), icon: BookOpen },
              { id: 'summary', label: t('syllabus.summarySheet'), icon: FileText },
              { id: 'mindmap', label: t('syllabus.mindMap'), icon: Network },
              { id: 'compare', label: t('syllabus.compareVersions'), icon: GitCompare },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === 'compare' ? (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('syllabus.versionA')}
              <select
                value={compareVersionA}
                onChange={(e) => setCompareVersionA(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                {allVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title[lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('syllabus.versionB')}
              <select
                value={compareVersionB}
                onChange={(e) => setCompareVersionB(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                {allVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title[lang]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                ver: allVersions.find((v) => v.id === compareVersionA),
                list: versionAChapters,
              },
              {
                ver: allVersions.find((v) => v.id === compareVersionB),
                list: versionBChapters,
              },
            ].map((col, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {col.ver?.title[lang]}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {tText(col.ver?.changelogSummary, lang)}
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {col.list.length === 0 ? (
                    <p className="text-xs text-slate-500">{t('syllabus.noContentForVersion')}</p>
                  ) : (
                    col.list.map((ch) => (
                      <div key={ch.id} className="text-xs p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {ch.code}. {tText(ch.title, lang)}
                        </div>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                          {tText(ch.summary, lang)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : chapters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-sm text-slate-600 dark:text-slate-300">
          {t('syllabus.noContentForVersion')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chapter Sidebar */}
          <aside className="lg:col-span-4 space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              {t('syllabus.chapters')}
            </h2>
            {chapters.map((ch) => {
              const lessonForCh = lessons.find((l) => l.chapterId === ch.id);
              const isRead = lessonForCh ? progressMap.get(lessonForCh.id)?.completed : false;
              const isSelected = activeChapter?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 dark:bg-sky-950/40 dark:border-sky-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>
                      {lang === 'fr' ? `Chapitre ${ch.code}` : `Chapter ${ch.code}`} · {ch.recommendedMinutes} min
                    </span>
                    {isRead && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {tText(ch.title, lang)}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Main Lesson / Summary / Mind Map Viewport */}
          {activeChapter && (
            <div className="lg:col-span-8 space-y-6">
              {viewMode === 'mindmap' ? (
                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('syllabus.mindMap')} · {tText(activeChapter.title, lang)}
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="px-5 py-3 rounded-xl bg-[#0B192C] dark:bg-sky-700 text-white text-sm font-semibold text-center max-w-md">
                      {activeChapter.code}. {tText(activeChapter.title, lang)}
                    </div>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {chapterObjectives.map((obj) => (
                        <div
                          key={obj.id}
                          className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40"
                        >
                          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                            {obj.code} · {obj.kLevel}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                            {tText(obj.title, lang)}
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {tText(obj.description, lang)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : viewMode === 'summary' ? (
                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('syllabus.summarySheet')} · {tText(activeChapter.title, lang)}
                  </h2>
                  {activeLesson ? (
                    <>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {tText(activeLesson.summary, lang)}
                      </p>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          {t('syllabus.keyPoints')}
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                          {activeLesson.keyPoints.map((kp, i) => (
                            <li key={i}>{tText(kp, lang)}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {activeLesson.definitions.map((def) => (
                          <div
                            key={def.id}
                            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                              {tText(def.term, lang)}
                            </div>
                            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                              {tText(def.definition, lang)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">{tText(activeChapter.summary, lang)}</p>
                  )}
                </section>
              ) : (
                <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
                  {activeLesson ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {activeLesson.estimatedMinutes} {t('common.minutes')} · {activeLesson.provenance.license}
                          </div>
                          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                            {tText(activeLesson.title, lang)}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void toggleLessonComplete(
                              activeLesson.id,
                              activeChapter.id,
                              activeLesson.estimatedMinutes,
                            )
                          }
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            progressMap.get(activeLesson.id)?.completed
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#0B192C] dark:bg-sky-600 text-white hover:opacity-90'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          {progressMap.get(activeLesson.id)?.completed
                            ? t('syllabus.markedAsRead')
                            : t('syllabus.markAsRead')}
                        </button>
                      </div>

                      <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {tText(activeLesson.explanation, lang)}
                      </div>

                      <PedagogicalDiagram type={activeLesson.diagramType} lang={lang} />

                      {activeLesson.definitions.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {t('syllabus.definitions')}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeLesson.definitions.map((def) => (
                              <div
                                key={def.id}
                                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                              >
                                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                                  {tText(def.term, lang)}
                                </div>
                                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {tText(def.definition, lang)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeLesson.examples.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {t('syllabus.examples')} · {tText(ex.title, lang)}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{tText(ex.context, lang)}</p>
                          <p className="text-xs font-medium text-sky-800 dark:text-sky-300 pt-1">
                            {tText(ex.analysis, lang)}
                          </p>
                        </div>
                      ))}

                      {activeLesson.tables.map((tbl) => (
                        <div key={tbl.id} className="space-y-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {tText(tbl.title, lang)}
                          </h3>
                          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                <tr>
                                  {tbl.headers.map((h, i) => (
                                    <th key={i} className="px-3 py-2 font-semibold">
                                      {tText(h, lang)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {tbl.rows.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                        {tText(cell, lang)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}

                      {activeLesson.exercises.map((exo) => (
                        <div
                          key={exo.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {t('syllabus.exercises')}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {tText(exo.prompt, lang)}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSolutions((prev) => ({ ...prev, [exo.id]: !prev[exo.id] }))
                            }
                            className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline"
                          >
                            {openSolutions[exo.id]
                              ? t('syllabus.hideSolution')
                              : t('syllabus.showSolution')}
                          </button>
                          {openSolutions[exo.id] && (
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-md">
                              {tText(exo.solution, lang)}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => onNavigateFlashcards(activeChapter.id)}
                          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {t('syllabus.linkedFlashcards')} →
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateQuizzes(activeChapter.id)}
                          className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:opacity-90"
                        >
                          {t('syllabus.linkedQuestions')} →
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {tText(activeChapter.summary, lang)}
                    </p>
                  )}

                  {/* Learning Objectives Table for Active Chapter */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      {t('syllabus.objectives')} ({chapterObjectives.length})
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {chapterObjectives.map((obj) => (
                        <div key={obj.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              <span className="font-mono text-sky-700 dark:text-sky-400 mr-2">
                                {obj.code}
                              </span>
                              {tText(obj.title, lang)}
                            </div>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                              {tText(obj.description, lang)}
                            </p>
                          </div>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                            {obj.kLevel ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
