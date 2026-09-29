import React, { useEffect, useState } from 'react';
import { Plus, Power, UtensilsCrossed } from 'lucide-react';
import { DietaryType, OrderStatus } from '../../configuration/constants';
import { MenuItemRecord } from '../../database/schema';
import { INITIAL_SEED_DATA } from '../../database/seed';
import { useMarketplace } from '../context/MarketplaceContext';
import { apiClient } from '../services/api.client';

export const MerchantPartnerView: React.FC = () => {
  const {
    restaurants,
    orders,
    advanceOrderStatus,
    refreshMarketplaceData,
    showToast,
  } = useMarketplace();

  const [selectedRestId, setSelectedRestId] = useState<string>(
    restaurants[0]?.id || 'rest-forno-napoli'
  );
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);

  // New dish form
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Chef Seasonal Specials');
  const [dishPrice, setDishPrice] = useState('540');
  const [dishDietary, setDishDietary] = useState<DietaryType>(DietaryType.VEG);
  const [dishDescription, setDishDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedRestaurant =
    restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  useEffect(() => {
    const fallback = INITIAL_SEED_DATA.menuItems.filter(
      (m) => m.restaurantId === selectedRestId
    );
    setMenuItems(fallback);

    apiClient
      .getRestaurantDetails(selectedRestId)
      .then((res) => setMenuItems(res.menu))
      .catch(() => {});
  }, [selectedRestId]);

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice) return;
    setIsSaving(true);
    try {
      const created = await apiClient.createMenuItem(selectedRestId, {
        name: dishName,
        category: dishCategory,
        price: Number(dishPrice) || 450,
        dietary: dishDietary,
        description:
          dishDescription ||
          'Prepared fresh to order in our temperature-controlled kitchen.',
        isBestseller: true,
        prepTimeMinutes: 15,
        calories: 620,
      });
      setMenuItems((prev) => [created, ...prev]);
      setDishName('');
      setDishDescription('');
      await refreshMarketplaceData();
      showToast(`Published "${created.name}" to ${selectedRestaurant?.name} live menu`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add menu item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const updated = await apiClient.toggleMenuItemAvailability(itemId);
      setMenuItems((prev) => prev.map((m) => (m.id === itemId ? updated : m)));
      showToast(
        `${updated.name} marked as ${updated.available ? 'In Stock' : 'Sold Out'}`
      );
    } catch {
      setMenuItems((prev) =>
        prev.map((m) => (m.id === itemId ? { ...m, available: !m.available } : m))
      );
    }
  };

  const restaurantOrders = orders.filter((o) => o.restaurantId === selectedRestId);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPayable, 0);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12 space-y-10">
      {/* Header & Restaurant Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs text-stone-500">
            Restaurant Partner Console · Menu & Kitchen Dispatch Management
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
            Partner Kitchen Operations
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="partner-rest-select" className="text-xs font-semibold text-stone-600">
            Active Kitchen:
          </label>
          <select
            id="partner-rest-select"
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-lg focus:outline-none cursor-pointer"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.neighborhood})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Operational Metrics (Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-stone-200/80 space-y-1">
          <p className="text-xs text-stone-500">Active Menu Catalog</p>
          <p className="font-mono-tabular text-2xl font-semibold text-stone-900">
            {menuItems.length} Dishes
          </p>
          <p className="text-xs text-stone-500">
            {menuItems.filter((m) => m.available).length} currently available for instant dispatch
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/80 space-y-1">
          <p className="text-xs text-stone-500">Marketplace Gross Order Value</p>
          <p className="font-mono-tabular text-2xl font-semibold text-stone-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-stone-500">
            Across {orders.length} verified delivery orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/80 space-y-1">
          <p className="text-xs text-stone-500">Kitchen Rating & SLA</p>
          <p className="font-mono-tabular text-2xl font-semibold text-stone-900">
            {selectedRestaurant?.rating.toFixed(1)} ★ · {selectedRestaurant?.deliveryTimeMinutes} min
          </p>
          <p className="text-xs text-stone-500">
            {selectedRestaurant?.reviewCount} verified customer reviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Add New Dish to Live Database */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateDish}
            className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-4"
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#E23744]" />
              <h3 className="font-display text-lg font-semibold text-stone-900">
                Publish Dish to {selectedRestaurant?.name}
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dish Title
              </label>
              <input
                type="text"
                required
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g., Smoked Burrata & Fig Focaccia"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Menu Category
                </label>
                <input
                  type="text"
                  required
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  max={5000}
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg font-mono-tabular focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dietary Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: DietaryType.VEG, label: '● Pure Veg' },
                    { id: DietaryType.EGG, label: '▲ Egg' },
                    { id: DietaryType.NON_VEG, label: '▲ Non-Veg' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDishDietary(d.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      dishDietary === d.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Culinary Description & Ingredients
              </label>
              <textarea
                rows={3}
                value={dishDescription}
                onChange={(e) => setDishDescription(e.target.value)}
                placeholder="Describe provenance, cooking technique, and tasting notes..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSaving ? 'Publishing to Menu...' : 'Publish Dish to Live Catalog'}</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Live Menu Inventory & Kitchen Ticket Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-stone-900">
                Live Menu Inventory ({menuItems.length})
              </h3>
              <span className="text-xs text-stone-500">
                Toggle stock availability in real time
              </span>
            </div>

            <div className="divide-y divide-stone-200/70">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span
                        className={`font-semibold ${
                          item.dietary === DietaryType.VEG
                            ? 'text-emerald-700'
                            : 'text-[#E23744]'
                        }`}
                      >
                        {item.dietary}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular font-semibold text-stone-900">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                      item.available
                        ? 'border-emerald-700/30 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/60'
                        : 'border-stone-300 bg-stone-100 text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{item.available ? 'In Stock' : 'Sold Out'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Kitchen Tickets for Selected Restaurant */}
          {restaurantOrders.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-stone-200/80 space-y-4">
              <h3 className="font-display text-lg font-semibold text-stone-900">
                Incoming Kitchen Tickets ({restaurantOrders.length})
              </h3>
              <div className="space-y-3">
                {restaurantOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-mono-tabular text-xs font-semibold text-stone-900">
                        Ticket #{ord.orderNumber} · {ord.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-stone-600">
                        {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                      </p>
                    </div>
                    {ord.status !== OrderStatus.DELIVERED && (
                      <button
                        type="button"
                        onClick={() =>
                          advanceOrderStatus(
                            ord.id,
                            ord.status === OrderStatus.CONFIRMED
                              ? OrderStatus.PREPARING
                              : ord.status === OrderStatus.PREPARING
                                ? OrderStatus.OUT_FOR_DELIVERY
                                : OrderStatus.DELIVERED
                          )
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Advance Ticket Status
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
