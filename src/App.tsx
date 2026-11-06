import { useCallback, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import RoomsSection from '@/components/rooms/RoomsSection';
import DiningSection from '@/components/dining/DiningSection';
import CartTray from '@/components/dining/CartTray';
import HallsSection from '@/components/halls/HallsSection';
import MyBookingsSection from '@/components/bookings/MyBookingsSection';
import ContactSection from '@/components/contact/ContactSection';
import { useCart } from '@/hooks/useCart';
import type { RoomSearchCriteria } from '@/types/hotel';

type SearchInput = Omit<RoomSearchCriteria, 'submittedAt'>;

export default function App() {
  const cart = useCart();
  const [criteria, setCriteria] = useState<RoomSearchCriteria | null>(null);

  const handleSearch = useCallback((next: SearchInput) => {
    setCriteria({ ...next, submittedAt: Date.now() });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero onSearch={handleSearch} />
        <RoomsSection criteria={criteria} />
        <DiningSection cart={cart} />
        <HallsSection />
        <MyBookingsSection />
        <ContactSection />
      </main>
      <Footer />
      <CartTray cart={cart} />
    </div>
  );
}
