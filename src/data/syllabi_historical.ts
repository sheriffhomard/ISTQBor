import type { Chapter, LearningObjective, SyllabusSection } from '../types/domain';

export const HISTORICAL_AND_EXTENSION_CHAPTERS: Chapter[] = [
  // CTFL v3.1 (2018) for Version Comparator
  {
    id: 'ctfl-v3.1-ch1',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 1,
    code: '1',
    title: { fr: 'Fondamentaux des tests (2018)', en: 'Fundamentals of Testing (2018)' },
    summary: {
      fr: 'Inclut la psychologie du test en section dédiée (1.5) avant l’introduction de l’approche Whole Team en v4.0.',
      en: 'Featured a dedicated Psychology of Testing section (1.5) prior to the Whole-Team focus in v4.0.',
    },
    recommendedMinutes: 70,
  },
  {
    id: 'ctfl-v3.1-ch2',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 2,
    code: '2',
    title: { fr: 'Tester pendant le cycle de vie logiciel (2018)', en: 'Testing Throughout the SDLC (2018)' },
    summary: {
      fr: 'Modèles de développement logiciel, niveaux, types et maintenance — sans sections dédiées DevOps / Shift-Left.',
      en: 'SDLC models, levels, types, and maintenance — prior to explicit DevOps and Shift-Left sections.',
    },
    recommendedMinutes: 60,
  },
  {
    id: 'ctfl-v3.1-ch3',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 3,
    code: '3',
    title: { fr: 'Tests statiques (2018)', en: 'Static Testing (2018)' },
    summary: {
      fr: 'Bases du test statique, processus de revue et techniques de revue (ad hoc, check-list, scénarios, basée sur les rôles/perspectives).',
      en: 'Static basics, review process, and detailed review techniques (ad hoc, checklist, scenario, role/perspective-based).',
    },
    recommendedMinutes: 50,
  },
  {
    id: 'ctfl-v3.1-ch4',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 4,
    code: '4',
    title: { fr: 'Techniques de test (2018)', en: 'Test Techniques (2018)' },
    summary: {
      fr: 'Incluait les tests basés sur les cas d’utilisation (4.2.5) et les tests de décision (renommés couverture des branches en v4.0).',
      en: 'Included Use Case Testing (4.2.5) and Decision Coverage (refocused as Branch Coverage in v4.0).',
    },
    recommendedMinutes: 110,
  },
  {
    id: 'ctfl-v3.1-ch5',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 5,
    code: '5',
    title: { fr: 'Gestion des tests (2018)', en: 'Test Management (2018)' },
    summary: {
      fr: 'Organisation du test, planification/estimation, suivi/contrôle, gestion de configuration, risques et gestion des défauts (sans pyramide ni quadrants).',
      en: 'Test organization, planning/estimation, monitoring/control, configuration, risks, and defect management (before pyramid/quadrants moved into Core).',
    },
    recommendedMinutes: 90,
  },
  {
    id: 'ctfl-v3.1-ch6',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    order: 6,
    code: '6',
    title: { fr: 'Outils de support aux tests (2018)', en: 'Tool Support for Testing (2018)' },
    summary: {
      fr: 'Classification détaillée des outils et processus pilote d’introduction d’outil dans l’organisation.',
      en: 'Detailed tool classification and organizational pilot/deployment lifecycle.',
    },
    recommendedMinutes: 40,
  },

  // CTFL-AT v1.0 (Agile Tester) chapters
  {
    id: 'ctfl-at-v1.0-ch1',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    order: 1,
    code: '1',
    title: { fr: 'Développement logiciel Agile', en: 'Agile Software Development' },
    summary: {
      fr: 'Manifeste Agile, approche Whole Team, retours précoces et collaboration au quotidien.',
      en: 'Agile Manifesto values, whole-team approach, early feedback, and daily collaboration.',
    },
    recommendedMinutes: 60,
  },
  {
    id: 'ctfl-at-v1.0-ch2',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    order: 2,
    code: '2',
    title: { fr: 'Principes, pratiques et processus fondamentaux des tests Agile', en: 'Fundamental Agile Testing Principles, Practices, and Processes' },
    summary: {
      fr: 'Statut du testeur, intégration continue, pyramide et quadrants de test dans les itérations courtes.',
      en: 'Tester role, continuous integration, test pyramid, and testing quadrants within iterations.',
    },
    recommendedMinutes: 75,
  },
  {
    id: 'ctfl-at-v1.0-ch3',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    order: 3,
    code: '3',
    title: { fr: 'Méthodes, techniques et outils de test Agile', en: 'Agile Testing Methods, Techniques, and Tools' },
    summary: {
      fr: 'TDD/ATDD/BDD, gestion des risques qualité en Agile, test exploratoire et outils d’intégration continue.',
      en: 'TDD/ATDD/BDD, agile quality risk assessment, exploratory testing, and CI tooling.',
    },
    recommendedMinutes: 85,
  },
];

