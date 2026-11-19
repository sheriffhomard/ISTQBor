export type AppLanguage = 'fr' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface LocalizedText {
  fr: string;
  en: string;
}

export type ContentStatus =
  | 'draft'
  | 'under_review'
  | 'validated'
  | 'published'
  | 'deprecated';

export type CertificationLevel = 'foundation' | 'advanced' | 'expert' | 'specialist';
export type CertificationDomain = 'core' | 'agile' | 'specialist';
export type CertificationStatus = 'active' | 'retired' | 'replaced' | 'historical';
export type KLevel = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6';

export interface ProvenanceMetadata {
  source: string;
  license: string;
  author: string;
  lastVerifiedAt: string;
  status: ContentStatus;
  officialReferenceNote?: string;
}

export interface Certification {
  id: string;
  code: string;
  name: LocalizedText;
  level: CertificationLevel;
  domain: CertificationDomain;
  description: LocalizedText;
  prerequisites: string[];
  currentVersionId: string;
  status: CertificationStatus;
  replacedById?: string;
  availableLanguages: AppLanguage[];
  officialUrl: string;
  sources: string[];
  lastVerified: string;
}

export interface ExamConfig {
  durationMinutes: number | null;
  nonNativeExtraPercent: number | null;
  questionCount: number | null;
  passingScorePercent: number | null;
  passingScorePoints: number | null;
  totalPoints: number | null;
  hasOfficialDistribution: boolean;
  chapterQuestionDistribution?: Record<string, number>;
  specialRules: LocalizedText;
  isVerified: boolean;
  verificationNote: LocalizedText;
}

export interface SyllabusVersion {
  id: string;
  certificationId: string;
  versionNumber: string;
  title: LocalizedText;
  releaseDate: string;
  retirementDate?: string;
  status: CertificationStatus;
  examConfig: ExamConfig;
  changelogSummary: LocalizedText;
  sources: string[];
  lastVerified: string;
  isPackDownloaded: boolean;
}

export interface Chapter {
  id: string;
  certificationId: string;
  versionId: string;
  order: number;
  code: string;
  title: LocalizedText;
  summary: LocalizedText;
  recommendedMinutes: number;
  targetExamQuestions?: number;
}

export interface SyllabusSection {
  id: string;
  chapterId: string;
  versionId: string;
  certificationId: string;
  order: number;
  code: string;
  title: LocalizedText;
}

export interface LearningObjective {
  id: string;
  certificationId: string;
  versionId: string;
  chapterId: string;
  sectionId: string;
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  kLevel?: KLevel;
  source: string;
}

export interface LessonDefinition {
  id: string;
  term: LocalizedText;
  definition: LocalizedText;
}

export interface LessonExample {
  id: string;
  title: LocalizedText;
  context: LocalizedText;
  analysis: LocalizedText;
}

export interface LessonTable {
  id: string;
  title: LocalizedText;
  headers: LocalizedText[];
  rows: LocalizedText[][];
}

export interface LessonExercise {
  id: string;
  prompt: LocalizedText;
  solution: LocalizedText;
}

export type LessonDiagramType =
  | 'none'
  | 'v_model_shift_left'
  | 'bva_boundaries'
  | 'test_pyramid_quadrants'
  | 'defect_lifecycle'
  | 'review_process'
  | 'risk_matrix';

export interface Lesson {
  id: string;
  certificationId: string;
  versionId: string;
  chapterId: string;
  sectionId: string;
  objectiveIds: string[];
  order: number;
  title: LocalizedText;
  estimatedMinutes: number;
  explanation: LocalizedText;
  definitions: LessonDefinition[];
  examples: LessonExample[];
  tables: LessonTable[];
  diagramType: LessonDiagramType;
  summary: LocalizedText;
  keyPoints: LocalizedText[];
  exercises: LessonExercise[];
  provenance: ProvenanceMetadata;
}

export interface Flashcard {
  id: string;
  certificationId: string;
  versionId: string;
  chapterId: string;
  objectiveId: string;
  languageScope: 'bilingual' | AppLanguage;
  front: LocalizedText;
  back: LocalizedText;
  hint?: LocalizedText;
  tags: string[];
  isCustom: boolean;
  provenance: ProvenanceMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardReviewState {
  cardId: string;
  certificationId: string;
  versionId: string;
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number; // FSRS State enum: 0 New, 1 Learning, 2 Review, 3 Relearning
  lastReview?: string;
  isFavorite: boolean;
  totalCorrect: number;
  totalIncorrect: number;
}

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  certificationId: string;
  versionId: string;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  stateBefore: number;
  stateAfter: number;
  reviewedAt: string;
}

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'scenario'
  | 'calculation'
  | 'analysis';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: LocalizedText;
}

