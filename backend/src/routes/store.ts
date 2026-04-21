import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  CouponDiscountType,
  OrderStatus,
  Prisma,
  StoreProductCategory,
} from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';

import { env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';

const storeRouter = new Hono<AuthEnv>();

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  recipientName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(20),
  line1: z.string().trim().min(1).max(160),
  line2: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(1).max(60).default('India'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional(),
});

const addressUpdateSchema = addressSchema.partial().refine(
  value => Object.keys(value).length > 0,
  'At least one address field is required.'
);

const cartItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

const couponValidationSchema = z.object({
  code: z.string().trim().min(1).max(40),
  items: z.array(cartItemSchema).min(1),
});

const paymentSessionSchema = z.object({
  addressId: z.string().uuid(),
  couponCode: z.string().trim().max(40).optional().nullable(),
  items: z.array(cartItemSchema).min(1),
});

const orderCreateSchema = paymentSessionSchema.extend({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

const STORE_PRODUCT_SEED = [
  {
    slug: 'skin-booster',
    title: 'Skin Booster',
    shortTitle: 'Skin Booster',
    capacity: '60 cap',
    pricePaise: 337_500,
    mrpPaise: 675_000,
    category: StoreProductCategory.BOOSTERS,
    description: 'Support skin wellness and daily glow care.',
    detailDescription:
      'Skin Booster is a focused beauty-from-within supplement built to support clearer looking skin, better texture, and everyday radiance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term skin routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. For best results, use consistently with your recommended nutrition routine.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, recharge & revive wellness',
  },
  {
    slug: 'immune-booster',
    title: 'Immunity Lifestyle Booster',
    shortTitle: 'Immunity Booster',
    capacity: '90 cap',
    pricePaise: 337_500,
    mrpPaise: 675_000,
    category: StoreProductCategory.BOOSTERS,
    description: 'Daily immunity lifestyle support for resilience.',
    detailDescription:
      'Immunity Lifestyle Booster is a focused wellness supplement built to support everyday resilience and immunity-focused routines. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Pair with your daily diet and hydration plan.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to recharge, protect & revive wellness',
  },
  {
    slug: 'bone-marrow-booster',
    title: 'Strength Support Booster',
    shortTitle: 'Strength Booster',
    capacity: '120 cap',
    pricePaise: 337_500,
    mrpPaise: 675_000,
    category: StoreProductCategory.BOOSTERS,
    description: 'Everyday strength and resilience support.',
    detailDescription:
      'Strength Support Booster is a focused wellness supplement built to support strength routines and everyday resilience. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use consistently with your recommended diet and wellness plan.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, recharge & revive wellness',
  },
  {
    slug: 'liver-booster',
    title: 'Daily Balance Booster',
    shortTitle: 'Balance Booster',
    capacity: '90 cap',
    pricePaise: 337_500,
    mrpPaise: 675_000,
    category: StoreProductCategory.BOOSTERS,
    description: 'Routine daily balance and vitality support.',
    detailDescription:
      'Daily Balance Booster is a focused wellness supplement built to support daily balance and everyday vitality. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use alongside your recommended nutrition and hydration routine.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, balance & revive wellness',
  },
  {
    slug: 'gt-500-booster',
    title: 'GT-500 Booster',
    shortTitle: 'GT-500',
    capacity: '60 cap',
    pricePaise: 287_500,
    mrpPaise: 575_000,
    category: StoreProductCategory.SUPPLEMENTS,
    description: 'Focused antioxidant support for everyday wellness.',
    detailDescription:
      'GT-500 Booster is a focused antioxidant supplement built to support glow and daily wellness. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use consistently with your daily food and hydration routine.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to recharge, restore & revive wellness',
  },
  {
    slug: 'br-1-supplement',
    title: 'BR-1 Supplement',
    shortTitle: 'BR-1',
    capacity: '30 cap',
    pricePaise: 257_500,
    mrpPaise: 515_000,
    category: StoreProductCategory.SUPPLEMENTS,
    description: 'Mineral balance support to round out your booster routine.',
    detailDescription:
      'BR-1 Supplement is a focused mineral support supplement built to round out daily wellness and balance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use with your recommended supplement and diet plan.',
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to balance, recharge & revive wellness',
  },
] satisfies Prisma.ProductCreateInput[];

type CartInput = z.infer<typeof cartItemSchema>;
type Coupon = Awaited<ReturnType<typeof findCoupon>>;

let seedProductsPromise: Promise<void> | null = null;

function normalizeCouponCode(code?: string | null) {
  const normalized = code?.trim().toUpperCase() ?? '';
  return normalized || null;
}

function getValidationError(errors: unknown) {
  return {
    success: false,
    message: 'Invalid request payload.',
    errors,
  };
}

function addressToSnapshot(address: {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}) {
  return {
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}

function buildRazorpayUnavailableResponse() {
  return {
    success: false,
    message:
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend.',
  };
}

async function seedStoreProducts() {
  await Promise.all(
    STORE_PRODUCT_SEED.map(product =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product,
      })
    )
  );
}

async function ensureStoreProducts() {
  if (!seedProductsPromise) {
    seedProductsPromise = seedStoreProducts().catch(error => {
      seedProductsPromise = null;
      throw error;
    });
  }

  return seedProductsPromise;
}

function aggregateCartItems(items: CartInput[]) {
  const quantities = new Map<string, number>();

  for (const item of items) {
    const productId = item.productId.trim();
    quantities.set(productId, (quantities.get(productId) ?? 0) + item.quantity);
  }

  return Array.from(quantities.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

async function findCoupon(code: string) {
  return prisma.coupon.findUnique({
    where: { code },
  });
}

async function calculateCart(items: CartInput[], couponCode?: string | null) {
  await ensureStoreProducts();

  const aggregatedItems = aggregateCartItems(items);
  const productSlugs = aggregatedItems.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      active: true,
      slug: {
        in: productSlugs,
      },
    },
  });
  const productBySlug = new Map(products.map(product => [product.slug, product]));
  const missingProductId = productSlugs.find(slug => !productBySlug.has(slug));

  if (missingProductId) {
    return {
      ok: false as const,
      status: 400 as const,
      message: `Product is not available: ${missingProductId}`,
    };
  }

  const lines = aggregatedItems.map(item => {
    const product = productBySlug.get(item.productId)!;

    return {
      product,
      quantity: item.quantity,
      lineTotalPaise: product.pricePaise * item.quantity,
    };
  });
  const subtotalPaise = lines.reduce(
    (total, line) => total + line.lineTotalPaise,
    0
  );
  const normalizedCouponCode = normalizeCouponCode(couponCode);
  let coupon: Coupon = null;
  let discountPaise = 0;

  if (normalizedCouponCode) {
    coupon = await findCoupon(normalizedCouponCode);

    if (!coupon || !coupon.active) {
      return {
        ok: false as const,
        status: 404 as const,
        message: 'Coupon code is not valid.',
      };
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return {
        ok: false as const,
        status: 400 as const,
        message: 'Coupon code has expired.',
      };
    }

    if (subtotalPaise < coupon.minSubtotalPaise) {
      return {
        ok: false as const,
        status: 400 as const,
        message: `Coupon requires a minimum order value of Rs ${(
          coupon.minSubtotalPaise / 100
        ).toLocaleString('en-IN')}.`,
      };
    }

    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discountPaise = Math.floor((subtotalPaise * coupon.discountValue) / 100);
    } else {
      discountPaise = coupon.discountValue;
    }

    if (coupon.maxDiscountPaise !== null) {
      discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
    }

    discountPaise = Math.min(discountPaise, subtotalPaise);
  }

  return {
    ok: true as const,
    lines,
    coupon,
    subtotalPaise,
    discountPaise,
    totalPaise: subtotalPaise - discountPaise,
  };
}

