import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import MenuCard from '@/components/dining/MenuCard';
import { getMenuItems } from '@/services/hotelService';
import { useLoadedData } from '@/hooks/useLoadedData';
import type { Cart } from '@/hooks/useCart';
import { MENU_CATEGORIES, type MenuCategory } from '@/types/hotel';

interface DiningSectionProps {
  cart: Cart;
}

type CategoryTab = (typeof MENU_CATEGORIES)[number];

export default function DiningSection({ cart }: DiningSectionProps) {
  const { data: items, loading, error } = useLoadedData(getMenuItems);
  const [category, setCategory] = useState<CategoryTab>('All');

  const allItems = items ?? [];
  const visibleItems = allItems.filter((item) => category === 'All' || item.category === category);
  const countFor = (value: CategoryTab) =>
    value === 'All' ? allItems.length : allItems.filter((item) => item.category === (value as MenuCategory)).length;

  return (
    <section id="dining" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Restaurant and Dining"
          title="Flavours that feel like home"
          description="Breakfast, slow-cooked mains, street-style snacks, sweets and refreshing drinks. Add what you like and check out in seconds."
        />

        <div
          role="tablist"
          aria-label="Menu categories"
          className="mt-12 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center"
        >
          {MENU_CATEGORIES.map((value) => {
            const active = category === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(value)}
                className={`chip shrink-0 ${active ? 'chip-active' : 'chip-idle'}`}
              >
                {value}
                <span className={`ml-2 text-xs ${active ? 'text-gold-300' : 'text-navy-400'}`}>{countFor(value)}</span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-navy-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading the menu...
          </div>
        )}

        {error && (
          <p className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            The menu could not be loaded. Please refresh the page.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" role="tabpanel">
            {visibleItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                quantity={cart.quantityOf(item.id)}
                onQuantityChange={(quantity) => {
                  if (quantity > cart.quantityOf(item.id)) cart.addItem(item);
                  else cart.updateQuantity(item.id, quantity);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
