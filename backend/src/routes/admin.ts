import { randomUUID } from 'node:crypto';
import os from 'node:os';

import {
  AdminRole,
  CouponDiscountType,
  OrderStatus,
  ProductPriceType,
  RefundStatus,
  ShippingStatus,
  StoreProductCategory,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';

import {
  env,
  getDatabaseConnectionMode,
  getFirebaseAdminCredentialSource,
  getFirebaseAdminProjectId,
  hasDatabaseConfig,
  hasFirebaseAdminConfig,
} from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import {
  requireAdmin,
  requireAdminRole,
  type AdminAuthEnv,
} from '../middleware/auth.js';
import { generateWeeklyReportForUser } from './reports.js';

const WRITE_ROLES = [AdminRole.super_admin, AdminRole.admin];
const SUPPORT_ROLES = [AdminRole.super_admin, AdminRole.admin, AdminRole.support];
const SUPER_ADMIN_ONLY = [AdminRole.super_admin];

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  disabled: z.boolean().optional(),
  note: z.string().trim().min(1).max(2000).optional(),
  role: z.nativeEnum(AdminRole).optional(),
});

const userStatusSchema = z.object({
  disabled: z.boolean(),
  note: z.string().trim().max(500).optional(),
});

const optionalTrimmedSlug = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).max(120).optional()
);

const productSchema = z.object({
  slug: optionalTrimmedSlug,
  title: z.string().trim().min(1).max(160),
  shortTitle: z.string().trim().min(1).max(80).optional(),
  capacity: z.string().trim().min(1).max(80),
  price: z.coerce.number().min(0),
  priceType: z.nativeEnum(ProductPriceType).default(ProductPriceType.FIXED),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  mrp: z.coerce.number().min(0),
  category: z.nativeEnum(StoreProductCategory),
  description: z.string().trim().max(1000).optional(),
  detailDescription: z.string().trim().max(4000).optional(),
  benefits: z.string().trim().max(3000).optional().nullable(),
  usage: z.string().trim().max(2000).optional().nullable(),
  howToUse: z.string().trim().max(2000).optional(),
  subtitle: z.string().trim().max(240).optional(),
  supportLine: z.string().trim().max(240).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().max(80).nullable().optional(),
  images: z.array(z.string().trim().url()).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  sortOrder: z.coerce.number().int().default(0),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
  seoTitle: z.string().trim().max(180).optional().nullable(),
  seoDescription: z.string().trim().max(300).optional().nullable(),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(1).max(100),
        price: z.coerce.number().min(0),
        stock: z.coerce.number().int().min(0).default(0),
        sku: z.string().trim().max(80).optional().nullable(),
        active: z.boolean().default(true),
        sortOrder: z.coerce.number().int().default(0),
      })
    )
    .default([]),
  active: z.boolean().default(true),
});

const productStatusSchema = z.object({
  active: z.boolean().optional(),
  archived: z.boolean().optional(),
  hidden: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

const couponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  discountType: z.nativeEnum(CouponDiscountType),
  discountValue: z.coerce.number().int().positive(),
  minSubtotal: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).nullable().optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  refundStatus: z.nativeEnum(RefundStatus).optional(),
  adminNotes: z.string().trim().max(2000).nullable().optional(),
});

const fulfillmentSchema = z.object({
  shippingStatus: z.nativeEnum(ShippingStatus),
  trackingNumber: z.string().trim().max(120).nullable().optional(),
  courier: z.string().trim().max(120).nullable().optional(),
  adminNotes: z.string().trim().max(2000).nullable().optional(),
});

function parseList(c: { req: { query: (key: string) => string | undefined } }) {
  return listSchema.parse({
    page: c.req.query('page'),
    pageSize: c.req.query('pageSize'),
    search: c.req.query('search'),
    status: c.req.query('status'),
    userId: c.req.query('userId'),
    from: c.req.query('from'),
    to: c.req.query('to'),
  });
}

