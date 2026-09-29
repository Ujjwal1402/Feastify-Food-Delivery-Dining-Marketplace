import React, { useState } from 'react';
import { Calendar, Users, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const DiningReservationModal: React.FC = () => {
  const {
    reservationRestaurant,
    setReservationRestaurant,
    bookDiningTable,
  } = useMarketplace();

  const [guestName, setGuestName] = useState('Ujjwal Sharma');
  const [guestPhone, setGuestPhone] = useState('+91 98450 77210');
  const [partySize, setPartySize] = useState(4);
  const [date, setDate] = useState('Tonight');
  const [timeSlot, setTimeSlot] = useState('08:30 PM');
  const [seatingPreference, setSeatingPreference] = useState<
    'Indoor Dining' | 'Chef Counter' | 'Courtyard Patio'
  >('Indoor Dining');
  const [specialRequest, setSpecialRequest] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  if (!reservationRestaurant) return null;

  const availableSlots =
    reservationRestaurant.availableTimeSlots.length > 0
      ? reservationRestaurant.availableTimeSlots
      : ['01:00 PM', '07:30 PM', '08:30 PM', '09:15 PM'];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      await bookDiningTable({
        restaurantId: reservationRestaurant.id,
        guestName,
        guestPhone,
        partySize,
        date,
        timeSlot,
        seatingPreference,
        specialRequest,
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-stone-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-stone-900 text-white flex items-start justify-between">
          <div>
            <p className="text-xs text-stone-300">Feastify Dining Table Privilege</p>
            <h2 id="reservation-modal-title" className="font-display text-xl font-semibold mt-0.5">
              {reservationRestaurant.name}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              {reservationRestaurant.address}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReservationRestaurant(null)}
            aria-label="Close reservation modal"
            className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBook} className="p-6 space-y-5">
          {reservationRestaurant.tableBookingOffer && (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800">
              <span className="font-semibold text-[#E23744]">Included Dining Offer: </span>
              {reservationRestaurant.tableBookingOffer}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Party Size
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPartySize(num)}
                    className={`py-2 rounded-lg text-xs font-mono-tabular font-semibold border transition-colors cursor-pointer ${
                      partySize === num
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Dining Date
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Tonight', 'Tomorrow', 'Saturday'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      date === d
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select Seating Time Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-3.5 rounded-lg text-xs font-mono-tabular font-semibold border transition-colors cursor-pointer ${
                    timeSlot === slot
                      ? 'bg-[#E23744] text-white border-[#E23744]'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Seating Area Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Indoor Dining', 'Chef Counter', 'Courtyard Patio'] as const).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSeatingPreference(area)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    seatingPreference === area
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-600 mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Mobile Number</label>
              <input
                type="text"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg font-mono-tabular focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone-600 mb-1">
              Special Occasion or Dietary Notes (Optional)
            </label>
            <input
              type="text"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="e.g., Window table, anniversary celebration, nut allergy"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setReservationRestaurant(null)}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBooking}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#E23744] hover:bg-[#c92d39] rounded-xl transition-colors cursor-pointer"
            >
              {isBooking ? 'Confirming Table...' : `Confirm Table for ${partySize} Guests`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
