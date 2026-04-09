import { Hono } from 'hono';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { env } from '../lib/env.js';
import { getOpenAIClient } from '../lib/openai.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  buildFallbackWeeklyInsights,
  buildWeeklyReport,
  type WeeklyReportBase,
  type WeeklyReportInsights,
  type WeeklyReportPayload,
} from '../utils/reporting.js';

const OPENAI_WEEKLY_REPORT_TIMEOUT_MS = 12_000;

const weeklyAiCategoryInsightSchema = z.object({
  key: z.enum(CATEGORY_KEYS),
  summary: z.string().trim().min(1).max(170),
});

const weeklyAiInsightsSchema = z.object({
  overview: z.string().trim().min(1).max(180),
  overallProgress: z.string().trim().min(1).max(260),
  areasToImprove: z.string().trim().min(1).max(260),
  encouragement: z.string().trim().min(1).max(140),
  categoryInsights: z
    .array(weeklyAiCategoryInsightSchema)
    .length(CATEGORY_KEYS.length),
});

const WEEKLY_REPORT_SYSTEM_PROMPT = [
  'You write Medha Clinic weekly health summaries for a mobile app.',
  "You receive a JSON payload with a user's last 7 days of daily immunity checks plus the previous comparison window.",
  'Return JSON that matches the schema exactly.',
  'The tone must feel like a supportive weekly report written by the app: calm, concise, medically responsible, and specific to the provided data.',
  'Use only facts grounded in the payload. Do not invent symptoms, causes, numbers, diagnoses, treatments, emergency advice, or cure claims.',
  'If tracking is limited, acknowledge that gently without sounding technical.',
  'Overall progress and areas to improve should each be one or two short sentences.',
  'Encouragement should be one short motivating sentence.',
  `categoryInsights must contain exactly one item for each key in this order: ${CATEGORY_KEYS.join(', ')}.`,
  'Each category summary must be a single short sentence tailored to the current score, trend, and recent coverage.',
  'Do not mention AI, JSON, or backend systems.',
].join(' ');

function readErrorMessage(value: unknown): string | null {
  if (value instanceof Error) {
    return readErrorMessage(value.message) ?? value.name;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = readErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of ['message', 'error', 'detail', 'title', 'reason']) {
    const message = readErrorMessage(record[key]);

    if (message) {
      return message;
    }
  }

  for (const key of ['errors', 'details', 'issues', 'cause']) {
    const message = readErrorMessage(record[key]);

    if (message) {
      return message;
    }
  }

  return null;
}

function buildWeeklyPromptPayload(
  report: WeeklyReportBase,
  patient: {
    profile?: {
      age?: number | null;
      gender?: string | null;
    } | null;
  } | null
) {
  return {
    patient: {
      age: patient?.profile?.age ?? null,
      gender: patient?.profile?.gender ?? null,
    },
    message: report.message,
    daysTracked: report.daysTracked,
    currentReportDate: report.currentReportDate,
    previousReportDate: report.previousReportDate,
    overall: report.overall,
    strongestCategory: report.strongestCategory,
    weakestCategory: report.weakestCategory,
    categories: CATEGORY_KEYS.map(key => ({
      key,
      label: CATEGORY_LABELS[key],
      current: report.currentScores[key],
      previous: report.previousScores[key],
      difference: report.scoreDifference[key].difference,
      trend: report.scoreDifference[key].trend,
      currentSampleCount: report.scoreDifference[key].currentSampleCount,
      previousSampleCount: report.scoreDifference[key].previousSampleCount,
    })),
    currentWindow: report.currentWindow,
    previousWindow: report.previousWindow,
  };
}

