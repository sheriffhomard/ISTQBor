import type { Lesson, ProvenanceMetadata, Question } from '../types/domain';

const PROVENANCE: ProvenanceMetadata = {
  source: 'ISTQB Academy Original Curriculum — Agile Tester Starter Pack',
  license: 'CC BY-NC-SA 4.0',
  author: 'ISTQB Academy Editorial Team',
  lastVerifiedAt: '2026-11-19',
  status: 'published',
};

export const AGILE_LESSONS: Lesson[] = [
  {
    id: 'lesson-ctflat-ch1',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    chapterId: 'ctfl-at-v1.0-ch1',
    sectionId: 'ctfl-at-v1.0-s1.1',
    objectiveIds: ['FA-1.1.1', 'FA-2.1.1'],
    order: 1,
    title: {
      fr: 'Fondamentaux Agile : Valeurs, Whole Team et Intégration Continue',
      en: 'Agile Fundamentals: Values, Whole-Team Approach & Continuous Integration',
    },
    estimatedMinutes: 25,
    explanation: {
      fr: 'En environnement Agile, le test n’est plus une phase isolée en fin de cycle : il s’intègre à chaque sprint et à chaque commit. L’approche Whole Team implique développeurs, testeurs et Product Owner dans la définition des critères d’acceptation avant même l’écriture du code.\n\nL’intégration continue (CI) exécute automatiquement les tests unitaires et d’intégration à chaque modification, fournissant un retour immédiat pour maintenir un incrément potentiellement livrable.',
      en: 'In Agile delivery, testing is woven into every sprint and commit rather than isolated at the end. The Whole-Team approach engages developers, testers, and Product Owners in defining clear acceptance criteria before coding begins.\n\nContinuous Integration (CI) runs automated unit and integration suites on every commit, giving instant feedback to keep the increment potentially shippable.',
    },
    definitions: [
      {
        id: 'def-agile-1',
        term: { fr: 'Manifeste Agile', en: 'Agile Manifesto' },
        definition: {
          fr: 'Quatre valeurs clés : individus et interactions, logiciel opérationnel, collaboration avec les clients, adaptation au changement.',
          en: 'Four core values: individuals and interactions, working software, customer collaboration, and responding to change.',
        },
      },
    ],
    examples: [],
    tables: [],
    diagramType: 'test_pyramid_quadrants',
    summary: {
      fr: 'Retenez l’importance du feedback continu, du pairing testeur-développeur et de la pyramide des tests pour soutenir la vélocité des sprints.',
      en: 'Focus on continuous feedback, tester-developer pairing, and the test pyramid to sustain sprint velocity.',
    },
    keyPoints: [
      { fr: 'La qualité est l’affaire de toute l’équipe Agile.', en: 'Quality is owned by the entire Agile team.' },
      { fr: 'L’intégration continue réduit fortement le coût de correction des régressions.', en: 'Continuous integration slashes regression remediation cost.' },
    ],
    exercises: [],
    provenance: PROVENANCE,
  },
];

export { CTFL_AT_FLASHCARDS as AGILE_FLASHCARDS } from './flashcards_ctfl_at';

export const AGILE_QUESTIONS: Question[] = [
  {
    id: 'q-ctflat-01',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    chapterId: 'ctfl-at-v1.0-ch1',
    objectiveId: 'FA-1.1.1',
    kLevel: 'K1',
    type: 'single_choice',
    difficulty: 'easy',
    stem: {
      fr: 'Selon le Manifeste Agile, que privilégie-t-on par rapport aux négociations contractuelles rigides ?',
      en: 'According to the Agile Manifesto, what is valued over contract negotiation?',
    },
    options: [
      { id: 'a', text: { fr: 'La collaboration avec les clients', en: 'Customer collaboration' } },
      { id: 'b', text: { fr: 'La documentation exhaustive figée', en: 'Comprehensive frozen documentation' } },
      { id: 'c', text: { fr: 'Le suivi strict d’un plan annuel', en: 'Strictly following an annual plan' } },
      { id: 'd', text: { fr: 'L’isolement des testeurs', en: 'Tester isolation' } },
    ],
    correctOptionIds: ['a'],
    explanation: {
      fr: 'Le Manifeste Agile valorise la collaboration avec le client plus que la négociation contractuelle.',
      en: 'The Agile Manifesto values customer collaboration over contract negotiation.',
    },
    provenance: PROVENANCE,
  },
  {
    id: 'q-ctflat-02',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    chapterId: 'ctfl-at-v1.0-ch2',
    objectiveId: 'FA-2.1.1',
    kLevel: 'K2',
    type: 'single_choice',
    difficulty: 'easy',
    stem: {
      fr: 'Quel bénéfice majeur l’intégration continue (CI) apporte-t-elle à une équipe Agile ?',
      en: 'What primary benefit does Continuous Integration bring to an Agile team?',
    },
    options: [
      { id: 'a', text: { fr: 'Retour rapide sur l’intégration et détection immédiate des régressions à chaque commit', en: 'Fast integration feedback and immediate regression detection on every commit' } },
      { id: 'b', text: { fr: 'Suppression de tout besoin de critères d’acceptation', en: 'Eliminating all need for acceptance criteria' } },
      { id: 'c', text: { fr: 'Remplacement complet du Product Owner', en: 'Replacing the Product Owner' } },
      { id: 'd', text: { fr: 'Exécution des tests uniquement en fin de trimestre', en: 'Running tests only once per quarter' } },
    ],
    correctOptionIds: ['a'],
    explanation: {
      fr: 'La CI valide en continu les modifications de code et sécurise l’incrément de sprint.',
      en: 'CI continuously validates code commits and keeps the sprint increment healthy.',
    },
    provenance: PROVENANCE,
  },
];
