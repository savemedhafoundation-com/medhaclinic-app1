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
    description: 'Support skin health and daily glow restoration.',
    detailDescription:
      'Skin Booster is a focused beauty-from-within supplement built to support clearer looking skin, better texture, and everyday radiance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term skin routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. For best results, use consistently with your recommended nutrition routine.',
    image: glutathioneBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for daily wellness support and a simple capsule routine.',
    searchTerms: ['skin booster', 'glow', 'beauty', 'antioxidant'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to cleanse, Recharge & Revive Health',
  },
  {
    id: 'immune-booster',
    title: 'Immune Booster',
    shortTitle: 'Immune Booster',
    capacity: '90 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Daily immune support for recovery and resilience.',
    detailDescription:
      'Immune Booster is a focused wellness supplement built to support everyday resilience, recovery, and immune health. Its wellness-led formulation is positioned for customers looking to strengthen their long-term health routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. Pair with your daily diet and hydration plan.',
    image: glutathioneBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for simple daily immune support and recovery-focused wellness.',
    searchTerms: ['immune booster', 'immunity', 'wellness', 'recovery'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to recharge, protect & revive health',
  },
  {
    id: 'bone-marrow-booster',
    title: 'Bone Marrow Booster',
    shortTitle: 'Bone Marrow Booster',
    capacity: '120 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Targeted support for bone marrow and strength.',
    detailDescription:
      'Bone Marrow Booster is a focused wellness supplement built to support bone marrow health, better strength, and everyday resilience. Its wellness-led formulation is positioned for customers looking to strengthen their long-term health routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. Use consistently with your prescribed diet and wellness plan.',
    image: boronBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    popular: true,
    review:
      'Customers choose this booster for long-term strength support and a simple capsule routine.',
    searchTerms: ['bone marrow booster', 'bone', 'strength', 'support'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to cleanse, Recharge & Revive Health',
  },
  {
    id: 'liver-booster',
    title: 'Liver Booster',
    shortTitle: 'Liver Booster',
    capacity: '90 cap',
    price: 3375,
    priceLabel: 'Rs 3,375.00',
    category: 'boosters',
    description: 'Routine liver support for detox and balance.',
    detailDescription:
      'Liver Booster is a focused wellness supplement built to support detox balance, liver care, and everyday vitality. Its wellness-led formulation is positioned for customers looking to strengthen their long-term health routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. Use alongside your recommended nutrition and hydration routine.',
    image: boronBottle,
    mrp: 6750,
    packSizes: ['60 cap', '90 cap', '120 cap'],
    review:
      'Customers choose this booster for routine liver support and balanced daily wellness.',
    searchTerms: ['liver booster', 'liver', 'detox', 'balance'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to cleanse, balance & revive health',
  },
  {
    id: 'gt-500-booster',
    title: 'GT-500 Booster',
    shortTitle: 'GT-500',
    capacity: '60 cap',
    price: 2875,
    priceLabel: 'Rs 2,875.00',
    category: 'supplements',
    description: 'Focused antioxidant support for everyday recovery.',
    detailDescription:
      'GT-500 Booster is a focused antioxidant supplement built to support recovery, glow, and daily wellness. Its wellness-led formulation is positioned for customers looking to strengthen their long-term health routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. Use consistently with your daily food and hydration routine.',
    image: glutathioneBottle,
    mrp: 5750,
    packSizes: ['30 cap', '60 cap', '90 cap'],
    review:
      'Customers choose this booster for antioxidant support and everyday recovery.',
    searchTerms: ['gt-500 booster', 'glutathione', 'antioxidant'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to recharge, recover & revive health',
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
      'BR-1 Supplement is a focused mineral support supplement built to round out daily wellness and balance. Its wellness-led formulation is positioned for customers looking to strengthen their long-term health routine with a more holistic approach.',
    howToUse:
      'Take as directed by your healthcare advisor. Use with your recommended supplement and diet plan.',
    image: boronBottle,
    mrp: 5150,
    packSizes: ['30 cap', '60 cap', '90 cap'],
    review:
      'Customers choose this supplement for mineral balance and steady routine support.',
    searchTerms: ['br-1 supplement', 'boron', 'mineral', 'supplement'],
    subtitle: 'Health Supplement for Adult',
    supportLine: 'Support to balance, recharge & revive health',
  },
];

export function getBoosterProduct(productId: string) {
  return BOOSTER_PRODUCTS.find(product => product.id === productId) ?? null;
}
