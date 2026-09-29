import React from 'react';
import { ArrowUpRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CUISINE_CATEGORIES } from '../configuration/constants';
import { CartDrawer } from './components/CartDrawer';
import { DiningReservationModal } from './components/DiningReservationModal';
import { HeroSection } from './components/HeroSection';
import { MerchantPartnerView } from './components/MerchantPartnerView';
import { Navbar } from './components/Navbar';
import { OrdersAndBookingsView } from './components/OrdersAndBookingsView';
import { ResilientImage } from './components/ResilientImage';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import {
  MarketplaceProvider,
  SortOption,
  useMarketplace,
} from './context/MarketplaceContext';

const MarketplaceContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedNeighborhood,
    selectedCuisine,
    setSelectedCuisine,
    pureVegOnly,
    setPureVegOnly,
    minRating45,
    setMinRating45,
    fastDeliveryOnly,
    setFastDeliveryOnly,
    sortBy,
    setSortBy,
    resetFilters,
    restaurants,
    collections,
    toastMessage,
  } = useMarketplace();

  const hasActiveFilters =
    selectedCuisine !== 'All Cuisines' ||
    pureVegOnly ||
    minRating45 ||
    fastDeliveryOnly;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'ORDERS' ? (
          <OrdersAndBookingsView />
        ) : activeTab === 'PARTNER_PORTAL' ? (
          <MerchantPartnerView />
        ) : (
          <>
            {/* Section 1: Storefront Hero */}
            <HeroSection />

            {/* Section 2: Featured Restaurants & Interactive Filter Bar */}
            <section
              id="featured-kitchens"
              className="max-w-[1200px] mx-auto px-6 py-12 space-y-8"
            >
              {/* Section Heading & Dining Mode Context */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500">
                    {activeTab === 'DINING_OUT'
                      ? `Curated Table Reservations · ${selectedNeighborhood}, Bengaluru`
                      : `Temperature-Controlled Delivery · ${selectedNeighborhood}, Bengaluru`}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                    {activeTab === 'DINING_OUT'
                      ? 'Chef-Led Dining Rooms & Courtyards'
                      : 'Featured Independent Kitchens'}
                  </h2>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2.5 self-start md:self-end">
                  <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                  <label htmlFor="sort-select" className="text-xs font-semibold text-stone-600">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="RATING">Highest Rated (4.9 ★ first)</option>
                    <option value="DELIVERY_TIME">Fastest Dispatch</option>
                    <option value="COST_LOW_TO_HIGH">Cost: Low to High</option>
                    <option value="COST_HIGH_TO_LOW">Cost: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Interactive Filter Controls (Functional Buttons with Active/Inactive States) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
                {/* Segmented Cuisine Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
                  {CUISINE_CATEGORIES.map((cuisine) => {
                    const isSelected = selectedCuisine === cuisine;
                    return (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => setSelectedCuisine(cuisine)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'bg-stone-200/60 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                        }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Attribute Toggle Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPureVegOnly((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      pureVegOnly
                        ? 'border-emerald-800 bg-emerald-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    Pure Vegetarian
                  </button>

                  <button
                    type="button"
                    onClick={() => setMinRating45((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap font-mono-tabular cursor-pointer ${
                      minRating45
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    Rating 4.8+ ★
                  </button>

                  <button
                    type="button"
                    onClick={() => setFastDeliveryOnly((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap font-mono-tabular cursor-pointer ${
                      fastDeliveryOnly
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    Under 26 Mins
                  </button>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#E23744] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3-Column Desktop Featured Collection Grid */}
              {restaurants.length === 0 ? (
                <div className="bg-white rounded-xl border border-stone-200/80 p-12 text-center space-y-3">
                  <p className="font-display text-lg font-semibold text-stone-900">
                    No kitchens match your current filter combination
                  </p>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Try clearing one of your dietary or delivery time filters to explore all curated restaurants in {selectedNeighborhood}.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#E23744] rounded-lg cursor-pointer"
                  >
                    Show All Kitchens
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Curated Culinary Collections & Provenance */}
            <section className="border-t border-stone-200/80 bg-white py-14">
              <div className="max-w-[1200px] mx-auto px-6 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">
                      Editorial Curation · Bengaluru Gastronomic Guide
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                      Curated Culinary Collections
                    </h2>
                  </div>
                  <p className="text-xs text-stone-600 max-w-md">
                    Handpicked lists of kitchens audited for authentic technique, heirloom ingredients, and thermal-grade packaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {collections.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => {
                        if (col.filterDiningOut) {
                          setActiveTab('DINING_OUT');
                        } else if (col.filterCuisine) {
                          setSelectedCuisine(col.filterCuisine);
                          setActiveTab('DELIVERY');
                        }
                        const el = document.getElementById('featured-kitchens');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 cursor-pointer"
                    >
                      <ResilientImage
                        src={col.imageUrl}
                        alt={col.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-6 flex flex-col justify-end text-white">
                        <div className="flex items-center justify-between text-xs text-stone-300 mb-1 font-mono-tabular">
                          <span>{col.placeCount} Featured Kitchens</span>
                          <ArrowUpRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <h3 className="font-display text-xl font-semibold">
                          {col.title}
                        </h3>
                        <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                          {col.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      <RestaurantDetailModal />
      <CartDrawer />
      <DiningReservationModal />

      {/* Live Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#E23744]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Editorial Footer */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 py-12">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-display text-xl font-semibold text-white">Feastify</p>
            <p className="text-xs text-stone-400">
              Artisanal Food Delivery, Dining Table Reservations & Kitchen Partner Platform · Bengaluru, Mumbai, New Delhi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('DELIVERY')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Delivery Kitchens
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DINING_OUT')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dining Out
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ORDERS')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Order Tracking
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PARTNER_PORTAL')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Partner Console
            </button>
            <span className="text-stone-600">© {new Date().getFullYear()} Feastify Marketplace</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function FrontendApp() {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
}
