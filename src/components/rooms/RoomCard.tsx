import { BedDouble, Building2, Snowflake, Sun, Users, Wind } from 'lucide-react';
import type { Room } from '@/types/hotel';
import { formatINR } from '@/lib/pricing';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

function Badge({ children, icon: Icon }: { children: string; icon: typeof Snowflake }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900 shadow-sm backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <article className="group card-base flex flex-col transition duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-navy-100">
        <img
          src={room.image_url}
          alt={`${room.room_type} room ${room.room_number}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge icon={room.is_ac ? Snowflake : Wind}>{room.is_ac ? 'AC' : 'Non-AC'}</Badge>
          <Badge icon={Sun}>{room.is_window ? 'Window Room' : 'Non-Window'}</Badge>
        </div>
        <span className="absolute bottom-4 right-4">
          <Badge icon={Building2}>{`Floor ${room.floor}`}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-2xl">Room {room.room_number}</h3>
          <p className="text-right">
            <span className="block font-display text-2xl font-semibold text-navy-900">{formatINR(room.price_per_night)}</span>
            <span className="text-xs text-navy-500">per night, +12% GST</span>
          </p>
        </div>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-gold-700">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          {room.room_type}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-navy-600">{room.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-navy-600">
          <Users className="h-4 w-4" aria-hidden="true" />
          Up to {room.max_guests} {room.max_guests === 1 ? 'guest' : 'guests'}
        </div>
        <button type="button" onClick={() => onBook(room)} className="btn-primary mt-6 w-full">
          Book Now
        </button>
      </div>
    </article>
  );
}
