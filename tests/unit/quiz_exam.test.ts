import { describe, expect, it } from 'vitest';
import { evaluateQuestionAnswer } from '../../src/services/quizEngine';
import { buildMockExamQuestions, createExamAttempt, gradeExamAttempt } from '../../src/services/examEngine';
import { CTFL_V4_QUESTIONS } from '../../src/data/questions_ctfl_v4';
import { CTFL_V4_CHAPTERS } from '../../src/data/syllabi_ctfl_v4';
import { SYLLABUS_VERSIONS } from '../../src/data/catalog';

describe('Quiz Evaluation & Mock Exam Simulator', () => {
  it('evaluates single_choice, multiple_choice, matching, and numeric calculation questions', () => {
    const single = CTFL_V4_QUESTIONS.find((q) => q.type === 'single_choice')!;
    expect(evaluateQuestionAnswer(single, { type: 'options', selectedOptionIds: single.correctOptionIds })).toBe(true);
    expect(evaluateQuestionAnswer(single, { type: 'options', selectedOptionIds: ['wrong'] })).toBe(false);

    const multi = CTFL_V4_QUESTIONS.find((q) => q.type === 'multiple_choice')!;
    expect(evaluateQuestionAnswer(multi, { type: 'options', selectedOptionIds: multi.correctOptionIds })).toBe(true);
    expect(evaluateQuestionAnswer(multi, { type: 'options', selectedOptionIds: [multi.correctOptionIds[0]!] })).toBe(false);

    const calc = CTFL_V4_QUESTIONS.find((q) => q.type === 'calculation')!;
    expect(
      evaluateQuestionAnswer(calc, {
        type: 'numeric',
        value: String(calc.numericAnswer!.expected),
      }),
    ).toBe(true);
    expect(evaluateQuestionAnswer(calc, { type: 'numeric', value: '9999' })).toBe(false);

    const matching = CTFL_V4_QUESTIONS.find((q) => q.type === 'matching')!;
    const rightPairs = Object.fromEntries(matching.matchingPairs!.map((p) => [p.id, p.id]));
    expect(evaluateQuestionAnswer(matching, { type: 'matching', pairs: rightPairs })).toBe(true);
  });

  it('builds a 40-question CTFL v4.0 mock exam honoring official 8/6/4/11/9/2 chapter distribution', () => {
    const ctflV4 = SYLLABUS_VERSIONS.find((v) => v.id === 'ctfl-v4.0')!;
    const { selectedQuestions, usedOfficialDistribution } = buildMockExamQuestions(
      ctflV4,
      CTFL_V4_QUESTIONS,
      40,
    );

    expect(usedOfficialDistribution).toBe(true);
    expect(selectedQuestions.length).toBe(40);
    expect(new Set(selectedQuestions.map((q) => q.id)).size).toBe(40);

    const counts: Record<string, number> = {};
    for (const q of selectedQuestions) {
      counts[q.chapterId] = (counts[q.chapterId] ?? 0) + 1;
    }
    expect(counts['ctfl-v4.0-ch1']).toBe(8);
    expect(counts['ctfl-v4.0-ch2']).toBe(6);
    expect(counts['ctfl-v4.0-ch3']).toBe(4);
    expect(counts['ctfl-v4.0-ch4']).toBe(11);
    expect(counts['ctfl-v4.0-ch5']).toBe(9);
    expect(counts['ctfl-v4.0-ch6']).toBe(2);
  });

  it('grades mock exam and evaluates pass/fail threshold accurately', () => {
    const ctflV4 = SYLLABUS_VERSIONS.find((v) => v.id === 'ctfl-v4.0')!;
    const attempt = createExamAttempt({
      version: ctflV4,
      questions: CTFL_V4_QUESTIONS,
      requestedCount: 40,
      nonNativeExtraTime: true,
    });
    // +25% non-native rule: 60 min * 1.25 = 75 min = 4500s
    expect(attempt.durationLimitSeconds).toBe(4500);

    const qMap = new Map(CTFL_V4_QUESTIONS.map((q) => [q.id, q]));
    const chMap = new Map(CTFL_V4_CHAPTERS.map((c) => [c.id, c]));

    // Answer first 26 correctly (65% = pass)
    const answers: Record<string, import('../../src/types/domain').UserQuestionAnswer> = {};
    attempt.questionIds.slice(0, 26).forEach((id) => {
      const q = qMap.get(id)!;
      if (q.type === 'calculation' && q.numericAnswer) {
        answers[id] = { type: 'numeric', value: String(q.numericAnswer.expected) };
      } else if (q.type === 'matching' && q.matchingPairs) {
        answers[id] = {
          type: 'matching',
          pairs: Object.fromEntries(q.matchingPairs.map((p) => [p.id, p.id])),
        };
      } else {
        answers[id] = { type: 'options', selectedOptionIds: q.correctOptionIds };
      }
    });

    const result = gradeExamAttempt(attempt, qMap, chMap, answers);
    expect(result.correctCount).toBe(26);
    expect(result.scorePercent).toBe(65);
    expect(result.passed).toBe(true);
  });
});
