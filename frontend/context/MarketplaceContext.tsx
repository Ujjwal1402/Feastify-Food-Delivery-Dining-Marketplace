import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { APP_CONFIG } from '../../configuration/app.config';
import { ACTIVE_PROMO_CODES, DietaryType, OrderStatus } from '../../configuration/constants';
import {
  CollectionRecord,
  MenuItemRecord,
  OrderItemRecord,
  OrderRecord,
  RestaurantRecord,
  TableReservationRecord,
} from '../../database/schema';
import { INITIAL_SEED_DATA } from '../../database/seed';
import { BillBreakdown, pricingService } from '../../backend/services/pricing.service';
import { apiClient } from '../services/api.client';

export type ActiveNavTab = 'DELIVERY' | 'DINING_OUT' | 'COLLECTIONS' | 'ORDERS' | 'PARTNER_PORTAL';
export type SortOption = 'RATING' | 'DELIVERY_TIME' | 'COST_LOW_TO_HIGH' | 'COST_HIGH_TO_LOW';

interface MarketplaceContextValue {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (loc: string) => void;
  neighborhoodOptions: string[];

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCuisine: string;
  setSelectedCuisine: (c: string) => void;
  pureVegOnly: boolean;
  setPureVegOnly: React.Dispatch<React.SetStateAction<boolean>>;
  minRating45: boolean;
  setMinRating45: React.Dispatch<React.SetStateAction<boolean>>;
  fastDeliveryOnly: boolean;
  setFastDeliveryOnly: React.Dispatch<React.SetStateAction<boolean>>;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  resetFilters: () => void;

  // Data
  restaurants: RestaurantRecord[];
  collections: CollectionRecord[];
  orders: OrderRecord[];
  reservations: TableReservationRecord[];
  isLoadingRestaurants: boolean;
  refreshMarketplaceData: () => Promise<void>;

