import type { Prisma } from '@prisma/client';

type DailyImmunitySubmission =
  Prisma.DailyImmunitySubmissionGetPayload<Record<string, never>>;

export type Trend = 'up' | 'down' | 'same';

export const CATEGORY_KEYS = [
  'energyLevels',
  'digestiveHealth',
  'cardiovascular',
  'immuneResponse',
  'respiratory',
  'hormonalHealth',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  energyLevels: 'Energy & Recovery',
  digestiveHealth: 'Digestive Health',
  cardiovascular: 'Cardiovascular',
  immuneResponse: 'Immune Response',
  respiratory: 'Respiratory',
  hormonalHealth: 'Hormonal Health',
};

export type ScoreDifferenceItem = {
  current: number;
  previous: number;
  difference: number;
  trend: Trend;
  currentSampleCount: number;
  previousSampleCount: number;
};

export type WeeklyReportCategorySummary = {
  key: CategoryKey;
  label: string;
  score: number;
  sampleCount: number;
} | null;

export type WeeklyWindowDaySummary = {
  date: string;
  submissionCount: number;
  averageImmunityScore: number | null;
  representativeLevel: string | null;
  categoryScores: Record<CategoryKey, number | null>;
};

export type WeeklyWindowSummary = {
  startDate: string;
  endDate: string;
  submissionCount: number;
  trackedDayCount: number;
  latestSubmissionAt: string | null;
  days: WeeklyWindowDaySummary[];
};

export type WeeklyReportInsights = {
  overview: string;
  overallProgress: string;
  areasToImprove: string;
  encouragement: string;
  categoryInsights: Record<CategoryKey, string>;
  generationSource: 'openai' | 'fallback';
};

export type WeeklyReportBase = {
  success: boolean;
  message: string;
  currentReportDate: string;
  previousReportDate: string;
  daysTracked: number;
  currentScores: Record<CategoryKey, number>;
  previousScores: Record<CategoryKey, number>;
  scoreDifference: Record<CategoryKey, ScoreDifferenceItem>;
  overall: {
    current: number;
    previous: number;
    difference: number;
    trend: Trend;
    currentSubmissionCount: number;
    previousSubmissionCount: number;
  };
  currentWindow: WeeklyWindowSummary;
  previousWindow: WeeklyWindowSummary;
  strongestCategory: WeeklyReportCategorySummary;
  weakestCategory: WeeklyReportCategorySummary;
};

