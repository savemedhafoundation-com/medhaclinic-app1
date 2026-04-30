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
  variantId: z.string().uuid().optional().nullable(),
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

type CartInput = z.infer<typeof cartItemSchema>;
type Coupon = Awaited<ReturnType<typeof findCoupon>>;

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

function aggregateCartItems(items: CartInput[]) {
  const quantities = new Map<string, CartInput>();

  for (const item of items) {
    const productId = item.productId.trim();
    const variantId = item.variantId?.trim() || null;
    const key = `${productId}:${variantId ?? ''}`;
    const existing = quantities.get(key);
    quantities.set(key, {
      productId,
      variantId,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  return Array.from(quantities.values());
}

async function findCoupon(code: string) {
  return prisma.coupon.findUnique({
    where: { code },
  });
}

async function calculateCart(items: CartInput[], couponCode?: string | null) {
  const aggregatedItems = aggregateCartItems(items);
  const productSlugs = aggregatedItems.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      active: true,
      hidden: false,
      deletedAt: null,
      archived: false,
      slug: {
        in: productSlugs,
      },
    },
    include: {
      variants: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
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
    const variant =
      item.variantId
        ? product.variants.find(candidate => candidate.id === item.variantId)
        : product.variants[0] ?? null;
    const unitPricePaise = variant?.pricePaise ?? product.minPricePaise ?? product.pricePaise;
    const capacity = variant?.title ?? product.capacity;

    if (item.variantId && !variant) {
      return {
        ok: false as const,
        message: `Variant is not available for ${product.slug}.`,
      };
    }

    return {
      ok: true as const,
      product,
      variant,
      capacity,
      unitPricePaise,
      quantity: item.quantity,
      lineTotalPaise: unitPricePaise * item.quantity,
    };
  });
  const unavailableLine = lines.find(line => !line.ok);

  if (unavailableLine && !unavailableLine.ok) {
    return {
      ok: false as const,
      status: 400 as const,
      message: unavailableLine.message,
    };
  }
  const validLines = lines.filter(line => line.ok);
  const subtotalPaise = lines.reduce(
    (total, line) => total + (line.ok ? line.lineTotalPaise : 0),
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

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        ok: false as const,
        status: 400 as const,
        message: 'Coupon code usage limit has been reached.',
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
    lines: validLines,
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

storeRouter.get('/categories', c => {
  return c.json({
    success: true,
    data: [
      { key: StoreProductCategory.BOOSTERS, label: 'Boosters' },
      { key: StoreProductCategory.SUPPLEMENTS, label: 'Supplements' },
      { key: StoreProductCategory.PACKAGES, label: 'Packages' },
    ],
  });
});

storeRouter.get('/products', async c => {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      hidden: false,
      archived: false,
      deletedAt: null,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      variants: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      },
      gallery: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return c.json({
    success: true,
    data: products,
  });
});

storeRouter.get('/products/:slug', async c => {
  const product = await prisma.product.findFirst({
    where: {
      slug: c.req.param('slug'),
      active: true,
      hidden: false,
      archived: false,
      deletedAt: null,
    },
    include: {
      variants: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      },
      gallery: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!product) {
    return c.json({ success: false, message: 'Product not found.' }, 404);
  }

  return c.json({
    success: true,
    data: product,
  });
});

storeRouter.use('*', requireAuth);

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
          capacity: line.capacity,
          quantity: line.quantity,
          unitPricePaise: line.unitPricePaise,
          lineTotalPaise: line.lineTotalPaise,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  if (calculation.coupon) {
    await prisma.coupon.update({
      where: { id: calculation.coupon.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

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
