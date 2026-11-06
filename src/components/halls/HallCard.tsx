import { Check, Users } from 'lucide-react';
import type { Hall } from '@/types/hotel';
import { formatINR } from '@/lib/pricing';

interface HallCardProps {
  hall: Hall;
  selected: boolean;
  onSelect: (hall: Hall) => void;
}

export default function HallCard({ hall, selected, onSelect }: HallCardProps) {
  return (
    <article
      className={`card-base flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected ? 'ring-2 ring-gold-500' : ''
      }`}
    >
      <div className="relative h-52 overflow-hidden bg-navy-100">
        <img
          src={hall.image_url}
          alt={hall.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy-900 shadow-sm">
          <Users className="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
          Up to {hall.capacity} guests
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">{hall.tagline}</p>
        <h3 className="mt-2 text-3xl">{hall.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">{hall.description}</p>

        <ul className="mt-5 grid gap-2 text-sm text-navy-700">
          {hall.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <dl className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-cream p-3 text-center text-xs text-navy-600">
          <div>
            <dt>Morning</dt>
            <dd className="mt-1 font-semibold text-navy-900">{formatINR(hall.price_morning)}</dd>
          </div>
          <div>
            <dt>Evening</dt>
            <dd className="mt-1 font-semibold text-navy-900">{formatINR(hall.price_evening)}</dd>
          </div>
          <div>
            <dt>Full Day</dt>
            <dd className="mt-1 font-semibold text-navy-900">{formatINR(hall.price_full_day)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => onSelect(hall)}
          aria-pressed={selected}
          className={`mt-6 w-full ${selected ? 'btn-gold' : 'btn-primary'}`}
        >
          {selected ? 'Selected for reservation' : 'Reserve this hall'}
        </button>
      </div>
    </article>
  );
}
