import { useState, type FormEvent } from 'react';
import { CalendarDays, Search, Users, BedDouble } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { addDaysISO, todayISO } from '@/lib/dates';
import { ROOM_TYPES, type RoomSearchCriteria, type RoomType } from '@/types/hotel';

type SearchInput = Omit<RoomSearchCriteria, 'submittedAt'>;

interface HeroProps {
  onSearch: (criteria: SearchInput) => void;
}

const HERO_IMAGE = 'https://images.pexels.com/photos/38926802/pexels-photo-38926802.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function Hero({ onSearch }: HeroProps) {
  const { showToast } = useToast();
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(() => addDaysISO(todayISO(), 1));
  const [roomType, setRoomType] = useState<RoomType | 'all'>('all');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkIn < todayISO()) {
      showToast({ tone: 'error', title: 'Invalid dates', description: 'Check-in cannot be in the past.' });
      return;
    }
    if (checkOut <= checkIn) {
      showToast({ tone: 'error', title: 'Invalid dates', description: 'Check-out must be after check-in.' });
      return;
    }
    onSearch({ checkIn, checkOut, roomType, guests });
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-20">
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/80 via-navy-900/65 to-navy-900" />

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Welcome to Krishna Hotel</p>
          <h1 className="mt-5 text-5xl leading-[1.1] text-cream sm:text-6xl lg:text-7xl">
            Comfort, Taste, and Celebrations at Krishna Hotel
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
            Restful rooms, a restaurant loved by locals, and banquet halls for every occasion.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Quick room search"
          className="mt-12 grid gap-4 rounded-2xl bg-cream p-4 shadow-2xl sm:p-5 md:grid-cols-[1fr_1fr_1.2fr_0.9fr_auto] md:items-end"
        >
          <label className="block">
            <span className="label-base flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Check-in
            </span>
            <input
              type="date"
              min={todayISO()}
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="input-base"
            />
          </label>
          <label className="block">
            <span className="label-base flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Check-out
            </span>
            <input
              type="date"
              min={addDaysISO(checkIn, 1)}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className="input-base"
            />
          </label>
          <label className="block">
            <span className="label-base flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" aria-hidden="true" /> Category
            </span>
            <select value={roomType} onChange={(event) => setRoomType(event.target.value as RoomType | 'all')} className="input-base">
              <option value="all">All room types</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-base flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" /> Guests
            </span>
            <select value={guests} onChange={(event) => setGuests(Number(event.target.value))} className="input-base">
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary w-full md:w-auto">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