  // Modals & Drawers
  activeRestaurantId: string | null;
  setActiveRestaurantId: (id: string | null) => void;
  reservationRestaurant: RestaurantRecord | null;
  setReservationRestaurant: (r: RestaurantRecord | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Cart & Billing
  cartRestaurant: RestaurantRecord | null;
  cartItems: OrderItemRecord[];
  promoCode: string;
  setPromoCode: (code: string) => void;
  riderTip: number;
  setRiderTip: (tip: number) => void;
  billBreakdown: BillBreakdown;
  addToCart: (restaurant: RestaurantRecord, item: MenuItemRecord, optionLabel?: string, priceDelta?: number) => void;
  updateCartQuantity: (menuItemId: string, optionLabel: string | undefined, delta: number) => void;
  clearCart: () => void;
  totalCartCount: number;

  // Actions
  placeDeliveryOrder: (details: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryInstructions?: string;
    paymentMethod: 'UPI' | 'CARD' | 'COD';
  }) => Promise<OrderRecord>;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  bookDiningTable: (details: {
    restaurantId: string;
    guestName: string;
    guestPhone: string;
    partySize: number;
    date: string;
    timeSlot: string;
    seatingPreference: 'Indoor Dining' | 'Chef Counter' | 'Courtyard Patio';
    specialRequest?: string;
  }) => Promise<TableReservationRecord>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('DELIVERY');
  const neighborhoodOptions = APP_CONFIG.SupportedCities[0].neighborhoods;
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(neighborhoodOptions[0]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [minRating45, setMinRating45] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('RATING');

  // Data states (seeded with initial fallback for zero-latency content availability)
  const [restaurants, setRestaurants] = useState<RestaurantRecord[]>(INITIAL_SEED_DATA.restaurants);
  const [collections, setCollections] = useState<CollectionRecord[]>(INITIAL_SEED_DATA.collections);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_SEED_DATA.orders);
  const [reservations, setReservations] = useState<TableReservationRecord[]>(INITIAL_SEED_DATA.reservations);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  // Modals & Drawers
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [reservationRestaurant, setReservationRestaurant] = useState<RestaurantRecord | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart states — pre-loaded with 1 signature dish so users can inspect or modify immediately
  const [cartRestaurant, setCartRestaurant] = useState<RestaurantRecord | null>(
    INITIAL_SEED_DATA.restaurants[0]
  );
  const [cartItems, setCartItems] = useState<OrderItemRecord[]>([
    {
      menuItemId: 'item-napoli-1',
      name: 'Burrata & San Marzano Margherita',
      unitPrice: 595,
      quantity: 1,
      selectedOptionLabel: '12" Classic 72-Hr Sourdough',
      dietary: DietaryType.VEG,
    },
  ]);
  const [promoCode, setPromoCode] = useState<string>('ZEST50');
  const [riderTip, setRiderTip] = useState<number>(30);
  const [billBreakdown, setBillBreakdown] = useState<BillBreakdown>(() =>
    pricingService.calculateBill(
      [
        {
          menuItemId: 'item-napoli-1',
          name: 'Burrata & San Marzano Margherita',
          unitPrice: 595,
          quantity: 1,
          selectedOptionLabel: '12" Classic 72-Hr Sourdough',
          dietary: DietaryType.VEG,
        },
      ],
      INITIAL_SEED_DATA.restaurants[0].distanceKm,
      'ZEST50',
      30
    )
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCuisine('All Cuisines');
    setPureVegOnly(false);
    setMinRating45(false);
    setFastDeliveryOnly(false);
    setSortBy('RATING');
  }, []);

  const fetchFilteredRestaurants = useCallback(async () => {
    setIsLoadingRestaurants(true);
    try {
      const modeParam =
        activeTab === 'DINING_OUT' ? 'DINING_OUT' : activeTab === 'DELIVERY' ? 'DELIVERY' : undefined;
      const list = await apiClient.getRestaurants({
        search: searchQuery,
        cuisine: selectedCuisine,
        mode: modeParam,
        pureVeg: pureVegOnly,
        minRating: minRating45 ? 4.8 : undefined,
        fastDelivery: fastDeliveryOnly,
        sortBy,
      });
      setRestaurants(list);
    } catch {
      // Fallback client filter if server is restarting
      let fallback = [...INITIAL_SEED_DATA.restaurants];
      if (activeTab === 'DINING_OUT') fallback = fallback.filter((r) => r.supportsDiningOut);
      if (selectedCuisine !== 'All Cuisines') {
        fallback = fallback.filter((r) => r.cuisines.includes(selectedCuisine));
      }
      if (pureVegOnly) fallback = fallback.filter((r) => r.isPureVeg);
      if (minRating45) fallback = fallback.filter((r) => r.rating >= 4.8);
      if (fastDeliveryOnly) fallback = fallback.filter((r) => r.deliveryTimeMinutes <= 26);
      setRestaurants(fallback);
    } finally {
      setIsLoadingRestaurants(false);
    }
  }, [activeTab, searchQuery, selectedCuisine, pureVegOnly, minRating45, fastDeliveryOnly, sortBy]);

  const refreshMarketplaceData = useCallback(async () => {
    await fetchFilteredRestaurants();
    try {
      const [meta, ordList, resList] = await Promise.all([
        apiClient.getMetadata(),
        apiClient.getOrders(),
        apiClient.getReservations(),
      ]);
      setCollections(meta.collections);
      setOrders(ordList);
      setReservations(resList);
    } catch {
      // Keep initial state on transient network error
    }
  }, [fetchFilteredRestaurants]);

  useEffect(() => {
    fetchFilteredRestaurants();
  }, [fetchFilteredRestaurants]);

  useEffect(() => {
    refreshMarketplaceData();
  }, []);

  // Recalculate bill breakdown whenever cartItems, promoCode, or riderTip changes
  useEffect(() => {
    const distance = cartRestaurant ? cartRestaurant.distanceKm : 2.4;
    const localQuote = pricingService.calculateBill(cartItems, distance, promoCode, riderTip);
    setBillBreakdown(localQuote);

    if (cartItems.length > 0 && cartRestaurant) {
      apiClient
        .getCartQuote({
          restaurantId: cartRestaurant.id,
          items: cartItems,
          promoCode,
          riderTip,
        })
        .then((serverQuote) => setBillBreakdown(serverQuote))
        .catch(() => {});
    }
  }, [cartItems, cartRestaurant, promoCode, riderTip]);

  const addToCart = useCallback(
    (
      restaurant: RestaurantRecord,
      item: MenuItemRecord,
      optionLabel?: string,
      priceDelta: number = 0
    ) => {
      const effectivePrice = item.price + priceDelta;

      setCartItems((prev) => {
        // If switching restaurants, replace cart with new restaurant's item
        if (cartRestaurant && cartRestaurant.id !== restaurant.id && prev.length > 0) {
          setCartRestaurant(restaurant);
          showToast(`Started fresh bag from ${restaurant.name}`);
          return [
            {
              menuItemId: item.id,
              name: item.name,
              unitPrice: effectivePrice,
              quantity: 1,
              selectedOptionLabel: optionLabel,
              dietary: item.dietary,
            },
          ];
        }

        setCartRestaurant(restaurant);
        const existingIndex = prev.findIndex(
          (i) => i.menuItemId === item.id && i.selectedOptionLabel === optionLabel
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          showToast(`Updated ${item.name} quantity in bag`);
          return updated;
        }

        showToast(`Added ${item.name} to bag`);
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            unitPrice: effectivePrice,
            quantity: 1,
            selectedOptionLabel: optionLabel,
            dietary: item.dietary,
          },
        ];
      });
    },
    [cartRestaurant, showToast]
  );

  const updateCartQuantity = useCallback(
    (menuItemId: string, optionLabel: string | undefined, delta: number) => {
      setCartItems((prev) => {
        const next = prev
          .map((item) => {
            if (item.menuItemId === menuItemId && item.selectedOptionLabel === optionLabel) {
              return { ...item, quantity: item.quantity + delta };
            }
            return item;
          })
          .filter((item) => item.quantity > 0);

        if (next.length === 0) {
          setCartRestaurant(null);
        }
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartRestaurant(null);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const placeDeliveryOrder = useCallback(
    async (details: {
      customerName: string;
      customerPhone: string;
      deliveryAddress: string;
      deliveryInstructions?: string;
      paymentMethod: 'UPI' | 'CARD' | 'COD';
    }) => {
      if (!cartRestaurant || cartItems.length === 0) {
        throw new Error('Your bag is empty.');
      }

      const createdOrder = await apiClient.createOrder({
        restaurantId: cartRestaurant.id,
        items: cartItems,
        promoCode: billBreakdown.appliedPromo?.code,
        riderTip,
        ...details,
      });

      setOrders((prev) => [createdOrder, ...prev]);
      clearCart();
      setIsCartOpen(false);
      setActiveRestaurantId(null);
      setActiveTab('ORDERS');
      showToast(`Order ${createdOrder.orderNumber} confirmed with ${createdOrder.restaurantName}`);
      return createdOrder;
    },
    [cartRestaurant, cartItems, billBreakdown, riderTip, clearCart, showToast]
  );

  const advanceOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const updated = await apiClient.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Order ${updated.orderNumber} updated to ${nextStatus.replace(/_/g, ' ')}`);
    },
    [showToast]
  );

  const bookDiningTable = useCallback(
    async (details: {
      restaurantId: string;
      guestName: string;
      guestPhone: string;
      partySize: number;
      date: string;
      timeSlot: string;
      seatingPreference: 'Indoor Dining' | 'Chef Counter' | 'Courtyard Patio';
      specialRequest?: string;
    }) => {
      const created = await apiClient.createReservation(details);
      setReservations((prev) => [created, ...prev]);
      setReservationRestaurant(null);
      setActiveTab('ORDERS');
      showToast(`Table ${created.reservationCode} reserved at ${created.restaurantName}`);
      return created;
    },
    [showToast]
  );

  return (
    <MarketplaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedNeighborhood,
        setSelectedNeighborhood,
        neighborhoodOptions,
        searchQuery,
        setSearchQuery,
        selectedCuisine,
        setSelectedCuisine,
        pureVegOnly,
        setPureVegOnly,
        minRating45,
        setMinRating45,
        fastDeliveryOnly,
        setFastDeliveryOnly,
        sortBy,
        setSortBy,
        resetFilters,
        restaurants,
        collections,
        orders,
        reservations,
        isLoadingRestaurants,
        refreshMarketplaceData,
        activeRestaurantId,
        setActiveRestaurantId,
        reservationRestaurant,
        setReservationRestaurant,
        isCartOpen,
        setIsCartOpen,
        cartRestaurant,
        cartItems,
        promoCode,
        setPromoCode,
        riderTip,
        setRiderTip,
        billBreakdown,
        addToCart,
        updateCartQuantity,
        clearCart,
        totalCartCount,
        placeDeliveryOrder,
        advanceOrderStatus,
        bookDiningTable,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return ctx;
}

export { ACTIVE_PROMO_CODES };