async function findUserAddress(userId: string, addressId: string) {
  return prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });
}

async function createRazorpayOrder({
  amountPaise,
  dbUserId,
}: {
  amountPaise: number;
  dbUserId: string;
}) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_NOT_CONFIGURED');
  }

  const receipt = `mc_${Date.now()}_${dbUserId.slice(0, 8)}`.slice(0, 40);
  const auth = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
  ).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        app: 'medha-clinic',
        user_id: dbUserId,
      },
    }),
  });
  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error &&
      'description' in payload.error &&
      typeof payload.error.description === 'string'
        ? payload.error.description
        : 'Could not create Razorpay payment session.';

    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('id' in payload) ||
    typeof payload.id !== 'string'
  ) {
    throw new Error('Razorpay returned an unexpected payment session response.');
  }

  return payload as {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  if (!env.RAZORPAY_KEY_SECRET) {
    return false;
  }

  const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const receivedSignature = Buffer.from(razorpaySignature, 'hex');
  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

  return (
    receivedSignature.length === expectedSignatureBuffer.length &&
    timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  );
}

function serializeOrder(order: Prisma.OrderGetPayload<{ include: { items: true } }>) {
  const { razorpaySignature: _razorpaySignature, ...publicOrder } = order;

  return {
    ...publicOrder,
    subtotalAmount: order.subtotalPaise / 100,
    discountAmount: order.discountPaise / 100,
    totalAmount: order.totalPaise / 100,
    items: order.items.map(item => ({
      ...item,
      unitPriceAmount: item.unitPricePaise / 100,
      lineTotalAmount: item.lineTotalPaise / 100,
    })),
  };
}

