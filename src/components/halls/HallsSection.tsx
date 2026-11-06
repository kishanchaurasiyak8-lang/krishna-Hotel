import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import HallCard from '@/components/halls/HallCard';
import HallReservationForm from '@/components/halls/HallReservationForm';
import { getHalls } from '@/services/hotelService';
import { useLoadedData } from '@/hooks/useLoadedData';
import type { Hall } from '@/types/hotel';

export default function HallsSection() {
  const { data: halls, loading, error } = useLoadedData(getHalls);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedHall) {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedHall]);

  return (
    <section id="halls" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Banquets and Event Halls"
          title="A stage for every celebration"
          description="From grand weddings to intimate private dinners, pick a hall, a time slot and a date that suits your gathering."
        />

        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-navy-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading halls...
          </div>
        )}

        {error && (
          <p className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            Halls could not be loaded. Please refresh the page.
          </p>
        )}

        {halls && (
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {halls.map((hall) => (
              <HallCard
                key={hall.id}
                hall={hall}
                selected={selectedHall?.id === hall.id}
                onSelect={setSelectedHall}
              />
            ))}
          </div>
        )}

        {selectedHall && (
          <div ref={formPanelRef} className="mt-12 scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 shadow-sm sm:p-10">
            <h3 className="text-3xl">Reserve the {selectedHall.name}</h3>
            <p className="mt-2 text-sm text-navy-600">Choose a date and slot, then tell us about your event.</p>
            <div className="mt-8">
              <HallReservationForm key={selectedHall.id} hall={selectedHall} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
