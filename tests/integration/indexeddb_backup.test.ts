import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IstqbAcademyDB } from '../../src/db/database';
import { ensureSeeded } from '../../src/db/seed';
import {
  exportFullBackupJson,
  importFlashcardsPackJson,
  importFullBackupJson,
} from '../../src/services/backupService';
import { recordFlashcardReview } from '../../src/services/fsrsService';

describe('IndexedDB Persistence, Seeding & Atomic Backup Transactions', () => {
  let testDb: IstqbAcademyDB;

  beforeEach(async () => {
    testDb = new IstqbAcademyDB(`istqb_test_${Date.now()}_${Math.random()}`);
    await ensureSeeded(testDb);
  });

  afterEach(async () => {
    await testDb.delete();
  });

  it('seeds catalogue, CTFL v4.0 curriculum, and preserves user progress across re-seeding', async () => {
    const certs = await testDb.certifications.toArray();
    expect(certs.length).toBeGreaterThanOrEqual(10);

    const card = (await testDb.flashcards.toArray())[0]!;
    await recordFlashcardReview(card, 3, testDb);

    // Re-seed (simulating an app update)
    await ensureSeeded(testDb);

    const preservedState = await testDb.flashcardStates.get(card.id);
    expect(preservedState).toBeDefined();
    expect(preservedState!.reps).toBe(1);
    expect(preservedState!.totalCorrect).toBe(1);
  });

  it('performs full backup export and transactional restore, rejecting invalid JSON without partial writes', async () => {
    await testDb.lessonProgress.put({
      id: 'ctfl-v4.0::lesson-ctfl4-ch1',
      certificationId: 'ctfl',
      versionId: 'ctfl-v4.0',
      lessonId: 'lesson-ctfl4-ch1',
      chapterId: 'ctfl-v4.0-ch1',
      completed: true,
      readingSeconds: 300,
      lastReadAt: '2026-11-19T12:00:00.000Z',
    });

    const exportedJson = await exportFullBackupJson(testDb);

    // Clear progress then restore
    await testDb.lessonProgress.clear();
    expect(await testDb.lessonProgress.count()).toBe(0);

    const summary = await importFullBackupJson(exportedJson, testDb);
    expect(summary.importedCount).toBeGreaterThanOrEqual(1);
    expect(await testDb.lessonProgress.count()).toBe(1);

    // Attempt invalid import with unknown version reference -> must fail atomically
    const corrupted = JSON.stringify({
      schemaVersion: 2,
      exportedAt: '2026-11-19T12:00:00.000Z',
      app: 'ISTQB Academy',
      data: {
        lessonProgress: [
          {
            id: 'corrupted-progress',
            certificationId: 'ctfl',
            versionId: 'ctfl-v4.0',
            lessonId: 'lesson-x',
            chapterId: 'ch-x',
            completed: true,
            readingSeconds: 10,
            lastReadAt: '2026-11-19',
          },
        ],
        flashcardsCustom: [
          {
            id: 'bad-card',
            certificationId: 'ctfl',
            versionId: 'NON_EXISTENT_VERSION',
            chapterId: 'ch1',
            objectiveId: 'FL-1.1.1',
            front: { fr: 'Test', en: 'Test' },
            back: { fr: 'Back', en: 'Back' },
          },
        ],
      },
    });

    await expect(importFullBackupJson(corrupted, testDb)).rejects.toThrow();
    // Crucial check: lessonProgress count MUST still be 1 (no partial write from corrupted import!)
    expect(await testDb.lessonProgress.count()).toBe(1);
  });

  it('imports flashcards pack with duplicate detection', async () => {
    const pack = JSON.stringify({
      schemaVersion: 1,
      type: 'flashcards_pack',
      cards: [
        {
          id: 'custom-pack-1',
          certificationId: 'ctfl',
          versionId: 'ctfl-v4.0',
          chapterId: 'ctfl-v4.0-ch1',
          objectiveId: 'FL-1.1.1',
          front: { fr: 'Carte importée unique', en: 'Unique imported card' },
          back: { fr: 'Réponse importée', en: 'Imported answer' },
        },
      ],
    });

    const firstImport = await importFlashcardsPackJson(pack, testDb);
    expect(firstImport.importedCount).toBe(1);

    const secondImport = await importFlashcardsPackJson(pack, testDb);
    expect(secondImport.importedCount).toBe(0);
    expect(secondImport.skippedDuplicates).toBe(1);
  });
});
