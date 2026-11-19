import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../db/database';
import { runGlobalSearch } from '../services/searchService';
import type { AppLanguage } from '../types/domain';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  lang,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const certifications = useLiveQuery(() => db.certifications.toArray(), []) ?? [];
  const objectives = useLiveQuery(() => db.learningObjectives.toArray(), []) ?? [];
  const lessons = useLiveQuery(() => db.lessons.toArray(), []) ?? [];
  const flashcards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];
  const questions = useLiveQuery(() => db.questions.toArray(), []) ?? [];
  const glossary = useLiveQuery(() => db.glossaryTerms.toArray(), []) ?? [];

  const results = useMemo(
    () =>
      runGlobalSearch({
        query,
        certifications,
        objectives,
        lessons,
        flashcards,
        questions,
        glossary,
      }),
    [query, certifications, objectives, lessons, flashcards, questions, glossary],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('common.search')}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('app.close')}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {query.trim().length < 2 ? (
            <p className="p-6 text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr'
                ? 'Saisissez au moins 2 caractères pour rechercher dans les certifications, objectifs, cours, flashcards, QCM et glossaire.'
                : 'Type at least 2 characters to search certifications, objectives, lessons, flashcards, questions, and glossary.'}
            </p>
          ) : results.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t('common.noResults')}</p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.targetTab);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {lang === 'fr' ? item.titleFr : item.titleEn}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{item.kind}</span>
                    {item.subtitle && (
                      <>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="font-mono">{item.subtitle}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-sky-700 dark:text-sky-400 shrink-0">
                  →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
