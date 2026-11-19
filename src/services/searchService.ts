import type {
  Certification,
  Flashcard,
  GlossaryTerm,
  LearningObjective,
  Lesson,
  Question,
} from '../types/domain';

export type SearchResultKind =
  | 'certification'
  | 'objective'
  | 'lesson'
  | 'flashcard'
  | 'question'
  | 'glossary';

export interface GlobalSearchResult {
  id: string;
  kind: SearchResultKind;
  titleFr: string;
  titleEn: string;
  subtitle: string;
  targetTab: string;
  targetId: string;
}

export function runGlobalSearch(params: {
  query: string;
  certifications: Certification[];
  objectives: LearningObjective[];
  lessons: Lesson[];
  flashcards: Flashcard[];
  questions: Question[];
  glossary: GlossaryTerm[];
}): GlobalSearchResult[] {
  const q = params.query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: GlobalSearchResult[] = [];

  for (const cert of params.certifications) {
    if (
      cert.code.toLowerCase().includes(q) ||
      cert.name.fr.toLowerCase().includes(q) ||
      cert.name.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-cert-${cert.id}`,
        kind: 'certification',
        titleFr: `${cert.code} — ${cert.name.fr}`,
        titleEn: `${cert.code} — ${cert.name.en}`,
        subtitle: cert.level,
        targetTab: 'certifications',
        targetId: cert.id,
      });
    }
  }

  for (const obj of params.objectives) {
    if (
      obj.code.toLowerCase().includes(q) ||
      obj.title.fr.toLowerCase().includes(q) ||
      obj.title.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-obj-${obj.id}`,
        kind: 'objective',
        titleFr: `${obj.code} · ${obj.title.fr}`,
        titleEn: `${obj.code} · ${obj.title.en}`,
        subtitle: obj.kLevel ?? 'LO',
        targetTab: 'syllabus',
        targetId: obj.chapterId,
      });
    }
  }

  for (const lesson of params.lessons) {
    if (
      lesson.title.fr.toLowerCase().includes(q) ||
      lesson.title.en.toLowerCase().includes(q) ||
      lesson.explanation.fr.toLowerCase().includes(q) ||
      lesson.explanation.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-les-${lesson.id}`,
        kind: 'lesson',
        titleFr: lesson.title.fr,
        titleEn: lesson.title.en,
        subtitle: `${lesson.estimatedMinutes} min`,
        targetTab: 'syllabus',
        targetId: lesson.chapterId,
      });
    }
  }

  for (const term of params.glossary) {
    if (
      term.termEn.toLowerCase().includes(q) ||
      term.termFr.toLowerCase().includes(q) ||
      term.pedagogicalExplanation.fr.toLowerCase().includes(q) ||
      term.pedagogicalExplanation.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-glo-${term.id}`,
        kind: 'glossary',
        titleFr: `${term.termFr} (${term.termEn})`,
        titleEn: `${term.termEn} (${term.termFr})`,
        subtitle: term.chapterCodes.join(', '),
        targetTab: 'glossary',
        targetId: term.id,
      });
    }
  }

  for (const card of params.flashcards) {
    if (
      card.front.fr.toLowerCase().includes(q) ||
      card.front.en.toLowerCase().includes(q) ||
      card.back.fr.toLowerCase().includes(q) ||
      card.back.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-fc-${card.id}`,
        kind: 'flashcard',
        titleFr: card.front.fr,
        titleEn: card.front.en,
        subtitle: card.objectiveId,
        targetTab: 'flashcards',
        targetId: card.id,
      });
    }
  }

  for (const question of params.questions) {
    if (
      question.stem.fr.toLowerCase().includes(q) ||
      question.stem.en.toLowerCase().includes(q)
    ) {
      results.push({
        id: `res-q-${question.id}`,
        kind: 'question',
        titleFr: question.stem.fr.slice(0, 110),
        titleEn: question.stem.en.slice(0, 110),
        subtitle: question.objectiveId,
        targetTab: 'quizzes',
        targetId: question.id,
      });
    }
  }

  return results.slice(0, 24);
}
