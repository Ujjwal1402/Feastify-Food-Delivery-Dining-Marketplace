import React from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ResilientImage } from './ResilientImage';

export const HeroSection: React.FC = () => {
  const {
    selectedNeighborhood,
    setSelectedNeighborhood,
    neighborhoodOptions,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
  } = useMarketplace();

  return (
    <section className="relative overflow-hidden border-b border-stone-200/80 bg-stone-950">
      <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Campaign Copy + Integrated Search & Location Control */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs text-stone-300 tracking-wide">
              <span>Bengaluru Culinary Dispatch</span>
              <span aria-hidden="true">·</span>
              <span>100% Temperature-Sealed Handis & Wood-Fired Boxes</span>
              <span aria-hidden="true">·</span>
              <span>Live Rider Telemetry</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-[1.15] tracking-tight max-w-2xl">
              Craft kitchens, heirloom biryanis, and wood-fired sourdough delivered at peak heat.
            </h1>

            <p className="text-base text-stone-300 leading-relaxed max-w-[62ch]">
              Discover Bengaluru’s highest-rated independent restaurants, inspect verified kitchen prep times, or reserve coveted chef-counter tables with instant confirmation.
            </p>

            {/* Unified Location + Dish/Restaurant Search Bar */}
            <div className="bg-white p-2 rounded-xl shadow-lg max-w-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 sm:border-r border-stone-200 shrink-0">
                <MapPin className="w-4 h-4 text-[#E23744] shrink-0" />
                <label htmlFor="neighborhood-select" className="sr-only">
                  Delivery Neighborhood
                </label>
                <select
                  id="neighborhood-select"
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="text-xs font-semibold text-stone-900 bg-transparent focus:outline-none cursor-pointer pr-2"
                >
                  {neighborhoodOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Bengaluru
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-stone-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'DELIVERY' && activeTab !== 'DINING_OUT') {
                      setActiveTab('DELIVERY');
                    }
                  }}
                  placeholder="Search for 'Burrata Pizza', 'Dum Biryani', 'Tonkotsu Ramen'..."
                  className="w-full px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('featured-kitchens')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] rounded-lg transition-colors text-center whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Kitchens
              </button>
            </div>

            {/* Quantitative Proof Row (Adjacency to Hero Claim) */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-300">
              <div>
                <span className="font-mono-tabular font-semibold text-white">24 min</span> median dispatch across Indiranagar & Koramangala
              </div>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <div>
                <span className="font-mono-tabular font-semibold text-white">4.8 ★</span> verified diner satisfaction across 8,200+ orders
              </div>
            </div>
          </div>

          {/* Right Column: 16:9 High-Fidelity Editorial Showcase */}
          <div className="lg:col-span-5">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <ResilientImage
                src="/src/assets/images/hero_culinary_spread_1790581470587.jpg"
                alt="Artisanal wood-fired pizza, copper handi dum biryani, and tonkotsu ramen spread"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                <p className="text-xs text-stone-300">
                  Tonight’s Featured Kitchen · Indiranagar
                </p>
                <p className="font-display text-lg font-semibold text-white mt-0.5">
                  Il Forno di Napoli & Atelier Oudh
                </p>
                <p className="text-xs text-stone-300 mt-1 font-mono-tabular">
                  50% Off First Feast up to ₹150 · Code: ZEST50
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
