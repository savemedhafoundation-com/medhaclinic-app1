import { z } from 'zod';

export const productSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  shortTitle: z.string().optional(),
  capacity: z.string().min(1),
  price: z.coerce.number().min(0),
  priceType: z.enum(['FIXED', 'RANGE']),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  mrp: z.coerce.number().min(0),
  category: z.enum(['BOOSTERS', 'SUPPLEMENTS', 'PACKAGES']),
  description: z.string().optional(),
  detailDescription: z.string().optional(),
  benefits: z.string().optional(),
  usage: z.string().optional(),
  howToUse: z.string().optional(),
  subtitle: z.string().optional(),
  supportLine: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  imagesText: z.string().optional(),
  tagsText: z.string().optional(),
  sortOrder: z.coerce.number().int(),
  featured: z.boolean(),
  hidden: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  variantsText: z.string().optional(),
  active: z.boolean(),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;

export const couponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.coerce.number().int().positive(),
  minSubtotal: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

export type CouponFormInput = z.input<typeof couponSchema>;
export type CouponFormValues = z.output<typeof couponSchema>;
