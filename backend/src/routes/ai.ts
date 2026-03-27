import type { Context } from 'hono';
import { Hono } from 'hono';
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

function getAiUpstreamFailure(
  error: unknown
): { message: string; status: 502 | 504 } {
  const message =
    error instanceof Error ? error.message : 'OpenAI request failed.';
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
        'OpenAI request timed out before Vercel finished the function. Please try again.',
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

const publicAiRouter = new Hono();
publicAiRouter.post('/immunity-summary-public', async c =>
  runSummary(c, await c.req.json())
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
