import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  BackupRecord,
  Certification,
  Chapter,
  DailyChallengeRecord,
  DiagnosticResult,
  ExamAttempt,
  Flashcard,
  FlashcardReviewState,
  GlossaryPreference,
  GlossaryTerm,
  LearningObjective,
  Lesson,
  LessonProgress,
  PlannedActivity,
  Question,
  QuestionPreference,
  QuizAttempt,
  ReviewLogEntry,
  StudyPlan,
  StudySessionLog,
  SyllabusSection,
  SyllabusVersion,
} from '../types/domain';

export class IstqbAcademyDB extends Dexie {
  // Catalogue & Pedagogical Content
  certifications!: Table<Certification, string>;
  syllabusVersions!: Table<SyllabusVersion, string>;
  chapters!: Table<Chapter, string>;
  sections!: Table<SyllabusSection, string>;
  learningObjectives!: Table<LearningObjective, string>;
  lessons!: Table<Lesson, string>;
  flashcards!: Table<Flashcard, string>;
  questions!: Table<Question, string>;
  glossaryTerms!: Table<GlossaryTerm, string>;

  // User Progress & History (isolated from content updates)
  lessonProgress!: Table<LessonProgress, string>;
  flashcardStates!: Table<FlashcardReviewState, string>;
  reviewLogs!: Table<ReviewLogEntry, string>;
  quizAttempts!: Table<QuizAttempt, string>;
  questionPreferences!: Table<QuestionPreference, string>;
  examAttempts!: Table<ExamAttempt, string>;
  studyPlans!: Table<StudyPlan, string>;
  plannedActivities!: Table<PlannedActivity, string>;
  studySessions!: Table<StudySessionLog, string>;
  glossaryPreferences!: Table<GlossaryPreference, string>;
  dailyChallenges!: Table<DailyChallengeRecord, string>;
  diagnosticResults!: Table<DiagnosticResult, string>;

  // Settings & Backups
  appSettings!: Table<AppSettings, string>;
  backups!: Table<BackupRecord, string>;

  constructor(dbName = 'istqb_academy_db') {
    super(dbName);

    // Schema v1: Core tables
    this.version(1).stores({
      certifications: 'id, code, level, domain, status',
      syllabusVersions: 'id, certificationId, versionNumber, status',
      chapters: 'id, certificationId, versionId, order, code',
      sections: 'id, chapterId, versionId, certificationId, order',
      learningObjectives: 'id, certificationId, versionId, chapterId, sectionId, code, kLevel',
      lessons: 'id, certificationId, versionId, chapterId, sectionId, order',
      flashcards: 'id, certificationId, versionId, chapterId, objectiveId, isCustom',
      questions: 'id, certificationId, versionId, chapterId, objectiveId, type, difficulty, kLevel',
      glossaryTerms: 'id, termEn, termFr, *certificationIds',

      lessonProgress: 'id, certificationId, versionId, lessonId, chapterId, completed',
      flashcardStates: 'cardId, certificationId, versionId, due, state, isFavorite',
      reviewLogs: 'id, cardId, certificationId, versionId, reviewedAt',
      quizAttempts: 'id, certificationId, versionId, mode, completedAt',
      questionPreferences: 'questionId, isFavorite',
      examAttempts: 'id, certificationId, versionId, status, startedAt, completedAt',
      studyPlans: 'id, certificationId, versionId, targetDate',
      plannedActivities: 'id, planId, date, type, completed',
      studySessions: 'id, date, certificationId, versionId, activityType',
      glossaryPreferences: 'termId, isFavorite, lastViewedAt',
      dailyChallenges: 'date, questionId',
      diagnosticResults: 'id, certificationId, versionId, completedAt',

      appSettings: 'id',
      backups: 'id, createdAt',
    });

    // Schema v2: Compound indexes for faster chapter/objective queries & pack management
    this.version(2)
      .stores({
        chapters: 'id, certificationId, versionId, [versionId+order], code',
        lessons: 'id, certificationId, versionId, chapterId, [versionId+chapterId], order',
        flashcards:
          'id, certificationId, versionId, chapterId, objectiveId, [versionId+chapterId], isCustom',
        questions:
          'id, certificationId, versionId, chapterId, objectiveId, [versionId+chapterId], type, difficulty, kLevel',
        flashcardStates:
          'cardId, certificationId, versionId, [versionId+due], due, state, isFavorite',
      })
      .upgrade(async (tx) => {
        // Ensure existing appSettings preserve user choice and update timestamp cleanly
        const settings = await tx.table('appSettings').get('user_settings');
        if (settings && !settings.updatedAt) {
          await tx
            .table('appSettings')
            .update('user_settings', { updatedAt: new Date().toISOString() });
        }
      });
  }
}

export const db = new IstqbAcademyDB();
