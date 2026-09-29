import { ACTIVE_PROMO_CODES, CUISINE_CATEGORIES, OrderStatus } from '../../configuration/constants';
import { APP_CONFIG } from '../../configuration/app.config';
import {
  CollectionRecord,
  MenuItemRecord,
  OrderItemRecord,
  OrderRecord,
  RestaurantRecord,
  ReviewRecord,
  TableReservationRecord,
} from '../../database/schema';
import { BillBreakdown } from '../../backend/services/pricing.service';

export interface MarketplaceMetadata {
  cities: typeof APP_CONFIG.SupportedCities;
  cuisines: readonly string[];
  promos: typeof ACTIVE_PROMO_CODES;
  collections: CollectionRecord[];
}

export interface RestaurantDetailPayload {
  restaurant: RestaurantRecord;
  menu: MenuItemRecord[];
  reviews: ReviewRecord[];
}

class ApiClient {
  private baseUrl = '/api/v1';

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || `Request failed with status ${response.status}`);
    }
    return json.data as T;
  }

  public async getMetadata(): Promise<MarketplaceMetadata> {
    return this.request<MarketplaceMetadata>('/metadata');
  }

  public async getRestaurants(params: {
    search?: string;
    cuisine?: string;
    mode?: 'DELIVERY' | 'DINING_OUT';
    pureVeg?: boolean;
    minRating?: number;
    fastDelivery?: boolean;
    sortBy?: string;
  }): Promise<RestaurantRecord[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.cuisine && params.cuisine !== 'All Cuisines') query.set('cuisine', params.cuisine);
    if (params.mode) query.set('mode', params.mode);
    if (params.pureVeg) query.set('pureVeg', 'true');
    if (params.minRating) query.set('minRating', String(params.minRating));
    if (params.fastDelivery) query.set('fastDelivery', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString();
    return this.request<RestaurantRecord[]>(`/restaurants${qs ? `?${qs}` : ''}`);
  }

  public async getRestaurantDetails(id: string): Promise<RestaurantDetailPayload> {
    return this.request<RestaurantDetailPayload>(`/restaurants/${id}`);
  }

  public async createMenuItem(
    restaurantId: string,
    payload: Omit<MenuItemRecord, 'id' | 'restaurantId' | 'available'>
  ): Promise<MenuItemRecord> {
    return this.request<MenuItemRecord>(`/restaurants/${restaurantId}/menu`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async toggleMenuItemAvailability(itemId: string): Promise<MenuItemRecord> {
    return this.request<MenuItemRecord>(`/menu/${itemId}/toggle`, {
      method: 'PATCH',
    });
  }

  public async addReview(payload: {
    restaurantId: string;
    authorName: string;
    authorRole: string;
    rating: number;
    comment: string;
    orderedDish: string;
  }): Promise<ReviewRecord> {
    return this.request<ReviewRecord>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getCartQuote(payload: {
    restaurantId: string;
    items: OrderItemRecord[];
    promoCode?: string;
    riderTip?: number;
  }): Promise<BillBreakdown> {
    return this.request<BillBreakdown>('/cart/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getOrders(): Promise<OrderRecord[]> {
    return this.request<OrderRecord[]>('/orders');
  }

  public async createOrder(payload: {
    restaurantId: string;
    items: OrderItemRecord[];
    promoCode?: string;
    riderTip?: number;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryInstructions?: string;
    paymentMethod: 'UPI' | 'CARD' | 'COD';
  }): Promise<OrderRecord> {
    return this.request<OrderRecord>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord> {
    return this.request<OrderRecord>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async getReservations(): Promise<TableReservationRecord[]> {
    return this.request<TableReservationRecord[]>('/reservations');
  }

  public async createReservation(payload: {
    restaurantId: string;
    guestName: string;
    guestPhone: string;
    partySize: number;
    date: string;
    timeSlot: string;
    seatingPreference: 'Indoor Dining' | 'Chef Counter' | 'Courtyard Patio';
    specialRequest?: string;
  }): Promise<TableReservationRecord> {
    return this.request<TableReservationRecord>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient();
export { CUISINE_CATEGORIES };
