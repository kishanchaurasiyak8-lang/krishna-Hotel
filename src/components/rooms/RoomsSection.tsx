import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import RoomCard from '@/components/rooms/RoomCard';
import RoomFilterBar from '@/components/rooms/RoomFilterBar';
import RoomBookingModal from '@/components/rooms/RoomBookingModal';
import { DEFAULT_ROOM_FILTERS, applyRoomFilters, type RoomFilters } from '@/components/rooms/roomFilters';
import { getRooms } from '@/services/hotelService';
import { useLoadedData } from '@/hooks/useLoadedData';
import { addDaysISO, todayISO } from '@/lib/dates';
import type { Room, RoomSearchCriteria } from '@/types/hotel';

interface RoomsSectionProps {
  criteria: RoomSearchCriteria | null;
}

export default function RoomsSection({ criteria }: RoomsSectionProps) {
  const { data: rooms, loading, error } = useLoadedData(getRooms);
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_ROOM_FILTERS);
  const [dates, setDates] = useState(() => ({ checkIn: todayISO(), checkOut: addDaysISO(todayISO(), 1) }));
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!criteria) return;
    setFilters((current) => ({ ...current, roomType: criteria.roomType, minGuests: criteria.guests }));
    setDates({ checkIn: criteria.checkIn, checkOut: criteria.checkOut });
  }, [criteria]);

  const visibleRooms = applyRoomFilters(rooms ?? [], filters);

  return (
    <section id="rooms" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Rooms and Suites"
          title="Rest well in a room made for you"
          description="Choose from king and single-bed rooms across seven floors, with air-conditioned and naturally ventilated options."
        />

        <div className="mt-12">
          <RoomFilterBar filters={filters} onChange={setFilters} resultCount={visibleRooms.length} />
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-navy-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading rooms...
          </div>
        )}

        {!loading && error && (
          <p className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            We could not load rooms right now. Please refresh the page.
          </p>
        )}

        {!loading && !error && visibleRooms.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center">
            <p className="font-display text-2xl text-navy-900">No rooms match these filters</p>
            <p className="mt-2 text-sm text-navy-600">Try a different floor or room type.</p>
          </div>
        )}

        {!loading && visibleRooms.length > 0 && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {visibleRooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={setSelectedRoom} />
            ))}
          </div>
        )}
      </div>

      {selectedRoom && (
        <RoomBookingModal
          key={selectedRoom.id}
          room={selectedRoom}
          initialCheckIn={dates.checkIn}
          initialCheckOut={dates.checkOut}
          initialGuests={filters.minGuests}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </section>
  );
}
