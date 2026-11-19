import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  certificationSchema,
  flashcardsPackSchema,
  questionSchema,
} from '../src/lib/schemas';
import { stripDangerousKeys } from '../src/services/securityService';

const genericQuestionsPackSchema = z.array(questionSchema).min(1);
const genericCatalogPackSchema = z.object({
  certifications: z.array(certificationSchema).min(1),
  versions: z.array(z.record(z.string(), z.unknown())).min(1),
});

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] ?? path.resolve(process.cwd(), 'content');

  if (!fs.existsSync(targetPath)) {
    console.error(`[ERROR] Path not found: ${targetPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  const files = stat.isDirectory()
    ? collectJsonFiles(targetPath)
    : [targetPath];

  if (files.length === 0) {
    console.error('[ERROR] No JSON content pack files found.');
    process.exit(1);
  }

  let validatedFiles = 0;
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = stripDangerousKeys(JSON.parse(raw) as unknown);
    const rel = path.relative(process.cwd(), filePath);

    if (isFlashcardsPack(parsed)) {
      const res = flashcardsPackSchema.safeParse(parsed);
      if (!res.success) {
        console.error(`[ERROR] ${rel}: ${res.error.issues[0]?.message}`);
        process.exit(1);
      }
      console.log(`[OK] ${rel} — Flashcards pack (${res.data.cards.length} cards)`);
      validatedFiles++;
    } else if (Array.isArray(parsed) && parsed.length > 0 && isQuestionLike(parsed[0])) {
      const res = genericQuestionsPackSchema.safeParse(parsed);
      if (!res.success) {
        console.error(`[ERROR] ${rel}: ${res.error.issues[0]?.message}`);
        process.exit(1);
      }
      console.log(`[OK] ${rel} — Questions pack (${res.data.length} questions)`);
      validatedFiles++;
    } else if (isCatalogPack(parsed)) {
      const res = genericCatalogPackSchema.safeParse(parsed);
      if (!res.success) {
        console.error(`[ERROR] ${rel}: ${res.error.issues[0]?.message}`);
        process.exit(1);
      }
      console.log(
        `[OK] ${rel} — Catalog pack (${res.data.certifications.length} certifications, ${res.data.versions.length} versions)`,
      );
      validatedFiles++;
    } else {
      console.log(`[OK] ${rel} — Structured JSON verified (safe keys)`);
      validatedFiles++;
    }
  }

  console.log(`Imported & validated ${validatedFiles} JSON content pack(s) cleanly.`);
}

function collectJsonFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results.sort();
}

function isFlashcardsPack(val: unknown): boolean {
  return (
    typeof val === 'object' &&
    val !== null &&
    'type' in val &&
    (val as Record<string, unknown>).type === 'flashcards_pack'
  );
}

function isQuestionLike(val: unknown): boolean {
  return typeof val === 'object' && val !== null && 'stem' in val && 'correctOptionIds' in val;
}

function isCatalogPack(val: unknown): boolean {
  return (
    typeof val === 'object' &&
    val !== null &&
    'certifications' in val &&
    'versions' in val
  );
}

main();
