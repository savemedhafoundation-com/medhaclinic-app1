import { PrismaClient } from '@prisma/client';
import { MEDHA_CATALOG_SEED } from '../dist/utils/catalog-seed.js';

const prisma = new PrismaClient();

for (const product of MEDHA_CATALOG_SEED) {
  const saved = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      title: product.title,
      shortTitle: product.title,
      capacity: product.variants[0]?.title ?? 'Standard',
      pricePaise: product.minPricePaise,
      mrpPaise: product.mrpPaise,
      category: product.category,
      description: product.description,
      detailDescription: product.detailDescription,
      howToUse: product.usage,
      benefits: product.benefits,
      usage: product.usage,
      priceType: product.priceType,
      minPricePaise: product.minPricePaise,
      maxPricePaise: product.maxPricePaise,
      subtitle: product.subtitle,
      supportLine: 'Medha Clinic support',
      stock: product.stock,
      active: true,
      hidden: false,
      archived: false,
      deletedAt: null,
      featured: product.featured ?? false,
      tags: product.tags ?? [],
      sortOrder: product.sortOrder,
    },
    create: {
      slug: product.slug,
      title: product.title,
      shortTitle: product.title,
      capacity: product.variants[0]?.title ?? 'Standard',
      pricePaise: product.minPricePaise,
      mrpPaise: product.mrpPaise,
      category: product.category,
      description: product.description,
      detailDescription: product.detailDescription,
      howToUse: product.usage,
      benefits: product.benefits,
      usage: product.usage,
      priceType: product.priceType,
      minPricePaise: product.minPricePaise,
      maxPricePaise: product.maxPricePaise,
      subtitle: product.subtitle,
      supportLine: 'Medha Clinic support',
      stock: product.stock,
      active: true,
      hidden: false,
      featured: product.featured ?? false,
      tags: product.tags ?? [],
      sortOrder: product.sortOrder,
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: saved.id } });
  await prisma.productVariant.createMany({
    data: product.variants.map((variant, index) => ({
      productId: saved.id,
      title: variant.title,
      pricePaise: variant.pricePaise,
      stock: variant.stock ?? product.stock,
      active: true,
      sortOrder: index,
    })),
  });
}

console.log(`Seeded ${MEDHA_CATALOG_SEED.length} Medha catalog products.`);
await prisma.$disconnect();
