import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Field from '@/components/ui/Field';
import { createBooking } from '@/services/hotelService';
import { useToast } from '@/hooks/useToast';
import { addDaysISO, formatDisplayDate, nightsBetween, todayISO } from '@/lib/dates';
import { formatINR, withStayTax } from '@/lib/pricing';
import { isValidEmail, isValidPhone } from '@/lib/validation';
import type { BookingReceipt, Room } from '@/types/hotel';

interface RoomBookingModalProps {
  room: Room;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  onClose: () => void;
}

interface BookingForm {
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof BookingForm, string>>;

function validateForm(form: BookingForm, room: Room): FormErrors {
  const errors: FormErrors = {};
  if (!form.checkIn || form.checkIn < todayISO()) errors.checkIn = 'Choose a check-in date from today onwards.';
  if (!form.checkOut || form.checkOut <= form.checkIn) errors.checkOut = 'Check-out must be after check-in.';
  if (form.guests < 1 || form.guests > room.max_guests) errors.guests = `This room holds up to ${room.max_guests} guests.`;
  if (form.name.trim().length < 2) errors.name = 'Enter the guest name.';
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

export default function RoomBookingModal({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onClose,
}: RoomBookingModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<BookingForm>({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: Math.min(initialGuests, room.max_guests),
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  const nights = form.checkOut > form.checkIn ? nightsBetween(form.checkIn, form.checkOut) : 0;
  const baseAmount = nights * room.price_per_night;
  const grandTotal = withStayTax(baseAmount);

  const updateField = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form, room);
    setErrors(nextErrors);
    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      showToast({ tone: 'error', title: 'Please check your booking details', description: firstError });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        bookingType: 'room',
        roomId: room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        notes: form.notes,
      });
      setReceipt(result);
      showToast({
        tone: 'success',
        title: 'Booking confirmed',
        description: `Room ${room.room_number} is reserved. Reference ${result.reference}.`,
      });
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Booking not completed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <Modal open onClose={onClose} title="Booking confirmed" description={`Room ${room.room_number}`}>
        <div className="space-y-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-sm text-navy-600">Your booking reference</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-wider text-navy-900">{receipt.reference}</p>
          </div>
          <dl className="grid gap-3 rounded-2xl bg-white p-5 text-left text-sm sm:grid-cols-2">
            <div>
              <dt className="text-navy-500">Stay</dt>
              <dd className="font-medium">
                {formatDisplayDate(form.checkIn)} to {formatDisplayDate(form.checkOut)}
              </dd>
            </div>
            <div>
              <dt className="text-navy-500">Total paid at hotel</dt>
              <dd className="font-medium">{formatINR(receipt.total)}</dd>
            </div>
          </dl>
          <p className="text-sm text-navy-600">Keep this reference to look up your booking under My Bookings.</p>
          <button type="button" onClick={onClose} className="btn-primary w-full">
            Done
          </button>
        </div>
      </Modal>
    );
  }

  const inputClass = (key: keyof BookingForm) => `input-base ${errors[key] ? 'input-invalid' : ''}`;

  return (
    <Modal open onClose={onClose} title={`Book Room ${room.room_number}`} description={room.room_type}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-semibold text-navy-900">Stay dates</legend>
          <Field label="Check-in" htmlFor="room-checkin" error={errors.checkIn}>
            <input
              id="room-checkin"
              type="date"
              min={todayISO()}
              value={form.checkIn}
              onChange={(event) => updateField('checkIn', event.target.value)}
              className={inputClass('checkIn')}
            />
          </Field>
          <Field label="Check-out" htmlFor="room-checkout" error={errors.checkOut}>
            <input
              id="room-checkout"
              type="date"
              min={addDaysISO(form.checkIn || todayISO(), 1)}
              value={form.checkOut}
              onChange={(event) => updateField('checkOut', event.target.value)}
              className={inputClass('checkOut')}
            />
          </Field>
          <Field label="Guests" htmlFor="room-guests" error={errors.guests}>
            <input
              id="room-guests"
              type="number"
              min={1}
              max={room.max_guests}
              value={form.guests}
              onChange={(event) => updateField('guests', Number(event.target.value))}
              className={inputClass('guests')}
            />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-semibold text-navy-900">Guest details</legend>
          <Field label="Full name" htmlFor="room-name" error={errors.name}>
            <input
              id="room-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={inputClass('name')}
            />
          </Field>
          <Field label="Phone" htmlFor="room-phone" error={errors.phone}>
            <input
              id="room-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={inputClass('phone')}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email" htmlFor="room-email" error={errors.email}>
              <input
                id="room-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={inputClass('email')}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Special requests (optional)" htmlFor="room-notes">
              <textarea
                id="room-notes"
                rows={2}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                className="input-base resize-none"
              />
            </Field>
          </div>
        </fieldset>

        <div className="rounded-2xl bg-navy-900 p-5 text-cream">
          <div className="flex justify-between text-sm text-navy-200">
            <span>
              {nights > 0 ? `${nights} ${nights === 1 ? 'night' : 'nights'} at ${formatINR(room.price_per_night)}` : 'Select dates to see the total'}
            </span>
            <span>{formatINR(baseAmount)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-navy-200">
            <span>GST (12%)</span>
            <span>{formatINR(grandTotal - baseAmount)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-navy-700 pt-3 font-display text-2xl font-semibold text-gold-300">
            <span>Total</span>
            <span>{formatINR(grandTotal)}</span>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-gold w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </form>
    </Modal>
  );
}
