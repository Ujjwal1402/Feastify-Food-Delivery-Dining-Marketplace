export interface AppConfiguration {
  appName: string;
  apiPrefix: string;
  port: number;
  environment: 'development' | 'production' | 'test';
  pricing: {
    gstRate: number;
    platformFee: number;
    freeDeliveryThreshold: number;
    baseDeliveryFee: number;
    perKmFee: number;
  };
  SupportedCities: {
    id: string;
    name: string;
    neighborhoods: string[];
  }[];
}

export const APP_CONFIG: AppConfiguration = {
  appName: 'Feastify',
  apiPrefix: '/api/v1',
  port: 3000,
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  pricing: {
    gstRate: 0.05, // 5% restaurant GST
    platformFee: 6, // ₹6 flat platform fee
    freeDeliveryThreshold: 499, // Free delivery on orders ₹499+
    baseDeliveryFee: 25,
    perKmFee: 6,
  },
  SupportedCities: [
    {
      id: 'blr',
      name: 'Bengaluru',
      neighborhoods: ['Indiranagar', 'Koramangala 5th Block', 'Lavelle Road', 'HSR Layout', 'Whitefield'],
    },
    {
      id: 'mum',
      name: 'Mumbai',
      neighborhoods: ['Bandra West', 'Lower Parel', 'Colaba', 'Kala Ghoda', 'Juhu'],
    },
    {
      id: 'del',
      name: 'New Delhi',
      neighborhoods: ['Khan Market', 'Connaught Place', 'Hauz Khas Village', 'Vasant Vihar', 'Saket'],
    },
  ],
};
