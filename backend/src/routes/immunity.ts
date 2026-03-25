import type { Context } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import {
  buildServerImmunityAssessment,
  normalizeGenderKey,
  validateClientImmunityAssessment,
} from '../utils/immunity-scoring.js';

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
  immunityScore: z.coerce.number().min(0).max(10).optional(),
  immunityLevel: z.string().trim().min(1).optional(),
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
  const userProfile = await prisma.patientProfile.findUnique({
    where: {
      userId: dbUser.id,
    },
    select: {
      gender: true,
    },
  });
  const assessment = buildServerImmunityAssessment(
    parsed.data,
    normalizeGenderKey(userProfile?.gender)
  );
  const clientValidation = validateClientImmunityAssessment(parsed.data, assessment);

  if ((clientValidation.scoreProvided || clientValidation.levelProvided) && !clientValidation.matches) {
    return c.json(
      {
        success: false,
        message: 'Submitted immunity summary does not match server calculation.',
        validation: clientValidation,
        assessment,
      },
      422
    );
  }

  const submission = await prisma.dailyImmunitySubmission.create({
    data: {
      userId: dbUser.id,
      ...assessment.normalizedScores,
      immunityScore: assessment.roundedScore,
      immunityLevel: assessment.apiLevel,
      submittedAt: parsed.data.submittedAt
        ? new Date(parsed.data.submittedAt)
        : new Date(),
    },
  });

  return c.json({
    success: true,
    message: 'Daily immunity data saved successfully.',
    data: submission,
    assessment,
    validation: clientValidation,
  });
}

const immunityRouter = new Hono<AuthEnv>();
immunityRouter.use('*', requireAuth);

immunityRouter.get('/latest', async c => {
  const dbUser = c.get('dbUser');
  const latestSubmission = await prisma.dailyImmunitySubmission.findFirst({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      submittedAt: 'desc',
    },
    select: {
      immunityScore: true,
      immunityLevel: true,
      submittedAt: true,
    },
  });

  return c.json({
    success: true,
    data: latestSubmission,
  });
});

immunityRouter.post('/daily', async c => createSubmission(c, await c.req.json()));

const legacyImmunityRouter = new Hono<AuthEnv>();
legacyImmunityRouter.use('*', requireAuth);
legacyImmunityRouter.post('/save_daily_immunity', async c =>
  createSubmission(c, await c.req.json())
);

export { legacyImmunityRouter };
export default immunityRouter;
