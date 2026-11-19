import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import { computeReadinessReport } from '../../services/readinessService';
import type { AppLanguage } from '../../types/domain';

interface AnalyticsViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ lang, versionId }) => {
  const { t } = useTranslation();

  const certifications = useLiveQuery(() => db.certifications.toArray(), []) ?? [];
  const versions = useLiveQuery(() => db.syllabusVersions.toArray(), []) ?? [];
  const allLessons = useLiveQuery(() => db.lessons.toArray(), []) ?? [];
  const allQuestions = useLiveQuery(() => db.questions.toArray(), []) ?? [];
  const allFlashcards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];
  const allObjectives = useLiveQuery(() => db.learningObjectives.toArray(), []) ?? [];

  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const lessons = useMemo(
    () => allLessons.filter((l) => l.versionId === versionId),
    [allLessons, versionId],
  );
  const questions = useMemo(
    () => allQuestions.filter((q) => q.versionId === versionId),
    [allQuestions, versionId],
  );
  const flashcards = useMemo(
    () => allFlashcards.filter((f) => f.versionId === versionId),
    [allFlashcards, versionId],
  );

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
  const quizAttempts =
    useLiveQuery(
      () => db.quizAttempts.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const examAttempts =
    useLiveQuery(
      () => db.examAttempts.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const studySessions =
    useLiveQuery(
      () => db.studySessions.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];

  const readiness = useMemo(
    () =>
      computeReadinessReport({
        chapters,
        lessons,
        lessonProgress,
        flashcards,
        flashcardStates,
        questions,
        quizAttempts,
        examAttempts,
        studySessions,
      }),
    [
      chapters,
      lessons,
      lessonProgress,
      flashcards,
      flashcardStates,
      questions,
      quizAttempts,
      examAttempts,
      studySessions,
    ],
  );

  const chapterChartData = readiness.chapterWeaknesses.map((w) => ({
    name: `Ch ${w.chapterCode}`,
    accuracy: w.accuracyPercent,
  }));

  const examTrendData = useMemo(
    () =>
      examAttempts
        .filter((e) => e.status === 'completed' && e.scoreResult)
        .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
        .map((e, idx) => ({
          label: `#${idx + 1}`,
          score: e.scoreResult?.scorePercent ?? 0,
        })),
    [examAttempts],
  );

  // Portfolio Coverage Matrix (Complete / Partial / Metadata Only)
  const coverageRows = useMemo(() => {
    return certifications.map((cert) => {
      const ver = versions.find((v) => v.id === cert.currentVersionId);
      const loCount = allObjectives.filter((o) => o.certificationId === cert.id).length;
      const lessonCount = allLessons.filter((l) => l.certificationId === cert.id).length;
      const fcCount = allFlashcards.filter((f) => f.certificationId === cert.id).length;
      const qCount = allQuestions.filter((q) => q.certificationId === cert.id).length;

      let coverageStatus: 'complete' | 'partial' | 'metadataOnly' = 'metadataOnly';
      if (lessonCount >= 6 && qCount >= 40 && fcCount >= 20) {
        coverageStatus = 'complete';
      } else if (loCount > 0 || lessonCount > 0 || qCount > 0) {
        coverageStatus = 'partial';
      }

      return {
        cert,
        versionNumber: ver?.versionNumber ?? '—',
        loCount,
        lessonCount,
        fcCount,
        qCount,
        coverageStatus,
      };
    });
  }, [certifications, versions, allObjectives, allLessons, allFlashcards, allQuestions]);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('analytics.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t('analytics.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            {t('analytics.accuracyByChapter')}
          </h2>
          {chapterChartData.length === 0 ? (
            <p className="text-sm text-slate-500">{t('dashboard.noWeaknessesYet')}</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" width={36} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            {t('analytics.examTrend')}
          </h2>
          {examTrendData.length === 0 ? (
            <p className="text-sm text-slate-500">{t('common.noResults')}</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" width={36} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Coverage Matrix across the entire ISTQB Catalogue */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          {t('analytics.coverageMatrix')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Code</th>
                <th className="py-2.5 px-3 font-medium">Certification</th>
                <th className="py-2.5 px-3 font-medium">Version</th>
                <th className="py-2.5 px-3 font-medium text-right">LOs</th>
                <th className="py-2.5 px-3 font-medium text-right">Lessons</th>
                <th className="py-2.5 px-3 font-medium text-right">Cards</th>
                <th className="py-2.5 px-3 font-medium text-right">QCM</th>
                <th className="py-2.5 pl-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
              {coverageRows.map((row) => (
                <tr key={row.cert.id}>
                  <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">
                    {row.cert.code}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                    {tText(row.cert.name, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{row.versionNumber}</td>
                  <td className="py-2.5 px-3 text-right">{row.loCount}</td>
                  <td className="py-2.5 px-3 text-right">{row.lessonCount}</td>
                  <td className="py-2.5 px-3 text-right">{row.fcCount}</td>
                  <td className="py-2.5 px-3 text-right">{row.qCount}</td>
                  <td className="py-2.5 pl-3 font-sans">
                    <span
                      className={
                        row.coverageStatus === 'complete'
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : row.coverageStatus === 'partial'
                            ? 'text-sky-700 dark:text-sky-400 font-medium'
                            : 'text-slate-500'
                      }
                    >
                      {t(`analytics.${row.coverageStatus}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
