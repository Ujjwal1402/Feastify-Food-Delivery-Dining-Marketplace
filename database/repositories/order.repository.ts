import { OrderStatus } from '../../configuration/constants';
import { dbEngine } from '../engine';
import { OrderRecord, TableReservationRecord } from '../schema';

export class OrderRepository {
  public findAllOrders(): OrderRecord[] {
    return [...dbEngine.read().orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public findOrderById(id: string): OrderRecord | undefined {
    return dbEngine.read().orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(order: OrderRecord): OrderRecord {
    const db = dbEngine.read();
    db.orders.unshift(order);
    dbEngine.commit();
    return order;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): OrderRecord | undefined {
    const db = dbEngine.read();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === OrderStatus.DELIVERED) {
      order.estimatedDeliveryMinutes = 0;
    } else if (status === OrderStatus.OUT_FOR_DELIVERY) {
      order.estimatedDeliveryMinutes = Math.max(8, Math.round(order.estimatedDeliveryMinutes * 0.5));
    }
    dbEngine.commit();
    return order;
  }

  public findAllReservations(): TableReservationRecord[] {
    return [...dbEngine.read().reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createReservation(reservation: TableReservationRecord): TableReservationRecord {
    const db = dbEngine.read();
    db.reservations.unshift(reservation);
    dbEngine.commit();
    return reservation;
  }
}

export const orderRepository = new OrderRepository();
