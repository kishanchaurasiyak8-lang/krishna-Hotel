import { useEffect, useState } from 'react';
import { Hotel, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Event Halls', href: '#halls' },
  { label: 'My Bookings', href: '#bookings' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-navy-900/95 shadow-lg backdrop-blur-md' : 'bg-navy-900'
      } border-b border-gold-500/20`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <a href="#top" className="flex items-center gap-3 text-cream">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-900">
            <Hotel className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-wide">Krishna Hotel</span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm font-medium text-navy-100 transition hover:text-gold-300">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#rooms" className="btn-gold hidden !px-5 !py-2.5 md:inline-flex">
            Book a Stay
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-full p-2 text-cream transition hover:bg-navy-800 lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-navy-700 bg-navy-900 px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-navy-800 py-4 font-display text-xl text-cream transition hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
