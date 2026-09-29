import { DietaryType, OrderStatus } from '../configuration/constants';

export interface MenuCustomizationOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface MenuCustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  options: MenuCustomizationOption[];
}

export interface MenuItemRecord {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  dietary: DietaryType;
  isBestseller: boolean;
  spiceLevel?: 'Mild' | 'Medium' | 'Fiery';
  prepTimeMinutes: number;
  calories: number;
  available: boolean;
  customizationGroups?: MenuCustomizationGroup[];
}

export interface ReviewRecord {
  id: string;
  restaurantId: string;
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
  orderedDish: string;
  createdAt: string;
}

export interface RestaurantRecord {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  neighborhood: string;
  address: string;
  cuisines: string[];
  primaryCuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: number;
  distanceKm: number;
  costForTwo: number;
  isPureVeg: boolean;
  supportsDelivery: boolean;
  supportsDiningOut: boolean;
  tableBookingOffer?: string;
  promotionalOffer?: string;
  heroImageUrl: string;
  storyHeadline: string;
  chefNote: string;
  openingHours: string;
  hygieneVerified: boolean;
  availableTimeSlots: string[];
}

export interface CollectionRecord {
  id: string;
  title: string;
  subtitle: string;
  placeCount: number;
  imageUrl: string;
  filterCuisine?: string;
  filterDiningOut?: boolean;
}

export interface OrderItemRecord {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedOptionLabel?: string;
  dietary: DietaryType;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantNeighborhood: string;
  items: OrderItemRecord[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  deliveryFee: number;
  packagingFee: number;
  taxes: number;
  riderTip: number;
  totalPayable: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: 'UPI' | 'CARD' | 'COD';
  status: OrderStatus;
  estimatedDeliveryMinutes: number;
  assignedRider: {
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TableReservationRecord {
  id: string;
  reservationCode: string;
  restaurantId: string;
  restaurantName: string;
  restaurantNeighborhood: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  date: string;
  timeSlot: string;
  seatingPreference: 'Indoor Dining' | 'Chef Counter' | 'Courtyard Patio';
  specialRequest?: string;
  tableOfferApplied?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface DatabaseSchema {
  restaurants: RestaurantRecord[];
  menuItems: MenuItemRecord[];
  reviews: ReviewRecord[];
  collections: CollectionRecord[];
  orders: OrderRecord[];
  reservations: TableReservationRecord[];
}
