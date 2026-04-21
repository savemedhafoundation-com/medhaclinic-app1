import type { ImageSourcePropType } from 'react-native';

const glutathioneBottle = require('../assets/images/GT-500 1.png');
const boronBottle = require('../assets/images/BR-1 1.png');

export type BoosterCategory = 'boosters' | 'supplements';

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
};

export const BOOSTER_PRODUCTS: BoosterProduct[] = [
  {
    id: 'skin-booster',
    title: 'Skin Booster',
    shortTitle: 'Skin Booster',
    capacity: '60 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Support skin wellness and daily glow care.',
    detailDescription:
      'Skin Booster is a focused beauty-from-within supplement built to support clearer looking skin, better texture, and everyday radiance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term skin routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. For best results, use consistently with your recommended nutrition routine.',
    image: glutathioneBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for daily wellness support and a simple capsule routine.',
    searchTerms: ['skin booster', 'glow', 'beauty', 'antioxidant'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, recharge & revive wellness',
  },
  {
    id: 'immune-booster',
    title: 'Immunity Lifestyle Booster',
    shortTitle: 'Immunity Booster',
    capacity: '90 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Daily immunity lifestyle support for resilience.',
    detailDescription:
      'Immunity Lifestyle Booster is a focused wellness supplement built to support everyday resilience and immunity-focused routines. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Pair with your daily diet and hydration plan.',
    image: glutathioneBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for simple daily immunity routine support.',
    searchTerms: ['immune booster', 'immunity', 'wellness', 'routine'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to recharge, protect & revive wellness',
  },
  {
    id: 'bone-marrow-booster',
    title: 'Strength Support Booster',
    shortTitle: 'Strength Booster',
    capacity: '120 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Everyday strength and resilience support.',
    detailDescription:
      'Strength Support Booster is a focused wellness supplement built to support strength routines and everyday resilience. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use consistently with your recommended diet and wellness plan.',
    image: boronBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for long-term strength support and a simple capsule routine.',
    searchTerms: ['strength booster', 'routine', 'strength', 'support'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, recharge & revive wellness',
  },
  {
    id: 'liver-booster',
    title: 'Daily Balance Booster',
    shortTitle: 'Balance Booster',
    capacity: '90 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Routine daily balance and vitality support.',
    detailDescription:
      'Daily Balance Booster is a focused wellness supplement built to support daily balance and everyday vitality. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use alongside your recommended nutrition and hydration routine.',
    image: boronBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    review:
      'Customers choose this booster for balanced daily wellness routines.',
    searchTerms: ['balance booster', 'daily wellness', 'routine', 'balance'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to refresh, balance & revive wellness',
  },
  {
    id: 'gt-500-booster',
    title: 'GT-500 Booster',
    shortTitle: 'GT-500',
    capacity: '60 cap',
    price: 2875,
    priceLabel: 'Rs 2,875.00',
    category: 'supplements',
    description: 'Focused antioxidant support for everyday wellness.',
    detailDescription:
      'GT-500 Booster is a focused antioxidant supplement built to support glow and daily wellness. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use consistently with your daily food and hydration routine.',
    image: glutathioneBottle,
    mrp: 5750,
    packSizes: ['30 cap', '60 cap', '90 cap'],
    review:
      'Customers choose this booster for antioxidant support and everyday wellness routines.',
    searchTerms: ['gt-500 booster', 'glutathione', 'antioxidant'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to recharge, restore & revive wellness',
  },
  {
    id: 'br-1-supplement',
    title: 'BR-1 Supplement',
    shortTitle: 'BR-1',
    capacity: '30 cap',
    price: 2575,
    priceLabel: 'Rs 2,575.00',
    category: 'supplements',
    description: 'Mineral balance support to round out your booster routine.',
    detailDescription:
      'BR-1 Supplement is a focused mineral support supplement built to round out daily wellness and balance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term wellness routine with a more holistic approach.',
    howToUse:
      'Use as guided by your wellness advisor. Use with your recommended supplement and diet plan.',
    image: boronBottle,
    mrp: 5150,
    packSizes: ['30 cap', '60 cap', '90 cap'],
    review:
      'Customers choose this supplement for mineral balance and steady routine support.',
    searchTerms: ['br-1 supplement', 'boron', 'mineral', 'supplement'],
    subtitle: 'Wellness Supplement for Adults',
    supportLine: 'Support to balance, recharge & revive wellness',
  },
];

export function getBoosterProduct(productId: string) {
  return BOOSTER_PRODUCTS.find(product => product.id === productId) ?? null;
}
