import type { Prisma } from '@prisma/client';

type DailyImmunitySubmission =
  Prisma.DailyImmunitySubmissionGetPayload<Record<string, never>>;

type Trend = 'up' | 'down' | 'same';

type CategoryKey =
  | 'energyLevels'
  | 'digestiveHealth'
  | 'cardiovascular'
  | 'immuneResponse'
  | 'respiratory'
  | 'hormonalHealth';

type ScoreDifferenceItem = {
  current: number;
  previous: number;
  difference: number;
  trend: Trend;
};

const CATEGORY_MAP: Record<
  CategoryKey,
  Array<keyof DailyImmunitySubmission>
> = {
  energyLevels: ['physicalEnergy', 'sleepHours'],
  digestiveHealth: ['appetite', 'digestionComfort', 'bloatingGas'],
  cardiovascular: ['bloodPressure'],
  immuneResponse: ['fever', 'infection', 'swelling'],
  respiratory: ['breathingProblem'],
  hormonalHealth: ['menstrualRegularity', 'libidoStability'],
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - days);
  return copy;
}

function round1(value: number) {
  return Number(value.toFixed(1));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function trendForDifference(difference: number): Trend {
  if (difference > 0.1) {
    return 'up';
  }

  if (difference < -0.1) {
    return 'down';
  }

  return 'same';
}

function categoryAverage(
  submissions: DailyImmunitySubmission[],
  fields: Array<keyof DailyImmunitySubmission>
) {
  const values: number[] = [];

  for (const submission of submissions) {
    for (const field of fields) {
      const value = submission[field];
      if (typeof value === 'number') {
        values.push(value);
      }
    }
  }

  return average(values);
}

export function buildWeeklyReport(submissions: DailyImmunitySubmission[]) {
  const now = new Date();
  const currentStart = startOfDay(subDays(now, 6));
  const previousStart = startOfDay(subDays(now, 13));
  const previousEnd = currentStart;

  const currentSubmissions = submissions.filter(
    submission => submission.submittedAt >= currentStart
  );
  const previousSubmissions = submissions.filter(
    submission =>
      submission.submittedAt >= previousStart &&
      submission.submittedAt < previousEnd
  );

  const currentScores = {} as Record<CategoryKey, number>;
  const previousScores = {} as Record<CategoryKey, number>;
  const scoreDifference = {} as Record<CategoryKey, ScoreDifferenceItem>;

  for (const [category, fields] of Object.entries(CATEGORY_MAP) as Array<
    [CategoryKey, Array<keyof DailyImmunitySubmission>]
  >) {
    const current = categoryAverage(currentSubmissions, fields);
    const previous = categoryAverage(previousSubmissions, fields);
    const difference = round1(current - previous);

    currentScores[category] = current;
    previousScores[category] = previous;
    scoreDifference[category] = {
      current,
      previous,
      difference,
      trend: trendForDifference(difference),
    };
  }

  const overallCurrent = average(Object.values(currentScores));
  const overallPrevious = average(Object.values(previousScores));
  const overallDifference = round1(overallCurrent - overallPrevious);

  return {
    success: true,
    message:
      currentSubmissions.length > 0
        ? 'Weekly report fetched successfully.'
        : 'No submissions found in the current week. Returning an empty report.',
    currentReportDate: currentStart.toISOString(),
    previousReportDate: previousStart.toISOString(),
    currentScores,
    previousScores,
    scoreDifference,
    overall: {
      current: overallCurrent,
      previous: overallPrevious,
      difference: overallDifference,
      trend: trendForDifference(overallDifference),
    },
  };
}
