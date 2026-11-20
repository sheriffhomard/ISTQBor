import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, Edit3, Eye, Plus, Star, Upload } from 'lucide-react';
import { db } from '../../db/database';
import { tText } from '../../lib/localize';
import {
  createInitialFlashcardState,
  isCardDue,
  isCardMastered,
  previewIntervals,
  recordFlashcardReview,
  type FsrsRatingValue,
} from '../../services/fsrsService';
import { exportFlashcardsJson, importFlashcardsPackJson } from '../../services/backupService';
import type { AppLanguage, Flashcard } from '../../types/domain';

type StudyMode = 'due' | 'random' | 'errors' | 'hard' | 'favorites' | 'chapter' | 'objective' | 'all';

interface FlashcardsViewProps {
  lang: AppLanguage;
  certificationId: string;
  versionId: string;
  initialChapterId?: string;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  lang,
  certificationId,
  versionId,
  initialChapterId,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flashcards =
    useLiveQuery(() => db.flashcards.where('versionId').equals(versionId).toArray(), [versionId]) ??
    [];
  const states =
    useLiveQuery(
      () => db.flashcardStates.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];
  const chapters =
    useLiveQuery(
      () => db.chapters.where('versionId').equals(versionId).sortBy('order'),
      [versionId],
    ) ?? [];
  const objectives =
    useLiveQuery(
      () => db.learningObjectives.where('versionId').equals(versionId).toArray(),
      [versionId],
    ) ?? [];

