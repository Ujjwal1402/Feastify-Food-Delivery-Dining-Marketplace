import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react';
import { ACTIVE_PROMO_CODES, useMarketplace } from '../context/MarketplaceContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartRestaurant,
    cartItems,
    updateCartQuantity,
    clearCart,
    promoCode,
    setPromoCode,
    riderTip,
    setRiderTip,
    billBreakdown,
    placeDeliveryOrder,
    selectedNeighborhood,
  } = useMarketplace();

  const [customerName, setCustomerName] = useState('Ujjwal Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98450 77210');
  const [deliveryAddress, setDeliveryAddress] = useState(
    `Apt 402, The Palm Grove, 12th Main Road, ${selectedNeighborhood}, Bengaluru`
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    'Keep in thermal bag; call upon reaching main gate'
  );
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await placeDeliveryOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryInstructions,
        paymentMethod,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Order failed. Please verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="bg-[#FAF9F6] w-full max-w-lg h-full flex flex-col justify-between shadow-2xl border-l border-stone-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 id="cart-drawer-title" className="font-display text-lg font-semibold text-stone-900">
              Checkout & Dispatch Bag
            </h2>
            {cartRestaurant && (
              <p className="text-xs text-stone-500">
                From <span className="font-semibold text-stone-800">{cartRestaurant.name}</span> · {cartRestaurant.neighborhood}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag drawer"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-display text-base font-semibold text-stone-800">
                Your culinary bag is empty
              </p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore wood-fired pizzas, copper handi biryanis, or artisan ramen bowls from Bengaluru’s top kitchens.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List with Quantity Steppers */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-semibold text-stone-700">Selected Dishes</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#E23744] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Bag</span>
                  </button>
                </div>

                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.menuItemId}-${idx}`}
                    className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0 border-stone-100"
                  >
                    <div className="space-y-0.5 flex-1">
                      <p className="text-xs font-semibold text-stone-900">{item.name}</p>
                      {item.selectedOptionLabel && (
                        <p className="text-[11px] text-stone-500">{item.selectedOptionLabel}</p>
                      )}
                      <p className="text-xs font-mono-tabular text-stone-600">₹{item.unitPrice} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-2.5 bg-stone-100 px-2.5 py-1 rounded-lg font-mono-tabular text-xs font-semibold text-stone-900">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.menuItemId, item.selectedOptionLabel, -1)
                          }
                          aria-label="Decrease quantity"
                          className="hover:text-[#E23744] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.menuItemId, item.selectedOptionLabel, 1)
                          }
                          aria-label="Increase quantity"
                          className="hover:text-[#E23744] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono-tabular text-xs font-semibold text-stone-900 w-14 text-right">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Promo Code Selector */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Marketplace Privileges & Promo Codes
                  </span>
                  {billBreakdown.appliedPromo && (
                    <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {billBreakdown.appliedPromo.code} Applied
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ACTIVE_PROMO_CODES.map((offer) => {
                    const isSelected = promoCode.toUpperCase() === offer.code;
                    return (
                      <button
                        key={offer.code}
                        type="button"
                        onClick={() => setPromoCode(isSelected ? '' : offer.code)}
                        className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <p className="font-mono-tabular text-xs font-semibold">{offer.code}</p>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {offer.title}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {billBreakdown.promoError && (
                  <p className="text-xs text-amber-800">{billBreakdown.promoError}</p>
                )}
              </div>

              {/* Delivery Partner Tip Selector */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    100% Direct Rider Appreciation Tip
                  </span>
                  <span className="font-mono-tabular text-xs text-stone-500">
                    ₹{riderTip}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 20, 30, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRiderTip(amt)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono-tabular font-semibold border transition-colors cursor-pointer ${
                        riderTip === amt
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {amt === 0 ? 'No Tip' : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Bill Breakdown (Tabular Numerals) */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-2 text-xs font-mono-tabular">
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">Item Total</span>
                  <span>₹{billBreakdown.subtotal}</span>
                </div>
                {billBreakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="font-sans">
                      Promo Savings ({billBreakdown.appliedPromo?.code})
                    </span>
                    <span>-₹{billBreakdown.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">
                    Delivery Partner Fee {billBreakdown.deliveryFee === 0 && '(Free over ₹499)'}
                  </span>
                  <span>{billBreakdown.deliveryFee === 0 ? 'FREE' : `₹${billBreakdown.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">Thermal Packaging Charge</span>
                  <span>₹{billBreakdown.packagingFee}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">GST (5%) & Platform Fee</span>
                  <span>₹{billBreakdown.taxes}</span>
                </div>
                {billBreakdown.riderTip > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span className="font-sans">Delivery Partner Tip</span>
                    <span>₹{billBreakdown.riderTip}</span>
                  </div>
                )}
                <div className="pt-2.5 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span className="font-sans">Total Payable</span>
                  <span>₹{billBreakdown.totalPayable}</span>
                </div>
              </div>

              {/* Customer Verification & Address Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-3">
                <p className="text-xs font-semibold text-stone-900">
                  Delivery Verification & Payment
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg font-mono-tabular focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Complete Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Delivery Instructions</label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'UPI', label: 'Instant UPI' },
                        { id: 'CARD', label: 'Credit / Debit' },
                        { id: 'COD', label: 'Cash on Delivery' },
                      ] as const
                    ).map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#E23744] font-medium">{errorMsg}</p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Sticky Checkout Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Tamper-evident thermal seal guaranteed · Instant kitchen dispatch</span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3 px-5 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] rounded-xl transition-colors cursor-pointer shadow-sm font-mono-tabular"
            >
              {isSubmitting
                ? 'Confirming with Kitchen...'
                : `Place Order (${paymentMethod}) · ₹${billBreakdown.totalPayable}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
