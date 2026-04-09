import type { Context } from 'hono';
import { Hono } from 'hono';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { env } from '../lib/env.js';
import { getOpenAIClient } from '../lib/openai.js';
import { prisma } from '../lib/prisma.js';
import {
  requireAuth,
  requireVerifiedAuth,
  type AuthEnv,
  type VerifiedAuthEnv,
  upsertDbUserFromFirebaseUser,
} from '../middleware/auth.js';

const OPENAI_SUMMARY_TIMEOUT_MS = 15_000;
const OPENAI_DIET_PLAN_TIMEOUT_MS = 25_000;

const legacyPromptSchema = z.object({
  prompt: z.string().trim().min(1).max(6000),
  sourceSubmissionId: z.string().trim().optional(),
});

const summarySchema = z.object({
  prompt: z.string().trim().min(1).max(6000).optional(),
  summary: z.record(z.any()).optional(),
  answers: z.array(z.record(z.any())).optional(),
  immunityScore: z.coerce.number().optional(),
  immunityLabel: z.string().optional(),
  sourceSubmissionId: z.string().trim().optional(),
});

const personalizedDietSchema = z.object({
  eatingHabits: z.string().trim().min(1).max(120),
  mealsPerDay: z.string().trim().min(1).max(20),
  activityLevel: z.string().trim().min(1).max(120),
  dietType: z.string().trim().min(1).max(80),
  otherPreferences: z.string().trim().max(400).optional(),
  patient: z
    .object({
      name: z.string().trim().max(120).optional(),
      age: z.coerce.number().int().positive().max(120).optional(),
      gender: z.string().trim().max(40).optional(),
    })
    .optional(),
  immunity: z
    .object({
      score: z.coerce.number().min(0).max(10).optional(),
      level: z.string().trim().max(80).optional(),
    })
    .optional(),
});

const personalizedDietPlanSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().min(1).max(220),
  intro: z.string().min(1).max(260),
  focusSummary: z.string().min(1).max(220),
  mealCards: z.array(
    z.object({
      name: z.string().min(1).max(40),
      time: z.string().min(1).max(40),
      foods: z.array(z.string().min(1).max(90)).min(2).max(5),
      boosterTip: z.string().min(1).max(150).nullable(),
      note: z.string().min(1).max(150).nullable(),
    })
  ).min(3).max(5),
  hydration: z.object({
    target: z.string().min(1).max(120),
    tips: z.array(z.string().min(1).max(90)).min(2).max(4),
  }),
  avoid: z.object({
    title: z.string().min(1).max(80),
    items: z.array(z.string().min(1).max(90)).min(3).max(6),
  }),
  improvementTimeline: z.object({
    title: z.string().min(1).max(80),
    phases: z.array(
      z.object({
        label: z.string().min(1).max(60),
        detail: z.string().min(1).max(150),
      })
    ).min(3).max(4),
  }),
  supportCards: z.array(
    z.object({
      title: z.string().min(1).max(80),
      description: z.string().min(1).max(180),
      bullets: z.array(z.string().min(1).max(90)).min(2).max(4),
    })
  ).min(2).max(3),
  caution: z.string().min(1).max(220),
  acceptLabel: z.string().min(1).max(30),
});

