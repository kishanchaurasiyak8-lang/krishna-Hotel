import { Minus, Plus } from 'lucide-react';
import type { MenuItem } from '@/types/hotel';
import { formatINR } from '@/lib/pricing';
import { MAX_ITEM_QUANTITY } from '@/hooks/useCart';

interface MenuCardProps {
  item: MenuItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export default function MenuCard({ item, quantity, onQuantityChange }: MenuCardProps) {
  return (
    <article className="card-base flex flex-col p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.is_veg ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-sm border ${item.is_veg ? 'border-emerald-600 bg-emerald-500' : 'border-red-700 bg-red-600'}`}
            aria-hidden="true"
          />
          {item.is_veg ? 'Veg' : 'Non-Veg'}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-gold-700">{item.category}</span>
      </div>

      <h3 className="mt-4 text-2xl">{item.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{item.description}</p>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-navy-100 pt-4">
        <span className="font-display text-2xl font-semibold text-navy-900">{formatINR(item.price)}</span>

        {quantity === 0 ? (
          <button type="button" onClick={() => onQuantityChange(1)} className="btn-secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to Order
          </button>
        ) : (
          <div
            className="inline-flex items-center gap-1 rounded-full bg-navy-900 p-1 text-cream"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <button
              type="button"
              onClick={() => onQuantityChange(quantity - 1)}
              className="rounded-full p-1.5 transition hover:bg-navy-700"
              aria-label={`Remove one ${item.name}`}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= MAX_ITEM_QUANTITY}
              className="rounded-full p-1.5 transition hover:bg-navy-700 disabled:opacity-40"
              aria-label={`Add one ${item.name}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
