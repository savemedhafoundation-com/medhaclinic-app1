import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildServerImmunityAssessment,
  validateClientImmunityAssessment,
} from './immunity-scoring.js';

test('applies weighted scoring, penalty, and system summaries', () => {
  const assessment = buildServerImmunityAssessment(
    {
      physicalEnergy: 10,
      appetite: 10,
      digestionComfort: 10,
      burningPain: 10,
      bloatingGas: 10,
      bloodPressure: 10,
      swelling: 10,
      fever: 3,
      infection: 10,
      breathingProblem: 10,
      libidoStability: 10,
      hairHealth: 10,
      sleepHours: 10,
    },
    'male'
  );

  assert.equal(assessment.baseWeightedScore, 9.34);
  assert.equal(assessment.penaltyApplied, 0.5);
  assert.equal(assessment.immunityScore, 8.84);
  assert.equal(assessment.roundedScore, 9);
  assert.equal(assessment.level, 'Excellent');
  assert.deepEqual(assessment.systemScores, {
    digestive: 10,
    immune: 7.67,
    energy: 10,
    cardiovascular: 10,
    respiratory: 10,
    hormonal: 10,
  });
  assert.deepEqual(assessment.weakestSystem, {
    key: 'immune',
    score: 7.67,
  });
  assert.deepEqual(assessment.strongestSystem, {
    key: 'digestive',
    score: 10,
  });
});

test('uses the gender-specific hormonal field and drops the opposite field', () => {
  const femaleAssessment = buildServerImmunityAssessment(
    {
      menstrualRegularity: 6,
      libidoStability: 10,
    },
    'female'
  );

  assert.equal(femaleAssessment.hormonalParameterKeyUsed, 'menstrualRegularity');
  assert.equal(femaleAssessment.systemScores.hormonal, 6);
  assert.equal(femaleAssessment.normalizedScores.menstrualRegularity, 6);
  assert.equal(femaleAssessment.normalizedScores.libidoStability, null);
});

test('accepts legacy level aliases and flags mismatched client summaries', () => {
  const assessment = buildServerImmunityAssessment(
    {
      physicalEnergy: 10,
      appetite: 10,
      digestionComfort: 10,
      bloatingGas: 10,
      bloodPressure: 10,
      swelling: 10,
      fever: 10,
      infection: 10,
      breathingProblem: 10,
      menstrualRegularity: 10,
      hairHealth: 10,
      sleepHours: 10,
    },
    'female'
  );

  const legacyAliasValidation = validateClientImmunityAssessment(
    {
      immunityScore: assessment.roundedScore,
      immunityLevel: 'high',
    },
    assessment
  );

  assert.equal(legacyAliasValidation.matches, true);
  assert.equal(legacyAliasValidation.levelMatches, true);

  const mismatchValidation = validateClientImmunityAssessment(
    {
      immunityScore: 4,
      immunityLevel: 'low',
    },
    assessment
  );

  assert.equal(mismatchValidation.matches, false);
  assert.equal(mismatchValidation.scoreMatches, false);
  assert.equal(mismatchValidation.levelMatches, false);
  assert.equal(mismatchValidation.expectedScore, assessment.roundedScore);
  assert.equal(mismatchValidation.expectedLevel, assessment.apiLevel);
});
