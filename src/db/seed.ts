import { db, type IstqbAcademyDB } from './database';
import { CERTIFICATIONS_CATALOG, SYLLABUS_VERSIONS } from '../data/catalog';
import {
  CTFL_V4_CHAPTERS,
  CTFL_V4_OBJECTIVES,
  CTFL_V4_SECTIONS,
} from '../data/syllabi_ctfl_v4';
import {
  HISTORICAL_AND_EXTENSION_CHAPTERS,
  HISTORICAL_OBJECTIVES,
  HISTORICAL_SECTIONS,
} from '../data/syllabi_historical';
import { CTFL_V4_LESSONS } from '../data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../data/flashcards_ctfl_v4';
import { CTFL_V4_QUESTIONS } from '../data/questions_ctfl_v4';
import { GLOSSARY_TERMS } from '../data/glossary';
import { AGILE_FLASHCARDS, AGILE_LESSONS, AGILE_QUESTIONS } from '../data/extensions_agile';
import { CT_AI_CHAPTERS, CT_AI_OBJECTIVES, CT_AI_SECTIONS } from '../data/syllabi_ct_ai';
import {
  ADVANCED_CHAPTERS,
  ADVANCED_OBJECTIVES,
  ADVANCED_SECTIONS,
} from '../data/syllabi_advanced';
import {
  SPECIALIST_CHAPTERS,
  SPECIALIST_OBJECTIVES,
  SPECIALIST_SECTIONS,
} from '../data/syllabi_specialist';
import { CT_AI_FLASHCARDS } from '../data/flashcards_ct_ai';
import { CTAL_TM_FLASHCARDS } from '../data/flashcards_ctal_tm';
import { CTAL_TA_FLASHCARDS } from '../data/flashcards_ctal_ta';
import { CTAL_TTA_FLASHCARDS } from '../data/flashcards_ctal_tta';
import { CT_TAS_FLASHCARDS } from '../data/flashcards_ct_tas';
import { CT_TAE_FLASHCARDS } from '../data/flashcards_ct_tae';
import { CT_PT_FLASHCARDS } from '../data/flashcards_ct_pt';
import { CT_SEC_FLASHCARDS } from '../data/flashcards_ct_sec';
import { CT_MAT_FLASHCARDS } from '../data/flashcards_ct_mat';
import { CTEL_TM_FLASHCARDS } from '../data/flashcards_ctel_tm';
import { CTFL_2011_FLASHCARDS } from '../data/flashcards_ctfl_2011';
import type { AppSettings } from '../types/domain';

const DEFAULT_SETTINGS: AppSettings = {
  id: 'user_settings',
  language: 'fr',
  theme: 'light',
  activeCertificationId: 'ctfl',
  activeVersionId: 'ctfl-v4.0',
  dailyReminderEnabled: false,
  dailyReminderTime: '19:00',
  dailyGoalMinutes: 30,
  nonNativeTimeExtension: false,
  updatedAt: '2026-11-19T00:00:00.000Z',
};

/**
 * Idempotently seeds catalogue and core curriculum into IndexedDB.
 * NEVER overwrites user progress, custom flashcards, review logs, or existing settings.
 */
export async function ensureSeeded(targetDb: IstqbAcademyDB = db): Promise<void> {
  await targetDb.transaction(
    'rw',
    [
      targetDb.certifications,
      targetDb.syllabusVersions,
      targetDb.chapters,
      targetDb.sections,
      targetDb.learningObjectives,
      targetDb.lessons,
      targetDb.flashcards,
      targetDb.questions,
      targetDb.glossaryTerms,
      targetDb.appSettings,
    ],
    async () => {
      await targetDb.certifications.bulkPut(CERTIFICATIONS_CATALOG);

      // Preserve user's isPackDownloaded status if already saved
      const existingVersions = await targetDb.syllabusVersions.toArray();
      const packMap = new Map(existingVersions.map((v) => [v.id, v.isPackDownloaded]));
      const mergedVersions = SYLLABUS_VERSIONS.map((v) => ({
        ...v,
        isPackDownloaded: packMap.has(v.id) ? Boolean(packMap.get(v.id)) : v.isPackDownloaded,
      }));
      await targetDb.syllabusVersions.bulkPut(mergedVersions);

      await targetDb.chapters.bulkPut([
        ...CTFL_V4_CHAPTERS,
        ...HISTORICAL_AND_EXTENSION_CHAPTERS,
        ...CT_AI_CHAPTERS,
        ...ADVANCED_CHAPTERS,
        ...SPECIALIST_CHAPTERS,
      ]);
      await targetDb.sections.bulkPut([
        ...CTFL_V4_SECTIONS,
        ...HISTORICAL_SECTIONS,
        ...CT_AI_SECTIONS,
        ...ADVANCED_SECTIONS,
        ...SPECIALIST_SECTIONS,
      ]);
      await targetDb.learningObjectives.bulkPut([
        ...CTFL_V4_OBJECTIVES,
        ...HISTORICAL_OBJECTIVES,
        ...CT_AI_OBJECTIVES,
        ...ADVANCED_OBJECTIVES,
        ...SPECIALIST_OBJECTIVES,
      ]);
      await targetDb.lessons.bulkPut([...CTFL_V4_LESSONS, ...AGILE_LESSONS]);

      // Only add built-in flashcards; never delete or overwrite custom flashcards
      const builtInCards = [
        ...SEED_FLASHCARDS,
        ...AGILE_FLASHCARDS,
        ...CTAL_TM_FLASHCARDS,
        ...CTAL_TA_FLASHCARDS,
        ...CTAL_TTA_FLASHCARDS,
        ...CT_TAS_FLASHCARDS,
        ...CT_TAE_FLASHCARDS,
        ...CT_AI_FLASHCARDS,
        ...CT_PT_FLASHCARDS,
        ...CT_SEC_FLASHCARDS,
        ...CT_MAT_FLASHCARDS,
        ...CTEL_TM_FLASHCARDS,
        ...CTFL_2011_FLASHCARDS,
      ];
      await targetDb.flashcards.bulkPut(builtInCards);

      await targetDb.questions.bulkPut([...CTFL_V4_QUESTIONS, ...AGILE_QUESTIONS]);
      await targetDb.glossaryTerms.bulkPut(GLOSSARY_TERMS);

      const currentSettings = await targetDb.appSettings.get('user_settings');
      if (!currentSettings) {
        await targetDb.appSettings.put(DEFAULT_SETTINGS);
      }
    },
  );
}
