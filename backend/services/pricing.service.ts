import { APP_CONFIG } from '../../configuration/app.config';
import { ACTIVE_PROMO_CODES, PromoOffer } from '../../configuration/constants';
import { OrderItemRecord } from '../../database/schema';

export interface BillBreakdown {
  subtotal: number;
  discountAmount: number;
  appliedPromo?: PromoOffer;
  promoError?: string;
  deliveryFee: number;
  packagingFee: number;
  taxes: number;
  riderTip: number;
  totalPayable: number;
}

export class PricingService {
  public calculateBill(
    items: OrderItemRecord[],
    distanceKm: number,
    promoCode?: string,
    riderTip: number = 0
  ): BillBreakdown {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (subtotal === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        deliveryFee: 0,
        packagingFee: 0,
        taxes: 0,
        riderTip: 0,
        totalPayable: 0,
      };
    }

    let deliveryFee =
      subtotal >= APP_CONFIG.pricing.freeDeliveryThreshold
        ? 0
        : Math.round(APP_CONFIG.pricing.baseDeliveryFee + distanceKm * APP_CONFIG.pricing.perKmFee);

    let discountAmount = 0;
    let appliedPromo: PromoOffer | undefined;
    let promoError: string | undefined;

    if (promoCode && promoCode.trim().length > 0) {
      const normalized = promoCode.trim().toUpperCase();
      const offer = ACTIVE_PROMO_CODES.find((p) => p.code === normalized);
      if (!offer) {
        promoError = `Promo code "${normalized}" is not valid.`;
      } else if (subtotal < offer.minOrderValue) {
        promoError = `Add ₹${offer.minOrderValue - subtotal} more to unlock ${offer.code}.`;
      } else {
        appliedPromo = offer;
        if (offer.discountType === 'PERCENTAGE') {
          discountAmount = Math.min(offer.maxDiscount, Math.round((subtotal * offer.value) / 100));
        } else if (offer.discountType === 'FLAT') {
          discountAmount = Math.min(subtotal, offer.value);
        } else if (offer.discountType === 'FREE_DELIVERY') {
          discountAmount = deliveryFee;
          deliveryFee = 0;
        }
      }
    }

    const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const packagingFee = Math.min(60, totalItemsCount * 15);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxes = Math.round(taxableAmount * APP_CONFIG.pricing.gstRate) + APP_CONFIG.pricing.platformFee;
    const safeTip = Math.max(0, Math.round(riderTip));

    const totalPayable = Math.max(0, subtotal - discountAmount + deliveryFee + packagingFee + taxes + safeTip);

    return {
      subtotal,
      discountAmount,
      appliedPromo,
      promoError,
      deliveryFee,
      packagingFee,
      taxes,
      riderTip: safeTip,
      totalPayable,
    };
  }
}

export const pricingService = new PricingService();