export interface MatchingPair {
  id: string;
  left: LocalizedText;
  right: LocalizedText;
}

export interface NumericAnswerSpec {
  expected: number;
  tolerance: number;
  unit?: string;
}

export interface Question {
  id: string;
  certificationId: string;
  versionId: string;
  chapterId: string;
  objectiveId: string;
  kLevel?: KLevel;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  stem: LocalizedText;
  options: QuestionOption[];
  correctOptionIds: string[];
  matchingPairs?: MatchingPair[];
  numericAnswer?: NumericAnswerSpec;
  explanation: LocalizedText;
  provenance: ProvenanceMetadata;
}

export type UserQuestionAnswer =
  | { type: 'options'; selectedOptionIds: string[] }
  | { type: 'matching'; pairs: Record<string, string> }
  | { type: 'numeric'; value: string };

export interface QuizAttempt {
  id: string;
  certificationId: string;
  versionId: string;
  mode: string;
  questionIds: string[];
  answers: Record<string, UserQuestionAnswer>;
  correctQuestionIds: string[];
  incorrectQuestionIds: string[];
  scorePercent: number;
  durationSeconds: number;
  completedAt: string;
}

export interface QuestionPreference {
  questionId: string;
  isFavorite: boolean;
  timesCorrect: number;
  timesIncorrect: number;
  lastAttemptAt?: string;
}

export interface ExamScoreBreakdown {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean | null;
  passingThresholdPercent: number | null;
  byChapter: Array<{
    chapterId: string;
    chapterCode: string;
    title: LocalizedText;
    total: number;
    correct: number;
  }>;
  byKLevel: Array<{
    kLevel: string;
    total: number;
    correct: number;
  }>;
}

export interface ExamAttempt {
  id: string;
  certificationId: string;
  versionId: string;
  title: string;
  isOfficialDistributionUsed: boolean;
  durationLimitSeconds: number;
  passingThresholdPercent: number | null;
  questionIds: string[];
  answers: Record<string, UserQuestionAnswer>;
  flaggedIds: string[];
  currentIndex: number;
  elapsedSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  scoreResult?: ExamScoreBreakdown;
}

export interface LessonProgress {
  id: string; // `${versionId}::${lessonId}`
  certificationId: string;
  versionId: string;
  lessonId: string;
  chapterId: string;
  completed: boolean;
  readingSeconds: number;
  lastReadAt: string;
}

export interface GlossaryTerm {
  id: string;
  termEn: string;
  termFr: string;
  officialDefinitionEn?: string;
  officialDefinitionFr?: string;
  pedagogicalExplanation: LocalizedText;
  source: string;
  glossaryVersion: string;
  certificationIds: string[];
  chapterCodes: string[];
  relatedTermIds: string[];
}

export interface GlossaryPreference {
  termId: string;
  isFavorite: boolean;
  lastViewedAt: string;
}

export interface StudyPlan {
  id: string;
  certificationId: string;
  versionId: string;
  targetDate: string;
  dailyMinutes: number;
  availableDays: number[]; // 0 (Sun) - 6 (Sat)
  weeklyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedActivity {
  id: string;
  planId: string;
  date: string; // YYYY-MM-DD
  type: 'lesson' | 'flashcards' | 'quiz' | 'mock_exam' | 'review';
  title: LocalizedText;
  targetId?: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  certificationId: string;
  versionId: string;
  activityType: 'lesson' | 'flashcards' | 'quiz' | 'exam' | 'glossary';
  minutesSpent: number;
  createdAt: string;
}

export interface DailyChallengeRecord {
  date: string; // YYYY-MM-DD
  questionId: string;
  answeredCorrectly: boolean;
  completedAt: string;
}

export interface DiagnosticResult {
  id: string;
  certificationId: string;
  versionId: string;
  completedAt: string;
  overallPercent: number;
  weakChapterIds: string[];
  recommendedAction: LocalizedText;
}

export interface AppSettings {
  id: 'user_settings';
  language: AppLanguage;
  theme: ThemeMode;
  activeCertificationId: string;
  activeVersionId: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  dailyGoalMinutes: number;
  nonNativeTimeExtension: boolean;
  updatedAt: string;
}

export interface BackupRecord {
  id: string;
  createdAt: string;
  label: string;
  schemaVersion: number;
  sizeBytes: number;
}
