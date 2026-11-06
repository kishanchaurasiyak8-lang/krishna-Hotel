/*
# Create guest bookings, food orders and contact messages tables

Plain-English summary
This migration creates the tables that store what guests do on the website: room and
banquet hall bookings, restaurant food orders and contact messages. Bookings and food
orders are protected so that the public website cannot read or edit other guests' records
directly. They can only be written or looked up through secure functions added in the next
migration, which check availability and calculate prices on the server.

1. New Tables
- `bookings`: one row per room stay or banquet hall reservation. Stores a booking reference
  (for example KH-A1B2C3), the guest's name, email, phone, dates or time slot, number of
  guests, total amount in INR and status.
- `food_orders`: one row per restaurant order. Stores the reference, the ordered items as a
  list, subtotal, tax (5 percent), total and the customer's name and phone.
- `contact_messages`: one row per message sent from the Contact section.

2. Security
- Row level security is enabled on all three tables.
- `bookings` and `food_orders` have NO direct access for website visitors. Reads and writes
  go through functions only.
- `contact_messages` allows visitors to INSERT a message only. Visitors cannot read messages
  back. Length checks limit abuse.

3. Important notes
- Each booking is either a room stay (check-out after check-in, room set) or a hall
  reservation (single date, time slot set). The database enforces this shape.
- Indexes were added on room and hall dates to keep availability checks fast.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  booking_type text NOT NULL CHECK (booking_type IN ('room', 'hall')),
  room_id uuid REFERENCES rooms(id) ON DELETE RESTRICT,
  hall_id uuid REFERENCES halls(id) ON DELETE RESTRICT,
  check_in date NOT NULL,
  check_out date NOT NULL,
  time_slot text CHECK (time_slot IN ('Morning', 'Evening', 'Full Day')),
  guests integer NOT NULL CHECK (guests > 0),
  guest_name text NOT NULL CHECK (char_length(guest_name) BETWEEN 2 AND 120),
  guest_email text NOT NULL CHECK (char_length(guest_email) <= 254 AND guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  guest_phone text NOT NULL CHECK (char_length(guest_phone) BETWEEN 7 AND 20),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
  total_amount integer NOT NULL CHECK (total_amount > 0),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (booking_type = 'room' AND room_id IS NOT NULL AND hall_id IS NULL AND check_out > check_in AND time_slot IS NULL)
    OR
    (booking_type = 'hall' AND hall_id IS NOT NULL AND room_id IS NULL AND time_slot IS NOT NULL AND check_out = check_in)
  )
);

CREATE INDEX IF NOT EXISTS bookings_room_dates_idx ON bookings (room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS bookings_hall_dates_idx ON bookings (hall_id, check_in);
CREATE INDEX IF NOT EXISTS bookings_reference_idx ON bookings (reference);

CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  subtotal integer NOT NULL CHECK (subtotal > 0),
  tax integer NOT NULL CHECK (tax >= 0),
  total integer NOT NULL CHECK (total > 0),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 120),
  customer_phone text NOT NULL CHECK (char_length(customer_phone) BETWEEN 7 AND 20),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'served', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON contact_messages TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
