import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { DietaryType } from '../../configuration/constants';
import { MenuItemRecord, RestaurantRecord, ReviewRecord } from '../../database/schema';
import { INITIAL_SEED_DATA } from '../../database/seed';
import { useMarketplace } from '../context/MarketplaceContext';
import { apiClient } from '../services/api.client';
import { ResilientImage } from './ResilientImage';

export const RestaurantDetailModal: React.FC = () => {
  const {
    activeRestaurantId,
    setActiveRestaurantId,
    setReservationRestaurant,
    cartItems,
    cartRestaurant,
    addToCart,
    updateCartQuantity,
    billBreakdown,
    setIsCartOpen,
    showToast,
  } = useMarketplace();

  const [restaurant, setRestaurant] = useState<RestaurantRecord | null>(null);
  const [menu, setMenu] = useState<MenuItemRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Customization selection map: itemId -> optionId
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewDish, setReviewDish] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!activeRestaurantId) {
      setRestaurant(null);
      return;
    }

    // Immediate local seed lookup for zero-latency open
    const seedRest = INITIAL_SEED_DATA.restaurants.find((r) => r.id === activeRestaurantId) || null;
    const seedMenu = INITIAL_SEED_DATA.menuItems.filter((m) => m.restaurantId === activeRestaurantId);
    const seedReviews = INITIAL_SEED_DATA.reviews.filter((r) => r.restaurantId === activeRestaurantId);
    setRestaurant(seedRest);
    setMenu(seedMenu);
    setReviews(seedReviews);
    setSelectedCategory('ALL');
    setMenuSearch('');

    // Fetch live data from backend
    apiClient
      .getRestaurantDetails(activeRestaurantId)
      .then((payload) => {
        setRestaurant(payload.restaurant);
        setMenu(payload.menu);
        setReviews(payload.reviews);
      })
      .catch(() => {});
  }, [activeRestaurantId]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menu.map((m) => m.category)));
    return ['ALL', ...unique];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (dietFilter === 'VEG' && item.dietary !== DietaryType.VEG) return false;
      if (dietFilter === 'NON_VEG' && item.dietary === DietaryType.VEG) return false;
      if (menuSearch.trim().length > 0) {
        const q = menuSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menu, selectedCategory, dietFilter, menuSearch]);

  if (!activeRestaurantId || !restaurant) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const created = await apiClient.addReview({
        restaurantId: restaurant.id,
        authorName: reviewAuthor,
        authorRole: `Verified Diner · ${restaurant.neighborhood}`,
        rating: reviewRating,
        comment: reviewComment,
        orderedDish: reviewDish || (menu[0]?.name ?? 'Chef Signature Dish'),
      });
      setReviews((prev) => [created, ...prev]);
      setReviewAuthor('');
      setReviewDish('');
      setReviewComment('');
      showToast('Thank you! Your verified review has been published.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs overflow-y-auto flex items-start justify-center p-4 sm:p-6 lg:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div className="bg-[#FAF9F6] w-full max-w-[1160px] rounded-2xl border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Top Banner with Restaurant Imagery & Scrim */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-900">
          <ResilientImage
            src={restaurant.heroImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

          <button
            type="button"
            onClick={() => setActiveRestaurantId(null)}
            aria-label="Close restaurant menu"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <span>{restaurant.cuisines.join(' · ')}</span>
                <span aria-hidden="true">·</span>
                <span>{restaurant.neighborhood}</span>
                <span aria-hidden="true">·</span>
                <span>{restaurant.openingHours}</span>
              </div>
              <h2
                id="restaurant-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold tracking-tight"
              >
                {restaurant.name}
              </h2>
              <p className="text-xs text-stone-200 max-w-2xl">
                {restaurant.chefNote}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono-tabular text-xs bg-black/50 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/15">
              <div>
                <span className="font-semibold text-white">{restaurant.rating.toFixed(1)} ★</span>
                <span className="text-stone-300 ml-1">({restaurant.reviewCount})</span>
              </div>
              <span aria-hidden="true" className="text-stone-500">·</span>
              <div>
                <span className="font-semibold text-white">{restaurant.deliveryTimeMinutes} min</span>
              </div>
              <span aria-hidden="true" className="text-stone-500">·</span>
              <div>
                <span className="font-semibold text-white">₹{restaurant.costForTwo}</span> for two
              </div>
            </div>
          </div>
        </div>

        {/* Main Contiguous 3-Column Layout (Category Rail | Menu & Reviews | Contiguous Purchase Module) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80">
          {/* Left Column: Category Rail & Table Reservation CTA */}
          <div className="lg:col-span-3 p-6 space-y-6 bg-white">
            <div>
              <h3 className="text-xs font-semibold text-stone-500 tracking-wide mb-3">
                Menu Sections
              </h3>
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {cat === 'ALL' ? `All Dishes (${menu.length})` : cat}
                  </button>
                ))}
              </div>
            </div>

            {restaurant.supportsDiningOut && (
              <div className="pt-5 border-t border-stone-200/80 space-y-3">
                <p className="text-xs font-semibold text-stone-900">
                  Dine-Out Privilege
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {restaurant.tableBookingOffer || 'Priority chef-counter and courtyard table reservations available.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRestaurantId(null);
                    setReservationRestaurant(restaurant);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#E23744] border border-[#E23744]/40 hover:bg-[#E23744]/5 rounded-lg transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve a Table</span>
                </button>
              </div>
            )}
          </div>

          {/* Center Column: Searchable Menu List + Verified Reviews */}
          <div className="lg:col-span-6 p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Menu Search & Dietary Segmented Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search within menu..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg shrink-0">
                {(['ALL', 'VEG', 'NON_VEG'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDietFilter(mode)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      dietFilter === mode
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {mode === 'ALL' ? 'All' : mode === 'VEG' ? 'Veg Only' : 'Non-Veg'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dish List */}
            <div className="divide-y divide-stone-200/80">
              {filteredMenu.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-stone-800">No dishes match your filter</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDietFilter('ALL');
                      setSelectedCategory('ALL');
                      setMenuSearch('');
                    }}
                    className="text-xs font-semibold text-[#E23744] underline cursor-pointer"
                  >
                    Reset menu filters
                  </button>
                </div>
              ) : (
                filteredMenu.map((item) => {
                  const group = item.customizationGroups?.[0];
                  const activeOptionId =
                    selectedOptions[item.id] || group?.options[0]?.id;
                  const activeOption = group?.options.find((o) => o.id === activeOptionId);
                  const optionLabel = activeOption?.label;
                  const priceDelta = activeOption?.priceDelta || 0;
                  const effectivePrice = item.price + priceDelta;

                  const inCartItem =
                    cartRestaurant?.id === restaurant.id
                      ? cartItems.find(
                          (ci) =>
                            ci.menuItemId === item.id &&
                            ci.selectedOptionLabel === optionLabel
                        )
                      : undefined;

                  return (
                    <div key={item.id} className="py-5 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        {/* Unboxed dietary + metadata line */}
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span
                            className={`font-semibold ${
                              item.dietary === DietaryType.VEG
                                ? 'text-emerald-700'
                                : 'text-[#E23744]'
                            }`}
                          >
                            {item.dietary === DietaryType.VEG
                              ? '● Veg'
                              : item.dietary === DietaryType.EGG
                                ? '▲ Contains Egg'
                                : '▲ Non-Veg'}
                          </span>
                          {item.isBestseller && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-amber-800">Chef Signature</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">{item.prepTimeMinutes} min prep</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">{item.calories} kcal</span>
                        </div>

                        <h4 className="text-base font-semibold text-stone-900">
                          {item.name}
                        </h4>

                        <p className="font-mono-tabular text-sm font-semibold text-stone-900">
                          ₹{effectivePrice}
                        </p>

                        <p className="text-xs text-stone-600 leading-relaxed max-w-[58ch]">
                          {item.description}
                        </p>

                        {/* Customization group selector if available */}
                        {group && (
                          <div className="pt-2">
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                              {group.name}:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {group.options.map((opt) => {
                                const isSel = opt.id === activeOptionId;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedOptions((prev) => ({
                                        ...prev,
                                        [item.id]: opt.id,
                                      }))
                                    }
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                      isSel
                                        ? 'border-stone-900 bg-stone-900 text-white'
                                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                                    }`}
                                  >
                                    {opt.label}
                                    {opt.priceDelta > 0 ? ` (+₹${opt.priceDelta})` : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add / Stepper Control */}
                      <div className="shrink-0 self-start sm:self-center">
                        {!item.available ? (
                          <span className="text-xs text-stone-400 font-semibold">
                            Sold Out Tonight
                          </span>
                        ) : inCartItem ? (
                          <div className="inline-flex items-center gap-3 bg-stone-900 text-white px-3 py-1.5 rounded-lg font-mono-tabular text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.id, optionLabel, -1)
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="p-0.5 hover:text-stone-300 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span>{inCartItem.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.id, optionLabel, 1)
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                              className="p-0.5 hover:text-stone-300 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              addToCart(restaurant, item, optionLabel, priceDelta)
                            }
                            className="inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold text-[#E23744] bg-white border border-[#E23744]/40 hover:bg-[#E23744] hover:text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Verified Diner Reviews & Add Review Form */}
            <div className="pt-6 border-t border-stone-200 space-y-5">
              <h3 className="font-display text-lg font-semibold text-stone-900">
                Verified Diner Reviews ({reviews.length})
              </h3>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-white rounded-xl border border-stone-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <div>
                        <span className="font-semibold text-stone-900">{rev.authorName}</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span>{rev.authorRole}</span>
                      </div>
                      <span className="font-mono-tabular font-semibold text-stone-900">
                        {rev.rating.toFixed(1)} ★ · {rev.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      “{rev.comment}”
                    </p>
                    <p className="text-xs text-stone-500">
                      Ordered: <span className="font-medium text-stone-800">{rev.orderedDish}</span>
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitReview} className="p-4 bg-white rounded-xl border border-stone-200/80 space-y-3">
                <p className="text-xs font-semibold text-stone-900">
                  Share Your Experience at {restaurant.name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Your Full Name"
                    className="px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                  />
                  <input
                    type="text"
                    value={reviewDish}
                    onChange={(e) => setReviewDish(e.target.value)}
                    placeholder="Dish Ordered (e.g. Margherita)"
                    className="px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                  />
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 font-mono-tabular"
                  >
                    <option value={5}>5.0 ★ Exceptional</option>
                    <option value={4}>4.0 ★ Very Good</option>
                    <option value={3}>3.0 ★ Average</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe packaging quality, temperature, and flavor..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Post Verified Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Contiguous Live Bag Summary Module */}
          <div className="lg:col-span-3 p-6 bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-stone-900">
                  Your Order Bag
                </h3>
                {cartRestaurant && (
                  <span className="text-xs text-stone-500 truncate max-w-[140px]">
                    {cartRestaurant.name}
                  </span>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed border-stone-200 rounded-xl p-4">
                  <ShoppingBag className="w-6 h-6 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-500">
                    Select any freshly prepared dish from the menu to build your order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((ci, idx) => (
                    <div
                      key={`${ci.menuItemId}-${idx}`}
                      className="flex items-start justify-between gap-2 text-xs py-2 border-b border-stone-100"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-stone-900">{ci.name}</p>
                        {ci.selectedOptionLabel && (
                          <p className="text-[11px] text-stone-500">{ci.selectedOptionLabel}</p>
                        )}
                        <p className="font-mono-tabular text-stone-600">
                          ₹{ci.unitPrice} × {ci.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-mono-tabular font-semibold">
                        <span>₹{ci.unitPrice * ci.quantity}</span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 space-y-1.5 text-xs font-mono-tabular">
                    <div className="flex justify-between text-stone-600">
                      <span className="font-sans">Item Subtotal</span>
                      <span>₹{billBreakdown.subtotal}</span>
                    </div>
                    {billBreakdown.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span className="font-sans">
                          Promo ({billBreakdown.appliedPromo?.code})
                        </span>
                        <span>-₹{billBreakdown.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span className="font-sans">Taxes & Packaging</span>
                      <span>₹{billBreakdown.taxes + billBreakdown.packagingFee}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
                      <span className="font-sans">Net Payable</span>
                      <span>₹{billBreakdown.totalPayable}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={() => {
                setActiveRestaurantId(null);
                setIsCartOpen(true);
              }}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] disabled:bg-stone-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {cartItems.length === 0
                ? 'Add Dishes to Proceed'
                : `Proceed to Checkout · ₹${billBreakdown.totalPayable}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
