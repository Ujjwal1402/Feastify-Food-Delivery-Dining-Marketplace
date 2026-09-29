import React from 'react';
import { ArrowRight, CheckCircle2, Clock, MapPin, Phone, Truck, Utensils } from 'lucide-react';
import { OrderStatus } from '../../configuration/constants';
import { useMarketplace } from '../context/MarketplaceContext';

const ORDER_STAGES: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: OrderStatus.CONFIRMED,
    label: 'Order Confirmed',
    description: 'Kitchen has accepted your ticket and verified customization notes.',
  },
  {
    status: OrderStatus.PREPARING,
    label: 'Kitchen Preparing',
    description: 'Chef is firing your dishes and sealing thermal packaging.',
  },
  {
    status: OrderStatus.OUT_FOR_DELIVERY,
    label: 'Rider En Route',
    description: 'Delivery partner has collected your sealed bag and is heading to your address.',
  },
  {
    status: OrderStatus.DELIVERED,
    label: 'Delivered at Peak Heat',
    description: 'Handed over at your doorstep. Enjoy your meal!',
  },
];

function getNextStage(current: OrderStatus): OrderStatus | null {
  if (current === OrderStatus.CONFIRMED) return OrderStatus.PREPARING;
  if (current === OrderStatus.PREPARING) return OrderStatus.OUT_FOR_DELIVERY;
  if (current === OrderStatus.OUT_FOR_DELIVERY) return OrderStatus.DELIVERED;
  return null;
}

export const OrdersAndBookingsView: React.FC = () => {
  const {
    orders,
    reservations,
    advanceOrderStatus,
    setActiveTab,
  } = useMarketplace();

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
      {/* Section 1: Live Delivery Orders & Stage Progression */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs text-stone-500">Real-Time Dispatch & Receipts</p>
            <h2 className="font-display text-2xl font-semibold text-stone-900 mt-0.5">
              Live Food Delivery Orders ({orders.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('DELIVERY')}
            className="text-xs font-semibold text-[#E23744] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Order from another kitchen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const currentStageIndex = ORDER_STAGES.findIndex((s) => s.status === order.status);
            const nextStatus = getNextStage(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-6"
              >
                {/* Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-mono-tabular">
                      <span className="font-semibold text-stone-900">Order #{order.orderNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.paymentMethod}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.restaurantNeighborhood}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-stone-900">
                      {order.restaurantName}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right font-mono-tabular">
                      <p className="text-xs text-stone-500">
                        {order.status === OrderStatus.DELIVERED
                          ? 'Completed'
                          : `Estimated Arrival: ${order.estimatedDeliveryMinutes} mins`}
                      </p>
                      <p className="text-sm font-semibold text-stone-900">
                        Total Paid: ₹{order.totalPayable}
                      </p>
                    </div>

                    {nextStatus && (
                      <button
                        type="button"
                        onClick={() => advanceOrderStatus(order.id, nextStatus)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Advance Stage → {nextStatus.replace(/_/g, ' ')}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4-Stage Progress Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {ORDER_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div
                        key={stage.status}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          isCurrent
                            ? 'border-[#E23744] bg-[#E23744]/5'
                            : isCompleted
                              ? 'border-stone-300 bg-stone-50'
                              : 'border-stone-200/60 bg-white opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className={isCurrent ? 'text-[#E23744]' : 'text-stone-900'}>
                            0{idx + 1}. {stage.label}
                          </span>
                          {isCompleted && (
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isCurrent ? 'text-[#E23744]' : 'text-emerald-700'
                              }`}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Details: Items + Assigned Delivery Partner */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  <div className="lg:col-span-7 space-y-2">
                    <p className="text-xs font-semibold text-stone-700">Itemized Kitchen Ticket</p>
                    <div className="divide-y divide-stone-100 text-xs">
                      {order.items.map((item, i) => (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-stone-900">
                              {item.quantity} × {item.name}
                            </span>
                            {item.selectedOptionLabel && (
                              <span className="text-stone-500 ml-2">({item.selectedOptionLabel})</span>
                            )}
                          </div>
                          <span className="font-mono-tabular font-semibold text-stone-800">
                            ₹{item.unitPrice * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {order.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-stone-50 rounded-xl p-4 border border-stone-200/70 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">
                            {order.assignedRider.name}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono-tabular">
                            EV Fleet · {order.assignedRider.vehicleNumber} · {order.assignedRider.rating} ★
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-xs font-semibold text-stone-700 inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {order.assignedRider.phone}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 flex items-center justify-between pt-2 border-t border-stone-200/70 font-mono-tabular">
                      <span>Subtotal: ₹{order.subtotal}</span>
                      <span>Discount: -₹{order.discountAmount}</span>
                      <span>GST & Pack: ₹{order.taxes + order.packagingFee}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Confirmed Dining-Out Table Reservations */}
      <div className="space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <p className="text-xs text-stone-500">Chef Counter & Courtyard Seating</p>
          <h2 className="font-display text-2xl font-semibold text-stone-900 mt-0.5">
            Confirmed Table Reservations ({reservations.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-stone-200/80 p-5 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono-tabular">
                <span className="font-semibold text-stone-900">
                  Booking #{res.reservationCode}
                </span>
                <span className="text-emerald-700 font-sans font-semibold">
                  ● Confirmed Table
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold text-stone-900">
                {res.restaurantName}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-mono-tabular">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {res.date} at {res.timeSlot}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-stone-400" />
                  {res.partySize} Guests ({res.seatingPreference})
                </span>
              </div>

              {res.tableOfferApplied && (
                <p className="text-xs text-[#E23744] font-medium">
                  Privilege Applied: {res.tableOfferApplied}
                </p>
              )}

              <p className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                Reserved for {res.guestName} ({res.guestPhone})
                {res.specialRequest ? ` · Note: "${res.specialRequest}"` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