export const HISTORICAL_SECTIONS: SyllabusSection[] = [
  { id: 'ctfl-v3.1-s1.5', chapterId: 'ctfl-v3.1-ch1', versionId: 'ctfl-v3.1', certificationId: 'ctfl', order: 5, code: '1.5', title: { fr: 'La psychologie du test (2018)', en: 'The Psychology of Testing (2018)' } },
  { id: 'ctfl-v3.1-s4.2', chapterId: 'ctfl-v3.1-ch4', versionId: 'ctfl-v3.1', certificationId: 'ctfl', order: 2, code: '4.2', title: { fr: 'Techniques boîte noire incluant Cas d’utilisation', en: 'Black-box techniques incl. Use Case Testing' } },
  { id: 'ctfl-at-v1.0-s1.1', chapterId: 'ctfl-at-v1.0-ch1', versionId: 'ctfl-at-v1.0', certificationId: 'ctfl-at', order: 1, code: '1.1', title: { fr: 'Fondamentaux du développement Agile', en: 'Fundamentals of Agile Software Development' } },
  { id: 'ctfl-at-v1.0-s2.1', chapterId: 'ctfl-at-v1.0-ch2', versionId: 'ctfl-at-v1.0', certificationId: 'ctfl-at', order: 1, code: '2.1', title: { fr: 'Différences entre approches traditionnelles et Agile', en: 'Differences Between Testing in Traditional and Agile Approaches' } },
  { id: 'ctfl-at-v1.0-s3.1', chapterId: 'ctfl-at-v1.0-ch3', versionId: 'ctfl-at-v1.0', certificationId: 'ctfl-at', order: 1, code: '3.1', title: { fr: 'Méthodes Agile de test', en: 'Agile Testing Methods' } },
];

export const HISTORICAL_OBJECTIVES: LearningObjective[] = [
  {
    id: 'FL2018-1.5.1',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    chapterId: 'ctfl-v3.1-ch1',
    sectionId: 'ctfl-v3.1-s1.5',
    code: 'FL-2018-1.5.1',
    kLevel: 'K2',
    title: { fr: 'Facteurs humains et psychologie du test (v3.1)', en: 'Human psychology and mindset in testing (v3.1)' },
    description: {
      fr: 'Biais de confirmation des développeurs, communication constructive des défauts et état d’esprit du testeur.',
      en: 'Confirmation bias, constructive defect communication, and tester vs developer mindset.',
    },
    source: 'CTFL v3.1 Historical Comparison Reference',
  },
  {
    id: 'FL2018-4.2.5',
    certificationId: 'ctfl',
    versionId: 'ctfl-v3.1',
    chapterId: 'ctfl-v3.1-ch4',
    sectionId: 'ctfl-v3.1-s4.2',
    code: 'FL-2018-4.2.5',
    kLevel: 'K3',
    title: { fr: 'Tests basés sur les cas d’utilisation (v3.1)', en: 'Use case testing (v3.1)' },
    description: {
      fr: 'Dérivation de scénarios nominaux et alternatifs à partir des interactions acteur-système (retiré en v4.0 au profit de la collaboration/ATDD).',
      en: 'Deriving mainstream and alternative paths from actor-system use cases (replaced in v4.0 by collaboration-based testing).',
    },
    source: 'CTFL v3.1 Historical Comparison Reference',
  },
  {
    id: 'FA-1.1.1',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    chapterId: 'ctfl-at-v1.0-ch1',
    sectionId: 'ctfl-at-v1.0-s1.1',
    code: 'FA-1.1.1',
    kLevel: 'K1',
    title: { fr: 'Valeurs du Manifeste Agile', en: 'Agile Manifesto values' },
    description: {
      fr: 'Individus et interactions, logiciel fonctionnel, collaboration client et adaptation au changement.',
      en: 'Individuals and interactions, working software, customer collaboration, and responding to change.',
    },
    source: 'CTFL-AT v1.0 Structure Reference',
  },
  {
    id: 'FA-2.1.1',
    certificationId: 'ctfl-at',
    versionId: 'ctfl-at-v1.0',
    chapterId: 'ctfl-at-v1.0-ch2',
    sectionId: 'ctfl-at-v1.0-s2.1',
    code: 'FA-2.1.1',
    kLevel: 'K2',
    title: { fr: 'Intégration continue et qualité en sprint', en: 'Continuous integration and sprint quality' },
    description: {
      fr: 'Tests automatisés rapides intégrés au pipeline à chaque commit pour maintenir l’incrément potentiellement livrable.',
      en: 'Automated fast checks run on every commit to keep the sprint increment potentially shippable.',
    },
    source: 'CTFL-AT v1.0 Structure Reference',
  },
];
