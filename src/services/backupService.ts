import { db, type IstqbAcademyDB } from '../db/database';
import { flashcardsPackSchema, fullBackupSchema } from '../lib/schemas';
import type { Flashcard, ProvenanceMetadata } from '../types/domain';
import { safeParseJson } from './securityService';

const CUSTOM_PROVENANCE: ProvenanceMetadata = {
  source: 'User Imported / Personal Flashcards',
  license: 'User Owned',
  author: 'Learner',
  lastVerifiedAt: new Date().toISOString().slice(0, 10),
  status: 'published',
};

export interface ImportSummary {
  importedCount: number;
  skippedDuplicates: number;
}

export async function exportFullBackupJson(targetDb: IstqbAcademyDB = db): Promise<string> {
  const [
    appSettings,
    lessonProgress,
    allFlashcards,
    flashcardStates,
    reviewLogs,
    quizAttempts,
    questionPreferences,
    examAttempts,
    studyPlans,
    plannedActivities,
    studySessions,
    glossaryPreferences,
    dailyChallenges,
    diagnosticResults,
  ] = await Promise.all([
    targetDb.appSettings.toArray(),
    targetDb.lessonProgress.toArray(),
    targetDb.flashcards.toArray(),
    targetDb.flashcardStates.toArray(),
    targetDb.reviewLogs.toArray(),
    targetDb.quizAttempts.toArray(),
    targetDb.questionPreferences.toArray(),
    targetDb.examAttempts.toArray(),
    targetDb.studyPlans.toArray(),
    targetDb.plannedActivities.toArray(),
    targetDb.studySessions.toArray(),
    targetDb.glossaryPreferences.toArray(),
    targetDb.dailyChallenges.toArray(),
    targetDb.diagnosticResults.toArray(),
  ]);

  const payload = {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    app: 'ISTQB Academy' as const,
    data: {
      appSettings,
      lessonProgress,
      flashcardsCustom: allFlashcards.filter((c) => c.isCustom),
      flashcardStates,
      reviewLogs,
      quizAttempts,
      questionPreferences,
      examAttempts,
      studyPlans,
      plannedActivities,
      studySessions,
      glossaryPreferences,
      dailyChallenges,
      diagnosticResults,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and restores a full backup inside a single atomic transaction.
 * Any schema, version, or relation error aborts the transaction leaving the DB untouched.
 */
export async function importFullBackupJson(
  rawJson: string,
  targetDb: IstqbAcademyDB = db,
): Promise<ImportSummary> {
  const parsed = safeParseJson(rawJson);
  const result = fullBackupSchema.safeParse(parsed);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new Error(
      `Invalid backup schema: ${firstIssue?.path.join('.') ?? 'root'} — ${firstIssue?.message ?? 'validation failed'}`,
    );
  }

  const backup = result.data;
  if (backup.schemaVersion > 2) {
    throw new Error(`Unsupported backup schemaVersion ${backup.schemaVersion}`);
  }

  let importedCount = 0;

  await targetDb.transaction(
    'rw',
    [
      targetDb.syllabusVersions,
      targetDb.appSettings,
      targetDb.lessonProgress,
      targetDb.flashcards,
      targetDb.flashcardStates,
      targetDb.reviewLogs,
      targetDb.quizAttempts,
      targetDb.questionPreferences,
      targetDb.examAttempts,
      targetDb.studyPlans,
      targetDb.plannedActivities,
      targetDb.studySessions,
      targetDb.glossaryPreferences,
      targetDb.dailyChallenges,
      targetDb.diagnosticResults,
      targetDb.backups,
    ],
    async () => {
      const validVersions = new Set(
        (await targetDb.syllabusVersions.toArray()).map((v) => v.id),
      );

      for (const card of backup.data.flashcardsCustom) {
        if (!validVersions.has(card.versionId)) {
          throw new Error(`Unknown syllabus version reference in custom card: ${card.versionId}`);
        }
      }

      if (backup.data.lessonProgress.length > 0) {
        await targetDb.lessonProgress.bulkPut(backup.data.lessonProgress as never[]);
        importedCount += backup.data.lessonProgress.length;
      }

      if (backup.data.flashcardsCustom.length > 0) {
        const now = new Date().toISOString();
        const cardsToSave: Flashcard[] = backup.data.flashcardsCustom.map((c) => ({
          ...c,
          isCustom: true,
          provenance: c.provenance ?? CUSTOM_PROVENANCE,
          createdAt: now,
          updatedAt: now,
        }));
        await targetDb.flashcards.bulkPut(cardsToSave);
        importedCount += cardsToSave.length;
      }

      if (backup.data.flashcardStates.length > 0) {
        await targetDb.flashcardStates.bulkPut(backup.data.flashcardStates as never[]);
        importedCount += backup.data.flashcardStates.length;
      }
      if (backup.data.reviewLogs.length > 0) {
        await targetDb.reviewLogs.bulkPut(backup.data.reviewLogs as never[]);
        importedCount += backup.data.reviewLogs.length;
      }
      if (backup.data.quizAttempts.length > 0) {
        await targetDb.quizAttempts.bulkPut(backup.data.quizAttempts as never[]);
        importedCount += backup.data.quizAttempts.length;
      }
      if (backup.data.questionPreferences.length > 0) {
        await targetDb.questionPreferences.bulkPut(backup.data.questionPreferences as never[]);
      }
      if (backup.data.examAttempts.length > 0) {
        await targetDb.examAttempts.bulkPut(backup.data.examAttempts as never[]);
        importedCount += backup.data.examAttempts.length;
      }
      if (backup.data.studyPlans.length > 0) {
        await targetDb.studyPlans.bulkPut(backup.data.studyPlans as never[]);
      }
      if (backup.data.plannedActivities.length > 0) {
        await targetDb.plannedActivities.bulkPut(backup.data.plannedActivities as never[]);
      }
      if (backup.data.studySessions.length > 0) {
        await targetDb.studySessions.bulkPut(backup.data.studySessions as never[]);
      }
      if (backup.data.glossaryPreferences.length > 0) {
        await targetDb.glossaryPreferences.bulkPut(backup.data.glossaryPreferences as never[]);
      }
      if (backup.data.dailyChallenges.length > 0) {
        await targetDb.dailyChallenges.bulkPut(backup.data.dailyChallenges as never[]);
      }
      if (backup.data.diagnosticResults.length > 0) {
        await targetDb.diagnosticResults.bulkPut(backup.data.diagnosticResults as never[]);
      }

      await targetDb.backups.put({
        id: `restore-${Date.now()}`,
        createdAt: new Date().toISOString(),
        label: `Restored (${importedCount} records)`,
        schemaVersion: backup.schemaVersion,
        sizeBytes: rawJson.length,
      });
    },
  );

  return { importedCount, skippedDuplicates: 0 };
}

export async function exportFlashcardsJson(
  versionId: string,
  targetDb: IstqbAcademyDB = db,
): Promise<string> {
  const cards = await targetDb.flashcards.where('versionId').equals(versionId).toArray();
  return JSON.stringify(
    {
      schemaVersion: 1,
      type: 'flashcards_pack',
      cards,
    },
    null,
    2,
  );
}

export async function importFlashcardsPackJson(
  rawJson: string,
  targetDb: IstqbAcademyDB = db,
): Promise<ImportSummary> {
  const parsed = safeParseJson(rawJson);
  const result = flashcardsPackSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `Invalid flashcards pack: ${issue?.path.join('.') ?? 'root'} — ${issue?.message ?? 'invalid'}`,
    );
  }

  let importedCount = 0;
  let skippedDuplicates = 0;

  await targetDb.transaction('rw', [targetDb.flashcards, targetDb.syllabusVersions], async () => {
    const versions = new Set((await targetDb.syllabusVersions.toArray()).map((v) => v.id));
    const existing = await targetDb.flashcards.toArray();
    const existingKeys = new Set(
      existing.map((c) => `${c.versionId}::${c.front.fr.trim().toLowerCase()}`),
    );
    const now = new Date().toISOString();

    const toInsert: Flashcard[] = [];
    for (const card of result.data.cards) {
      if (!versions.has(card.versionId)) {
        throw new Error(`Unknown syllabus version: ${card.versionId}`);
      }
      const dedupeKey = `${card.versionId}::${card.front.fr.trim().toLowerCase()}`;
      if (existingKeys.has(dedupeKey)) {
        skippedDuplicates++;
        continue;
      }
      existingKeys.add(dedupeKey);
      toInsert.push({
        ...card,
        provenance: card.provenance ?? CUSTOM_PROVENANCE,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (toInsert.length > 0) {
      await targetDb.flashcards.bulkPut(toInsert);
      importedCount = toInsert.length;
    }
  });

  return { importedCount, skippedDuplicates };
}
