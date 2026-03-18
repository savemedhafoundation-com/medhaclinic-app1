import type { Context } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';

const scoreField = z.coerce.number().int().min(0).max(10).optional();

const submissionSchema = z.object({
  physicalEnergy: scoreField,
  appetite: scoreField,
  digestionComfort: scoreField,
  burningPain: scoreField,
  bloatingGas: scoreField,
  bloodPressure: scoreField,
  swelling: scoreField,
  fever: scoreField,
  infection: scoreField,
  breathingProblem: scoreField,
  menstrualRegularity: scoreField,
  libidoStability: scoreField,
  hairHealth: scoreField,
  sleepHours: scoreField,
  immunityScore: z.coerce.number().int().min(0).max(10),
  immunityLevel: z.string().trim().min(1),
  submittedAt: z.string().datetime().optional(),
});

async function createSubmission(
  c: Context<AuthEnv>,
  body: unknown
) {
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid immunity payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  const dbUser = c.get('dbUser');

  const submission = await prisma.dailyImmunitySubmission.create({
    data: {
      userId: dbUser.id,
      ...parsed.data,
      submittedAt: parsed.data.submittedAt
        ? new Date(parsed.data.submittedAt)
        : new Date(),
    },
  });

  return c.json({
    success: true,
    message: 'Daily immunity data saved successfully.',
    data: submission,
  });
}

const immunityRouter = new Hono<AuthEnv>();
immunityRouter.use('*', requireAuth);

immunityRouter.post('/daily', async c => createSubmission(c, await c.req.json()));

const legacyImmunityRouter = new Hono<AuthEnv>();
legacyImmunityRouter.use('*', requireAuth);
legacyImmunityRouter.post('/save_daily_immunity', async c =>
  createSubmission(c, await c.req.json())
);

export { legacyImmunityRouter };
export default immunityRouter;
