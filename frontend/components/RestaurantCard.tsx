import React from 'react';
import { Calendar, UtensilsCrossed } from 'lucide-react';
import { RestaurantRecord } from '../../database/schema';
import { useMarketplace } from '../context/MarketplaceContext';
import { ResilientImage } from './ResilientImage';

interface RestaurantCardProps {
  restaurant: RestaurantRecord;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const {
    activeTab,
    setActiveRestaurantId,
    setReservationRestaurant,
  } = useMarketplace();

  const isDiningMode = activeTab === 'DINING_OUT';

  return (
    <article
      onClick={() => setActiveRestaurantId(restaurant.id)}
      className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col cursor-pointer"
    >
      {/* 4:3 Product / Restaurant Imagery with Measured Scrim */}
      <div className="relative aspect-[4/3] w-full bg-stone-900 overflow-hidden">
        <ResilientImage
          src={restaurant.heroImageUrl}
          alt={`${restaurant.name} signature culinary spread`}
          fallbackLabel={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Single subtle promotional text line at bottom of image scrim (No badge spam) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
          <span className="text-xs font-semibold tracking-tight truncate">
            {isDiningMode && restaurant.tableBookingOffer
              ? restaurant.tableBookingOffer
              : restaurant.promotionalOffer || 'Complimentary Priority Dispatch'}
          </span>
          <span className="font-mono-tabular text-xs text-stone-200 shrink-0">
            {restaurant.deliveryTimeMinutes} min
          </span>
        </div>
      </div>

      {/* Card Body: Clean Unboxed Metadata with Typographic Separators */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Quiet 1-line category & neighborhood kicker */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
            <span className="truncate">
              {restaurant.cuisines.slice(0, 2).join(' · ')}
            </span>
            <span className="font-mono-tabular font-semibold text-stone-900 shrink-0">
              {restaurant.rating.toFixed(1)} ★ ({restaurant.reviewCount})
            </span>
          </div>

          {/* Primary Restaurant Title (16px SemiBold) */}
          <h3 className="text-base font-semibold text-stone-900 group-hover:text-[#E23744] transition-colors truncate">
            {restaurant.name}
          </h3>

          {/* Story Headline */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {restaurant.storyHeadline}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-200/60 space-y-3">
          {/* Unboxed Metadata Row with · separators and tabular numerals */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono-tabular">
            <div className="flex items-center gap-1.5 truncate">
              <span>{restaurant.neighborhood}</span>
              <span aria-hidden="true">·</span>
              <span>{restaurant.distanceKm} km</span>
              {restaurant.isPureVeg && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-sans font-semibold">Pure Veg</span>
                </>
              )}
            </div>
            <span className="text-stone-800 font-semibold shrink-0">
              ₹{restaurant.costForTwo} for two
            </span>
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRestaurantId(restaurant.id);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>View Menu & Order</span>
            </button>

            {restaurant.supportsDiningOut && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReservationRestaurant(restaurant);
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-semibold text-[#E23744] border border-[#E23744]/30 hover:bg-[#E23744]/5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Table</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
