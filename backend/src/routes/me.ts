import { Hono } from 'hono';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';

const meRouter = new Hono<AuthEnv>();

const profileSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  gender: z.string().trim().min(1).optional(),
  age: z.coerce.number().int().positive().max(120).optional(),
  weightKg: z.coerce.number().positive().max(500).optional(),
  heightCm: z.coerce.number().positive().max(300).optional(),
  purpose: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
});

meRouter.use('*', requireAuth);

meRouter.get('/', async c => {
  const dbUser = c.get('dbUser');

  const user = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: { profile: true },
  });

  return c.json({
    success: true,
    data: user,
  });
});

meRouter.put('/profile', async c => {
  const dbUser = c.get('dbUser');
  const body = await c.req.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid profile payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  const { fullName, email, ...profileData } = parsed.data;

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: fullName,
      email,
    },
  });

  const profile = await prisma.patientProfile.upsert({
    where: {
      userId: dbUser.id,
    },
    update: profileData,
    create: {
      userId: dbUser.id,
      ...profileData,
    },
  });

  return c.json({
    success: true,
    message: 'Profile updated successfully.',
    data: profile,
  });
});

export default meRouter;
