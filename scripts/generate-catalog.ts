import fs from 'node:fs';
import path from 'node:path';
import { CERTIFICATIONS_CATALOG, SYLLABUS_VERSIONS } from '../src/data/catalog';
import { CTFL_V4_CHAPTERS, CTFL_V4_OBJECTIVES } from '../src/data/syllabi_ctfl_v4';
import { CTFL_V4_LESSONS } from '../src/data/lessons_ctfl_v4';
import { SEED_FLASHCARDS } from '../src/data/flashcards_ctfl_v4';
import { CTFL_V4_QUESTIONS } from '../src/data/questions_ctfl_v4';
import { GLOSSARY_TERMS } from '../src/data/glossary';
import { CT_AI_CHAPTERS, CT_AI_OBJECTIVES, CT_AI_SECTIONS } from '../src/data/syllabi_ct_ai';
import {
  ADVANCED_CHAPTERS,
  ADVANCED_OBJECTIVES,
  ADVANCED_SECTIONS,
} from '../src/data/syllabi_advanced';
import {
  SPECIALIST_CHAPTERS,
  SPECIALIST_OBJECTIVES,
  SPECIALIST_SECTIONS,
} from '../src/data/syllabi_specialist';
import {
  HISTORICAL_AND_EXTENSION_CHAPTERS,
  HISTORICAL_OBJECTIVES,
  HISTORICAL_SECTIONS,
} from '../src/data/syllabi_historical';
import { CTFL_AT_FLASHCARDS } from '../src/data/flashcards_ctfl_at';
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
  path.join(contentDir, 'syllabi', 'ct-ai-v1.0.json'),
  JSON.stringify(
    { chapters: CT_AI_CHAPTERS, sections: CT_AI_SECTIONS, objectives: CT_AI_OBJECTIVES },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(contentDir, 'syllabi', 'advanced.json'),
  JSON.stringify(
    { chapters: ADVANCED_CHAPTERS, sections: ADVANCED_SECTIONS, objectives: ADVANCED_OBJECTIVES },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(contentDir, 'syllabi', 'specialist.json'),
  JSON.stringify(
    { chapters: SPECIALIST_CHAPTERS, sections: SPECIALIST_SECTIONS, objectives: SPECIALIST_OBJECTIVES },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(contentDir, 'syllabi', 'historical.json'),
  JSON.stringify(
    {
      chapters: HISTORICAL_AND_EXTENSION_CHAPTERS,
      sections: HISTORICAL_SECTIONS,
      objectives: HISTORICAL_OBJECTIVES,
    },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(contentDir, 'lessons', 'ctfl-v4.0-bilingual.json'),
  JSON.stringify(CTFL_V4_LESSONS, null, 2),
);

const flashcardPacks = [
  { versionId: 'ctfl-v4.0', cards: SEED_FLASHCARDS },
  { versionId: 'ctfl-at-v1.0', cards: CTFL_AT_FLASHCARDS },
  { versionId: 'ctal-tm-v3.0', cards: CTAL_TM_FLASHCARDS },
  { versionId: 'ctal-ta-v3.1.2', cards: CTAL_TA_FLASHCARDS },
  { versionId: 'ctal-tta-v4.0', cards: CTAL_TTA_FLASHCARDS },
  { versionId: 'ct-tas-v1.0', cards: CT_TAS_FLASHCARDS },
  { versionId: 'ct-tae-v1.0', cards: CT_TAE_FLASHCARDS },
  { versionId: 'ct-ai-v1.0', cards: CT_AI_FLASHCARDS },
  { versionId: 'ct-pt-v1.0', cards: CT_PT_FLASHCARDS },
  { versionId: 'ct-sec-v1.0', cards: CT_SEC_FLASHCARDS },
  { versionId: 'ct-mat-v1.0', cards: CT_MAT_FLASHCARDS },
  { versionId: 'ctel-tm-v1.0', cards: CTEL_TM_FLASHCARDS },
  { versionId: 'ctfl-v2011', cards: CTFL_2011_FLASHCARDS },
];

for (const pack of flashcardPacks) {
  fs.writeFileSync(
    path.join(contentDir, 'flashcards', `${pack.versionId}-bilingual.json`),
    JSON.stringify({ schemaVersion: 1, type: 'flashcards_pack', cards: pack.cards }, null, 2),
  );
}

fs.writeFileSync(
  path.join(contentDir, 'questions', 'ctfl-v4.0-bilingual.json'),
  JSON.stringify(CTFL_V4_QUESTIONS, null, 2),
);
fs.writeFileSync(
  path.join(contentDir, 'glossary', 'istqb-bilingual.json'),
  JSON.stringify(GLOSSARY_TERMS, null, 2),
);

console.log(`Exported decoupled JSON content packs (${flashcardPacks.length} flashcard decks) into content/.`);

