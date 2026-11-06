import { useState, type FormEvent } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Field from '@/components/ui/Field';
import { createFoodOrder } from '@/services/hotelService';
import { useToast } from '@/hooks/useToast';
import { MAX_ITEM_QUANTITY, type Cart } from '@/hooks/useCart';
import { FOOD_TAX_RATE, formatINR } from '@/lib/pricing';
import { isValidPhone } from '@/lib/validation';
import type { CartEntry, FoodOrderReceipt } from '@/types/hotel';

interface CartTrayProps {
  cart: Cart;
}

export default function CartTray({ cart }: CartTrayProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (cart.itemCount === 0) return null;

  const tax = Math.round(cart.subtotal * FOOD_TAX_RATE);
  const total = cart.subtotal + tax;

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md animate-slide-up sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0">
        <div className="overflow-hidden rounded-2xl bg-navy-900 text-cream shadow-2xl ring-1 ring-gold-500/30">
          {expanded && (
            <div className="max-h-72 overflow-y-auto border-b border-navy-700 px-5 py-4">
              <ul className="space-y-3">
                {cart.entries.map((entry) => (
                  <CartLine key={entry.item.id} entry={entry} cart={cart} />
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-navy-700 pt-4 text-sm text-navy-200">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatINR(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>GST (5%)</dt>
                  <dd>{formatINR(tax)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cream px-1 text-xs font-bold text-navy-900">
                  {cart.itemCount}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Your order</span>
                <span className="flex items-center gap-1 text-xs text-navy-200">
                  Total {formatINR(total)} incl. GST
                  {expanded ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />}
                </span>
              </span>
            </button>
            <button type="button" onClick={() => setCheckoutOpen(true)} className="btn-gold shrink-0 !px-5 !py-2.5">
              Checkout
            </button>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          entries={cart.entries}
          onClose={() => setCheckoutOpen(false)}
          onDone={() => {
            cart.clear();
            setCheckoutOpen(false);
            setExpanded(false);
          }}
        />
      )}
    </>
  );
}

function CartLine({ entry, cart }: { entry: CartEntry; cart: Cart }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{entry.item.name}</p>
        <p className="text-xs text-navy-300">{formatINR(entry.item.price * entry.quantity)}</p>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-navy-800 p-1">
        <button
          type="button"
          onClick={() => cart.updateQuantity(entry.item.id, entry.quantity - 1)}
          className="rounded-full p-1 transition hover:bg-navy-700"
          aria-label={`Remove one ${entry.item.name}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{entry.quantity}</span>
        <button
          type="button"
          onClick={() => cart.updateQuantity(entry.item.id, entry.quantity + 1)}
          disabled={entry.quantity >= MAX_ITEM_QUANTITY}
          className="rounded-full p-1 transition hover:bg-navy-700 disabled:opacity-40"
          aria-label={`Add one ${entry.item.name}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

interface CheckoutModalProps {
  entries: CartEntry[];
  onClose: () => void;
  onDone: () => void;
}

function CheckoutModal({ entries, onClose, onDone }: CheckoutModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<FoodOrderReceipt | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextNameError = name.trim().length < 2 ? 'Enter your name so we can find your order.' : undefined;
    const nextPhoneError = isValidPhone(phone) ? undefined : 'Enter a valid phone number.';
    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    const firstError = nextNameError ?? nextPhoneError;
    if (firstError) {
      showToast({ tone: 'error', title: 'Please check your order details', description: firstError });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createFoodOrder({
        customerName: name,
        customerPhone: phone,
        items: entries.map((entry) => ({ menuItemId: entry.item.id, quantity: entry.quantity })),
      });
      setReceipt(result);
      showToast({ tone: 'success', title: 'Order placed', description: `Reference ${result.reference}` });
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Order not placed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <Modal open onClose={onDone} title="Order placed" description="Your food is being prepared.">
        <div className="space-y-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-sm text-navy-600">Order reference</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-wider">{receipt.reference}</p>
          </div>
          <p className="text-sm text-navy-600">
            Total {formatINR(receipt.total)} including {formatINR(receipt.tax)} GST. Pay at the restaurant.
          </p>
          <button type="button" onClick={onDone} className="btn-primary w-full">
            Done
          </button>
        </div>
      </Modal>
    );
  }

  const subtotal = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const tax = Math.round(subtotal * FOOD_TAX_RATE);

  return (
    <Modal open onClose={onClose} title="Review and checkout" description="Confirm your details to place the order.">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <ul className="divide-y divide-navy-100 rounded-2xl bg-white px-5">
          {entries.map((entry) => (
            <li key={entry.item.id} className="flex justify-between py-3 text-sm">
              <span>
                {entry.item.name} <span className="text-navy-500">x {entry.quantity}</span>
              </span>
              <span className="font-medium">{formatINR(entry.item.price * entry.quantity)}</span>
            </li>
          ))}
          <li className="space-y-1.5 py-3 text-sm text-navy-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between font-display text-xl font-semibold text-navy-900">
              <span>Total</span>
              <span>{formatINR(subtotal + tax)}</span>
            </div>
          </li>
        </ul>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="order-name" error={nameError}>
            <input
              id="order-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(undefined);
              }}
              className={`input-base ${nameError ? 'input-invalid' : ''}`}
            />
          </Field>
          <Field label="Phone" htmlFor="order-phone" error={phoneError}>
            <input
              id="order-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setPhoneError(undefined);
              }}
              className={`input-base ${phoneError ? 'input-invalid' : ''}`}
            />
          </Field>
        </div>

        <button type="submit" disabled={submitting} className="btn-gold w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </Modal>
  );
}