  const [mode, setMode] = useState<StudyMode>(initialChapterId ? 'chapter' : 'due');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId ?? '');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setCardIndex(0);
    setRevealed(false);
    setShowHint(false);
    setSelectedChapterId(initialChapterId ?? '');
    setSelectedObjectiveId('');
  }, [versionId, initialChapterId]);

  // Create / Edit custom card modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formFrontFr, setFormFrontFr] = useState('');
  const [formFrontEn, setFormFrontEn] = useState('');
  const [formBackFr, setFormBackFr] = useState('');
  const [formBackEn, setFormBackEn] = useState('');
  const [formHintFr, setFormHintFr] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formObjectiveId, setFormObjectiveId] = useState('');

  const stateMap = useMemo(() => new Map(states.map((s) => [s.cardId, s])), [states]);

  const stats = useMemo(() => {
    const now = new Date();
    const due = flashcards.filter((c) => isCardDue(stateMap.get(c.id), now)).length;
    const mastered = flashcards.filter((c) => isCardMastered(stateMap.get(c.id))).length;
    return { total: flashcards.length, due, mastered };
  }, [flashcards, stateMap]);

  const queue = useMemo(() => {
    const now = new Date();
    let list = [...flashcards];

    if (mode === 'due') {
      list = list.filter((c) => isCardDue(stateMap.get(c.id), now));
    } else if (mode === 'errors') {
      list = list.filter((c) => {
        const st = stateMap.get(c.id);
        return st && st.totalIncorrect > 0;
      });
    } else if (mode === 'hard') {
      list = list.filter((c) => {
        const st = stateMap.get(c.id);
        return st && (st.lapses >= 1 || st.difficulty >= 6.5);
      });
    } else if (mode === 'favorites') {
      list = list.filter((c) => stateMap.get(c.id)?.isFavorite);
    } else if (mode === 'chapter') {
      const chId = selectedChapterId || chapters[0]?.id;
      if (chId) list = list.filter((c) => c.chapterId === chId);
    } else if (mode === 'objective') {
      const objId = selectedObjectiveId || objectives[0]?.id;
      if (objId) list = list.filter((c) => c.objectiveId === objId);
    }

    if (mode === 'random') {
      list.sort(() => Math.random() - 0.5);
    }
    return list;
  }, [flashcards, stateMap, mode, selectedChapterId, selectedObjectiveId, chapters, objectives]);

  const safeIndex = queue.length > 0 ? Math.min(cardIndex, queue.length - 1) : 0;
  const currentCard = queue[safeIndex];
  const currentState = currentCard
    ? (stateMap.get(currentCard.id) ?? createInitialFlashcardState(currentCard))
    : null;
  const intervals = currentState ? previewIntervals(currentState) : null;

  const handleRate = async (rating: FsrsRatingValue) => {
    if (!currentCard) return;
    await recordFlashcardReview(currentCard, rating);
    setRevealed(false);
    setShowHint(false);
    if (mode === 'due') {
      // Rated card leaves the due queue automatically; stay at same index (or wrap if at end)
      setCardIndex((i) => (queue.length <= 1 ? 0 : Math.min(i, queue.length - 2)));
    } else if (safeIndex < queue.length - 1) {
      setCardIndex(safeIndex + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handleStep = (delta: number) => {
    if (queue.length <= 1) return;
    setRevealed(false);
    setShowHint(false);
    setCardIndex((safeIndex + delta + queue.length) % queue.length);
  };

  const toggleFavorite = async (card: Flashcard) => {
    const existing = stateMap.get(card.id) ?? createInitialFlashcardState(card);
    await db.flashcardStates.put({
      ...existing,
      isFavorite: !existing.isFavorite,
    });
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setFormFrontFr('');
    setFormFrontEn('');
    setFormBackFr('');
    setFormBackEn('');
    setFormHintFr('');
    setFormChapterId(chapters[0]?.id ?? '');
    setFormObjectiveId(objectives[0]?.id ?? '');
    setEditorOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setFormFrontFr(card.front.fr);
    setFormFrontEn(card.front.en);
    setFormBackFr(card.back.fr);
    setFormBackEn(card.back.en);
    setFormHintFr(card.hint?.fr ?? '');
    setFormChapterId(card.chapterId);
    setFormObjectiveId(card.objectiveId);
    setEditorOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFrontFr.trim() || !formBackFr.trim()) return;
    const now = new Date().toISOString();

    const card: Flashcard = {
      id: editingCard?.id ?? `fc-custom-${Date.now()}`,
      certificationId,
      versionId,
      chapterId: formChapterId || chapters[0]?.id || 'custom',
      objectiveId: formObjectiveId || objectives[0]?.id || 'custom',
      languageScope: 'bilingual',
      front: {
        fr: formFrontFr.trim(),
        en: formFrontEn.trim() || formFrontFr.trim(),
      },
      back: {
        fr: formBackFr.trim(),
        en: formBackEn.trim() || formBackFr.trim(),
      },
      hint: formHintFr.trim()
        ? { fr: formHintFr.trim(), en: formHintFr.trim() }
        : undefined,
      tags: editingCard?.tags ?? ['custom'],
      isCustom: editingCard ? editingCard.isCustom : true,
      provenance: editingCard?.provenance ?? {
        source: 'Personal Flashcard',
        license: 'User Owned',
        author: 'Learner',
        lastVerifiedAt: now.slice(0, 10),
        status: 'published',
      },
      createdAt: editingCard?.createdAt ?? now,
      updatedAt: now,
    };

    // Note: editing card NEVER overwrites flashcardStates or reviewLogs!
    await db.flashcards.put(card);
    setEditorOpen(false);
    setStatusMessage(t('flashcards.statsPreserved'));
  };

  const handleExport = async () => {
    const json = await exportFlashcardsJson(versionId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `istqb-academy-flashcards-${versionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await importFlashcardsPackJson(text);
      setStatusMessage(
        `${res.importedCount} ${t('common.cards')} (+${res.skippedDuplicates} duplicates skipped)`,
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : t('app.errorGeneric'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('flashcards.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t('flashcards.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white hover:opacity-90 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t('flashcards.createCard')}
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t('flashcards.exportJson')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {t('flashcards.importJson')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => void handleImportFile(e)}
          />
        </div>
      </div>

      {/* Metrics & Modes */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
          <span>
            {t('flashcards.dueCount')}: <strong className="text-sky-700 dark:text-sky-400">{stats.due}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t('flashcards.masteredCards')}: <strong>{stats.mastered}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t('flashcards.totalCards')}: <strong>{stats.total}</strong>
          </span>
        </div>

        {statusMessage && (
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
          {(
            ['due', 'random', 'errors', 'hard', 'favorites', 'chapter', 'objective', 'all'] as const
          ).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setCardIndex(0);
                setRevealed(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === m
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t(`flashcards.modes.${m}`)}
            </button>
          ))}
        </div>

        {mode === 'chapter' && (
          <select
            value={selectedChapterId || chapters[0]?.id || ''}
            onChange={(e) => {
              setSelectedChapterId(e.target.value);
              setCardIndex(0);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.code}. {tText(ch.title, lang)}
              </option>
            ))}
          </select>
        )}

        {mode === 'objective' && (
          <select
            value={selectedObjectiveId || objectives[0]?.id || ''}
            onChange={(e) => {
              setSelectedObjectiveId(e.target.value);
              setCardIndex(0);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs max-w-xs"
          >
            {objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.code} · {tText(obj.title, lang)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Active Flashcard Stage */}
      {!currentCard ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('flashcards.sessionEmpty')}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="font-mono tabular-nums">
              {safeIndex + 1} / {queue.length} · {currentCard.objectiveId} ·{' '}
              {currentState?.reps ?? 0} reps
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    aria-label={t('common.previous')}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    aria-label={t('common.next')}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => openEditModal(currentCard)}
                aria-label={t('flashcards.editCard')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void toggleFavorite(currentCard)}
                aria-label={t('common.favorite')}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  currentState?.isFavorite
                    ? 'text-amber-500 border-amber-300 dark:border-amber-700'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Star className="h-3.5 w-3.5" fill={currentState?.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="min-h-36 flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
              {tText(currentCard.front, lang)}
            </h2>

            {currentCard.hint && !revealed && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {t('flashcards.showHint')}
                </button>
                {showHint && (
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    {tText(currentCard.hint, lang)}
                  </p>
                )}
              </div>
            )}

            {revealed && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                  {tText(currentCard.back, lang)}
                </p>
                <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                  {currentCard.provenance.source} · {t(`status.${currentCard.provenance.status}`)}
                </p>
              </div>
            )}
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {t('flashcards.revealAnswer')}
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(
                [
                  { rating: 1 as const, label: t('flashcards.ratingAgain'), cls: 'border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50' },
                  { rating: 2 as const, label: t('flashcards.ratingHard'), cls: 'border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/50' },
                  { rating: 3 as const, label: t('flashcards.ratingGood'), cls: 'border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-950/50' },
                  { rating: 4 as const, label: t('flashcards.ratingEasy'), cls: 'border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.rating}
                  type="button"
                  onClick={() => void handleRate(btn.rating)}
                  className={`p-3 rounded-lg border text-center transition-colors ${btn.cls}`}
                >
                  <div className="text-xs font-semibold">{btn.label}</div>
                  <div className="text-[11px] font-mono tabular-nums opacity-80 mt-0.5">
                    {intervals ? `${intervals[btn.rating]}d` : '—'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <form
            onSubmit={(e) => void handleSaveCard(e)}
            className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCard ? t('flashcards.editCard') : t('flashcards.createCard')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('syllabus.chapters')}
                <select
                  value={formChapterId}
                  onChange={(e) => setFormChapterId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}. {tText(c.title, lang)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('syllabus.objectives')}
                <select
                  value={formObjectiveId}
                  onChange={(e) => setFormObjectiveId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  {objectives.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('flashcards.frontLabel')} (FR) *
              <textarea
                required
                rows={2}
                value={formFrontFr}
                onChange={(e) => setFormFrontFr(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('flashcards.frontLabel')} (EN)
              <textarea
                rows={2}
                value={formFrontEn}
                onChange={(e) => setFormFrontEn(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('flashcards.backLabel')} (FR) *
              <textarea
                required
                rows={2}
                value={formBackFr}
                onChange={(e) => setFormBackFr(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('flashcards.backLabel')} (EN)
              <textarea
                rows={2}
                value={formBackEn}
                onChange={(e) => setFormBackEn(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('flashcards.hintLabel')}
              <input
                type="text"
                value={formHintFr}
                onChange={(e) => setFormHintFr(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0B192C] dark:bg-sky-600 text-xs font-medium text-white"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
