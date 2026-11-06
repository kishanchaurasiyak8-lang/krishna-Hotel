import { Hotel } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Event Halls', href: '#halls' },
  { label: 'My Bookings', href: '#bookings' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold-500/20 bg-navy-900 text-navy-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-900">
            <Hotel className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-cream">Krishna Hotel</p>
            <p className="text-sm text-navy-300">Comfort, Taste, and Celebrations</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-gold-300">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-navy-800 py-6 text-center text-xs text-navy-400">
        &copy; {new Date().getFullYear()} Krishna Hotel. All rights reserved.
      </div>
    </footer>
  );
}