storeRouter.use('*', requireAuth);

storeRouter.get('/products', async c => {
  await ensureStoreProducts();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  });

  return c.json({
    success: true,
    data: products,
  });
});

storeRouter.get('/addresses', async c => {
  const dbUser = c.get('dbUser');
  const addresses = await prisma.address.findMany({
    where: { userId: dbUser.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return c.json({
    success: true,
    data: addresses,
  });
});

storeRouter.post('/addresses', async c => {
  const dbUser = c.get('dbUser');
  const body = await c.req.json();
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(getValidationError(parsed.error.flatten()), 400);
  }

  const existingCount = await prisma.address.count({
    where: { userId: dbUser.id },
  });
  const shouldMakeDefault = parsed.data.isDefault ?? existingCount === 0;

  const address = await prisma.$transaction(async tx => {
    if (shouldMakeDefault) {
      await tx.address.updateMany({
        where: { userId: dbUser.id },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId: dbUser.id,
        label: parsed.data.label,
        recipientName: parsed.data.recipientName,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
        isDefault: shouldMakeDefault,
      },
    });
  });

  return c.json(
    {
      success: true,
      data: address,
    },
    201
  );
});

storeRouter.put('/addresses/:id', async c => {
  const dbUser = c.get('dbUser');
  const addressId = c.req.param('id');
  const body = await c.req.json();
  const parsed = addressUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(getValidationError(parsed.error.flatten()), 400);
  }

  const existingAddress = await findUserAddress(dbUser.id, addressId);

  if (!existingAddress) {
    return c.json(
      {
        success: false,
        message: 'Address not found.',
      },
      404
    );
  }

  const address = await prisma.$transaction(async tx => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId: dbUser.id },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        ...parsed.data,
        ...('line2' in parsed.data ? { line2: parsed.data.line2 || null } : {}),
      },
    });
  });

  return c.json({
    success: true,
    data: address,
  });
});

storeRouter.put('/addresses/:id/default', async c => {
  const dbUser = c.get('dbUser');
  const addressId = c.req.param('id');
  const existingAddress = await findUserAddress(dbUser.id, addressId);

  if (!existingAddress) {
    return c.json(
      {
        success: false,
        message: 'Address not found.',
      },
      404
    );
  }

  const address = await prisma.$transaction(async tx => {
    await tx.address.updateMany({
      where: { userId: dbUser.id },
      data: { isDefault: false },
    });

    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });

  return c.json({
    success: true,
    data: address,
  });
});

