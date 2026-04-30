import { ProductPriceType, StoreProductCategory } from '@prisma/client';

type SeedVariant = {
  title: string;
  pricePaise: number;
  stock?: number;
};

export type SeedProduct = {
  title: string;
  slug: string;
  category: StoreProductCategory;
  subtitle: string;
  description: string;
  detailDescription: string;
  benefits: string;
  usage: string;
  priceType: ProductPriceType;
  minPricePaise: number;
  maxPricePaise: number;
  mrpPaise: number;
  stock: number;
  featured?: boolean;
  tags?: string[];
  sortOrder: number;
  variants: SeedVariant[];
};

const boosterNames = [
  'Bone Marrow Booster',
  'Heart Booster',
  'Immune Booster',
  'Kidney Booster',
  'Liver Booster',
  'Nerve Booster',
  'Pancreas Booster',
  'Platelet Booster',
  'Skeleton Booster',
  'Skin Booster',
  'Sperm Booster',
  'Spleen Booster',
  'Hair Root Booster',
  'Detox Booster',
  'Thyroid Booster',
  'Eye Booster',
  'Dry Booster',
  'Fat Breaker',
  'Tumor Breaker',
];

const supplementNames = [
  'Vitamin A',
  'Vitamin B1',
  'Vitamin B2',
  'Vitamin B3',
  'Vitamin B5',
  'Vitamin B6',
  'Vitamin B7',
  'Vitamin B9',
  'Vitamin B12',
  'Vitamin K',
  'Boron',
  'Copper',
  'Iodine',
  'Manganese',
  'Pepsin',
  'Protease',
  'Selenium',
  'Silica',
  'Zinc',
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function wellnessCopy(name: string, category: string) {
  return {
    subtitle: `${category} wellness support`,
    description: `${name} for Medha Clinic wellness programs.`,
    detailDescription: `${name} is managed from the Medha Clinic admin catalog and can be included in guided wellness, diet, and store workflows.`,
    benefits: 'Supports personalized wellness routines, clinic-guided plans, and consistent product fulfillment.',
    usage: 'Use only as advised by Medha Clinic staff or the assigned wellness advisor.',
  };
}

export const MEDHA_CATALOG_SEED: SeedProduct[] = [
  {
    title: 'Power Booster Sattu',
    slug: 'power-booster-sattu',
    category: StoreProductCategory.BOOSTERS,
    ...wellnessCopy('Power Booster Sattu', 'Booster'),
    priceType: ProductPriceType.FIXED,
    minPricePaise: 42_800,
    maxPricePaise: 42_800,
    mrpPaise: 42_800,
    stock: 100,
    featured: true,
    tags: ['booster', 'sattu'],
    sortOrder: 1,
    variants: [{ title: 'Standard', pricePaise: 42_800, stock: 100 }],
  },
  ...boosterNames.map((title, index) => ({
    title,
    slug: slugify(title),
    category: StoreProductCategory.BOOSTERS,
    ...wellnessCopy(title, 'Booster'),
    priceType: ProductPriceType.RANGE,
    minPricePaise: 270_000,
    maxPricePaise: 540_000,
    mrpPaise: 540_000,
    stock: 100,
    featured: index < 4,
    tags: ['booster'],
    sortOrder: index + 2,
    variants: [
      { title: '1 Month Pack', pricePaise: 270_000, stock: 50 },
      { title: '2 Month Pack', pricePaise: 540_000, stock: 50 },
    ],
  })),
  ...supplementNames.map((title, index) => ({
    title,
    slug: slugify(title),
    category: StoreProductCategory.SUPPLEMENTS,
    ...wellnessCopy(title, 'Supplement'),
    priceType: ProductPriceType.RANGE,
    minPricePaise: 90_000,
    maxPricePaise: 180_000,
    mrpPaise: 180_000,
    stock: 100,
    featured: false,
    tags: ['supplement'],
    sortOrder: index + 100,
    variants: [
      { title: 'Standard', pricePaise: 90_000, stock: 50 },
      { title: 'Double Pack', pricePaise: 180_000, stock: 50 },
    ],
  })),
  {
    title: 'Lemon Grass',
    slug: 'lemon-grass',
    category: StoreProductCategory.SUPPLEMENTS,
    ...wellnessCopy('Lemon Grass', 'Special supplement'),
    priceType: ProductPriceType.FIXED,
    minPricePaise: 20_000,
    maxPricePaise: 20_000,
    mrpPaise: 20_000,
    stock: 100,
    featured: true,
    tags: ['special', 'supplement'],
    sortOrder: 200,
    variants: [{ title: 'Standard', pricePaise: 20_000, stock: 100 }],
  },
  {
    title: 'THALASSEMIA',
    slug: 'thalassemia',
    category: StoreProductCategory.PACKAGES,
    ...wellnessCopy('THALASSEMIA', 'Package'),
    priceType: ProductPriceType.FIXED,
    minPricePaise: 675_000,
    maxPricePaise: 675_000,
    mrpPaise: 675_000,
    stock: 100,
    featured: true,
    tags: ['package'],
    sortOrder: 300,
    variants: [{ title: 'Package', pricePaise: 675_000, stock: 100 }],
  },
  {
    title: 'HOT WATER THERAPY KIT',
    slug: 'hot-water-therapy-kit',
    category: StoreProductCategory.PACKAGES,
    ...wellnessCopy('HOT WATER THERAPY KIT', 'Package'),
    priceType: ProductPriceType.RANGE,
    minPricePaise: 100_000,
    maxPricePaise: 160_000,
    mrpPaise: 160_000,
    stock: 100,
    featured: true,
    tags: ['package', 'therapy'],
    sortOrder: 301,
    variants: [
      { title: 'Standard Kit', pricePaise: 100_000, stock: 50 },
      { title: 'Complete Kit', pricePaise: 160_000, stock: 50 },
    ],
  },
  {
    title: 'DIABETES',
    slug: 'diabetes',
    category: StoreProductCategory.PACKAGES,
    ...wellnessCopy('DIABETES', 'Package'),
    priceType: ProductPriceType.RANGE,
    minPricePaise: 675_000,
    maxPricePaise: 2_025_000,
    mrpPaise: 2_025_000,
    stock: 100,
    featured: true,
    tags: ['package'],
    sortOrder: 302,
    variants: [
      { title: 'Basic Package', pricePaise: 675_000, stock: 50 },
      { title: 'Advanced Package', pricePaise: 1_350_000, stock: 25 },
      { title: 'Complete Package', pricePaise: 2_025_000, stock: 25 },
    ],
  },
];
