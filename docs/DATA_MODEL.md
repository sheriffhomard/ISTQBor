# Modèle de données IndexedDB — `IstqbAcademyDB`

## 1. Principe de séparation

La base `istqb_academy_db` (Dexie.js, version de schéma `2`) sépare strictement :
1. **Tables de contenu pédagogique** (remises à jour de manière sûre lors des évolutions de version sans toucher aux acquis).
2. **Tables de progression utilisateur** (jamais écrasées par `ensureSeeded`, sauvegardables/restaurables transactionnellement).
3. **Tables de configuration et snapshots locaux**.

## 2. Tables de contenu

| Table | Clé primaire | Index principaux | Rôle |
| :--- | :--- | :--- | :--- |
| `certifications` | `id` | `code, level, domain, status` | Catalogue des certifications ISTQB |
| `syllabusVersions` | `id` | `certificationId, versionNumber, status` | Versions historiques et actives + `examConfig` |
| `chapters` | `id` | `certificationId, versionId, [versionId+order], code` | Chapitres d'une version de syllabus |
| `sections` | `id` | `chapterId, versionId, certificationId, order` | Sections rattachées à chaque chapitre |
| `learningObjectives` | `id` | `certificationId, versionId, chapterId, sectionId, code, kLevel` | Objectifs pédagogiques (`LO`) et niveaux cognitifs |
| `lessons` | `id` | `certificationId, versionId, chapterId, [versionId+chapterId], order` | Leçons bilingues, résumés, diagrammes et cartes mentales |
| `flashcards` | `id` | `certificationId, versionId, chapterId, objectiveId, [versionId+chapterId], isCustom` | Cartes officielles et personnalisées |
| `questions` | `id` | `certificationId, versionId, chapterId, objectiveId, [versionId+chapterId], type, difficulty, kLevel` | Banque de questions multi-formats |
| `glossaryTerms` | `id` | `termEn, termFr, *certificationIds` | Termes bilingues du glossaire ISTQB |

## 3. Tables utilisateur & analytique

| Table | Clé primaire | Index principaux | Rôle |
| :--- | :--- | :--- | :--- |
| `lessonProgress` | `id` | `certificationId, versionId, lessonId, chapterId, completed` | Avancement de lecture et notes personnelles |
| `flashcardStates` | `cardId` | `certificationId, versionId, [versionId+due], due, state, isFavorite` | État FSRS courant de chaque carte |
| `reviewLogs` | `id` | `cardId, certificationId, versionId, reviewedAt` | Historique immuable des révisions FSRS |
| `quizAttempts` | `id` | `certificationId, versionId, mode, completedAt` | Historique des sessions de QCM |
| `questionPreferences` | `questionId` | `isFavorite` | Questions favorites / marquées par l'utilisateur |
| `examAttempts` | `id` | `certificationId, versionId, status, startedAt, completedAt` | Examens blancs en cours (`in_progress`) ou terminés |
| `studyPlans` | `id` | `certificationId, versionId, targetDate` | Plans d'étude configurés |
| `plannedActivities` | `id` | `planId, date, type, completed` | Tâches journalières de révision |
| `studySessions` | `id` | `date, certificationId, versionId, activityType` | Journal d'activité et temps passé |
| `glossaryPreferences` | `termId` | `isFavorite, lastViewedAt` | Favoris et consultations du glossaire |
| `dailyChallenges` | `date` | `questionId` | Résultats des défis quotidiens |
| `diagnosticResults` | `id` | `certificationId, versionId, completedAt` | Résultats des diagnostics initiaux |

## 4. Tables système

| Table | Clé primaire | Index | Rôle |
| :--- | :--- | :--- | :--- |
| `appSettings` | `id` | `id` | Langue active, thème, certification/version sélectionnées, statut onboarding |
| `backups` | `id` | `createdAt` | Instantanés de sauvegarde locaux |

## 5. Stratégie de migration

- **v1 -> v2** : ajout des index composés `[versionId+order]`, `[versionId+chapterId]` et `[versionId+due]` afin d'accélérer les requêtes filtrées par version de syllabus, avec mise à niveau non destructive des paramètres existants.
