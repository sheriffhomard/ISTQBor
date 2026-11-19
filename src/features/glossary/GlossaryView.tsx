import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import type { AppLanguage, GlossaryTerm } from '../../types/domain';

interface GlossaryViewProps {
  lang: AppLanguage;
  onNavigateFlashcards: () => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ lang, onNavigateFlashcards }) => {
  const { t } = useTranslation();
  const terms = useLiveQuery(() => db.glossaryTerms.toArray(), []) ?? [];
  const prefs = useLiveQuery(() => db.glossaryPreferences.toArray(), []) ?? [];

  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  const prefMap = useMemo(() => new Map(prefs.map((p) => [p.termId, p])), [prefs]);
  const termsMap = useMemo(() => new Map(terms.map((item) => [item.id, item])), [terms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms
      .filter((term) => {
        if (favoritesOnly && !prefMap.get(term.id)?.isFavorite) return false;
        if (!q) return true;
        return (
          term.termEn.toLowerCase().includes(q) ||
          term.termFr.toLowerCase().includes(q) ||
          term.pedagogicalExplanation.fr.toLowerCase().includes(q) ||
          term.pedagogicalExplanation.en.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        lang === 'fr' ? a.termFr.localeCompare(b.termFr) : a.termEn.localeCompare(b.termEn),
      );
  }, [terms, query, favoritesOnly, prefMap, lang]);

  const activeTerm: GlossaryTerm | undefined =
    termsMap.get(selectedId) ?? filtered[0];

  const selectTerm = async (termId: string) => {
    setSelectedId(termId);
    const existing = prefMap.get(termId);
    await db.glossaryPreferences.put({
      termId,
      isFavorite: existing?.isFavorite ?? false,
      lastViewedAt: new Date().toISOString(),
    });
  };

  const toggleFavorite = async (termId: string) => {
    const existing = prefMap.get(termId);
    await db.glossaryPreferences.put({
      termId,
      isFavorite: !(existing?.isFavorite ?? false),
      lastViewedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('glossary.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('glossary.subtitle')}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            className="w-full sm:w-80 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium ${
              favoritesOnly
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Star className="h-3.5 w-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} />
            {t('glossary.favoritesOnly')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">{t('common.noResults')}</p>
          ) : (
            filtered.map((term) => {
              const isSelected = term.id === activeTerm?.id;
              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => void selectTerm(term.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    isSelected
                      ? 'bg-sky-50/70 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lang === 'fr' ? term.termFr : term.termEn}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'fr' ? term.termEn : term.termFr} · {term.chapterCodes.join(', ')}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {activeTerm && (
          <aside className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  {activeTerm.glossaryVersion} · {activeTerm.certificationIds.join(', ').toUpperCase()}
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {activeTerm.termFr} / {activeTerm.termEn}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void toggleFavorite(activeTerm.id)}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 ${
                  prefMap.get(activeTerm.id)?.isFavorite ? 'text-amber-500' : 'text-slate-400'
                }`}
                aria-label={t('common.favorite')}
              >
                <Star
                  className="h-4 w-4"
                  fill={prefMap.get(activeTerm.id)?.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('glossary.pedagogicalNote')}
              </h3>
              <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {tText(activeTerm.pedagogicalExplanation, lang)}
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('common.source')}: {activeTerm.source}
            </div>

            {activeTerm.relatedTermIds.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('glossary.relatedTerms')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeTerm.relatedTermIds.map((relId) => {
                    const rel = termsMap.get(relId);
                    if (!rel) return null;
                    return (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => void selectTerm(relId)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-sky-700 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {lang === 'fr' ? rel.termFr : rel.termEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateFlashcards}
                className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
              >
                {t('glossary.linkedFlashcard')} →
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