function buildPrompt(input: z.infer<typeof summarySchema>) {
  if (input.prompt) {
    return input.prompt;
  }

  return [
    'Create exactly 3 short paragraphs for a wellness status summary.',
    'Tone: calm, positive, medically responsible, non-alarmist.',
    input.immunityScore !== undefined
      ? `Immunity score: ${input.immunityScore}`
      : null,
    input.immunityLabel ? `Immunity label: ${input.immunityLabel}` : null,
    input.summary ? `Summary JSON: ${JSON.stringify(input.summary)}` : null,
    input.answers ? `Answers JSON: ${JSON.stringify(input.answers)}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildDietPlanPrompt(input: z.infer<typeof personalizedDietSchema>) {
  return JSON.stringify(
    {
      patient: input.patient ?? {},
      lifestyle: {
        eatingHabits: input.eatingHabits,
        mealsPerDay: input.mealsPerDay,
        activityLevel: input.activityLevel,
        dietType: input.dietType,
        otherPreferences: input.otherPreferences ?? '',
      },
      immunity: input.immunity ?? {},
    },
    null,
    2
  );
}

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

function getAiUpstreamFailure(
  error: unknown
): { message: string; status: 502 | 504 } {
  const message = readErrorMessage(error) ?? 'OpenAI request failed.';
  const normalized = message.toLowerCase();
  const errorName = error instanceof Error ? error.name.toLowerCase() : '';

  if (
    errorName.includes('abort') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('aborted')
  ) {
    return {
      message:
        'OpenAI request timed out before the backend finished the request. Please try again.',
      status: 504,
    };
  }

  return {
    message,
    status: 502,
  };
}

async function createOpenAiSummary(prompt: string) {
  const openai = getOpenAIClient();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_SUMMARY_TIMEOUT_MS);

  try {
    return await openai.responses.create(
      {
        model: env.OPENAI_MODEL,
        max_output_tokens: 220,
        input: [
          {
            role: 'system',
            content:
              'You write short wellness summaries for a health-tracking app. Do not diagnose. Avoid certainty, fear, or emergency language unless explicitly present in the input.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        maxRetries: 0,
        timeout: OPENAI_SUMMARY_TIMEOUT_MS,
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function createOpenAiDietPlan(input: z.infer<typeof personalizedDietSchema>) {
  const openai = getOpenAIClient();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_DIET_PLAN_TIMEOUT_MS);

  try {
    return await openai.responses.parse(
      {
        model: env.OPENAI_MODEL,
        max_output_tokens: 1_200,
        text: {
          format: zodTextFormat(personalizedDietPlanSchema, 'personalized_diet_plan'),
        },
        input: [
          {
            role: 'system',
            content:
              'You are Medha Clinic\'s personalized nutrition planner. Create a practical 30-day diet and wellness support plan for a mobile app. Tailor the plan to the provided eating habits, meals per day, activity level, diet type, optional preferences, age, gender, and immunity context. Keep the tone warm, positive, and medically responsible. Do not diagnose, prescribe medicines, mention cure claims, suggest extreme fasting, or recommend unsafe detox routines. Prefer realistic Indian household-friendly foods unless the preferences clearly indicate another pattern. Keep meal items short, practical, and easy to follow. "Support" cards may mention food-based nutrient support or gentle wellness routines, but must not prescribe medical treatment. Return valid JSON that matches the schema exactly.',
          },
          {
            role: 'user',
            content: buildDietPlanPrompt(input),
          },
        ],
      },
      {
        maxRetries: 0,
        timeout: OPENAI_DIET_PLAN_TIMEOUT_MS,
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSummary(
  c: Context,
  body: unknown,
  options: {
    storeForUserId?: string | null;
  } = {}
) {
  const parsed = summarySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid AI payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  const prompt = buildPrompt(parsed.data);
  let response;

  try {
    response = await createOpenAiSummary(prompt);
  } catch (error) {
    const upstreamFailure = getAiUpstreamFailure(error);

    return c.json(
      {
        success: false,
        message: upstreamFailure.message,
      },
      {
        status: upstreamFailure.status,
      }
    );
  }

  const result = response.output_text.trim();

  if (options.storeForUserId) {
    try {
      await prisma.aiSummary.create({
        data: {
          userId: options.storeForUserId,
          sourceSubmissionId: parsed.data.sourceSubmissionId,
          promptJson: parsed.data,
          resultText: result,
          model: env.OPENAI_MODEL,
        },
      });
    } catch (error) {
      console.error('Failed to store AI summary:', error);
    }
  }

  return c.json({
    success: true,
    result,
  });
}

async function runPersonalizedDietPlan(c: Context, body: unknown) {
  const parsed = personalizedDietSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid personalized diet payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  let response;

  try {
    response = await createOpenAiDietPlan(parsed.data);
  } catch (error) {
    const upstreamFailure = getAiUpstreamFailure(error);

    return c.json(
      {
        success: false,
        message: upstreamFailure.message,
      },
      {
        status: upstreamFailure.status,
      }
    );
  }

  if (!response.output_parsed) {
    return c.json(
      {
        success: false,
        message: 'OpenAI returned an invalid personalized diet plan.',
      },
      502
    );
  }

  return c.json({
    success: true,
    plan: response.output_parsed,
  });
}

const publicAiRouter = new Hono();
publicAiRouter.post('/immunity-summary-public', async c =>
  runSummary(c, await c.req.json())
);
publicAiRouter.post('/personalized-diet-public', async c =>
  runPersonalizedDietPlan(c, await c.req.json())
);

const aiRouter = new Hono<VerifiedAuthEnv>();
aiRouter.use('*', requireVerifiedAuth);
aiRouter.post('/immunity-summary', async c =>
  {
    const firebaseUser = c.get('firebaseUser');
    let storeForUserId: string | null = null;

    try {
      const dbUser = await upsertDbUserFromFirebaseUser(firebaseUser);
      storeForUserId = dbUser.id;
    } catch (error) {
      console.error('AI summary user sync skipped because the database is unavailable:', {
        error,
        firebaseUid: firebaseUser.uid,
      });
    }

    return runSummary(c, await c.req.json(), {
      storeForUserId,
    });
  }
);
aiRouter.post('/personalized-diet', async c =>
  runPersonalizedDietPlan(c, await c.req.json())
);

const legacyAiRouter = new Hono<AuthEnv>();
legacyAiRouter.use('*', requireAuth);
legacyAiRouter.post('/chat', async c => {
  const body = await c.req.json();
  const parsed = legacyPromptSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid AI prompt payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  return runSummary(c, parsed.data, {
    storeForUserId: c.get('dbUser').id,
  });
});

export { publicAiRouter };
export { legacyAiRouter };
export default aiRouter;
