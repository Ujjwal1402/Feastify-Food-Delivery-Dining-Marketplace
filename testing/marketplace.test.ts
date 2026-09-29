import assert from 'node:assert/strict';
import { DietaryType, OrderStatus } from '../configuration/constants';
import { pricingService } from '../backend/services/pricing.service';
import { restaurantRepository } from '../database/repositories/restaurant.repository';
import { orderRepository } from '../database/repositories/order.repository';

function runEnterpriseTestSuite() {
  console.log('Running Zestora Enterprise Test Suite...');

  // 1. Database Repository Discovery & Filtering Tests
  const allRestaurants = restaurantRepository.findAll();
  assert.ok(allRestaurants.length >= 6, 'Should load all seeded flagship restaurants');

  const vegRestaurants = restaurantRepository.findAll({ pureVegOnly: true });
  assert.ok(
    vegRestaurants.every((r) => r.isPureVeg),
    'Pure Veg filter must return only 100% vegetarian kitchens'
  );

  const searchResults = restaurantRepository.findAll({ search: 'Burrata' });
  assert.ok(
    searchResults.some((r) => r.id === 'rest-forno-napoli'),
    'Full-text dish search should match Il Forno di Napoli via Burrata pizza'
  );

  // 2. Pricing & Promo Calculation Engine Tests
  const sampleItems = [
    {
      menuItemId: 'item-napoli-1',
      name: 'Burrata & San Marzano Margherita',
      unitPrice: 595,
      quantity: 2,
      dietary: DietaryType.VEG,
    },
  ];
  const quote = pricingService.calculateBill(sampleItems, 2.4, 'ZEST50', 30);
  assert.equal(quote.subtotal, 1190, 'Subtotal for 2 x 595 should be 1190');
  assert.equal(quote.discountAmount, 150, 'ZEST50 should cap discount at ₹150');
  assert.equal(quote.deliveryFee, 0, 'Orders above ₹499 should receive free delivery');
  assert.ok(quote.totalPayable > 0, 'Total payable must be positive');

  // 3. Order Lifecycle Persistence Tests
  const existingOrders = orderRepository.findAllOrders();
  assert.ok(existingOrders.length >= 1, 'Should contain initial demo order');

  console.log('✓ All repository, pricing, and order lifecycle assertions passed.');
}

runEnterpriseTestSuite();
