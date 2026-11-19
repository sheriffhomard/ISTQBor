import { CERTIFICATIONS_CATALOG, SYLLABUS_VERSIONS } from '../src/data/catalog';
import { CTFL_V4_CHAPTERS, CTFL_V4_OBJECTIVES } from '../src/data/syllabi_ctfl_v4';
import { CTFL_V4_LESSONS } from '../src/data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../src/data/flashcards_ctfl_v4';
import { CTFL_V4_QUESTIONS } from '../src/data/questions_ctfl_v4';
import { GLOSSARY_TERMS } from '../src/data/glossary';
import { certificationSchema, questionSchema } from '../src/lib/schemas';

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
const chapterIds = new Set(CTFL_V4_CHAPTERS.map((c) => c.id));
const objectiveIds = new Set(CTFL_V4_OBJECTIVES.map((o) => o.id));
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

// 4. Coverage Report for CTFL v4.0
console.log(`Certifications: ${CERTIFICATIONS_CATALOG.length}`);
console.log(`Versions: ${SYLLABUS_VERSIONS.length}`);
console.log(`CTFL v4.0 Chapters: ${CTFL_V4_CHAPTERS.length}`);
console.log(`CTFL v4.0 Learning Objectives: ${CTFL_V4_OBJECTIVES.length}`);
console.log(`CTFL v4.0 Lessons: ${CTFL_V4_LESSONS.length}`);
console.log(`Flashcards: ${SEED_FLASHCARDS.length}`);
console.log(`CTFL v4.0 Questions: ${CTFL_V4_QUESTIONS.length}`);
console.log(`Glossary Terms: ${GLOSSARY_TERMS.length}`);

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}
console.log('Content validation passed with 0 errors.');
