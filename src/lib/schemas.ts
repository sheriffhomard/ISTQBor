import { z } from 'zod';

export const localizedTextSchema = z.object({
  fr: z.string().min(1),
  en: z.string().min(1),
});

export const contentStatusSchema = z.enum([
  'draft',
  'under_review',
  'validated',
  'published',
  'deprecated',
]);

export const provenanceSchema = z.object({
  source: z.string().min(1),
  license: z.string().min(1),
  author: z.string().min(1),
  lastVerifiedAt: z.string().min(1),
  status: contentStatusSchema,
  officialReferenceNote: z.string().optional(),
});

export const flashcardImportSchema = z.object({
  id: z.string().min(1).max(120),
  certificationId: z.string().min(1).max(60),
  versionId: z.string().min(1).max(80),
  chapterId: z.string().min(1).max(100),
  objectiveId: z.string().min(1).max(100),
  languageScope: z.enum(['bilingual', 'fr', 'en']).default('bilingual'),
  front: localizedTextSchema,
  back: localizedTextSchema,
  hint: localizedTextSchema.optional(),
  tags: z.array(z.string().max(40)).max(15).default([]),
  isCustom: z.boolean().default(true),
  provenance: provenanceSchema.optional(),
});

export const flashcardsPackSchema = z.object({
  schemaVersion: z.number().int().positive(),
  type: z.literal('flashcards_pack'),
  cards: z.array(flashcardImportSchema).min(1).max(1000),
});

export const fullBackupSchema = z.object({
  schemaVersion: z.number().int().min(1).max(10),
  exportedAt: z.string().min(1),
  app: z.literal('ISTQB Academy'),
  data: z.object({
    appSettings: z.array(z.record(z.string(), z.unknown())).optional(),
    lessonProgress: z.array(z.record(z.string(), z.unknown())).default([]),
    flashcardsCustom: z.array(flashcardImportSchema).default([]),
    flashcardStates: z.array(z.record(z.string(), z.unknown())).default([]),
    reviewLogs: z.array(z.record(z.string(), z.unknown())).default([]),
    quizAttempts: z.array(z.record(z.string(), z.unknown())).default([]),
    questionPreferences: z.array(z.record(z.string(), z.unknown())).default([]),
    examAttempts: z.array(z.record(z.string(), z.unknown())).default([]),
    studyPlans: z.array(z.record(z.string(), z.unknown())).default([]),
    plannedActivities: z.array(z.record(z.string(), z.unknown())).default([]),
    studySessions: z.array(z.record(z.string(), z.unknown())).default([]),
    glossaryPreferences: z.array(z.record(z.string(), z.unknown())).default([]),
    dailyChallenges: z.array(z.record(z.string(), z.unknown())).default([]),
    diagnosticResults: z.array(z.record(z.string(), z.unknown())).default([]),
  }),
});

export const certificationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: localizedTextSchema,
  level: z.enum(['foundation', 'advanced', 'expert', 'specialist']),
  domain: z.enum(['core', 'agile', 'specialist']),
  description: localizedTextSchema,
  prerequisites: z.array(z.string()),
  currentVersionId: z.string().min(1),
  status: z.enum(['active', 'retired', 'replaced', 'historical']),
  replacedById: z.string().optional(),
  availableLanguages: z.array(z.enum(['fr', 'en'])).min(1),
  officialUrl: z.string().url(),
  sources: z.array(z.string()).min(1),
  lastVerified: z.string().min(1),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  certificationId: z.string().min(1),
  versionId: z.string().min(1),
  chapterId: z.string().min(1),
  objectiveId: z.string().min(1),
  kLevel: z.enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6']).optional(),
  type: z.enum([
    'single_choice',
    'multiple_choice',
    'true_false',
    'matching',
    'scenario',
    'calculation',
    'analysis',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  stem: localizedTextSchema,
  options: z.array(z.object({ id: z.string(), text: localizedTextSchema })),
  correctOptionIds: z.array(z.string()),
  explanation: localizedTextSchema,
  provenance: provenanceSchema,
});
