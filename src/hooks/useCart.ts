import { useCallback, useState } from 'react';
import type { CartEntry, MenuItem } from '@/types/hotel';

export const MAX_ITEM_QUANTITY = 20;

export function useCart() {
  const [entries, setEntries] = useState<CartEntry[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    setEntries((current) => {
      const existing = current.find((entry) => entry.item.id === item.id);
      if (!existing) return [...current, { item, quantity: 1 }];
      return current.map((entry) =>
        entry.item.id === item.id
          ? { ...entry, quantity: Math.min(entry.quantity + 1, MAX_ITEM_QUANTITY) }
          : entry,
      );
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setEntries((current) =>
      quantity <= 0
        ? current.filter((entry) => entry.item.id !== itemId)
        : current.map((entry) =>
            entry.item.id === itemId ? { ...entry, quantity: Math.min(quantity, MAX_ITEM_QUANTITY) } : entry,
          ),
    );
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const quantityOf = useCallback(
    (itemId: string) => entries.find((entry) => entry.item.id === itemId)?.quantity ?? 0,
    [entries],
  );

  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  return { entries, itemCount, subtotal, addItem, updateQuantity, clear, quantityOf };
}

export type Cart = ReturnType<typeof useCart>;
