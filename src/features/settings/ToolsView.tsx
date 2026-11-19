import React, { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Download, Printer, ShieldCheck, Upload } from 'lucide-react';
import { db } from '../../db/database';
import { exportFullBackupJson, importFullBackupJson } from '../../services/backupService';
import type { AppLanguage } from '../../types/domain';

interface ToolsViewProps {
  lang: AppLanguage;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ lang }) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const backups =
    useLiveQuery(async () => {
      const list = await db.backups.toArray();
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, []) ?? [];

  const versions = useLiveQuery(() => db.syllabusVersions.toArray(), []) ?? [];
  const lessons = useLiveQuery(() => db.lessons.toArray(), []) ?? [];
  const flashcards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];
  const questions = useLiveQuery(() => db.questions.toArray(), []) ?? [];

  const handleExportAll = async () => {
    const json = await exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `istqb-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const summary = await importFullBackupJson(text);
      setFeedback({
        ok: true,
        text: `${t('tools.importSuccess')} (${summary.importedCount})`,
      });
    } catch (err) {
      setFeedback({
        ok: false,
        text: `${t('tools.importError')}${err instanceof Error ? err.message : 'Invalid file'}`,
      });
    } finally {
      e.target.value = '';
    }
  };

  const contentAudit = {
    publishedLessons: lessons.filter((l) => l.provenance.status === 'published').length,
    publishedCards: flashcards.filter((c) => c.provenance.status === 'published').length,
    publishedQuestions: questions.filter((q) => q.provenance.status === 'published').length,
    downloadedPacks: versions.filter((v) => v.isPackDownloaded).length,
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('tools.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('tools.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup & Restore */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t('tools.backupTitle')}
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleExportAll()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {t('tools.exportBackup')}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {t('tools.importBackup')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => void handleImportAll(e)}
            />
          </div>

          {feedback && (
            <p
              role="status"
              className={`text-xs font-medium p-3 rounded-lg border ${
                feedback.ok
                  ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                  : 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
              }`}
            >
              {feedback.text}
            </p>
          )}

          {backups.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              {backups.slice(0, 5).map((b) => (
                <div key={b.id} className="flex justify-between text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                  <span>{b.label}</span>
                  <span>{b.createdAt.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PDF / Print Export */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t('tools.printPdfTitle')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('tools.printPdfDesc')}
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            {t('tools.printAction')}
          </button>
        </section>

        {/* Content Audit & Governance */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t('tools.contentAdminTitle')}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-slate-500">{lang === 'fr' ? 'Cours publiés' : 'Published lessons'}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {contentAudit.publishedLessons}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-slate-500">{lang === 'fr' ? 'Flashcards publiées' : 'Published flashcards'}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {contentAudit.publishedCards}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-slate-500">{lang === 'fr' ? 'Questions QCM' : 'QCM questions'}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {contentAudit.publishedQuestions}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-slate-500">{lang === 'fr' ? 'Packs hors ligne' : 'Offline packs'}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {contentAudit.downloadedPacks} / {versions.length}
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h2>{t('tools.privacyTitle')}</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('tools.privacyText')}
          </p>
        </section>
      </div>
    </div>
  );
};
