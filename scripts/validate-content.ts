import { CERTIFICATIONS_CATALOG, SYLLABUS_VERSIONS } from '../src/data/catalog';
import { CTFL_V4_CHAPTERS, CTFL_V4_OBJECTIVES } from '../src/data/syllabi_ctfl_v4';
import { HISTORICAL_AND_EXTENSION_CHAPTERS, HISTORICAL_OBJECTIVES } from '../src/data/syllabi_historical';
import { CT_AI_CHAPTERS, CT_AI_OBJECTIVES } from '../src/data/syllabi_ct_ai';
import { ADVANCED_CHAPTERS, ADVANCED_OBJECTIVES } from '../src/data/syllabi_advanced';
import { SPECIALIST_CHAPTERS, SPECIALIST_OBJECTIVES } from '../src/data/syllabi_specialist';
import { CTFL_V4_LESSONS } from '../src/data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../src/data/flashcards_ctfl_v4';
import { AGILE_FLASHCARDS } from '../src/data/extensions_agile';
import { CTAL_TM_FLASHCARDS } from '../src/data/flashcards_ctal_tm';
import { CTAL_TA_FLASHCARDS } from '../src/data/flashcards_ctal_ta';
import { CTAL_TTA_FLASHCARDS } from '../src/data/flashcards_ctal_tta';
import { CT_TAS_FLASHCARDS } from '../src/data/flashcards_ct_tas';
import { CT_TAE_FLASHCARDS } from '../src/data/flashcards_ct_tae';
import { CT_AI_FLASHCARDS } from '../src/data/flashcards_ct_ai';
import { CT_PT_FLASHCARDS } from '../src/data/flashcards_ct_pt';
import { CT_SEC_FLASHCARDS } from '../src/data/flashcards_ct_sec';
import { CT_MAT_FLASHCARDS } from '../src/data/flashcards_ct_mat';
import { CTEL_TM_FLASHCARDS } from '../src/data/flashcards_ctel_tm';
import { CTFL_2011_FLASHCARDS } from '../src/data/flashcards_ctfl_2011';
import { CTFL_V4_QUESTIONS } from '../src/data/questions_ctfl_v4';
import { GLOSSARY_TERMS } from '../src/data/glossary';
import { certificationSchema, flashcardImportSchema, questionSchema } from '../src/lib/schemas';

let errors = 0;

function fail(msg: string) {
  console.error(`[ERROR] ${msg}`);
  errors++;
}

console.log('--- ISTQB Academy Content Validation Report ---');

// 1. Validate Certifications
const certIds = new Set<string>();
for (const cert of CERTIFICATIONS_CATALOG) {
  if (certIds.has(cert.id)) fail(`Duplicate certification id: ${cert.id}`);
  certIds.add(cert.id);
  const parsed = certificationSchema.safeParse(cert);
  if (!parsed.success) {
    fail(`Invalid certification ${cert.id}: ${parsed.error.issues[0]?.message}`);
  }
}

// 2. Validate Versions & Chapter Distributions
const versionIds = new Set(SYLLABUS_VERSIONS.map((v) => v.id));
for (const ver of SYLLABUS_VERSIONS) {
  if (!certIds.has(ver.certificationId)) {
    fail(`Version ${ver.id} references unknown certification ${ver.certificationId}`);
  }
  if (ver.examConfig.hasOfficialDistribution && ver.examConfig.chapterQuestionDistribution) {
    const sum = Object.values(ver.examConfig.chapterQuestionDistribution).reduce((a, b) => a + b, 0);
    if (sum !== ver.examConfig.questionCount) {
      fail(`Version ${ver.id} distribution sum (${sum}) != questionCount (${ver.examConfig.questionCount})`);
    }
  }
}

// 3. Validate Questions & Referential Integrity
const allChapters = [
  ...CTFL_V4_CHAPTERS,
  ...HISTORICAL_AND_EXTENSION_CHAPTERS,
  ...CT_AI_CHAPTERS,
  ...ADVANCED_CHAPTERS,
  ...SPECIALIST_CHAPTERS,
];
const allObjectives = [
  ...CTFL_V4_OBJECTIVES,
  ...HISTORICAL_OBJECTIVES,
  ...CT_AI_OBJECTIVES,
  ...ADVANCED_OBJECTIVES,
  ...SPECIALIST_OBJECTIVES,
];
const chapterIds = new Set(allChapters.map((c) => c.id));
const objectiveIds = new Set(allObjectives.map((o) => o.id));
const questionIds = new Set<string>();

