import type { ImageSourcePropType } from 'react-native';

import type { StoreProduct } from '../services/storeApi';

const fallbackBottle = require('../assets/images/GT-500 1.png');

export type BoosterCategory = 'boosters' | 'supplements' | 'packages';

export type BoosterProduct = {
  id: string;
  title: string;
  shortTitle: string;
  capacity: string;
  price: number;
  priceLabel: string;
  category: BoosterCategory;
  description: string;
  detailDescription: string;
  howToUse: string;
  image: ImageSourcePropType;
  mrp: number;
  packSizes: string[];
  popular?: boolean;
  review: string;
  searchTerms: string[];
  subtitle: string;
  supportLine: string;
  variantId?: string | null;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
  }>;
};

function formatPriceLabel(pricePaise: number) {
  return `Rs ${(pricePaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function mapCategory(category: StoreProduct['category']): BoosterCategory {
  if (category === 'SUPPLEMENTS') return 'supplements';
  if (category === 'PACKAGES') return 'packages';
  return 'boosters';
}

export function mapStoreProductToBoosterProduct(product: StoreProduct): BoosterProduct {
  const firstVariant = product.variants?.[0] ?? null;
  const pricePaise = firstVariant?.pricePaise ?? product.minPricePaise ?? product.pricePaise;
  const imageUrl = product.gallery?.[0]?.url ?? product.images?.[0] ?? null;

  return {
    id: product.slug,
    title: product.title,
    shortTitle: product.shortTitle || product.title,
    capacity: firstVariant?.title ?? product.capacity,
    price: pricePaise / 100,
    priceLabel:
      product.priceType === 'RANGE'
        ? `${formatPriceLabel(product.minPricePaise ?? pricePaise)} - ${formatPriceLabel(product.maxPricePaise ?? pricePaise)}`
        : formatPriceLabel(pricePaise),
    category: mapCategory(product.category),
    description: product.description,
    detailDescription: product.detailDescription,
    howToUse: product.usage ?? product.howToUse,
    image: imageUrl ? { uri: imageUrl } : fallbackBottle,
    mrp: product.mrpPaise / 100,
    packSizes: product.variants?.map(variant => variant.title) ?? [product.capacity],
    popular: product.featured,
    review: 'Managed by Medha Wellness for guided wellness routines.',
    searchTerms: [product.title.toLowerCase(), product.slug, ...(product.tags ?? [])],
    subtitle: product.subtitle,
    supportLine: product.supportLine,
    variantId: firstVariant?.id ?? null,
    variants:
      product.variants?.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.pricePaise / 100,
        stock: variant.stock,
      })) ?? [],
  };
}

export function selectBoosterVariant(product: BoosterProduct, packSize: string): BoosterProduct {
  const variant = product.variants.find(item => item.title === packSize);

  if (!variant) {
    return product;
  }

  return {
    ...product,
    capacity: variant.title,
    price: variant.price,
    priceLabel: formatPriceLabel(Math.round(variant.price * 100)),
    variantId: variant.id,
  };
}
