import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFallbackWeeklyInsights,
  buildWeeklyReport,
} from './reporting.js';

function createSubmission(
  id: string,
  submittedAt: string,
  overrides: Partial<{
    physicalEnergy: number | null;
    appetite: number | null;
    digestionComfort: number | null;
    burningPain: number | null;
    bloatingGas: number | null;
    bloodPressure: number | null;
    swelling: number | null;
    fever: number | null;
    infection: number | null;
    breathingProblem: number | null;
    menstrualRegularity: number | null;
    libidoStability: number | null;
    hairHealth: number | null;
    sleepHours: number | null;
    immunityScore: number;
    immunityLevel: string;
  }> = {}
) {
  return {
    id,
    userId: 'user_1',
    physicalEnergy: null,
    appetite: null,
    digestionComfort: null,
    burningPain: null,
    bloatingGas: null,
    bloodPressure: null,
    swelling: null,
    fever: null,
    infection: null,
    breathingProblem: null,
    menstrualRegularity: null,
    libidoStability: null,
    hairHealth: null,
    sleepHours: null,
    immunityScore: 0,
    immunityLevel: 'moderate',
    submittedAt: new Date(submittedAt),
    createdAt: new Date(submittedAt),
    ...overrides,
  };
}

test('buildWeeklyReport aggregates the last 7 days and compares against the previous window', () => {
  const now = new Date('2026-04-07T10:00:00.000Z');
  const report = buildWeeklyReport(
    [
      createSubmission('current_1', '2026-04-07T08:00:00.000Z', {
        physicalEnergy: 10,
        sleepHours: 10,
        appetite: 10,
        digestionComfort: 10,
        bloatingGas: 10,
        bloodPressure: 10,
        swelling: 10,
        fever: 10,
        infection: 10,
        breathingProblem: 10,
        libidoStability: 8,
        immunityScore: 9,
        immunityLevel: 'good',
      }),
      createSubmission('current_2', '2026-04-05T09:30:00.000Z', {
        physicalEnergy: 6,
        sleepHours: 6,
        appetite: 6,
        digestionComfort: 6,
        bloatingGas: 6,
        bloodPressure: 6,
        swelling: 6,
        fever: 6,
        infection: 6,
        breathingProblem: 6,
        libidoStability: 6,
        immunityScore: 6,
        immunityLevel: 'moderate',
      }),
      createSubmission('previous_1', '2026-03-30T11:00:00.000Z', {
        physicalEnergy: 3,
        sleepHours: 3,
        appetite: 3,
        digestionComfort: 3,
        bloatingGas: 3,
        bloodPressure: 6,
        swelling: 3,
        fever: 3,
        infection: 3,
        breathingProblem: 6,
        libidoStability: 3,
        immunityScore: 4,
        immunityLevel: 'low',
      }),
    ],
    now
  );

  assert.equal(report.daysTracked, 2);
  assert.equal(report.currentWindow.trackedDayCount, 2);
  assert.equal(report.currentWindow.days.length, 7);
  assert.equal(report.currentWindow.days[6]?.date, '2026-04-07');
  assert.equal(report.currentWindow.days[6]?.submissionCount, 1);
  assert.equal(report.currentWindow.days[4]?.date, '2026-04-05');
  assert.equal(report.currentWindow.days[4]?.submissionCount, 1);
  assert.equal(report.overall.current, 7.5);
  assert.equal(report.overall.previous, 4);
  assert.equal(report.overall.difference, 3.5);
  assert.equal(report.overall.trend, 'up');
  assert.equal(report.strongestCategory?.key, 'energyLevels');
  assert.equal(report.weakestCategory?.key, 'hormonalHealth');
  assert.equal(report.scoreDifference.digestiveHealth.currentSampleCount, 6);
  assert.equal(report.scoreDifference.hormonalHealth.previousSampleCount, 1);
});

test('buildFallbackWeeklyInsights returns structured copy grounded in the aggregate', () => {
  const now = new Date('2026-04-07T10:00:00.000Z');
  const report = buildWeeklyReport(
    [
      createSubmission('current_only', '2026-04-07T08:00:00.000Z', {
        physicalEnergy: 6,
        sleepHours: 6,
        appetite: 6,
        digestionComfort: 6,
        bloatingGas: 6,
        bloodPressure: 10,
        swelling: 6,
        fever: 6,
        infection: 6,
        breathingProblem: 10,
        libidoStability: 6,
        immunityScore: 6,
        immunityLevel: 'moderate',
      }),
    ],
    now
  );
  const insights = buildFallbackWeeklyInsights(report);

  assert.equal(insights.generationSource, 'fallback');
  assert.match(insights.overview, /tracked day/i);
  assert.match(insights.overallProgress, /limited recent check-ins/i);
  assert.match(insights.areasToImprove, /needs the most attention/i);
  assert.ok(insights.categoryInsights.energyLevels.length > 0);
  assert.ok(insights.categoryInsights.digestiveHealth.length > 0);
});
