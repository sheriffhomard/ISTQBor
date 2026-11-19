import fs from 'node:fs';
import path from 'node:path';
import { CERTIFICATIONS_CATALOG, SYLLABUS_VERSIONS } from '../src/data/catalog';
import { CTFL_V4_CHAPTERS, CTFL_V4_OBJECTIVES } from '../src/data/syllabi_ctfl_v4';
import { CTFL_V4_LESSONS } from '../src/data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../src/data/flashcards_ctfl_v4';
import { CTFL_V4_QUESTIONS } from '../src/data/questions_ctfl_v4';
import { GLOSSARY_TERMS } from '../src/data/glossary';

const contentDir = path.resolve(process.cwd(), 'content');
const dirs = ['certifications', 'syllabi', 'lessons', 'flashcards', 'questions', 'glossary'];
for (const d of dirs) {
  fs.mkdirSync(path.join(contentDir, d), { recursive: true });
}

fs.writeFileSync(
  path.join(contentDir, 'certifications', 'catalog.json'),
  JSON.stringify({ certifications: CERTIFICATIONS_CATALOG, versions: SYLLABUS_VERSIONS }, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'syllabi', 'ctfl-v4.0.json'),
  JSON.stringify({ chapters: CTFL_V4_CHAPTERS, objectives: CTFL_V4_OBJECTIVES }, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'lessons', 'ctfl-v4.0-bilingual.json'),
  JSON.stringify(CTFL_V4_LESSONS, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'flashcards', 'ctfl-v4.0-bilingual.json'),
  JSON.stringify({ schemaVersion: 1, type: 'flashcards_pack', cards: SEED_FLASHCARDS }, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'questions', 'ctfl-v4.0-bilingual.json'),
  JSON.stringify(CTFL_V4_QUESTIONS, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'glossary', 'istqb-bilingual.json'),
  JSON.stringify(GLOSSARY_TERMS, null, 2),
);

console.log('Exported decoupled JSON content packs into content/.');
