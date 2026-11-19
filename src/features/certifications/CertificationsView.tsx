import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink, Scale, Trash2, DownloadCloud } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import type { AppLanguage, Certification, CertificationLevel, CertificationStatus } from '../../types/domain';

interface CertificationsViewProps {
  lang: AppLanguage;
  activeCertificationId: string;
  activeVersionId: string;
  onSelectActive: (certId: string, versionId: string) => Promise<void>;
  onNavigateSyllabus: () => void;
}

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  lang,
  activeCertificationId,
  activeVersionId,
  onSelectActive,
  onNavigateSyllabus,
}) => {
  const { t } = useTranslation();
  const certifications = useLiveQuery(() => db.certifications.toArray(), []) ?? [];
  const versions = useLiveQuery(() => db.syllabusVersions.toArray(), []) ?? [];

  const [levelFilter, setLevelFilter] = useState<CertificationLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<string>(activeCertificationId);
  const [compareIds, setCompareIds] = useState<string[]>(['ctfl', 'ctfl-at']);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certifications.filter((cert) => {
      if (levelFilter !== 'all' && cert.level !== levelFilter) return false;
      if (statusFilter !== 'all' && cert.status !== statusFilter) return false;
      if (q) {
        const hay = `${cert.code} ${cert.name.fr} ${cert.name.en} ${cert.description.fr} ${cert.description.en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [certifications, levelFilter, statusFilter, search]);

  const selectedCert: Certification | undefined =
    certifications.find((c) => c.id === selectedCertId) ?? filtered[0];

  const selectedVersions = useMemo(
    () =>
      versions
        .filter((v) => v.certificationId === selectedCert?.id)
        .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)),
    [versions, selectedCert],
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length >= 3
          ? [...prev.slice(1), id]
          : [...prev, id],
    );
  };

  const togglePackInstall = async (versionId: string, nextInstalled: boolean) => {
    await db.syllabusVersions.update(versionId, { isPackDownloaded: nextInstalled });
  };

  const comparedCerts = certifications.filter((c) => compareIds.includes(c.id));

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('certifications.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          {t('certifications.subtitle')}
        </p>

        {/* Filters & Search */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full sm:w-64 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            {(['all', 'foundation', 'advanced', 'specialist', 'expert'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  levelFilter === lvl
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {lvl === 'all' ? t('common.all') : t(`levels.${lvl}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            {(['all', 'active', 'retired', 'replaced'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? t('common.all') : t(`status.${st}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalogue Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((cert) => {
            const isSelected = cert.id === selectedCert?.id;
            const isActiveUserCert = cert.id === activeCertificationId;
            const isCompared = compareIds.includes(cert.id);

            return (
              <div
                key={cert.id}
                className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30 dark:border-sky-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onClick={() => setSelectedCertId(cert.id)}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {cert.code}
                  </span>
                  <span>
                    {t(`levels.${cert.level}`)} · {t(`status.${cert.status}`)}
                  </span>
                </div>
                <h2 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-white leading-snug">
                  {tText(cert.name, lang)}
                </h2>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {tText(cert.description, lang)}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(cert.id);
                    }}
                    className={`text-xs font-medium whitespace-nowrap ${
                      isCompared
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isCompared ? `✓ ${t('certifications.compareSelect')}` : `+ ${t('certifications.compareSelect')}`}
                  </button>
                  {isActiveUserCert && (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('certifications.activeBadge')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Certification & Versions Details */}
        {selectedCert && (
          <aside className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {selectedCert.code}
                </span>
                {' · '}
                {t(`domains.${selectedCert.domain}`)}
                {' · '}
                {t(`status.${selectedCert.status}`)}
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {tText(selectedCert.name, lang)}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {tText(selectedCert.description, lang)}
              </p>
            </div>

            <div className="text-xs space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('certifications.prerequisites')}:{' '}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {selectedCert.prerequisites.length > 0
                    ? selectedCert.prerequisites.join(', ')
                    : t('certifications.noPrerequisites')}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('common.source')}:{' '}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {selectedCert.sources.join(' · ')} ({selectedCert.lastVerified})
                </span>
              </div>
              <a
                href={selectedCert.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400 hover:underline font-medium pt-1"
              >
                {t('common.officialUrl')}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Syllabus Versions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('certifications.versionsHistory')}
              </h3>
              {selectedVersions.map((ver) => {
                const isCurrentActive = ver.id === activeVersionId;
                return (
                  <div
                    key={ver.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {ver.versionNumber}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {ver.releaseDate} · {t(`status.${ver.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {tText(ver.changelogSummary, lang)}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono tabular-nums">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {t('certifications.duration')}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {ver.examConfig.durationMinutes !== null
                            ? `${ver.examConfig.durationMinutes} min`
                            : t('common.unverified')}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {t('certifications.questionCount')}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {ver.examConfig.questionCount !== null
                            ? ver.examConfig.questionCount
                            : t('common.unverified')}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {t('certifications.passingScore')}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {ver.examConfig.passingScorePercent !== null
                            ? `${ver.examConfig.passingScorePercent}%`
                            : t('common.unverified')}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tText(ver.examConfig.verificationNote, lang)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await onSelectActive(selectedCert.id, ver.id);
                          onNavigateSyllabus();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          isCurrentActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#0B192C] dark:bg-sky-600 text-white hover:opacity-90'
                        }`}
                      >
                        {isCurrentActive
                          ? t('certifications.activeBadge')
                          : t('certifications.selectActiveVersion')}
                      </button>

                      <button
                        type="button"
                        onClick={() => void togglePackInstall(ver.id, !ver.isPackDownloaded)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
                      >
                        {ver.isPackDownloaded ? (
                          <>
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('certifications.removePack')}
                          </>
                        ) : (
                          <>
                            <DownloadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('certifications.downloadPack')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Certification Comparator */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('certifications.compareTitle')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            ({comparedCerts.length}/3)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">{t('common.status')} / Critère</th>
                {comparedCerts.map((c) => (
                  <th key={c.id} className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {c.code} · {tText(c.name, lang)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-400">Level</td>
                {comparedCerts.map((c) => (
                  <td key={c.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {t(`levels.${c.level}`)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-400">
                  {t('certifications.prerequisites')}
                </td>
                {comparedCerts.map((c) => (
                  <td key={c.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {c.prerequisites.length > 0 ? c.prerequisites.join(', ') : t('certifications.noPrerequisites')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-400">
                  {t('certifications.examParameters')}
                </td>
                {comparedCerts.map((c) => {
                  const v = versions.find((ver) => ver.id === c.currentVersionId);
                  return (
                    <td key={c.id} className="py-3 px-4 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {v?.examConfig.questionCount
                        ? `${v.examConfig.questionCount} q. · ${v.examConfig.durationMinutes} min · ${v.examConfig.passingScorePercent}%`
                        : t('common.unverified')}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