for (const q of CTFL_V4_QUESTIONS) {
  if (questionIds.has(q.id)) fail(`Duplicate question id: ${q.id}`);
  questionIds.add(q.id);
  const parsed = questionSchema.safeParse(q);
  if (!parsed.success) {
    fail(`Invalid question ${q.id}: ${parsed.error.issues[0]?.message}`);
  }
  if (!versionIds.has(q.versionId)) fail(`Question ${q.id} unknown version ${q.versionId}`);
  if (!chapterIds.has(q.chapterId)) fail(`Question ${q.id} unknown chapter ${q.chapterId}`);
  if (!objectiveIds.has(q.objectiveId)) fail(`Question ${q.id} unknown objective ${q.objectiveId}`);
}

// 4. Validate All Flashcards (All 13 Certifications)
const allFlashcards = [
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
const normalizeQuestion = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const cardIds = new Set<string>();
const globalFrontsFr = new Map<string, string>();
const globalFrontsEn = new Map<string, string>();
const countByCert = new Map<string, number>();

for (const card of allFlashcards) {
  if (cardIds.has(card.id)) fail(`Duplicate flashcard id: ${card.id}`);
  cardIds.add(card.id);
  const parsed = flashcardImportSchema.safeParse(card);
  if (!parsed.success) {
    fail(`Invalid flashcard ${card.id}: ${parsed.error.issues[0]?.message}`);
  }
  if (!certIds.has(card.certificationId)) fail(`Flashcard ${card.id} unknown certification ${card.certificationId}`);
  if (!versionIds.has(card.versionId)) fail(`Flashcard ${card.id} unknown version ${card.versionId}`);
  if (!chapterIds.has(card.chapterId)) fail(`Flashcard ${card.id} unknown chapter ${card.chapterId}`);
  if (!objectiveIds.has(card.objectiveId)) fail(`Flashcard ${card.id} unknown objective ${card.objectiveId}`);

  const normFr = normalizeQuestion(card.front.fr);
  const normEn = normalizeQuestion(card.front.en);
  const existingFr = globalFrontsFr.get(normFr);
  if (existingFr) {
    fail(`Duplicate normalized FR flashcard front between ${existingFr} and ${card.id}: "${card.front.fr}"`);
  } else {
    globalFrontsFr.set(normFr, card.id);
  }
  const existingEn = globalFrontsEn.get(normEn);
  if (existingEn) {
    fail(`Duplicate normalized EN flashcard front between ${existingEn} and ${card.id}: "${card.front.en}"`);
  } else {
    globalFrontsEn.set(normEn, card.id);
  }

  countByCert.set(card.certificationId, (countByCert.get(card.certificationId) ?? 0) + 1);
}

for (const cert of CERTIFICATIONS_CATALOG) {
  const count = countByCert.get(cert.id) ?? 0;
  if (count !== 200) {
    fail(`Expected exactly 200 bilingual flashcards for certification ${cert.id}, got ${count}`);
  }
}

// 5. Coverage Report
console.log(`Certifications: ${CERTIFICATIONS_CATALOG.length}`);
console.log(`Versions: ${SYLLABUS_VERSIONS.length}`);
console.log(`Total Chapters: ${allChapters.length}`);
console.log(`Total Learning Objectives: ${allObjectives.length}`);
console.log(`CTFL v4.0 Lessons: ${CTFL_V4_LESSONS.length}`);
console.log(`Flashcards (Total): ${allFlashcards.length} across ${CERTIFICATIONS_CATALOG.length} certifications`);
for (const cert of CERTIFICATIONS_CATALOG) {
  console.log(`  - ${cert.code} (${cert.id}): ${countByCert.get(cert.id) ?? 0} flashcards`);
}
console.log(`CTFL v4.0 Questions: ${CTFL_V4_QUESTIONS.length}`);
console.log(`Glossary Terms: ${GLOSSARY_TERMS.length}`);

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}
console.log('Content validation passed with 0 errors.');

