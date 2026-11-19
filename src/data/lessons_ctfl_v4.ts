import type { Lesson, ProvenanceMetadata } from '../types/domain';

const PROVENANCE: ProvenanceMetadata = {
  source: 'ISTQB Academy Original Curriculum — Aligned with CTFL v4.0 Structure',
  license: 'CC BY-NC-SA 4.0 (Original Pedagogical Content)',
  author: 'ISTQB Academy Editorial Team',
  lastVerifiedAt: '2026-11-19',
  status: 'published',
  officialReferenceNote: 'Contenu pédagogique original indépendant du texte officiel ISTQB.',
};

export const CTFL_V4_LESSONS: Lesson[] = [
  {
    id: 'lesson-ctfl4-ch1',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch1',
    sectionId: 'ctfl-v4.0-s1.1',
    objectiveIds: ['FL-1.1.1', 'FL-1.1.2', 'FL-1.2.1', 'FL-1.2.2', 'FL-1.2.3', 'FL-1.3.1', 'FL-1.4.1', 'FL-1.5.2', 'FL-1.5.3'],
    order: 1,
    title: {
      fr: 'Chapitre 1 : Fondamentaux, Principes, Processus et Rôles du Test',
      en: 'Chapter 1: Fundamentals, Principles, Test Process & Team Dynamics',
    },
    estimatedMinutes: 35,
    explanation: {
      fr: 'Le test logiciel ne se résume pas à exécuter un programme pour « trouver des bugs ». Il constitue un processus complet d’évaluation de la qualité visant à réduire le risque de défaillance en production, vérifier la conformité aux exigences (vérification) et s’assurer que le produit répond aux besoins réels des utilisateurs (validation).\n\nLa chaîne causale distingue clairement quatre notions : une erreur humaine (fatigue, ambiguïté d’une règle métier) introduit un défaut (imperfection dans une spécification ou dans le code), qui peut provoquer une défaillance observable à l’exécution. L’analyse de cause racine cherche à éliminer le facteur organisationnel ou technique initial.\n\nLes sept principes fondamentaux cadrent toute stratégie réaliste : le test montre la présence de défauts mais ne prouve jamais leur absence ; le test exhaustif est impossible hors cas triviaux ; tester tôt économise du temps et du budget ; les défauts ont tendance à se regrouper (principe de Pareto) ; les tests finissent par s’user s’ils ne sont pas renouvelés ; le test dépend du contexte ; enfin, un logiciel sans défaut connu reste inutile s’il ne répond pas au besoin métier.',
      en: 'Software testing is far more than running code to "find bugs." It is an end-to-end quality evaluation process designed to reduce operational failure risk, verify compliance with specifications (verification), and validate that the system satisfies real stakeholder needs (validation).\n\nThe causal chain separates four distinct concepts: a human error (oversight, ambiguous rule) introduces a defect (an imperfection in a work product or code), which may trigger an observable failure when executed. Root cause analysis targets the underlying systemic trigger rather than only patching symptoms.\n\nSeven universal principles govern practical test design: testing shows the presence—not the absence—of defects; exhaustive testing is impossible outside trivial cases; early testing saves time and money; defects tend to cluster in specific modules; tests wear out if repeated unchanged; testing is context-dependent; and the absence-of-defects fallacy warns that a bug-free product still fails if it is unusable or misses business goals.',
    },
    definitions: [
      {
        id: 'def-ch1-1',
        term: { fr: 'Test vs Débogage', en: 'Testing vs Debugging' },
        definition: {
          fr: 'Le test dynamique met en évidence des défaillances ; le débogage (activité de développement) localise et supprime le défaut dans le code ; le test de confirmation vérifie ensuite le correctif.',
          en: 'Dynamic testing triggers failures; debugging (a development activity) locates and removes the defect in code; confirmation testing then verifies the fix.',
        },
      },
      {
        id: 'def-ch1-2',
        term: { fr: 'Approche Whole Team', en: 'Whole-Team Approach' },
        definition: {
          fr: 'Pratique collaborative où chaque membre de l’équipe (développeurs, testeurs, métier) partage la responsabilité de la qualité et travaille dans des espaces partagés ou en binôme.',
          en: 'A collaborative model in which every team member shares responsibility for quality, leveraging cross-functional pairing and shared workspaces.',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch1-1',
        title: { fr: 'Paradoxe du pesticide (usure des tests)', en: 'Tests Wearing Out in CI/CD' },
        context: {
          fr: 'Une équipe e-commerce exécute les mêmes 200 tests de non-régression chaque nuit depuis 18 mois sans en ajouter de nouveaux.',
          en: 'An e-commerce team runs the exact same 200 regression scripts nightly for 18 months without evolving test data or adding new cases.',
        },
        analysis: {
          fr: 'Ces tests vérifient la stabilité de l’existant mais ne découvrent plus de nouveaux défauts dans les parcours récents. Il faut diversifier les données, renouveler les scénarios et compléter par du test exploratoire.',
          en: 'While those scripts guard existing baselines, they no longer catch novel defects in recently introduced flows. Refreshing datasets, updating cases, and adding exploratory charters restores discovery power.',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch1-activities',
        title: { fr: 'Activités principales du processus de test et Testware associé', en: 'Core Test Process Activities & Associated Testware' },
        headers: [
          { fr: 'Activité', en: 'Activity' },
          { fr: 'Objectif clé', en: 'Key Focus' },
          { fr: 'Testware produit', en: 'Resulting Testware' },
        ],
        rows: [
          [
            { fr: 'Planification', en: 'Test Planning' },
            { fr: 'Définir objectifs, périmètre, stratégie et critères', en: 'Define scope, objectives, approach, and criteria' },
            { fr: 'Plan de test, calendrier, registre de risques', en: 'Test plan, schedule, risk register' },
          ],
          [
            { fr: 'Suivi & Contrôle', en: 'Monitoring & Control' },
            { fr: 'Comparer avancement réel vs plan et ajuster', en: 'Compare actual progress vs plan and steer actions' },
            { fr: 'Rapports d’avancement, tableaux de bord', en: 'Test progress reports, control directives' },
          ],
          [
            { fr: 'Analyse & Conception', en: 'Analysis & Design' },
            { fr: 'Identifier « quoi tester » puis « comment tester »', en: 'Identify "what to test" then "how to test"' },
            { fr: 'Conditions de test, cas de test, chartes', en: 'Test conditions, test cases, test charters' },
          ],
          [
            { fr: 'Implémentation & Exécution', en: 'Implementation & Execution' },
            { fr: 'Préparer données/scripts puis exécuter et consigner', en: 'Prepare data/scripts, run tests, log results' },
            { fr: 'Procédures, jeux de données, journaux d’exécution', en: 'Test scripts, test data, execution logs' },
          ],
          [
            { fr: 'Clôture', en: 'Test Completion' },
            { fr: 'Capitaliser, archiver le testware et émettre le bilan', en: 'Archive testware, lessons learned, completion report' },
            { fr: 'Rapport de clôture, demandes de changement', en: 'Test completion report, archived assets' },
          ],
        ],
      },
    ],
    diagramType: 'v_model_shift_left',
    summary: {
      fr: 'Retenez la séquence Erreur → Défaut → Défaillance, la différence entre QA (préventive, processus) et QC/Test (produit), l’équilibre entre indépendance des tests et collaboration Whole Team, et le rôle de la traçabilité tout au long des 7 activités de test.',
      en: 'Key anchors: Error → Defect → Failure chain, QA (preventive process) vs QC/Testing (product), balancing independent testing with Whole-Team collaboration, and traceability across all test activities.',
    },
    keyPoints: [
      { fr: '100 % de tests réussis ne signifie jamais 0 défaut (Principe 1).', en: 'Zero failed tests never proves zero defects remain (Principle 1).' },
      { fr: 'Une forte indépendance réduit les biais cognitifs mais risque d’isoler le testeur.', en: 'High independence reduces bias but can create communication silos.' },
      { fr: 'La traçabilité bidirectionnelle relie base de test, cas de test, résultats et défauts.', en: 'Bidirectional traceability connects test basis, test cases, logs, and defects.' },
    ],
    exercises: [
      {
        id: 'exo-ch1-1',
        prompt: {
          fr: 'Un développeur oublie une condition « >= » et écrit « > » dans une règle de remise fidélité. En production, un client ayant exactement 100 points n’obtient pas sa remise. Identifiez l’erreur, le défaut et la défaillance.',
          en: 'A developer accidentally writes ">" instead of ">=" in a loyalty discount rule. In production, a customer with exactly 100 points receives no discount. Identify the error, defect, and failure.',
        },
        solution: {
          fr: 'Erreur : l’inattention ou la mauvaise lecture de la règle par le développeur. Défaut : l’opérateur « > » incorrect dans le code source. Défaillance : la remise non appliquée observée lors de la commande à 100 points.',
          en: 'Error: human oversight while coding the rule. Defect: the wrong ">" operator in source code. Failure: missing discount observed at checkout for 100 points.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
  {
    id: 'lesson-ctfl4-ch2',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch2',
    sectionId: 'ctfl-v4.0-s2.1',
    objectiveIds: ['FL-2.1.1', 'FL-2.1.3', 'FL-2.1.4', 'FL-2.1.5', 'FL-2.1.6', 'FL-2.2.1', 'FL-2.2.2', 'FL-2.2.3', 'FL-2.3.1'],
    order: 2,
    title: {
      fr: 'Chapitre 2 : Tester dans le Cycle de Vie (SDLC), Niveaux, Types et Maintenance',
      en: 'Chapter 2: Testing in the SDLC, Test Levels, Test Types & Maintenance',
    },
    estimatedMinutes: 30,
    explanation: {
      fr: 'Le choix du modèle de cycle de vie (séquentiel comme le modèle en V, itératif, incrémental ou Agile/DevOps) dicte quand et comment tester. Quelle que soit l’approche, chaque activité de développement possède un pendant de test, et les testeurs doivent participer dès la revue des exigences.\n\nL’approche Shift-Left déplace les vérifications vers l’amont : revue précoce des user stories, analyse statique dans l’IDE, TDD/ATDD/BDD et pipelines CI/CD automatisés. Les rétrospectives de fin d’itération permettent à l’équipe entière d’ajuster continuellement la stratégie qualité.\n\nCTFL v4.0 structure 5 niveaux de test (Composant, Intégration de composants, Système, Intégration de systèmes, Acceptation) et 4 grands types de test (Fonctionnel, Non fonctionnel selon ISO/IEC 25010, Boîte noire, Boîte blanche). Après chaque correction, le test de confirmation vérifie le correctif précis, tandis que le test de non-régression contrôle l’absence d’effets de bord.',
      en: 'The SDLC model (sequential V-model, iterative, incremental, or Agile/DevOps) dictates test cadence, artifacts, and automation strategy. Universally, every development activity pairs with a corresponding test activity, and testers add maximum value when involved from initial requirements.\n\nShift-Left moves quality feedback earlier: reviewing user stories before coding, running static analysis in IDEs, practicing TDD/ATDD/BDD, and automating CI/CD verification gates. Retrospectives provide regular inspection-and-adaptation loops for test effectiveness.\n\nCTFL v4.0 defines five test levels (Component, Component Integration, System, System Integration, Acceptance) and four test types (Functional, Non-functional per ISO/IEC 25010, Black-box, White-box). After defect fixes, confirmation testing verifies the targeted patch while regression testing guards against unintended side effects.',
    },
    definitions: [
      {
        id: 'def-ch2-1',
        term: { fr: 'Test d’acceptation opérationnelle (OAT)', en: 'Operational Acceptance Testing (OAT)' },
        definition: {
          fr: 'Tests validant l’exploitabilité en production : sauvegardes/restauration, reprise après sinistre, maintenance, charge et durcissement sécurité.',
          en: 'Acceptance testing focused on production operability: backup/restore, disaster recovery, failover, maintenance, and security hardening.',
        },
      },
      {
        id: 'def-ch2-2',
        term: { fr: 'Déclencheurs des tests de maintenance', en: 'Maintenance Testing Triggers' },
        definition: {
          fr: 'Trois déclencheurs : Modification (corrective, adaptative, perfective), Migration (plateforme, cloud, base de données) et Retrait (archivage, décommissionnement).',
          en: 'Three primary triggers: Modification (fixes/enhancements), Migration (platform/cloud/OS upgrades), and Retirement (data archiving/decommissioning).',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch2-1',
        title: { fr: 'Migration d’un moteur de base de données', en: 'Database Engine Migration' },
        context: {
          fr: 'Une banque migre son historique client d’une base relationnelle legacy vers PostgreSQL.',
          en: 'A bank migrates customer history from a legacy RDBMS to PostgreSQL.',
        },
        analysis: {
          fr: 'Il s’agit d’un test de maintenance déclenché par une migration. Une analyse d’impact identifie les requêtes SQL critiques, les scripts ETL de conversion des données et les tests de performance comparatifs.',
          en: 'This triggers maintenance testing under the Migration category. Impact analysis guides data-conversion verification, SQL compatibility checks, and baseline performance comparisons.',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch2-levels',
        title: { fr: 'Les 5 niveaux de test en CTFL v4.0', en: 'The 5 Test Levels in CTFL v4.0' },
        headers: [
          { fr: 'Niveau', en: 'Test Level' },
          { fr: 'Objet de test', en: 'Test Object' },
          { fr: 'Base de test typique', en: 'Typical Test Basis' },
        ],
        rows: [
          [
            { fr: 'Composant (Unitaire)', en: 'Component Testing' },
            { fr: 'Modules, classes, fonctions isolées', en: 'Isolated modules, classes, functions' },
            { fr: 'Conception détaillée, code, specs unitaires', en: 'Detailed design, code, component specs' },
          ],
          [
            { fr: 'Intégration de composants', en: 'Component Integration' },
            { fr: 'Interfaces et échanges entre composants', en: 'Interfaces and interactions between components' },
            { fr: 'Architecture logicielle, diagrammes de séquence, API', en: 'Software architecture, sequence diagrams, internal APIs' },
          ],
          [
            { fr: 'Système', en: 'System Testing' },
            { fr: 'Système complet de bout en bout', en: 'Complete integrated system end-to-end' },
            { fr: 'Spécifications fonctionnelles/non fonctionnelles, Epics', en: 'System specs, user stories, risk analyses' },
          ],
          [
            { fr: 'Intégration de systèmes', en: 'System Integration' },
            { fr: 'Interfaces avec systèmes externes/tiers', en: 'Interfaces with external/third-party systems' },
            { fr: 'Contrats d’API, flux EDI, microservices externes', en: 'External API contracts, message schemas, SLAs' },
          ],
          [
            { fr: 'Acceptation', en: 'Acceptance Testing' },
            { fr: 'Adéquation métier, contractuelle ou opérationnelle', en: 'Business, contractual, or operational readiness' },
            { fr: 'Processus métier, réglementation, contrats', en: 'Business processes, regulations, user requirements' },
          ],
        ],
      },
    ],
    diagramType: 'v_model_shift_left',
    summary: {
      fr: 'Distinguez l’intégration de composants (interne) de l’intégration de systèmes (externe), le test de confirmation (ciblé sur un correctif) du test de non-régression (périmètre impacté), et maîtrisez les déclencheurs de maintenance + analyse d’impact.',
      en: 'Distinguish component integration (internal) from system integration (external), confirmation testing (fix verification) from regression (side-effect checks), and maintenance triggers paired with impact analysis.',
    },
    keyPoints: [
      { fr: 'Les tests non fonctionnels peuvent et doivent intervenir à tous les niveaux (pas uniquement en fin de projet).', en: 'Non-functional testing belongs at every test level, not only at system level.' },
      { fr: 'En DevOps, le CI/CD automatise les boucles de feedback tout en exigeant une maintenance rigoureuse des pipelines.', en: 'DevOps CI/CD accelerates feedback loops while requiring disciplined pipeline maintenance.' },
    ],
    exercises: [
      {
        id: 'exo-ch2-1',
        prompt: {
          fr: 'Après correction d’un bug sur le calcul de TVA, vous réexécutez le scénario de facture qui avait échoué, puis la suite automatisée de facturation. Nommez ces deux types de tests.',
          en: 'After fixing a VAT calculation defect, you re-run the failing invoice case and then run the automated billing suite. Name both testing activities.',
        },
        solution: {
          fr: '1) Réexécution du scénario corrigé = Test de confirmation. 2) Suite de facturation pour vérifier l’absence d’effet de bord = Test de non-régression.',
          en: '1) Re-running the fixed invoice case = Confirmation testing. 2) Running the billing suite for side effects = Regression testing.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
  {
    id: 'lesson-ctfl4-ch3',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch3',
    sectionId: 'ctfl-v4.0-s3.1',
    objectiveIds: ['FL-3.1.1', 'FL-3.1.2', 'FL-3.1.3', 'FL-3.2.1', 'FL-3.2.2', 'FL-3.2.3', 'FL-3.2.4', 'FL-3.2.5'],
    order: 3,
    title: {
      fr: 'Chapitre 3 : Tests Statiques, Revues et Retour d’Information Précoce',
      en: 'Chapter 3: Static Testing, Review Process & Early Feedback',
    },
    estimatedMinutes: 25,
    explanation: {
      fr: 'Contrairement aux tests dynamiques qui nécessitent d’exécuter le logiciel, les tests statiques examinent directement les produits d’activité (exigences, user stories, maquettes, code source, plans de test) sans les exécuter.\n\nLe test statique trouve des défauts que le test dynamique détecte difficilement ou tardivement : code mort, variables non initialisées, contradictions dans un cahier des charges, critères d’acceptation ambigus ou non-conformité aux standards de codage.\n\nLe processus formel de revue comporte cinq activités : Planification, Initiation de la revue, Revue individuelle, Communication et analyse des anomalies, puis Correction et rapport. Quatre grands types de revues s’échelonnent du moins formel au plus rigoureux : revue informelle, walkthrough (piloté par l’auteur), revue technique (pairs experts) et inspection (pilotée par un modérateur formé avec check-lists et métriques).',
      en: 'Unlike dynamic testing, static testing inspects work products directly—requirements, user stories, architecture diagrams, source code, and testware—without executing software.\n\nStatic testing uncovers defects that dynamic testing misses or catches far later: unreachable dead code, contradictory requirements, ambiguous acceptance criteria, security anti-patterns, and coding standard violations.\n\nA structured review process follows five activities: Planning, Review Initiation, Individual Review, Communication & Analysis, and Fixing & Reporting. Review formality progresses across four main types: Informal review, Walkthrough (author-led), Technical review (peer/expert-led), and Inspection (moderator-led with defined roles, checklists, and metrics).',
    },
    definitions: [
      {
        id: 'def-ch3-1',
        term: { fr: 'Modérateur vs Auteur vs Scribe', en: 'Moderator vs Author vs Scribe' },
        definition: {
          fr: 'L’Auteur crée le document ; le Modérateur anime la réunion d’inspection et garantit l’impartialité ; le Scribe consigne les défauts et décisions.',
          en: 'The Author created the work product; the Moderator facilitates the review impartially; the Scribe records defects and decisions.',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch3-1',
        title: { fr: 'Défaut d’ambiguïté dans une User Story', en: 'Ambiguity Caught in Backlog Refinement' },
        context: {
          fr: 'Une user story indique : « Le mot de passe doit être sécurisé et l’utilisateur averti rapidement ».',
          en: 'A user story states: "The password must be secure and the user notified quickly."',
        },
        analysis: {
          fr: 'Une revue statique avant sprint révèle deux ambiguïtés non testables (« sécurisé » = longueur/entropie ? « rapidement » = < 500 ms ?). Corriger ce défaut avant codage évite des reprises coûteuses.',
          en: 'Static review before sprint start reveals untestable terms ("secure" and "quickly"). Clarifying concrete rules (12+ chars, < 500ms feedback) prevents rework.',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch3-reviews',
        title: { fr: 'Comparaison des 4 types de revues', en: 'Comparison of the 4 Review Types' },
        headers: [
          { fr: 'Type', en: 'Review Type' },
          { fr: 'Animateur clé', en: 'Key Leader' },
          { fr: 'Objectif principal', en: 'Primary Goal' },
        ],
        rows: [
          [
            { fr: 'Revue informelle', en: 'Informal Review' },
            { fr: 'Aucun animateur formel', en: 'No formal leader' },
            { fr: 'Détection rapide d’anomalies à faible coût (binômage)', en: 'Fast, low-overhead defect detection (buddy check)' },
          ],
          [
            { fr: 'Walkthrough', en: 'Walkthrough' },
            { fr: 'Auteur du produit d’activité', en: 'Work product Author' },
            { fr: 'Partager la compréhension et recueillir des avis', en: 'Build shared understanding and gather feedback' },
          ],
          [
            { fr: 'Revue technique', en: 'Technical Review' },
            { fr: 'Modérateur ou expert pair', en: 'Moderator or technical peer' },
            { fr: 'Évaluer la faisabilité et les choix techniques par consensus', en: 'Gain consensus on technical decisions and detect defects' },
          ],
          [
            { fr: 'Inspection', en: 'Inspection' },
            { fr: 'Modérateur formé (pas l’auteur)', en: 'Trained Moderator (not Author)' },
            { fr: 'Trouver un maximum de défauts avec métriques et critères formels', en: 'Maximize defect detection using formal roles, checklists, and metrics' },
          ],
        ],
      },
    ],
    diagramType: 'review_process',
    summary: {
      fr: 'Le test statique trouve des défauts (pas des défaillances), s’applique avant l’exécution du code et repose sur des revues humaines bienveillantes limitées à des fragments gérables.',
      en: 'Static testing finds defects directly (not runtime failures), works before code is runnable, and thrives on manageable review chunks and a blame-free culture.',
    },
    keyPoints: [
      { fr: 'L’inspection est le type de revue le plus formel ; l’auteur ne doit jamais en être le modérateur.', en: 'Inspection is the most formal review type; the author never acts as moderator.' },
      { fr: 'Les facteurs humains (culture sans blâme, réunions courtes, objectifs clairs) conditionnent le succès.', en: 'Human factors—blame-free culture, short sessions, clear criteria—drive review success.' },
    ],
    exercises: [
      {
        id: 'exo-ch3-1',
        prompt: {
          fr: 'Un architecte présente son diagramme d’API à l’équipe pendant 45 minutes pour aligner la compréhension et noter les oublis, sans collecte formelle de métriques. De quel type de revue s’agit-il ?',
          en: 'An architect presents an API diagram to the team for 45 minutes to align understanding and collect feedback without formal metrics. Which review type is this?',
        },
        solution: {
          fr: 'Un Walkthrough : la session est animée par l’auteur lui-même dans un objectif d’alignement et de détection précoce de défauts.',
          en: 'A Walkthrough: led by the author primarily to build shared understanding and gather early defect feedback.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
  {
    id: 'lesson-ctfl4-ch4',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch4',
    sectionId: 'ctfl-v4.0-s4.2',
    objectiveIds: ['FL-4.1.1', 'FL-4.2.1', 'FL-4.2.2', 'FL-4.2.3', 'FL-4.2.4', 'FL-4.3.1', 'FL-4.3.2', 'FL-4.4.2', 'FL-4.5.1', 'FL-4.5.3'],
    order: 4,
    title: {
      fr: 'Chapitre 4 : Techniques d’Analyse et de Conception des Tests (Boîte Noire, Blanche, Expérience & Collaboration)',
      en: 'Chapter 4: Test Analysis & Design Techniques (Black-Box, White-Box, Experience & Collaboration)',
    },
    estimatedMinutes: 50,
    explanation: {
      fr: 'Ce chapitre représente le cœur technique de l’examen CTFL v4.0 (11 questions sur 40). On distingue quatre familles complémentaires.\n\n1. Techniques boîte noire (comportementales) :\n- Partitions d’équivalence (EP) : regrouper les valeurs traitées de manière identique (valides et invalides). La couverture Each Choice exige au moins une valeur par partition.\n- Analyse des valeurs limites (BVA) : CTFL v4.0 distingue explicitement la BVA à 2 valeurs (borne + voisin extérieur : pour [1..10], tester 0, 1, 10, 11) et la BVA à 3 valeurs (borne + ses deux voisins : 0, 1, 2 et 9, 10, 11).\n- Tables de décision : combinatoire rigoureuse de conditions booléennes ou multi-valeurs avec actions correspondantes.\n- Transitions d’états : couverture de tous les états, de toutes les transitions valides (0-switch) et tentative de transitions invalides.\n\n2. Techniques boîte blanche (structurelles) :\n- Couverture des instructions : % d’instructions exécutables parcourues.\n- Couverture des branches : % de branches décisionnelles (Vrai/Faux) et inconditionnelles parcourues. 100 % de couverture des branches garantit 100 % de couverture des instructions, l’inverse étant faux.\n\n3. Techniques basées sur l’expérience : Estimation d’erreur, Test exploratoire (chartes SBTM) et Check-lists.\n4. Approches basées sur la collaboration : User Stories (3C : Card, Conversation, Confirmation + INVEST), critères d’acceptation (Given/When/Then ou règles) et ATDD.',
      en: 'Chapter 4 carries the highest weight in CTFL v4.0 (11 of 40 questions). It organizes test design into four complementary families.\n\n1. Black-box (behavioral) techniques:\n- Equivalence Partitioning (EP): dividing inputs/outputs into valid and invalid equivalence classes. Each-Choice coverage exercises every partition at least once.\n- Boundary Value Analysis (BVA): CTFL v4.0 explicitly separates 2-value BVA (boundary + outer neighbor: for [1..10], test 0, 1, 10, 11) and 3-value BVA (boundary + both adjacent neighbors: 0, 1, 2 and 9, 10, 11).\n- Decision Tables: systematic matrix mapping condition combinations to expected actions.\n- State Transition Testing: covering states, valid transitions (0-switch), and invalid transition attempts.\n\n2. White-box (structural) techniques:\n- Statement Coverage: percentage of executable statements executed.\n- Branch Coverage: percentage of control-flow edges (true/false outcomes) executed. 100% branch coverage guarantees 100% statement coverage, whereas the reverse does not hold.\n\n3. Experience-based techniques: Error Guessing, Exploratory Testing (time-boxed charters), and Checklist-based Testing.\n4. Collaboration-based approaches: User Stories (3Cs + INVEST), Acceptance Criteria (Given/When/Then or rule lists), and ATDD.',
    },
    definitions: [
      {
        id: 'def-ch4-1',
        term: { fr: 'BVA 2-valeurs vs BVA 3-valeurs', en: '2-Value BVA vs 3-Value BVA' },
        definition: {
          fr: 'Pour un entier compris entre 18 et 65 inclus : la BVA 2-valeurs teste {17, 18, 65, 66} (4 valeurs) ; la BVA 3-valeurs ajoute les voisins internes {19, 64}, soit {17, 18, 19, 64, 65, 66} (6 valeurs), utile pour repérer les erreurs d’opérateur « < » vs « <= ».',
          en: 'For integer age [18..65]: 2-value BVA tests {17, 18, 65, 66} (4 values); 3-value BVA adds inner neighbors {19, 64} for {17, 18, 19, 64, 65, 66} (6 values), catching off-by-one operator errors.',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch4-1',
        title: { fr: 'Instruction « if (x > 0) » sans clause else', en: '"if (x > 0)" Without an Else Branch' },
        context: {
          fr: 'Un bloc contient : `read(x); if (x > 0) { applyBonus(); } print(x);`. On exécute un seul test avec `x = 5`.',
          en: 'Code snippet: `read(x); if (x > 0) { applyBonus(); } print(x);`. We run one test with `x = 5`.',
        },
        analysis: {
          fr: 'Avec `x = 5`, toutes les instructions (read, if, applyBonus, print) sont exécutées → Couverture des instructions = 100 %. En revanche, la branche « Faux » du `if` (saut vers `print` quand `x <= 0`) n’a jamais été prise → Couverture des branches = 50 % (1/2).',
          en: 'With `x = 5`, every executable statement runs → Statement Coverage = 100%. However, the False branch skipping `applyBonus()` was never taken → Branch Coverage = 50% (1/2).',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch4-bva',
        title: { fr: 'Synthèse des valeurs limites sur plage entière [10..50]', en: 'BVA Summary for Integer Range [10..50]' },
        headers: [
          { fr: 'Méthode', en: 'Method' },
          { fr: 'Valeurs requises', en: 'Required Values' },
          { fr: 'Nombre minimal de points', en: 'Minimum Points' },
        ],
        rows: [
          [
            { fr: 'Partitions d’équivalence (Each Choice)', en: 'Equivalence Partitioning (Each Choice)' },
            { fr: '1 valeur < 10 (ex. 4), 1 dans [10..50] (ex. 25), 1 > 50 (ex. 70)', en: '1 value < 10 (e.g. 4), 1 in [10..50] (e.g. 25), 1 > 50 (e.g. 70)' },
            { fr: '3 valeurs (1 par partition)', en: '3 values (1 per partition)' },
          ],
          [
            { fr: 'BVA à 2 valeurs', en: '2-Value BVA' },
            { fr: '9, 10, 50, 51', en: '9, 10, 50, 51' },
            { fr: '4 valeurs', en: '4 values' },
          ],
          [
            { fr: 'BVA à 3 valeurs', en: '3-Value BVA' },
            { fr: '9, 10, 11, 49, 50, 51', en: '9, 10, 11, 49, 50, 51' },
            { fr: '6 valeurs', en: '6 values' },
          ],
        ],
      },
    ],
    diagramType: 'bva_boundaries',
    summary: {
      fr: 'Maîtrisez le calcul exact des partitions valides/invalides, le comptage en BVA 2 et 3 valeurs, les tables de décision (2^n colonnes avant réduction), le schéma d’états/transitions et la règle d’or : 100 % branches ⇒ 100 % instructions.',
      en: 'Master valid/invalid partition counting, 2-value vs 3-value BVA derivation, decision table column math (2^n before collapse), state transition graphs, and the rule: 100% branch coverage ⇒ 100% statement coverage.',
    },
    keyPoints: [
      { fr: 'Une partition invalide ne doit pas masquer une autre partition invalide dans un même cas de test (risque de masquage).', en: 'Do not combine multiple invalid partitions in one test case without isolating them, or error masking occurs.' },
      { fr: 'Les critères d’acceptation s’écrivent en format orienté scénarios (Given/When/Then) ou orienté règles.', en: 'Acceptance criteria follow scenario-oriented (Given/When/Then) or rule-oriented formats.' },
    ],
    exercises: [
      {
        id: 'exo-ch4-1',
        prompt: {
          fr: 'Un champ accepte une quantité entière de 1 à 99 inclus. Quelles valeurs devez-vous tester pour atteindre 100 % de couverture BVA à 3 valeurs ?',
          en: 'An order quantity field accepts integers from 1 to 99 inclusive. Which values are required for 100% 3-value BVA coverage?',
        },
        solution: {
          fr: 'Borne inférieure (1) → {0, 1, 2}. Borne supérieure (99) → {98, 99, 100}. Soit 6 valeurs au total : 0, 1, 2, 98, 99, 100.',
          en: 'Lower boundary (1) → {0, 1, 2}. Upper boundary (99) → {98, 99, 100}. Total of 6 values: 0, 1, 2, 98, 99, 100.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
  {
    id: 'lesson-ctfl4-ch5',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch5',
    sectionId: 'ctfl-v4.0-s5.1',
    objectiveIds: ['FL-5.1.1', 'FL-5.1.3', 'FL-5.1.4', 'FL-5.1.6', 'FL-5.1.7', 'FL-5.2.2', 'FL-5.3.2', 'FL-5.4.1', 'FL-5.5.1'],
    order: 5,
    title: {
      fr: 'Chapitre 5 : Gestion des Activités de Test, Risques, Estimation & Défauts',
      en: 'Chapter 5: Managing Test Activities, Risks, Estimation & Defect Reports',
    },
    estimatedMinutes: 40,
    explanation: {
      fr: 'La gestion des activités de test organise le travail pour livrer les bonnes preuves qualité au bon moment. Le plan de test aligne périmètre, stratégie, budget, calendrier et critères d’entrée (conditions pour démarrer) / de sortie (Definition of Done).\n\nQuatre techniques d’estimation figurent au programme : l’estimation basée sur les ratios (ex. ratio dev:test historique), l’extrapolation (mesure sur itérations passées), Wideband Delphi (consensus d’experts anonyme et itératif) et l’estimation à trois points : E = (O + 4M + P) / 6 avec écart-type SD = (P - O) / 6.\n\nLa pyramide des tests recommande une base large de tests unitaires rapides et un sommet réduit de tests E2E coûteux. Les quadrants de test classent les activités entre orientation Technologie/Métier et Soutien à l’équipe / Critique du produit.\n\nLa gestion des risques distingue les risques projet (planning, compétences, environnements) des risques produit (qualité logicielle, sécurité, calcul erroné). L’analyse des risques produit oriente la profondeur, la priorisation et le choix des techniques de test.',
      en: 'Test management orchestrates testing so decision-makers receive reliable quality evidence on time. A test plan defines scope, strategy, schedule, resources, entry criteria (Definition of Ready), and exit criteria (Definition of Done).\n\nFour estimation techniques are tested in CTFL v4.0: ratio-based estimation, extrapolation from earlier sprints, Wideband Delphi (anonymous iterative expert consensus), and three-point estimation: E = (O + 4M + P) / 6 with standard deviation SD = (P - O) / 6.\n\nThe test pyramid advocates many fast unit tests at the base and fewer brittle E2E tests at the top, while the four Agile testing quadrants map tests across Business/Technology-facing and Team-supporting/Product-critiquing axes.\n\nRisk management separates project risks (schedule, budget, environment availability) from product risks (functional bugs, security vulnerabilities, performance bottlenecks), directly guiding test prioritization.',
    },
    definitions: [
      {
        id: 'def-ch5-1',
        term: { fr: 'Formule Estimation à 3 points', en: 'Three-Point Estimation Formula' },
        definition: {
          fr: 'Estimation pondérée E = (Optimiste + 4 × Plus probable + Pessimiste) / 6, avec écart-type d’incertitude SD = (Pessimiste - Optimiste) / 6.',
          en: 'Weighted estimate E = (Optimistic + 4 × Most Likely + Pessimistic) / 6, with uncertainty standard deviation SD = (Pessimistic - Optimistic) / 6.',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch5-1',
        title: { fr: 'Calcul d’estimation à 3 points', en: 'Three-Point Effort Calculation' },
        context: {
          fr: 'Pour tester un module de paiement : Optimiste = 6h, Plus probable = 9h, Pessimiste = 24h.',
          en: 'To test a payment module: Optimistic = 6h, Most Likely = 9h, Pessimistic = 24h.',
        },
        analysis: {
          fr: 'E = (6 + 4×9 + 24) / 6 = (6 + 36 + 24) / 6 = 66 / 6 = 11 heures. Écart-type SD = (24 - 6) / 6 = 3 heures → Estimation finale : 11h ± 3h.',
          en: 'E = (6 + 4×9 + 24) / 6 = 66 / 6 = 11 hours. Standard deviation SD = (24 - 6) / 6 = 3 hours → 11h ± 3h.',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch5-quadrants',
        title: { fr: 'Les 4 Quadrants de Test', en: 'The 4 Testing Quadrants' },
        headers: [
          { fr: 'Quadrant', en: 'Quadrant' },
          { fr: 'Axes', en: 'Orientation' },
          { fr: 'Exemples concrets', en: 'Typical Tests' },
        ],
        rows: [
          [
            { fr: 'Q1', en: 'Q1' },
            { fr: 'Technologie + Soutien équipe (Automatisé)', en: 'Technology-facing + Supporting team' },
            { fr: 'Tests unitaires, intégration composants', en: 'Unit tests, component integration' },
          ],
          [
            { fr: 'Q2', en: 'Q2' },
            { fr: 'Métier + Soutien équipe (Auto & Manuel)', en: 'Business-facing + Supporting team' },
            { fr: 'Tests fonctionnels, BDD/ATDD, prototypes', en: 'Functional tests, BDD/ATDD, story tests' },
          ],
          [
            { fr: 'Q3', en: 'Q3' },
            { fr: 'Métier + Critique produit (Manuel)', en: 'Business-facing + Critiquing product' },
            { fr: 'Tests exploratoires, utilisabilité, UAT', en: 'Exploratory testing, usability, UAT' },
          ],
          [
            { fr: 'Q4', en: 'Q4' },
            { fr: 'Technologie + Critique produit (Outillé)', en: 'Technology-facing + Critiquing product' },
            { fr: 'Performance, charge, sécurité, compatibilité', en: 'Performance, load, security, reliability' },
          ],
        ],
      },
    ],
    diagramType: 'test_pyramid_quadrants',
    summary: {
      fr: 'Retenez la différence entre risque produit et risque projet, la formule (O+4M+P)/6, les 4 quadrants Q1-Q4, et les rubriques indispensables d’un rapport de défaut reproductible.',
      en: 'Keep clear boundaries between product vs project risks, the (O+4M+P)/6 formula, Q1–Q4 quadrants, and complete reproducible defect reports.',
    },
    keyPoints: [
      { fr: 'Un rapport de défaut efficace est factuel, neutre, reproductible et indique la version exacte testée.', en: 'Effective defect reports are objective, reproducible, and cite the exact build/configuration.' },
      { fr: 'La gestion de configuration garantit qu’on sait exactement quelle version du code a passé quels tests.', en: 'Configuration management links exact code builds, testware, and execution results.' },
    ],
    exercises: [
      {
        id: 'exo-ch5-1',
        prompt: {
          fr: 'Calculez E et SD pour Optimiste = 4 jours, Plus probable = 7 jours, Pessimiste = 16 jours.',
          en: 'Compute E and SD for Optimistic = 4 days, Most Likely = 7 days, Pessimistic = 16 days.',
        },
        solution: {
          fr: 'E = (4 + 4×7 + 16) / 6 = 48 / 6 = 8 jours. SD = (16 - 4) / 6 = 2 jours.',
          en: 'E = (4 + 4×7 + 16) / 6 = 48 / 6 = 8 days. SD = (16 - 4) / 6 = 2 days.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
  {
    id: 'lesson-ctfl4-ch6',
    certificationId: 'ctfl',
    versionId: 'ctfl-v4.0',
    chapterId: 'ctfl-v4.0-ch6',
    sectionId: 'ctfl-v4.0-s6.1',
    objectiveIds: ['FL-6.1.1', 'FL-6.2.1'],
    order: 6,
    title: {
      fr: 'Chapitre 6 : Outils de Test et Risques Réalistes de l’Automatisation',
      en: 'Chapter 6: Test Tool Categories & Realistic Automation Benefits/Risks',
    },
    estimatedMinutes: 20,
    explanation: {
      fr: 'Les outils de support assistent l’ensemble du cycle de test : gestion des tests et défauts (ALM, Jira, TestRail), analyse statique (linters, SAST), conception et génération de données, exécution automatisée et couverture de code, mesure non fonctionnelle (charge, sécurité) et intégration continue.\n\nL’automatisation des tests n’est pas une solution miracle : elle excelle pour les contrôles répétitifs (non-régression, smoke tests CI/CD, calculs de charge), libérant du temps pour les tests exploratoires à forte valeur humaine. Toutefois, elle comporte des risques majeurs : sous-estimation de l’effort de maintenance lorsque l’UI évolue, coût initial élevé, dépendance technique ou faux sentiment de confiance si les assertions sont faibles.',
      en: 'Test tools support every phase of testing: test & defect management (ALM, trackers), static analysis (linters, SAST), test design & synthetic data generation, automated execution & coverage measurement, non-functional load/security tools, and CI/CD orchestration.\n\nTest automation is not a silver bullet: it excels at repeatable regression suites, CI smoke gates, and high-volume load generation, freeing testers for high-value exploratory work. Yet key risks include underestimated script maintenance when UIs change, initial setup cost, tool lock-in, and false confidence from weak assertions.',
    },
    definitions: [
      {
        id: 'def-ch6-1',
        term: { fr: 'Faux sentiment de sécurité en automatisation', en: 'False Confidence in Automation' },
        definition: {
          fr: 'Situation où 100 % des tests automatisés passent au vert alors que des défauts critiques existent, car les scripts vérifient peu d’assertions ou négligent l’expérience réelle.',
          en: 'When 100% of automated checks pass green while critical defects remain, due to shallow assertions or missing user-journey coverage.',
        },
      },
    ],
    examples: [
      {
        id: 'ex-ch6-1',
        title: { fr: 'Scripts UI fragiles en sprint court', en: 'Fragile UI Scripts in Rapid Sprints' },
        context: {
          fr: 'Une équipe automatise uniquement via l’interface graphique (E2E) des écrans dont le design change chaque semaine.',
          en: 'A team automates exclusively through fragile UI selectors on screens redesigned weekly.',
        },
        analysis: {
          fr: 'Le temps passé à réparer les sélecteurs dépasse le gain d’exécution. Solution : suivre la pyramide des tests en déplaçant l’essentiel des assertions vers les tests unitaires et API.',
          en: 'Maintenance overhead exceeds execution savings. Following the test pyramid by shifting assertions to unit and API layers restores ROI.',
        },
      },
    ],
    tables: [
      {
        id: 'tbl-ch6-tools',
        title: { fr: 'Bénéfices vs Risques de l’automatisation', en: 'Automation Benefits vs Risks' },
        headers: [
          { fr: 'Bénéfices attendus', en: 'Expected Benefits' },
          { fr: 'Risques à anticiper', en: 'Risks to Manage' },
        ],
        rows: [
          [
            { fr: 'Réduction du travail répétitif manuel', en: 'Reduced repetitive manual regression effort' },
            { fr: 'Sous-estimation de la maintenance des scripts et données', en: 'Underestimating ongoing script & data maintenance' },
          ],
          [
            { fr: 'Exécution plus rapide et cohérente dans le CI/CD', en: 'Faster, repeatable feedback in CI/CD pipelines' },
            { fr: 'Attentes irréalistes de remplacement total des testeurs', en: 'Unrealistic expectations that automation replaces human testers' },
          ],
          [
            { fr: 'Mesures objectives (couverture, temps de réponse)', en: 'Objective metrics (code coverage, response times)' },
            { fr: 'Négligence des tests exploratoires et tests d’utilisabilité', en: 'Neglecting exploratory and human-centered usability tests' },
          ],
        ],
      },
    ],
    diagramType: 'defect_lifecycle',
    summary: {
      fr: 'Sélectionnez les outils en adéquation avec vos objectifs et le contexte de l’équipe, et évaluez toujours le coût total de possession (création + maintenance).',
      en: 'Align tool selection with team context and continuously weigh total cost of ownership (creation + maintenance).',
    },
    keyPoints: [
      { fr: 'L’automatisation complète la réflexion humaine sans jamais la remplacer.', en: 'Automation augments human testing judgment; it never replaces it.' },
      { fr: 'Privilégier les couches basses (API, composants) pour maximiser le retour sur investissement.', en: 'Target lower architectural layers (API, component) for higher automation ROI.' },
    ],
    exercises: [
      {
        id: 'exo-ch6-1',
        prompt: {
          fr: 'Citez deux risques majeurs d’une campagne d’automatisation lancée sans stratégie de maintenance.',
          en: 'Name two major risks of launching test automation without a maintenance strategy.',
        },
        solution: {
          fr: '1) Explosion du coût de mise à jour des tests (tests flaky abandonnés). 2) Perte de confiance de l’équipe ou faux positifs ignorés dans le pipeline CI.',
          en: '1) Escalating maintenance cost leading to abandoned flaky suites. 2) Erosion of team trust when CI failures are routinely ignored.',
        },
      },
    ],
    provenance: PROVENANCE,
  },
];
