import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { ActiveNavTab, useMarketplace } from '../context/MarketplaceContext';

const NAV_ITEMS: { id: ActiveNavTab; label: string }[] = [
  { id: 'DELIVERY', label: 'Delivery' },
  { id: 'DINING_OUT', label: 'Dining Out' },
  { id: 'COLLECTIONS', label: 'Collections' },
  { id: 'ORDERS', label: 'Live Orders' },
  { id: 'PARTNER_PORTAL', label: 'Partner Kitchen' },
];

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    totalCartCount,
    billBreakdown,
    setIsCartOpen,
  } = useMarketplace();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark (Top Bar Contract) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('DELIVERY');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-2xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Feastify
        </button>

        {/* Zone 2: 5 clean text navigation links with subtle hover/active underlines */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-stone-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#E23744]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action (Bag trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Bag ({totalCartCount})</span>
            {totalCartCount > 0 && (
              <span className="font-mono-tabular pl-1 border-l border-white/30">
                ₹{billBreakdown.totalPayable}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="md:hidden flex items-center gap-5 px-6 py-2.5 overflow-x-auto border-t border-stone-200/60 bg-[#FAF9F6]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`text-xs font-semibold whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#E23744] text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
