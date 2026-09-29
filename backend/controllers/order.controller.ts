import { Request, Response } from 'express';
import { OrderStatus } from '../../configuration/constants';
import { orderRepository } from '../../database/repositories/order.repository';
import { restaurantRepository } from '../../database/repositories/restaurant.repository';
import { OrderRecord, TableReservationRecord } from '../../database/schema';
import { pricingService } from '../services/pricing.service';

const DELIVERY_FLEET = [
  { name: 'Karthik Gowda', phone: '+91 99001 44821', vehicleNumber: 'KA-01-EV-8842', rating: 4.9 },
  { name: 'salman Pasha', phone: '+91 98452 19304', vehicleNumber: 'KA-03-JM-4410', rating: 4.8 },
  { name: 'Pradeep Nair', phone: '+91 97310 66291', vehicleNumber: 'KA-05-EV-2109', rating: 4.9 },
];

export class OrderController {
  public calculateQuote(req: Request, res: Response): void {
    const { restaurantId, items, promoCode, riderTip } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.json({
        success: true,
        data: pricingService.calculateBill([], 2.0, promoCode, riderTip),
      });
      return;
    }

    const restaurant = restaurantRepository.findById(restaurantId);
    const distanceKm = restaurant ? restaurant.distanceKm : 2.5;
    const breakdown = pricingService.calculateBill(items, distanceKm, promoCode, Number(riderTip) || 0);

    res.json({
      success: true,
      data: breakdown,
    });
  }

  public listOrders(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: orderRepository.findAllOrders(),
    });
  }

  public createOrder(req: Request, res: Response): void {
    const {
      restaurantId,
      items,
      promoCode,
      riderTip,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
    } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Order must contain at least one menu item.' });
      return;
    }

    if (!customerName || !customerPhone || !deliveryAddress) {
      res.status(400).json({
        success: false,
        error: 'Customer name, phone number, and delivery address are required.',
      });
      return;
    }

    const restaurant = restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ success: false, error: 'Selected restaurant was not found.' });
      return;
    }

    const bill = pricingService.calculateBill(
      items,
      restaurant.distanceKm,
      promoCode,
      Number(riderTip) || 0
    );

    const rider = DELIVERY_FLEET[Math.floor(Math.random() * DELIVERY_FLEET.length)];
    const orderNum = `ZST-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantNeighborhood: restaurant.neighborhood,
      items,
      subtotal: bill.subtotal,
      discountAmount: bill.discountAmount,
      promoCode: bill.appliedPromo?.code,
      deliveryFee: bill.deliveryFee,
      packagingFee: bill.packagingFee,
      taxes: bill.taxes,
      riderTip: bill.riderTip,
      totalPayable: bill.totalPayable,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      deliveryAddress: String(deliveryAddress).trim(),
      deliveryInstructions: deliveryInstructions ? String(deliveryInstructions).trim() : undefined,
      paymentMethod: paymentMethod === 'CARD' || paymentMethod === 'COD' ? paymentMethod : 'UPI',
      status: OrderStatus.CONFIRMED,
      estimatedDeliveryMinutes: restaurant.deliveryTimeMinutes,
      assignedRider: rider,
      createdAt: now,
      updatedAt: now,
    };

    const saved = orderRepository.createOrder(newOrder);
    res.status(201).json({
      success: true,
      data: saved,
    });
  }

  public updateOrderStatus(req: Request, res: Response): void {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid order status transition.' });
      return;
    }

    const updated = orderRepository.updateOrderStatus(id, status as OrderStatus);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    res.json({
      success: true,
      data: updated,
    });
  }

  public listReservations(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: orderRepository.findAllReservations(),
    });
  }

  public createReservation(req: Request, res: Response): void {
    const {
      restaurantId,
      guestName,
      guestPhone,
      partySize,
      date,
      timeSlot,
      seatingPreference,
      specialRequest,
    } = req.body;

    if (!restaurantId || !guestName || !guestPhone || !timeSlot) {
      res.status(400).json({
        success: false,
        error: 'Restaurant, guest name, phone number, and time slot are required.',
      });
      return;
    }

    const restaurant = restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ success: false, error: 'Restaurant not found.' });
      return;
    }

    const reservation: TableReservationRecord = {
      id: `res-${Date.now()}`,
      reservationCode: `TBL-${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantNeighborhood: restaurant.neighborhood,
      guestName: String(guestName).trim(),
      guestPhone: String(guestPhone).trim(),
      partySize: Math.min(16, Math.max(1, Number(partySize) || 2)),
      date: String(date || 'Tonight'),
      timeSlot: String(timeSlot),
      seatingPreference:
        seatingPreference === 'Chef Counter' || seatingPreference === 'Courtyard Patio'
          ? seatingPreference
          : 'Indoor Dining',
      specialRequest: specialRequest ? String(specialRequest).trim() : undefined,
      tableOfferApplied: restaurant.tableBookingOffer,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const saved = orderRepository.createReservation(reservation);
    res.status(201).json({
      success: true,
      data: saved,
    });
  }
}

export const orderController = new OrderController();
