export enum OrderStatus {
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum DiningMode {
  DELIVERY = 'DELIVERY',
  DINING_OUT = 'DINING_OUT',
}

export enum DietaryType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  EGG = 'EGG',
}

export interface PromoOffer {
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT' | 'FREE_DELIVERY';
  value: number;
  maxDiscount: number;
  minOrderValue: number;
}

export const ACTIVE_PROMO_CODES: PromoOffer[] = [
  {
    code: 'ZEST50',
    title: '50% Off First Feast',
    description: 'Save 50% up to ₹150 on orders above ₹299',
    discountType: 'PERCENTAGE',
    value: 50,
    maxDiscount: 150,
    minOrderValue: 299,
  },
  {
    code: 'CRAFT120',
    title: 'Flat ₹120 Off Gourmet',
    description: 'Flat ₹120 instant savings on orders above ₹699',
    discountType: 'FLAT',
    value: 120,
    maxDiscount: 120,
    minOrderValue: 699,
  },
  {
    code: 'FREEDEL',
    title: 'Zero Delivery Fee',
    description: 'Complimentary priority dispatch on orders above ₹249',
    discountType: 'FREE_DELIVERY',
    value: 100,
    maxDiscount: 80,
    minOrderValue: 249,
  },
];

export const CUISINE_CATEGORIES = [
  'All Cuisines',
  'Wood-Fired Pizza',
  'Awadhi & Biryani',
  'Japanese Ramen',
  'Smash Burgers',
  'Coastal Indian',
  'Artisan Bakery',
] as const;