storeRouter.delete('/addresses/:id', async c => {
  const dbUser = c.get('dbUser');
  const addressId = c.req.param('id');
  const existingAddress = await findUserAddress(dbUser.id, addressId);

  if (!existingAddress) {
    return c.json(
      {
        success: false,
        message: 'Address not found.',
      },
      404
    );
  }

  await prisma.$transaction(async tx => {
    await tx.address.delete({
      where: { id: addressId },
    });

    if (existingAddress.isDefault) {
      const nextAddress = await tx.address.findFirst({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
      });

      if (nextAddress) {
        await tx.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return c.json({
    success: true,
  });
});

storeRouter.post('/coupons/validate', async c => {
  const body = await c.req.json();
  const parsed = couponValidationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(getValidationError(parsed.error.flatten()), 400);
  }

  const calculation = await calculateCart(parsed.data.items, parsed.data.code);

  if (!calculation.ok) {
    return c.json(
      {
        success: false,
        message: calculation.message,
      },
      calculation.status
    );
  }

  return c.json({
    success: true,
    message: 'Coupon applied successfully.',
    data: {
      code: calculation.coupon?.code ?? normalizeCouponCode(parsed.data.code),
      discountType: calculation.coupon?.discountType ?? null,
      discountValue: calculation.coupon?.discountValue ?? null,
      subtotalPaise: calculation.subtotalPaise,
      discountPaise: calculation.discountPaise,
      totalPaise: calculation.totalPaise,
    },
  });
});

storeRouter.post('/payment-sessions', async c => {
  const dbUser = c.get('dbUser');
  const body = await c.req.json();
  const parsed = paymentSessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(getValidationError(parsed.error.flatten()), 400);
  }

  const address = await findUserAddress(dbUser.id, parsed.data.addressId);

  if (!address) {
    return c.json(
      {
        success: false,
        message: 'Select a valid delivery address before payment.',
      },
      400
    );
  }

  const calculation = await calculateCart(
    parsed.data.items,
    parsed.data.couponCode
  );

  if (!calculation.ok) {
    return c.json(
      {
        success: false,
        message: calculation.message,
      },
      calculation.status
    );
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return c.json(buildRazorpayUnavailableResponse(), 503);
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: calculation.totalPaise,
      dbUserId: dbUser.id,
    });

    return c.json({
      success: true,
      data: {
        razorpay: {
          keyId: env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amountPaise: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        summary: {
          subtotalPaise: calculation.subtotalPaise,
          discountPaise: calculation.discountPaise,
          totalPaise: calculation.totalPaise,
          couponCode: calculation.coupon?.code ?? null,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment failed.';

    return c.json(
      {
        success: false,
        message:
          message === 'RAZORPAY_NOT_CONFIGURED'
            ? buildRazorpayUnavailableResponse().message
            : message,
      },
      message === 'RAZORPAY_NOT_CONFIGURED' ? 503 : 502
    );
  }
});

storeRouter.post('/orders', async c => {
  const dbUser = c.get('dbUser');
  const body = await c.req.json();
  const parsed = orderCreateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(getValidationError(parsed.error.flatten()), 400);
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    return c.json(buildRazorpayUnavailableResponse(), 503);
  }

  if (
    !verifyRazorpaySignature({
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    })
  ) {
    return c.json(
      {
        success: false,
        message: 'Payment verification failed.',
      },
      400
    );
  }

  const address = await findUserAddress(dbUser.id, parsed.data.addressId);

  if (!address) {
    return c.json(
      {
        success: false,
        message: 'Delivery address was not found.',
      },
      400
    );
  }

  const calculation = await calculateCart(
    parsed.data.items,
    parsed.data.couponCode
  );

  if (!calculation.ok) {
    return c.json(
      {
        success: false,
        message: calculation.message,
      },
      calculation.status
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: dbUser.id,
      addressId: address.id,
      couponId: calculation.coupon?.id ?? null,
      status: OrderStatus.PAID,
      subtotalPaise: calculation.subtotalPaise,
      discountPaise: calculation.discountPaise,
      totalPaise: calculation.totalPaise,
      couponCode: calculation.coupon?.code ?? null,
      addressSnapshot: addressToSnapshot(address),
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
      items: {
        create: calculation.lines.map(line => ({
          productId: line.product.id,
          productSlug: line.product.slug,
          title: line.product.title,
          capacity: line.product.capacity,
          quantity: line.quantity,
          unitPricePaise: line.product.pricePaise,
          lineTotalPaise: line.lineTotalPaise,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return c.json(
    {
      success: true,
      data: serializeOrder(order),
    },
    201
  );
});

storeRouter.get('/orders/:id', async c => {
  const dbUser = c.get('dbUser');
  const orderId = c.req.param('id');
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: dbUser.id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    return c.json(
      {
        success: false,
        message: 'Order not found.',
      },
      404
    );
  }

  return c.json({
    success: true,
    data: serializeOrder(order),
  });
});

export default storeRouter;
