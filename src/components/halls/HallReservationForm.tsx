import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, Loader2, Moon, Sunrise } from 'lucide-react';
import Field from '@/components/ui/Field';
import { createBooking } from '@/services/hotelService';
import { useToast } from '@/hooks/useToast';
import { formatDisplayDate, todayISO } from '@/lib/dates';
import { formatINR, withStayTax } from '@/lib/pricing';
import { isValidEmail, isValidPhone } from '@/lib/validation';
import { TIME_SLOTS, type BookingReceipt, type Hall, type TimeSlot } from '@/types/hotel';

interface HallReservationFormProps {
  hall: Hall;
}

const SLOT_ICONS: Record<TimeSlot, typeof Clock> = {
  Morning: Sunrise,
  Evening: Moon,
  'Full Day': Clock,
};

function priceForSlot(hall: Hall, slot: TimeSlot): number {
  if (slot === 'Morning') return hall.price_morning;
  if (slot === 'Evening') return hall.price_evening;
  return hall.price_full_day;
}

interface HallForm {
  date: string;
  slot: TimeSlot;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

type HallFormErrors = Partial<Record<keyof HallForm, string>>;

function validateHallForm(form: HallForm, hall: Hall): HallFormErrors {
  const errors: HallFormErrors = {};
  if (!form.date || form.date < todayISO()) errors.date = 'Choose a date from today onwards.';
  if (form.guests < 1 || form.guests > hall.capacity) errors.guests = `This hall holds up to ${hall.capacity} guests.`;
  if (form.name.trim().length < 2) errors.name = 'Enter the contact name.';
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

export default function HallReservationForm({ hall }: HallReservationFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<HallForm>({
    date: '',
    slot: 'Evening',
    guests: Math.min(hall.capacity, 50),
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<HallFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  const updateField = <K extends keyof HallForm>(key: K, value: HallForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateHallForm(form, hall);
    setErrors(nextErrors);
    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      showToast({ tone: 'error', title: 'Please check your reservation details', description: firstError });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        bookingType: 'hall',
        hallId: hall.id,
        date: form.date,
        timeSlot: form.slot,
        guests: form.guests,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        notes: form.notes,
      });
      setReceipt(result);
      showToast({
        tone: 'success',
        title: 'Reservation confirmed',
        description: `${hall.name} is reserved. Reference ${result.reference}.`,
      });
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Reservation not completed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="space-y-6 py-6 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
        <div>
          <p className="text-sm text-navy-600">Reservation reference</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-wider">{receipt.reference}</p>
        </div>
        <p className="text-sm text-navy-600">
          {hall.name} on {formatDisplayDate(form.date)}, {form.slot}. Total {formatINR(receipt.total)} incl. GST.
        </p>
      </div>
    );
  }

  const baseAmount = priceForSlot(hall, form.slot);
  const grandTotal = withStayTax(baseAmount);
  const inputClass = (key: keyof HallForm) => `input-base ${errors[key] ? 'input-invalid' : ''}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event date" htmlFor="hall-date" error={errors.date}>
            <input
              id="hall-date"
              type="date"
              min={todayISO()}
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className={inputClass('date')}
            />
          </Field>
          <Field label="Guests" htmlFor="hall-guests" error={errors.guests}>
            <input
              id="hall-guests"
              type="number"
              min={1}
              max={hall.capacity}
              value={form.guests}
              onChange={(event) => updateField('guests', Number(event.target.value))}
              className={inputClass('guests')}
            />
          </Field>
        </div>

        <div>
          <p className="label-base">Time slot</p>
          <div role="radiogroup" aria-label="Time slot" className="grid gap-3 sm:grid-cols-3">
            {TIME_SLOTS.map((slot) => {
              const Icon = SLOT_ICONS[slot];
              const active = form.slot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateField('slot', slot)}
                  className={`rounded-xl border p-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    active ? 'border-gold-500 bg-gold-50 shadow-sm' : 'border-navy-200 bg-white hover:border-gold-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-gold-700' : 'text-navy-400'}`} aria-hidden="true" />
                  <span className="mt-2 block text-sm font-semibold text-navy-900">{slot}</span>
                  <span className="text-xs text-navy-600">{formatINR(priceForSlot(hall, slot))} + GST</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" htmlFor="hall-name" error={errors.name}>
            <input
              id="hall-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={inputClass('name')}
            />
          </Field>
          <Field label="Phone" htmlFor="hall-phone" error={errors.phone}>
            <input
              id="hall-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={inputClass('phone')}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email" htmlFor="hall-email" error={errors.email}>
              <input
                id="hall-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={inputClass('email')}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Event details (optional)" htmlFor="hall-notes">
              <textarea
                id="hall-notes"
                rows={3}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Occasion, seating style, catering or decor needs"
                className="input-base resize-none"
              />
            </Field>
          </div>
        </div>
      </div>

      <aside className="flex flex-col rounded-2xl bg-navy-900 p-6 text-cream">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Reservation summary</p>
        <h4 className="mt-2 font-display text-2xl font-semibold">{hall.name}</h4>
        <dl className="mt-6 space-y-3 text-sm text-navy-200">
          <div className="flex justify-between">
            <dt>Slot</dt>
            <dd>{form.slot}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Hall rate</dt>
            <dd>{formatINR(baseAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>GST (12%)</dt>
            <dd>{formatINR(grandTotal - baseAmount)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-navy-700 pt-4 font-display text-2xl font-semibold text-gold-300">
          <span>Total</span>
          <span>{formatINR(grandTotal)}</span>
        </div>
        <button type="submit" disabled={submitting} className="btn-gold mt-8 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Reserving...' : 'Request Reservation'}
        </button>
      </aside>
    </form>
  );
}
