import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { MOCK_HALLS, MOCK_MENU_ITEMS, MOCK_ROOMS } from '@/data/mockCatalog';
import type {
  BookingInput,
  BookingReceipt,
  ContactMessageInput,
  FoodOrderInput,
  FoodOrderReceipt,
  FoundBooking,
  Hall,
  MenuItem,
  Room,
  TimeSlot,
} from '@/types/hotel';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

interface FoundBookingRow {
  out_reference: string;
  out_booking_type: 'room' | 'hall';
  out_room_number: string | null;
  out_room_type: string | null;
  out_hall_name: string | null;
  out_check_in: string;
  out_check_out: string;
  out_time_slot: TimeSlot | null;
  out_guests: number;
  out_total_amount: number;
  out_status: 'confirmed' | 'cancelled';
  out_created_at: string;
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('The booking service is not connected yet. Please try again shortly.');
  }
  return supabase;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

async function loadCatalog<T>(
  path: string,
  fallback: T[],
  fromSupabase: (client: SupabaseClient) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  try {
    let rows: T[] | null;
    if (API_BASE_URL) {
      rows = await requestJson<T[]>(path);
    } else {
      const { data, error } = await fromSupabase(getSupabase());
      if (error) throw new Error(error.message);
      rows = data;
    }
    if (!Array.isArray(rows)) throw new Error(`Unexpected response for ${path}`);
    return rows;
  } catch (error) {
    console.warn(`Showing built-in data for ${path}.`, error);
    return fallback;
  }
}

export function getRooms(): Promise<Room[]> {
  return loadCatalog('/rooms', MOCK_ROOMS, (client) =>
    client.from('rooms').select('*').order('floor').order('room_number'),
  );
}

export function getMenuItems(): Promise<MenuItem[]> {
  return loadCatalog('/menu-items', MOCK_MENU_ITEMS, (client) =>
    client.from('menu_items').select('*').order('created_at'),
  );
}

export function getHalls(): Promise<Hall[]> {
  return loadCatalog('/halls', MOCK_HALLS, (client) =>
    client.from('halls').select('*').order('capacity', { ascending: false }),
  );
}

function toBookingParams(input: BookingInput) {
  const shared = {
    p_guests: input.guests,
    p_guest_name: input.guestName.trim(),
    p_guest_email: input.guestEmail.trim(),
    p_guest_phone: input.guestPhone.trim(),
    p_notes: input.notes.trim(),
  };
  if (input.bookingType === 'room') {
    return {
      ...shared,
      p_booking_type: 'room',
      p_room_id: input.roomId,
      p_hall_id: null,
      p_check_in: input.checkIn,
      p_check_out: input.checkOut,
      p_time_slot: null,
    };
  }
  return {
    ...shared,
    p_booking_type: 'hall',
    p_room_id: null,
    p_hall_id: input.hallId,
    p_check_in: input.date,
    p_check_out: input.date,
    p_time_slot: input.timeSlot,
  };
}

export async function createBooking(input: BookingInput): Promise<BookingReceipt> {
  const params = toBookingParams(input);
  if (API_BASE_URL) {
    return requestJson<BookingReceipt>('/bookings', { method: 'POST', body: JSON.stringify(params) });
  }
  const { data, error } = await getSupabase().rpc('create_booking', params);
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || typeof row.out_reference !== 'string') {
    throw new Error('The booking could not be confirmed. Please try again.');
  }
  return { reference: row.out_reference, total: Number(row.out_total) };
}

export async function createFoodOrder(input: FoodOrderInput): Promise<FoodOrderReceipt> {
  const params = {
    p_customer_name: input.customerName.trim(),
    p_customer_phone: input.customerPhone.trim(),
    p_items: input.items.map((line) => ({ menu_item_id: line.menuItemId, quantity: line.quantity })),
  };
  if (API_BASE_URL) {
    return requestJson<FoodOrderReceipt>('/food-orders', { method: 'POST', body: JSON.stringify(params) });
  }
  const { data, error } = await getSupabase().rpc('create_food_order', params);
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || typeof row.out_reference !== 'string') {
    throw new Error('Your order could not be placed. Please try again.');
  }
  return {
    reference: row.out_reference,
    subtotal: Number(row.out_subtotal),
    tax: Number(row.out_tax),
    total: Number(row.out_total),
  };
}

export async function findBookings(reference: string, email: string): Promise<FoundBooking[]> {
  if (API_BASE_URL) {
    const query = new URLSearchParams({ reference: reference.trim(), email: email.trim() });
    return requestJson<FoundBooking[]>(`/bookings?${query.toString()}`);
  }
  const { data, error } = await getSupabase().rpc('find_bookings', {
    p_reference: reference.trim(),
    p_email: email.trim(),
  });
  if (error) throw new Error(error.message);
  const rows: FoundBookingRow[] = Array.isArray(data) ? data : [];
  return rows.map((row) => ({
    reference: row.out_reference,
    bookingType: row.out_booking_type,
    roomNumber: row.out_room_number,
    roomType: row.out_room_type,
    hallName: row.out_hall_name,
    checkIn: row.out_check_in,
    checkOut: row.out_check_out,
    timeSlot: row.out_time_slot,
    guests: row.out_guests,
    totalAmount: row.out_total_amount,
    status: row.out_status,
    createdAt: row.out_created_at,
  }));
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const message = {
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  };
  if (API_BASE_URL) {
    await requestJson<unknown>('/contact-messages', { method: 'POST', body: JSON.stringify(message) });
    return;
  }
  const { error } = await getSupabase().from('contact_messages').insert(message);
  if (error) throw new Error(error.message);
}
