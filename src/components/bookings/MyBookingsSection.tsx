import { useState, type FormEvent } from 'react';
import { BedDouble, CalendarDays, Loader2, Search, Users, Building2 } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Field from '@/components/ui/Field';
import { findBookings } from '@/services/hotelService';
import { useToast } from '@/hooks/useToast';
import { formatDisplayDate } from '@/lib/dates';
import { formatINR } from '@/lib/pricing';
import { isValidEmail } from '@/lib/validation';
import type { FoundBooking } from '@/types/hotel';

export default function MyBookingsSection() {
  const { showToast } = useToast();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ reference?: string; email?: string }>({});
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundBooking[] | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      reference: reference.trim().length < 6 ? 'Enter the reference from your confirmation (e.g. KH-A1B2C3).' : undefined,
      email: isValidEmail(email) ? undefined : 'Enter the email address used for the booking.',
    };
    setErrors(nextErrors);
    const firstError = nextErrors.reference ?? nextErrors.email;
    if (firstError) {
      showToast({ tone: 'error', title: 'Please check your lookup details', description: firstError });
      return;
    }

    setSearching(true);
    try {
      setResults(await findBookings(reference, email));
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Lookup failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <section id="bookings" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="My Bookings"
          title="Find your reservation"
          description="Enter your booking reference and the email you booked with to see your room stays and hall reservations."
        />

        <form onSubmit={handleSubmit} noValidate className="mx-auto mt-12 grid gap-4 rounded-2xl border border-navy-100 bg-cream p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Booking reference" htmlFor="lookup-reference" error={errors.reference}>
            <input
              id="lookup-reference"
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value.toUpperCase())}
              placeholder="KH-A1B2C3"
              className={`input-base uppercase ${errors.reference ? 'input-invalid' : ''}`}
            />
          </Field>
          <Field label="Email used" htmlFor="lookup-email" error={errors.email}>
            <input
              id="lookup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`input-base ${errors.email ? 'input-invalid' : ''}`}
            />
          </Field>
          <button type="submit" disabled={searching} className="btn-primary">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            Find booking
          </button>
        </form>

        {results && results.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-navy-200 p-10 text-center text-sm text-navy-600">
            No booking matches that reference and email. Please check both and try again.
          </p>
        )}

        {results && results.length > 0 && (
          <ul className="mt-10 grid gap-6">
            {results.map((booking) => (
              <BookingResultCard key={booking.reference} booking={booking} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BookingResultCard({ booking }: { booking: FoundBooking }) {
  const isRoom = booking.bookingType === 'room';
  const title = isRoom ? `Room ${booking.roomNumber} · ${booking.roomType}` : booking.hallName ?? 'Event hall';
  const dateLine = isRoom
    ? `${formatDisplayDate(booking.checkIn)} to ${formatDisplayDate(booking.checkOut)}`
    : `${formatDisplayDate(booking.checkIn)} · ${booking.timeSlot}`;
  const Icon = isRoom ? BedDouble : Building2;

  return (
    <li className="card-base p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-navy-900">{title}</p>
            <p className="mt-1 text-sm text-navy-600">Reference {booking.reference}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {booking.status}
        </span>
      </div>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 text-navy-700">
          <CalendarDays className="h-4 w-4 text-gold-700" aria-hidden="true" />
          {dateLine}
        </div>
        <div className="flex items-center gap-2 text-navy-700">
          <Users className="h-4 w-4 text-gold-700" aria-hidden="true" />
          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
        </div>
        <div className="font-semibold text-navy-900 sm:text-right">Total {formatINR(booking.totalAmount)}</div>
      </dl>
    </li>
  );
}