export type WeeklyReportPayload = WeeklyReportBase & {
  insights: WeeklyReportInsights;
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

function endOfDay(date: Date) {
  const copy = startOfDay(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function subDays(date: Date, days: number) {
  return addDays(date, -days);
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

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countDaysLabel(daysTracked: number) {
  return `${daysTracked} tracked day${daysTracked === 1 ? '' : 's'}`;
}

function categoryMetrics(
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

  return {
    average: average(values),
    sampleCount: values.length,
  };
}

function buildWindowSummary(
  submissions: DailyImmunitySubmission[],
  startDate: Date,
  endDate: Date
): WeeklyWindowSummary {
  const days: WeeklyWindowDaySummary[] = [];

  for (
    let cursor = startOfDay(startDate);
    cursor <= startOfDay(endDate);
    cursor = addDays(cursor, 1)
  ) {
    const dateKey = formatLocalDateKey(cursor);
    const daySubmissions = submissions.filter(
      submission => formatLocalDateKey(submission.submittedAt) === dateKey
    );

    const categoryScores = CATEGORY_KEYS.reduce<Record<CategoryKey, number | null>>(
      (accumulator, key) => {
        const metrics = categoryMetrics(daySubmissions, CATEGORY_MAP[key]);
        accumulator[key] = metrics.sampleCount > 0 ? metrics.average : null;
        return accumulator;
      },
      {} as Record<CategoryKey, number | null>
    );

    days.push({
      date: dateKey,
      submissionCount: daySubmissions.length,
      averageImmunityScore: daySubmissions.length
        ? average(daySubmissions.map(submission => submission.immunityScore))
        : null,
      representativeLevel:
        daySubmissions[0]?.immunityLevel && typeof daySubmissions[0].immunityLevel === 'string'
          ? daySubmissions[0].immunityLevel
          : null,
      categoryScores,
    });
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    submissionCount: submissions.length,
    trackedDayCount: days.filter(day => day.submissionCount > 0).length,
    latestSubmissionAt: submissions[0]?.submittedAt.toISOString() ?? null,
    days,
  };
}

function pickCategoryExtreme(
  scoreDifference: Record<CategoryKey, ScoreDifferenceItem>,
  direction: 'min' | 'max'
): WeeklyReportCategorySummary {
  const candidates = CATEGORY_KEYS.flatMap(key => {
    const item = scoreDifference[key];

    if (item.currentSampleCount === 0) {
      return [];
    }

    return [
      {
        key,
        label: CATEGORY_LABELS[key],
        score: item.current,
        sampleCount: item.currentSampleCount,
      },
    ];
  });

  if (!candidates.length) {
    return null;
  }

  return candidates.reduce((current, candidate) => {
    if (direction === 'min') {
      return candidate.score < current.score ? candidate : current;
    }

    return candidate.score > current.score ? candidate : current;
  });
}

function buildMessage(daysTracked: number) {
  if (daysTracked === 0) {
    return 'No daily immunity check-ins were found in the last 7 days.';
  }

  return `Weekly report generated from ${countDaysLabel(daysTracked)} in the last 7 days.`;
}

function buildFallbackCategoryInsight(
  key: CategoryKey,
  item: ScoreDifferenceItem
) {
  const label = CATEGORY_LABELS[key];

  if (item.currentSampleCount === 0) {
    return `Recent check-ins do not yet show enough data for ${label.toLowerCase()}.`;
  }

  if (item.current >= 8.2) {
    if (item.trend === 'up') {
      return `${label} improved and is now one of your stronger areas this week.`;
    }

    if (item.trend === 'down') {
      return `${label} is still fairly strong, although it dipped a little this week.`;
    }

    return `${label} stayed strong and steady across the week.`;
  }

  if (item.trend === 'up') {
    return `${label} showed improvement compared with the previous week.`;
  }

  if (item.trend === 'down') {
    return `${label} slipped this week and deserves a bit more attention.`;
  }

  if (item.current <= 5.2) {
    return `${label} stayed on the lower side this week and needs closer follow-through.`;
  }

  return `${label} remained fairly steady this week.`;
}

export function buildFallbackWeeklyInsights(
  report: WeeklyReportBase
): WeeklyReportInsights {
  const categoryInsights = CATEGORY_KEYS.reduce<Record<CategoryKey, string>>(
    (accumulator, key) => {
      accumulator[key] = buildFallbackCategoryInsight(key, report.scoreDifference[key]);
      return accumulator;
    },
    {} as Record<CategoryKey, string>
  );

  const weakestLabel = report.weakestCategory?.label ?? null;
  const strongestLabel = report.strongestCategory?.label ?? null;
  const limitedData = report.daysTracked < 3;

  let overview = 'Your weekly report is ready.';
  if (report.daysTracked === 0) {
    overview =
      'Add a few daily immunity check-ins to unlock a more meaningful weekly view.';
  } else {
    overview = `Over the last 7 days, you logged ${countDaysLabel(
      report.daysTracked
    )} and your overall score is ${report.overall.current.toFixed(1)}.`;
  }

  let overallProgress =
    'Your overall pattern remained fairly steady across the week.';
  if (report.daysTracked === 0) {
    overallProgress =
      'We need some recent daily check-ins before we can describe a weekly trend.';
  } else if (limitedData) {
    overallProgress = `This week is based on limited recent check-ins, so treat the trend as an early signal. Your overall score is ${report.overall.current.toFixed(
      1
    )}.`;
  } else if (report.overall.trend === 'up') {
    overallProgress = `Your overall score improved compared with the previous week. ${
      strongestLabel ? `${strongestLabel} looks like your steadiest area right now.` : ''
    }`.trim();
  } else if (report.overall.trend === 'down') {
    overallProgress = `Your overall score dipped this week. ${
      weakestLabel
        ? `${weakestLabel} appears to need the most attention right now.`
        : 'A few core areas may need closer follow-through.'
    }`.trim();
  }

  let areasToImprove =
    'Stay consistent with sleep, hydration, and daily tracking to make the next report more useful.';
  if (report.daysTracked === 0) {
    areasToImprove =
      'Start with a few daily immunity check-ins so we can identify the main area to improve.';
  } else if (weakestLabel) {
    areasToImprove = `${weakestLabel} needs the most attention this week. Focus on routine, hydration, rest, and consistent symptom tracking.`;
  }

  const encouragement =
    report.daysTracked >= 5
      ? 'Keep tracking daily to build steady week-by-week progress.'
      : 'A few more daily check-ins will make your next weekly report even more precise.';

  return {
    overview,
    overallProgress,
    areasToImprove,
    encouragement,
    categoryInsights,
    generationSource: 'fallback',
  };
}

export function buildWeeklyReport(
  submissions: DailyImmunitySubmission[],
  now = new Date()
): WeeklyReportBase {
  const sortedSubmissions = [...submissions].sort(
    (left, right) => right.submittedAt.getTime() - left.submittedAt.getTime()
  );
  const currentStart = startOfDay(subDays(now, 6));
  const currentEnd = endOfDay(now);
  const previousStart = startOfDay(subDays(now, 13));
  const previousEnd = endOfDay(subDays(now, 7));

  const currentSubmissions = sortedSubmissions.filter(
    submission =>
      submission.submittedAt >= currentStart && submission.submittedAt <= currentEnd
  );
  const previousSubmissions = sortedSubmissions.filter(
    submission =>
      submission.submittedAt >= previousStart && submission.submittedAt <= previousEnd
  );

  const currentWindow = buildWindowSummary(
    currentSubmissions,
    currentStart,
    currentEnd
  );
  const previousWindow = buildWindowSummary(
    previousSubmissions,
    previousStart,
    previousEnd
  );

  const currentScores = {} as Record<CategoryKey, number>;
  const previousScores = {} as Record<CategoryKey, number>;
  const scoreDifference = {} as Record<CategoryKey, ScoreDifferenceItem>;

  for (const key of CATEGORY_KEYS) {
    const currentMetrics = categoryMetrics(currentSubmissions, CATEGORY_MAP[key]);
    const previousMetrics = categoryMetrics(previousSubmissions, CATEGORY_MAP[key]);
    const difference = round1(currentMetrics.average - previousMetrics.average);

    currentScores[key] = currentMetrics.average;
    previousScores[key] = previousMetrics.average;
    scoreDifference[key] = {
      current: currentMetrics.average,
      previous: previousMetrics.average,
      difference,
      trend: trendForDifference(difference),
      currentSampleCount: currentMetrics.sampleCount,
      previousSampleCount: previousMetrics.sampleCount,
    };
  }

  const overallCurrent = average(
    currentSubmissions.map(submission => submission.immunityScore)
  );
  const overallPrevious = average(
    previousSubmissions.map(submission => submission.immunityScore)
  );
  const overallDifference = round1(overallCurrent - overallPrevious);
  const daysTracked = currentWindow.trackedDayCount;

  return {
    success: true,
    message: buildMessage(daysTracked),
    currentReportDate: currentStart.toISOString(),
    previousReportDate: previousStart.toISOString(),
    daysTracked,
    currentScores,
    previousScores,
    scoreDifference,
    overall: {
      current: overallCurrent,
      previous: overallPrevious,
      difference: overallDifference,
      trend: trendForDifference(overallDifference),
      currentSubmissionCount: currentSubmissions.length,
      previousSubmissionCount: previousSubmissions.length,
    },
    currentWindow,
    previousWindow,
    strongestCategory: pickCategoryExtreme(scoreDifference, 'max'),
    weakestCategory: pickCategoryExtreme(scoreDifference, 'min'),
  };
}
