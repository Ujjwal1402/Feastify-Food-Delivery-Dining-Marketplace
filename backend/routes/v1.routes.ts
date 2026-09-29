import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplace.controller';
import { orderController } from '../controllers/order.controller';

export const v1Router = Router();

// Marketplace & Discovery Endpoints
v1Router.get('/metadata', (req, res) => marketplaceController.getMetadata(req, res));
v1Router.get('/restaurants', (req, res) => marketplaceController.listRestaurants(req, res));
v1Router.get('/restaurants/:id', (req, res) => marketplaceController.getRestaurantDetails(req, res));
v1Router.post('/restaurants/:id/menu', (req, res) => marketplaceController.createMenuItem(req, res));
v1Router.patch('/menu/:itemId/toggle', (req, res) => marketplaceController.toggleMenuAvailability(req, res));

// Reviews Endpoints
v1Router.get('/reviews', (req, res) => marketplaceController.listReviews(req, res));
v1Router.post('/reviews', (req, res) => marketplaceController.addReview(req, res));

// Cart Quote, Orders & Table Reservations Endpoints
v1Router.post('/cart/quote', (req, res) => orderController.calculateQuote(req, res));
v1Router.get('/orders', (req, res) => orderController.listOrders(req, res));
v1Router.post('/orders', (req, res) => orderController.createOrder(req, res));
v1Router.patch('/orders/:id/status', (req, res) => orderController.updateOrderStatus(req, res));

v1Router.get('/reservations', (req, res) => orderController.listReservations(req, res));
v1Router.post('/reservations', (req, res) => orderController.createReservation(req, res));