async function createOpenAiWeeklyInsights(
  report: WeeklyReportBase,
  patient: {
    profile?: {
      age?: number | null;
      gender?: string | null;
    } | null;
  } | null
) {
  const openai = getOpenAIClient();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    OPENAI_WEEKLY_REPORT_TIMEOUT_MS
  );

  try {
    const response = await openai.responses.parse(
      {
        model: env.OPENAI_MODEL,
        max_output_tokens: 900,
        text: {
          format: zodTextFormat(
            weeklyAiInsightsSchema,
            'weekly_health_report'
          ),
        },
        input: [
          {
            role: 'system',
            content: WEEKLY_REPORT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: JSON.stringify(buildWeeklyPromptPayload(report, patient), null, 2),
          },
        ],
      },
      {
        maxRetries: 0,
        timeout: OPENAI_WEEKLY_REPORT_TIMEOUT_MS,
        signal: controller.signal,
      }
    );

    if (!response.output_parsed) {
      throw new Error('OpenAI returned an invalid weekly report payload.');
    }

    return response.output_parsed;
  } finally {
    clearTimeout(timeoutId);
  }
}

function mergeWeeklyInsights(
  generated: z.infer<typeof weeklyAiInsightsSchema>,
  fallbackInsights: WeeklyReportInsights
): WeeklyReportInsights {
  const categoryInsights = {
    ...fallbackInsights.categoryInsights,
  };

  for (const item of generated.categoryInsights) {
    categoryInsights[item.key] = item.summary.trim();
  }

  return {
    overview: generated.overview.trim() || fallbackInsights.overview,
    overallProgress:
      generated.overallProgress.trim() || fallbackInsights.overallProgress,
    areasToImprove:
      generated.areasToImprove.trim() || fallbackInsights.areasToImprove,
    encouragement:
      generated.encouragement.trim() || fallbackInsights.encouragement,
    categoryInsights,
    generationSource: 'openai',
  };
}

async function generateWeeklyReportForUser(userId: string) {
  const [submissions, user] = await Promise.all([
    prisma.dailyImmunitySubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 60,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: {
          select: {
            age: true,
            gender: true,
          },
        },
      },
    }),
  ]);

  const baseReport = buildWeeklyReport(submissions);
  const fallbackInsights = buildFallbackWeeklyInsights(baseReport);
  let insights = fallbackInsights;

  if (submissions.length > 0) {
    try {
      const aiInsights = await createOpenAiWeeklyInsights(baseReport, user);
      insights = mergeWeeklyInsights(aiInsights, fallbackInsights);
    } catch (error) {
      console.error(
        'Weekly report AI generation failed. Falling back to deterministic insights.',
        {
          userId,
          model: env.OPENAI_MODEL,
          error: readErrorMessage(error) ?? 'Unknown OpenAI error',
        }
      );
    }
  }

  const report: WeeklyReportPayload = {
    ...baseReport,
    insights,
  };

  await prisma.weeklyReport.create({
    data: {
      userId,
      weekStart: new Date(report.currentReportDate),
      weekEnd: new Date(report.currentWindow.endDate),
      overallCurrent: report.overall.current,
      overallPrevious: report.overall.previous,
      overallDelta: report.overall.difference,
      trend: report.overall.trend,
      payloadJson: report,
    },
  });

  return report;
}

const reportsRouter = new Hono<AuthEnv>();
reportsRouter.use('*', requireAuth);

reportsRouter.get('/weekly', async c => {
  const dbUser = c.get('dbUser');
  const report = await generateWeeklyReportForUser(dbUser.id);

  return c.json(report);
});

reportsRouter.post('/weekly/generate', async c => {
  const dbUser = c.get('dbUser');
  const report = await generateWeeklyReportForUser(dbUser.id);

  return c.json({
    success: true,
    message: 'Weekly report generated successfully.',
    data: report,
  });
});

const legacyReportsRouter = new Hono<AuthEnv>();
legacyReportsRouter.use('*', requireAuth);

legacyReportsRouter.post('/weekly-report', async c => {
  const dbUser = c.get('dbUser');

  try {
    await c.req.json();
  } catch {
    // Legacy route previously accepted a body. It is intentionally ignored now.
  }

  const report = await generateWeeklyReportForUser(dbUser.id);
  return c.json(report);
});

export { legacyReportsRouter };
export default reportsRouter;
