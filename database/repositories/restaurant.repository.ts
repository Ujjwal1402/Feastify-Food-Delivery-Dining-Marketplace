import { dbEngine } from '../engine';
import { CollectionRecord, MenuItemRecord, RestaurantRecord, ReviewRecord } from '../schema';

export interface RestaurantFilterParams {
  search?: string;
  cuisine?: string;
  mode?: 'DELIVERY' | 'DINING_OUT';
  pureVegOnly?: boolean;
  minRating?: number;
  fastDeliveryOnly?: boolean;
  sortBy?: 'RATING' | 'DELIVERY_TIME' | 'COST_LOW_TO_HIGH' | 'COST_HIGH_TO_LOW';
}

export class RestaurantRepository {
  public findAll(filters: RestaurantFilterParams = {}): RestaurantRecord[] {
    const db = dbEngine.read();
    let results = [...db.restaurants];

    if (filters.mode === 'DELIVERY') {
      results = results.filter((r) => r.supportsDelivery);
    } else if (filters.mode === 'DINING_OUT') {
      results = results.filter((r) => r.supportsDiningOut);
    }

    if (filters.cuisine && filters.cuisine !== 'All Cuisines') {
      const target = filters.cuisine.toLowerCase();
      results = results.filter(
        (r) =>
          r.primaryCuisine.toLowerCase() === target ||
          r.cuisines.some((c) => c.toLowerCase().includes(target))
      );
    }

    if (filters.pureVegOnly) {
      results = results.filter((r) => r.isPureVeg);
    }

    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      results = results.filter((r) => r.rating >= filters.minRating!);
    }

    if (filters.fastDeliveryOnly) {
      results = results.filter((r) => r.deliveryTimeMinutes <= 26);
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      const matchingRestaurantIdsFromMenu = new Set(
        db.menuItems
          .filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q) ||
              m.category.toLowerCase().includes(q)
          )
          .map((m) => m.restaurantId)
      );

      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q) ||
          r.cuisines.some((c) => c.toLowerCase().includes(q)) ||
          matchingRestaurantIdsFromMenu.has(r.id)
      );
    }

    const sortBy = filters.sortBy || 'RATING';
    results.sort((a, b) => {
      if (sortBy === 'DELIVERY_TIME') return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
      if (sortBy === 'COST_LOW_TO_HIGH') return a.costForTwo - b.costForTwo;
      if (sortBy === 'COST_HIGH_TO_LOW') return b.costForTwo - a.costForTwo;
      return b.rating - a.rating;
    });

    return results;
  }

  public findById(id: string): RestaurantRecord | undefined {
    return dbEngine.read().restaurants.find((r) => r.id === id);
  }

  public getMenuByRestaurantId(restaurantId: string): MenuItemRecord[] {
    return dbEngine.read().menuItems.filter((item) => item.restaurantId === restaurantId);
  }

  public createMenuItem(item: Omit<MenuItemRecord, 'id'>): MenuItemRecord {
    const db = dbEngine.read();
    const newItem: MenuItemRecord = {
      ...item,
      id: `item-custom-${Date.now()}`,
    };
    db.menuItems.unshift(newItem);
    dbEngine.commit();
    return newItem;
  }

  public toggleMenuItemAvailability(itemId: string): MenuItemRecord | undefined {
    const db = dbEngine.read();
    const target = db.menuItems.find((i) => i.id === itemId);
    if (!target) return undefined;
    target.available = !target.available;
    dbEngine.commit();
    return target;
  }

  public getReviews(restaurantId?: string): ReviewRecord[] {
    const reviews = dbEngine.read().reviews;
    if (!restaurantId) return reviews;
    return reviews.filter((r) => r.restaurantId === restaurantId);
  }

  public createReview(payload: Omit<ReviewRecord, 'id' | 'createdAt'>): ReviewRecord {
    const db = dbEngine.read();
    const newReview: ReviewRecord = {
      ...payload,
      id: `rev-${Date.now()}`,
      createdAt: 'Just now',
    };
    db.reviews.unshift(newReview);

    // Recalculate restaurant rating
    const rest = db.restaurants.find((r) => r.id === payload.restaurantId);
    if (rest) {
      rest.reviewCount += 1;
      rest.rating = Number(((rest.rating * (rest.reviewCount - 1) + payload.rating) / rest.reviewCount).toFixed(1));
    }

    dbEngine.commit();
    return newReview;
  }

  public getCollections(): CollectionRecord[] {
    return dbEngine.read().collections;
  }
}

export const restaurantRepository = new RestaurantRepository();