function pageArgs(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function paise(amount: number) {
  return Math.round(amount * 100);
}

function amount(paiseValue: number) {
  return paiseValue / 100;
}

function dateRange(from?: string, to?: string) {
  if (!from && !to) {
    return undefined;
  }

  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function buildProductWriteData(body: z.infer<typeof productSchema>) {
  const minPrice = body.minPrice ?? body.price;
  const maxPrice = body.maxPrice ?? minPrice;
  const description = body.description || `${body.title} for Medha Clinic wellness programs.`;
  const usage = body.usage || body.howToUse || 'Use as advised by Medha Clinic staff.';

  return {
    slug: body.slug ?? slugify(body.title),
    title: body.title,
    shortTitle: body.shortTitle ?? body.title,
    capacity: body.capacity,
    pricePaise: paise(minPrice),
    mrpPaise: paise(body.mrp),
    category: body.category,
    description,
    detailDescription: body.detailDescription || description,
    howToUse: usage,
    benefits: body.benefits,
    usage,
    priceType: body.priceType,
    minPricePaise: paise(minPrice),
    maxPricePaise: paise(maxPrice),
    subtitle: body.subtitle || 'Medha Clinic product',
    supportLine: body.supportLine || 'Medha Clinic support',
    stock: body.stock,
    sku: body.sku,
    images: body.images,
    tags: body.tags,
    sortOrder: body.sortOrder,
    featured: body.featured,
    hidden: body.hidden,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    active: body.active,
  };
}

function buildVariantData(productId: string, variants: z.infer<typeof productSchema>['variants']) {
  return variants.map((variant, index) => ({
    productId,
    title: variant.title,
    pricePaise: paise(variant.price),
    stock: variant.stock,
    sku: variant.sku,
    active: variant.active,
    sortOrder: variant.sortOrder ?? index,
  }));
}

function buildNestedVariantData(variants: z.infer<typeof productSchema>['variants']) {
  return variants.map((variant, index) => ({
    title: variant.title,
    pricePaise: paise(variant.price),
    stock: variant.stock,
    sku: variant.sku,
    active: variant.active,
    sortOrder: variant.sortOrder ?? index,
  }));
}

function buildProductImageData(productId: string, images: string[]) {
  return images.map((url, index) => ({
    productId,
    url,
    sortOrder: index,
  }));
}

function buildNestedProductImageData(images: string[]) {
  return images.map((url, index) => ({
    url,
    sortOrder: index,
  }));
}

function redactPrompt(value: unknown) {
  const serialized = JSON.stringify(value ?? {});
  return serialized.length > 500 ? `${serialized.slice(0, 500)}...` : serialized;
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function audit(
  c: { get: (name: 'adminUser') => { uid: string } },
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Prisma.InputJsonValue
) {
  const actor = c.get('adminUser');

  await prisma.auditLog.create({
    data: {
      actorId: actor.uid,
      action,
      entity,
      entityId,
      metadata,
    },
  });
}

const adminRouter = new Hono<AdminAuthEnv>();
adminRouter.use('*', requireAdmin);

adminRouter.get('/me', c => {
  return c.json({
    success: true,
    data: c.get('adminUser'),
  });
});

adminRouter.get('/dashboard', async c => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now);
  startOfMonth.setMonth(now.getMonth() - 1);

  const [
    totalUsers,
    activeUsers,
    newToday,
    newWeek,
    newMonth,
    submissionsCount,
    latestSubmissions,
    reportsGenerated,
    aiSummariesCount,
    revenue,
    orderStatus,
    topProducts,
    latestOrders,
    latestUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { disabled: false, deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.dailyImmunitySubmission.count(),
    prisma.dailyImmunitySubmission.findMany({
      distinct: ['userId'],
      orderBy: [{ userId: 'asc' }, { submittedAt: 'desc' }],
      select: { immunityScore: true, submittedAt: true },
    }),
    prisma.weeklyReport.count(),
    prisma.aiSummary.count(),
    prisma.order.aggregate({
      where: { status: OrderStatus.PAID },
      _sum: { totalPaise: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.orderItem.groupBy({
      by: ['productSlug', 'title'],
      _sum: { quantity: true, lineTotalPaise: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: true, items: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { profile: true },
    }),
  ]);

  const averageLatestImmunityScore =
    latestSubmissions.length > 0
      ? latestSubmissions.reduce((sum, item) => sum + item.immunityScore, 0) /
        latestSubmissions.length
      : 0;

  return c.json({
    success: true,
    data: {
      totals: {
        totalUsers,
        activeUsers,
        newUsersToday: newToday,
        newUsersWeek: newWeek,
        newUsersMonth: newMonth,
        immunitySubmissions: submissionsCount,
        averageLatestImmunityScore,
        reportsGenerated,
        aiSummaries: aiSummariesCount,
        revenue: amount(revenue._sum.totalPaise ?? 0),
        paidOrders: revenue._count,
      },
      orderCountsByStatus: orderStatus.map(item => ({
        status: item.status,
        total: item._count,
      })),
      topProducts: topProducts.map(item => ({
        productSlug: item.productSlug,
        title: item.title,
        quantity: item._sum.quantity ?? 0,
        revenue: amount(item._sum.lineTotalPaise ?? 0),
      })),
      latestOrders: latestOrders.map(order => ({
        id: order.id,
        userName: order.user.name,
        userEmail: order.user.email,
        total: amount(order.totalPaise),
        status: order.status,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt,
        itemsCount: order.items.length,
      })),
      latestUsers: latestUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        disabled: user.disabled,
        createdAt: user.createdAt,
        profile: user.profile,
      })),
      systemHealth: {
        databaseConfigured: hasDatabaseConfig(),
        firebaseAdminConfigured: hasFirebaseAdminConfig(),
        openaiConfigured: Boolean(env.OPENAI_API_KEY),
        razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      },
    },
  });
});

adminRouter.get('/users', async c => {
  const query = parseList(c);
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.status === 'disabled' ? { disabled: true } : {}),
    ...(query.status === 'active' ? { disabled: false } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        _count: {
          select: {
            submissions: true,
            reports: true,
            aiSummaries: true,
            orders: true,
            notes: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.get('/users/:id', async c => {
  const user = await prisma.user.findUnique({
    where: { id: c.req.param('id') },
    include: {
      profile: true,
      notes: { orderBy: { createdAt: 'desc' }, take: 25 },
      submissions: { orderBy: { submittedAt: 'desc' }, take: 20 },
      reports: { orderBy: { generatedAt: 'desc' }, take: 10 },
      orders: { orderBy: { createdAt: 'desc' }, take: 10, include: { items: true } },
      _count: {
        select: { submissions: true, reports: true, aiSummaries: true, orders: true },
      },
    },
  });

  if (!user) {
    return c.json({ success: false, message: 'User not found.' }, 404);
  }

  return c.json({ success: true, data: user });
});

adminRouter.patch('/users/:id', requireAdminRole(SUPPORT_ROLES), async c => {
  const userId = c.req.param('id');
  const body = userUpdateSchema.parse(await c.req.json());
  const actor = c.get('adminUser');

  if (body.role && actor.role !== AdminRole.super_admin) {
    return c.json({ success: false, message: 'Only super admins can assign roles.' }, 403);
  }

  const { note, role: _role, ...userData } = body;
  const user = await prisma.user.update({
    where: { id: userId },
    data: userData,
  });

  if (note) {
    await prisma.userNote.create({
      data: { userId, note, createdBy: actor.uid },
    });
  }

  await audit(c, 'user.update', 'User', userId, { fields: Object.keys(body) });
  return c.json({ success: true, data: user });
});

adminRouter.patch('/users/:id/status', requireAdminRole(SUPPORT_ROLES), async c => {
  const userId = c.req.param('id');
  const body = userStatusSchema.parse(await c.req.json());
  const user = await prisma.user.update({
    where: { id: userId },
    data: { disabled: body.disabled },
  });

  if (body.note) {
    await prisma.userNote.create({
      data: { userId, note: body.note, createdBy: c.get('adminUser').uid },
    });
  }

  await audit(c, body.disabled ? 'user.disable' : 'user.enable', 'User', userId);
  return c.json({ success: true, data: user });
});

adminRouter.delete('/users/:id', requireAdminRole(SUPER_ADMIN_ONLY), async c => {
  const userId = c.req.param('id');
  const user = await prisma.user.update({
    where: { id: userId },
    data: { disabled: true, deletedAt: new Date() },
  });
  await audit(c, 'user.soft_delete', 'User', userId);
  return c.json({ success: true, data: user });
});

adminRouter.get('/immunity-submissions/export/csv', async c => {
  const query = parseList(c);
  const where: Prisma.DailyImmunitySubmissionWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { immunityLevel: query.status } : {}),
    ...(dateRange(query.from, query.to) ? { submittedAt: dateRange(query.from, query.to) } : {}),
  };
  const rows = await prisma.dailyImmunitySubmission.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    include: { user: true },
    take: 5000,
  });
  const header = ['id', 'userEmail', 'userName', 'score', 'level', 'submittedAt'];
  const csv = [
    header.join(','),
    ...rows.map(row =>
      [
        row.id,
        row.user.email,
        row.user.name,
        row.immunityScore,
        row.immunityLevel,
        row.submittedAt.toISOString(),
      ]
        .map(csvEscape)
        .join(',')
    ),
  ].join('\n');

  return c.body(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="immunity-submissions.csv"',
  });
});

adminRouter.get('/immunity-submissions', async c => {
  const query = parseList(c);
  const minScore = c.req.query('minScore');
  const maxScore = c.req.query('maxScore');
  const where: Prisma.DailyImmunitySubmissionWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { immunityLevel: query.status } : {}),
    ...(dateRange(query.from, query.to) ? { submittedAt: dateRange(query.from, query.to) } : {}),
    ...(minScore || maxScore
      ? {
          immunityScore: {
            ...(minScore ? { gte: Number(minScore) } : {}),
            ...(maxScore ? { lte: Number(maxScore) } : {}),
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.dailyImmunitySubmission.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { submittedAt: 'desc' },
      include: { user: true },
    }),
    prisma.dailyImmunitySubmission.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.get('/immunity-submissions/:id', async c => {
  const item = await prisma.dailyImmunitySubmission.findUnique({
    where: { id: c.req.param('id') },
    include: { user: { include: { profile: true } }, aiSummaries: true },
  });
  return item
    ? c.json({ success: true, data: item })
    : c.json({ success: false, message: 'Submission not found.' }, 404);
});

adminRouter.get('/users/:id/immunity-history', async c => {
  const items = await prisma.dailyImmunitySubmission.findMany({
    where: { userId: c.req.param('id') },
    orderBy: { submittedAt: 'desc' },
    take: 180,
  });
  return c.json({ success: true, items, total: items.length });
});

adminRouter.get('/reports', async c => {
  const query = parseList(c);
  const where: Prisma.WeeklyReportWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(dateRange(query.from, query.to) ? { generatedAt: dateRange(query.from, query.to) } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.weeklyReport.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { generatedAt: 'desc' },
      include: { user: true },
    }),
    prisma.weeklyReport.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.get('/reports/:id', async c => {
  const item = await prisma.weeklyReport.findUnique({
    where: { id: c.req.param('id') },
    include: { user: true },
  });
  return item
    ? c.json({ success: true, data: item })
    : c.json({ success: false, message: 'Report not found.' }, 404);
});

adminRouter.post('/users/:id/reports/generate', requireAdminRole(WRITE_ROLES), async c => {
  const userId = c.req.param('id');
  const report = await generateWeeklyReportForUser(userId);
  await audit(c, 'report.generate', 'User', userId);
  return c.json({ success: true, data: report });
});

adminRouter.post('/reports/:id/regenerate', requireAdminRole(WRITE_ROLES), async c => {
  const existing = await prisma.weeklyReport.findUnique({ where: { id: c.req.param('id') } });

  if (!existing) {
    return c.json({ success: false, message: 'Report not found.' }, 404);
  }

  const report = await generateWeeklyReportForUser(existing.userId);
  await audit(c, 'report.regenerate', 'WeeklyReport', existing.id);
  return c.json({ success: true, data: report });
});

adminRouter.get('/ai-summaries', async c => {
  const query = parseList(c);
  const where: Prisma.AiSummaryWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(dateRange(query.from, query.to) ? { createdAt: dateRange(query.from, query.to) } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.aiSummary.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.aiSummary.count({ where }),
  ]);
  return c.json({
    success: true,
    items: items.map(item => ({
      ...item,
      promptPreview: redactPrompt(item.promptJson),
      outputPreview:
        item.resultText.length > 500 ? `${item.resultText.slice(0, 500)}...` : item.resultText,
      promptJson: undefined,
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  });
});

adminRouter.get('/ai-summaries/:id', async c => {
  const item = await prisma.aiSummary.findUnique({
    where: { id: c.req.param('id') },
    include: { user: true, sourceSubmission: true },
  });
  return item
    ? c.json({ success: true, data: { ...item, promptPreview: redactPrompt(item.promptJson), promptJson: undefined } })
    : c.json({ success: false, message: 'AI summary not found.' }, 404);
});

adminRouter.get('/products', async c => {
  const query = parseList(c);
  const categoryFilter = c.req.query('category');
  const activeFilter = c.req.query('active');
  const featuredFilter = c.req.query('featured');
  const lowStockFilter = c.req.query('lowStock');
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(query.status === 'active' ? { active: true, hidden: false, archived: false } : {}),
    ...(query.status === 'inactive' ? { active: false } : {}),
    ...(query.status === 'hidden' ? { hidden: true } : {}),
    ...(query.status === 'featured' ? { featured: true } : {}),
    ...(query.status === 'low-stock' ? { stock: { lte: 10 } } : {}),
    ...(query.status === 'archived' ? { archived: true } : {}),
    ...(categoryFilter ? { category: categoryFilter as StoreProductCategory } : {}),
    ...(activeFilter === 'true' ? { active: true } : {}),
    ...(activeFilter === 'false' ? { active: false } : {}),
    ...(featuredFilter === 'true' ? { featured: true } : {}),
    ...(featuredFilter === 'false' ? { featured: false } : {}),
    ...(lowStockFilter === 'true' ? { stock: { lte: 10 } } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
            { sku: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: {
        variants: { orderBy: { sortOrder: 'asc' } },
        gallery: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.product.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.get('/products/:id', async c => {
  const product = await prisma.product.findUnique({
    where: { id: c.req.param('id') },
    include: {
      variants: { orderBy: { sortOrder: 'asc' } },
      gallery: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return product
    ? c.json({ success: true, data: product })
    : c.json({ success: false, message: 'Product not found.' }, 404);
});

adminRouter.post('/products', requireAdminRole(WRITE_ROLES), async c => {
  const body = productSchema.parse(await c.req.json());
  const productId = randomUUID();
  const product = await prisma.product.create({
    data: {
      id: productId,
      ...buildProductWriteData(body),
      ...(body.variants.length > 0
        ? {
            variants: {
              create: buildNestedVariantData(body.variants),
            },
          }
        : {}),
      ...(body.images.length > 0
        ? {
            gallery: {
              create: buildNestedProductImageData(body.images),
            },
          }
        : {}),
    },
    include: {
      variants: true,
      gallery: true,
    },
  });
  await audit(c, 'product.create', 'Product', product.id);
  return c.json({ success: true, data: product }, 201);
});

adminRouter.put('/products/:id', requireAdminRole(WRITE_ROLES), async c => {
  const body = productSchema.parse(await c.req.json());
  const productId = c.req.param('id');

  await prisma.product.update({
    where: { id: productId },
    data: buildProductWriteData(body),
  });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productImage.deleteMany({ where: { productId } });

  if (body.variants.length > 0) {
    await prisma.productVariant.createMany({
      data: buildVariantData(productId, body.variants),
    });
  }

  if (body.images.length > 0) {
    await prisma.productImage.createMany({
      data: buildProductImageData(productId, body.images),
    });
  }

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { variants: true, gallery: true },
  });
  await audit(c, 'product.update', 'Product', product.id);
  return c.json({ success: true, data: product });
});

adminRouter.post('/products/:id/images', requireAdminRole(WRITE_ROLES), async c => {
  const body = z
    .object({
      url: z.string().trim().url(),
      alt: z.string().trim().max(160).optional(),
      sortOrder: z.coerce.number().int().default(0),
    })
    .parse(await c.req.json());
  const image = await prisma.productImage.create({
    data: {
      productId: c.req.param('id'),
      ...body,
    },
  });
  await audit(c, 'product.image.add', 'Product', c.req.param('id'), body);
  return c.json({ success: true, data: image }, 201);
});

adminRouter.post('/products/bulk-import', requireAdminRole(WRITE_ROLES), async c => {
  const body = z.object({ csv: z.string().min(1) }).parse(await c.req.json());
  const [headerLine, ...rows] = body.csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map(header => header.trim());
  let imported = 0;

  for (const row of rows) {
    const values = row.split(',').map(value => value.trim());
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    const name = record.name || record.title;

    if (!name) continue;

    const category = String(record.category || 'boosters').toUpperCase();
    const parsedCategory =
      category === 'PACKAGES'
        ? StoreProductCategory.PACKAGES
        : category === 'SUPPLEMENTS'
          ? StoreProductCategory.SUPPLEMENTS
          : StoreProductCategory.BOOSTERS;
    const minPrice = Number(record.minPrice || record.price || 0);
    const maxPrice = Number(record.maxPrice || record.price || minPrice);

    await prisma.product.upsert({
      where: { slug: record.slug || slugify(name) },
      update: {
        title: name,
        category: parsedCategory,
        minPricePaise: paise(minPrice),
        maxPricePaise: paise(maxPrice),
        pricePaise: paise(minPrice),
        priceType: minPrice === maxPrice ? ProductPriceType.FIXED : ProductPriceType.RANGE,
        stock: Number(record.stock || 0),
        active: record.active !== 'false',
      },
      create: {
        slug: record.slug || slugify(name),
        title: name,
        shortTitle: name,
        capacity: 'Standard',
        pricePaise: paise(minPrice),
        mrpPaise: paise(maxPrice || minPrice),
        category: parsedCategory,
        description: record.description || `${name} for Medha Clinic wellness programs.`,
        detailDescription: record.fullDescription || record.description || `${name} details can be managed from admin.`,
        howToUse: record.usage || 'Use as advised by Medha Clinic staff.',
        usage: record.usage || 'Use as advised by Medha Clinic staff.',
        subtitle: record.subtitle || 'Medha Clinic product',
        supportLine: 'Medha Clinic support',
        minPricePaise: paise(minPrice),
        maxPricePaise: paise(maxPrice),
        priceType: minPrice === maxPrice ? ProductPriceType.FIXED : ProductPriceType.RANGE,
        stock: Number(record.stock || 0),
        active: record.active !== 'false',
      },
    });
    imported += 1;
  }

  await audit(c, 'product.bulk_import', 'Product', null, { imported });
  return c.json({ success: true, data: { imported } });
});

adminRouter.patch('/products/:id/status', requireAdminRole(WRITE_ROLES), async c => {
  const body = productStatusSchema.parse(await c.req.json());
  const product = await prisma.product.update({
    where: { id: c.req.param('id') },
    data: body,
  });
  await audit(c, 'product.status', 'Product', product.id, body);
  return c.json({ success: true, data: product });
});

adminRouter.delete('/products/:id', requireAdminRole(WRITE_ROLES), async c => {
  const product = await prisma.product.update({
    where: { id: c.req.param('id') },
    data: { archived: true, active: false, hidden: true, deletedAt: new Date() },
  });
  await audit(c, 'product.archive', 'Product', product.id);
  return c.json({ success: true, data: product });
});

adminRouter.get('/coupons', async c => {
  const query = parseList(c);
  const where: Prisma.CouponWhereInput = {
    ...(query.status === 'active' ? { active: true } : {}),
    ...(query.status === 'inactive' ? { active: false } : {}),
    ...(query.search ? { code: { contains: query.search, mode: 'insensitive' } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coupon.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.post('/coupons', requireAdminRole(WRITE_ROLES), async c => {
  const body = couponSchema.parse(await c.req.json());
  const coupon = await prisma.coupon.create({
    data: {
      id: randomUUID(),
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      minSubtotalPaise: paise(body.minSubtotal),
      maxDiscountPaise: body.maxDiscount == null ? null : paise(body.maxDiscount),
      usageLimit: body.usageLimit,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: body.active,
    },
  });
  await audit(c, 'coupon.create', 'Coupon', coupon.id);
  return c.json({ success: true, data: coupon }, 201);
});

adminRouter.put('/coupons/:id', requireAdminRole(WRITE_ROLES), async c => {
  const body = couponSchema.parse(await c.req.json());
  const coupon = await prisma.coupon.update({
    where: { id: c.req.param('id') },
    data: {
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      minSubtotalPaise: paise(body.minSubtotal),
      maxDiscountPaise: body.maxDiscount == null ? null : paise(body.maxDiscount),
      usageLimit: body.usageLimit,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: body.active,
    },
  });
  await audit(c, 'coupon.update', 'Coupon', coupon.id);
  return c.json({ success: true, data: coupon });
});

adminRouter.patch('/coupons/:id/status', requireAdminRole(WRITE_ROLES), async c => {
  const body = z.object({ active: z.boolean() }).parse(await c.req.json());
  const coupon = await prisma.coupon.update({ where: { id: c.req.param('id') }, data: body });
  await audit(c, 'coupon.status', 'Coupon', coupon.id, body);
  return c.json({ success: true, data: coupon });
});

adminRouter.get('/orders', async c => {
  const query = parseList(c);
  const where: Prisma.OrderWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { status: query.status as OrderStatus } : {}),
    ...(dateRange(query.from, query.to) ? { createdAt: dateRange(query.from, query.to) } : {}),
    ...(query.search
      ? {
          OR: [
            { razorpayOrderId: { contains: query.search, mode: 'insensitive' } },
            { razorpayPaymentId: { contains: query.search, mode: 'insensitive' } },
            { couponCode: { contains: query.search, mode: 'insensitive' } },
            { user: { email: { contains: query.search, mode: 'insensitive' } } },
            { user: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: true },
    }),
    prisma.order.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

adminRouter.get('/orders/:id', async c => {
  const item = await prisma.order.findUnique({
    where: { id: c.req.param('id') },
    include: { user: { include: { profile: true } }, items: true, coupon: true },
  });
  return item
    ? c.json({ success: true, data: item })
    : c.json({ success: false, message: 'Order not found.' }, 404);
});

adminRouter.patch('/orders/:id/status', requireAdminRole(WRITE_ROLES), async c => {
  const body = orderStatusSchema.parse(await c.req.json());
  const order = await prisma.order.update({ where: { id: c.req.param('id') }, data: body });
  await audit(c, 'order.status', 'Order', order.id, body);
  return c.json({ success: true, data: order });
});

adminRouter.patch('/orders/:id/fulfillment', requireAdminRole(SUPPORT_ROLES), async c => {
  const body = fulfillmentSchema.parse(await c.req.json());
  const now = new Date();
  const order = await prisma.order.update({
    where: { id: c.req.param('id') },
    data: {
      ...body,
      ...(body.shippingStatus === ShippingStatus.PACKING ? { packedAt: now } : {}),
      ...(body.shippingStatus === ShippingStatus.SHIPPED ? { shippedAt: now } : {}),
      ...(body.shippingStatus === ShippingStatus.DELIVERED ? { deliveredAt: now } : {}),
    },
  });
  await audit(c, 'order.fulfillment', 'Order', order.id, body);
  return c.json({ success: true, data: order });
});

adminRouter.get('/health', async c => {
  let databaseReachable = hasDatabaseConfig();
  let databaseMessage: string | null = null;

  if (hasDatabaseConfig()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseReachable = false;
      databaseMessage = error instanceof Error ? error.message : 'Database health check failed.';
    }
  } else {
    databaseMessage = 'Database configuration is missing.';
  }

  return c.json({
    success: true,
    data: {
      status: databaseReachable ? 'ok' : 'degraded',
      databaseReachable,
      databaseMessage,
      firebaseAdminConfigured: hasFirebaseAdminConfig(),
      openaiConfigured: Boolean(env.OPENAI_API_KEY),
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      envMode: env.NODE_ENV,
      backendVersion: process.env.npm_package_version ?? '0.1.0',
      uptimeSeconds: Math.floor(process.uptime()),
      hostname: os.hostname(),
    },
  });
});

adminRouter.get('/config-status', async c => {
  return c.json({
    success: true,
    data: {
      databaseConfigured: hasDatabaseConfig(),
      databaseConnectionMode: getDatabaseConnectionMode(),
      firebaseAdminConfigured: hasFirebaseAdminConfig(),
      firebaseAdminCredentialSource: getFirebaseAdminCredentialSource(),
      firebaseAdminProjectId: getFirebaseAdminProjectId(),
      openaiConfigured: Boolean(env.OPENAI_API_KEY),
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      corsOrigin: env.CORS_ORIGIN,
      envMode: env.NODE_ENV,
    },
  });
});

adminRouter.get('/audit-logs', async c => {
  const query = parseList(c);
  const where: Prisma.AuditLogWhereInput = {
    ...(query.status ? { action: { contains: query.status, mode: 'insensitive' } } : {}),
    ...(dateRange(query.from, query.to) ? { createdAt: dateRange(query.from, query.to) } : {}),
    ...(query.search
      ? {
          OR: [
            { action: { contains: query.search, mode: 'insensitive' } },
            { entity: { contains: query.search, mode: 'insensitive' } },
            { entityId: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      ...pageArgs(query.page, query.pageSize),
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return c.json({ success: true, items, total, page: query.page, pageSize: query.pageSize });
});

export default adminRouter;
