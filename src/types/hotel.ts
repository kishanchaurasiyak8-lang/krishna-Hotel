export const ROOM_TYPES = [
  'King Size Double Bed',
  'Medium Size Single Bed',
  'Small Size Single Bed',
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export interface Room {
  id: string;
  room_number: string;
  room_type: RoomType;
  is_ac: boolean;
  floor: number;
  is_window: boolean;
  price_per_night: number;
  max_guests: number;
  description: string;
  image_url: string;
}

export const MENU_CATEGORIES = ['All', 'Breakfast', 'Main Course', 'Snacks', 'Desserts', 'Drinks'] as const;

export type MenuCategory = Exclude<(typeof MENU_CATEGORIES)[number], 'All'>;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  is_veg: boolean;
  description: string;
  price: number;
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
}

export type HallType = 'big' | 'medium' | 'small';

export const TIME_SLOTS = ['Morning', 'Evening', 'Full Day'] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export interface Hall {
  id: string;
  name: string;
  hall_type: HallType;
  capacity: number;
  tagline: string;
  description: string;
  price_morning: number;
  price_evening: number;
  price_full_day: number;
  features: string[];
  image_url: string;
}

export interface RoomBookingInput {
  bookingType: 'room';
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
}

export interface HallBookingInput {
  bookingType: 'hall';
  hallId: string;
  date: string;
  timeSlot: TimeSlot;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
}

export type BookingInput = RoomBookingInput | HallBookingInput;

export interface BookingReceipt {
  reference: string;
  total: number;
}

export interface FoodOrderInput {
  customerName: string;
  customerPhone: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface FoodOrderReceipt {
  reference: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface FoundBooking {
  reference: string;
  bookingType: 'room' | 'hall';
  roomNumber: string | null;
  roomType: string | null;
  hallName: string | null;
  checkIn: string;
  checkOut: string;
  timeSlot: TimeSlot | null;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface RoomSearchCriteria {
  checkIn: string;
  checkOut: string;
  roomType: RoomType | 'all';
  guests: number;
  submittedAt: number;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}
