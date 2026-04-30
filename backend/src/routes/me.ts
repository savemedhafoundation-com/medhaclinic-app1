import { Hono } from 'hono';
import { z } from 'zod';

import { getAdminAuth } from '../lib/firebase-admin.js';
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
const photoSchema = z.object({
  photoUrl: z.string().trim().url(),
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

meRouter.put('/photo', async c => {
  const dbUser = c.get('dbUser');
  const body = await c.req.json();
  const parsed = photoSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: 'Invalid photo payload.',
        errors: parsed.error.flatten(),
      },
      400
    );
  }

  const user = await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      photoUrl: parsed.data.photoUrl,
    },
  });

  return c.json({
    success: true,
    message: 'Profile photo updated successfully.',
    data: user,
  });
});

meRouter.delete('/', async c => {
  const dbUser = c.get('dbUser');
  const firebaseUser = c.get('firebaseUser');

  const existingUser = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: {
      profile: true,
      _count: {
        select: {
          submissions: true,
          reports: true,
          aiSummaries: true,
          addresses: true,
          orders: true,
        },
      },
    },
  });

  if (existingUser) {
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  try {
    await getAdminAuth().deleteUser(firebaseUser.uid);
  } catch (error) {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : null;

    if (errorCode !== 'auth/user-not-found') {
      console.error('Firebase account deletion failed:', {
        error,
        firebaseUid: firebaseUser.uid,
      });

      return c.json(
        {
          success: false,
          message:
            'Your stored data was removed, but we could not finish deleting the sign-in account. Please try again or contact support.',
        },
        502
      );
    }
  }

  return c.json({
    success: true,
    message: 'Account deleted successfully.',
    data: {
      deleted: {
        account: true,
        profile: Boolean(existingUser?.profile),
        dailyImmunitySubmissions: existingUser?._count.submissions ?? 0,
        weeklyReports: existingUser?._count.reports ?? 0,
        aiSummaries: existingUser?._count.aiSummaries ?? 0,
        savedAddresses: existingUser?._count.addresses ?? 0,
        storeOrders: existingUser?._count.orders ?? 0,
      },
      retention: {
        hasExceptions: false,
        message: 'No retention exceptions were applied for this deletion request.',
        exceptions: [] as string[],
      },
    },
  });
});

export default meRouter;
