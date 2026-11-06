/*
# Add secure booking, food order and guest lookup functions

Plain-English summary
Website visitors cannot write to bookings or food orders directly. Instead, the website calls
these functions, which run on the server and perform every check before saving anything:
- Room stays: dates must be valid and in the future, guest count must fit the room, the room
  must be free for those nights, and the total is calculated from the room's price plus 12%
  GST.
- Hall reservations: the date and time slot must be valid, guest count must fit the hall, and
  the slot must not clash with an existing booking (a Full Day booking clashes with both
  Morning and Evening). The total uses the hall's price for that slot plus 12% GST.
- Food orders: prices are read from the menu on the server, never trusted from the browser.
  Tax is 5 percent.
- Booking lookup: a guest can only see a booking when they provide BOTH the exact reference
  and the email address used to book.

1. New Functions
- `create_booking`: creates a room stay or hall reservation and returns the reference and total.
- `create_food_order`: creates a restaurant order and returns the reference, subtotal, tax and total.
- `find_bookings`: returns the bookings matching a reference and email pair.

2. Security
- Each function runs with the owner's rights so it can write to the protected tables, and uses
  a fixed search path to prevent hijacking.
- Only the website roles (anon and authenticated) may run them. The PUBLIC default is removed.
- Input is validated inside the function so bad or tampered data is rejected with a clear message.

3. Important notes
- Functions are the only write path for bookings and food orders. No table grants were added.
- Booking references are generated on the server and are unique.
*/

CREATE OR REPLACE FUNCTION public.create_booking(
  p_booking_type text,
  p_room_id uuid,
  p_hall_id uuid,
  p_check_in date,
  p_check_out date,
  p_time_slot text,
  p_guests integer,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_notes text
)
RETURNS TABLE (out_reference text, out_total integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reference text := 'KH-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  v_total integer;
  v_room rooms%ROWTYPE;
  v_hall halls%ROWTYPE;
  v_nights integer;
BEGIN
  IF p_guest_name IS NULL OR char_length(trim(p_guest_name)) < 2 THEN
    RAISE EXCEPTION 'Please enter the guest name.';
  END IF;
  IF p_guest_email IS NULL OR p_guest_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF p_guest_phone IS NULL OR char_length(trim(p_guest_phone)) < 7 THEN
    RAISE EXCEPTION 'Please enter a valid phone number.';
  END IF;
  IF p_guests IS NULL OR p_guests < 1 THEN
    RAISE EXCEPTION 'At least one guest is required.';
  END IF;
  IF p_check_in IS NULL OR p_check_in < CURRENT_DATE THEN
    RAISE EXCEPTION 'Please choose a date that is today or later.';
  END IF;

  IF p_booking_type = 'room' THEN
    SELECT * INTO v_room FROM rooms WHERE id = p_room_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'The selected room could not be found.';
    END IF;
    IF p_check_out IS NULL OR p_check_out <= p_check_in THEN
      RAISE EXCEPTION 'Check-out must be after check-in.';
    END IF;
    IF p_guests > v_room.max_guests THEN
      RAISE EXCEPTION 'This room accommodates up to % guests.', v_room.max_guests;
    END IF;
    IF EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.room_id = p_room_id
        AND b.status = 'confirmed'
        AND b.check_in < p_check_out
        AND b.check_out > p_check_in
    ) THEN
      RAISE EXCEPTION 'This room is already booked for the selected dates.';
    END IF;

    v_nights := p_check_out - p_check_in;
    v_total := round(v_room.price_per_night * v_nights * 1.12);

    INSERT INTO bookings (reference, booking_type, room_id, check_in, check_out, guests,
                          guest_name, guest_email, guest_phone, notes, total_amount)
    VALUES (v_reference, 'room', p_room_id, p_check_in, p_check_out, p_guests,
            trim(p_guest_name), lower(trim(p_guest_email)), trim(p_guest_phone),
            left(coalesce(p_notes, ''), 1000), v_total);

  ELSIF p_booking_type = 'hall' THEN
    SELECT * INTO v_hall FROM halls WHERE id = p_hall_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'The selected hall could not be found.';
    END IF;
    IF p_time_slot IS NULL OR p_time_slot NOT IN ('Morning', 'Evening', 'Full Day') THEN
      RAISE EXCEPTION 'Please choose a time slot.';
    END IF;
    IF p_guests > v_hall.capacity THEN
      RAISE EXCEPTION 'This hall holds up to % guests.', v_hall.capacity;
    END IF;
    IF EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.hall_id = p_hall_id
        AND b.status = 'confirmed'
        AND b.check_in = p_check_in
        AND (b.time_slot = p_time_slot OR b.time_slot = 'Full Day' OR p_time_slot = 'Full Day')
    ) THEN
      RAISE EXCEPTION 'This hall is already reserved for that time slot.';
    END IF;

    v_total := round(
      CASE p_time_slot
        WHEN 'Morning' THEN v_hall.price_morning
        WHEN 'Evening' THEN v_hall.price_evening
        ELSE v_hall.price_full_day
      END * 1.12
    );

    INSERT INTO bookings (reference, booking_type, hall_id, check_in, check_out, time_slot, guests,
                          guest_name, guest_email, guest_phone, notes, total_amount)
    VALUES (v_reference, 'hall', p_hall_id, p_check_in, p_check_in, p_time_slot, p_guests,
            trim(p_guest_name), lower(trim(p_guest_email)), trim(p_guest_phone),
            left(coalesce(p_notes, ''), 1000), v_total);

  ELSE
    RAISE EXCEPTION 'Unknown booking type.';
  END IF;

  RETURN QUERY SELECT v_reference, v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_food_order(
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb
)
RETURNS TABLE (out_reference text, out_subtotal integer, out_tax integer, out_total integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reference text := 'FO-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  v_item jsonb;
  v_menu menu_items%ROWTYPE;
  v_qty integer;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_tax integer;
BEGIN
  IF p_customer_name IS NULL OR char_length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Please enter your name for the order.';
  END IF;
  IF p_customer_phone IS NULL OR char_length(trim(p_customer_phone)) < 7 THEN
    RAISE EXCEPTION 'Please enter a valid phone number.';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your order is empty.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 20 THEN
      RAISE EXCEPTION 'Each item quantity must be between 1 and 20.';
    END IF;
    SELECT * INTO v_menu FROM menu_items WHERE id = (v_item->>'menu_item_id')::uuid;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'One of the selected dishes is no longer available.';
    END IF;
    v_lines := v_lines || jsonb_build_object(
      'menu_item_id', v_menu.id,
      'name', v_menu.name,
      'price', v_menu.price,
      'quantity', v_qty
    );
    v_subtotal := v_subtotal + v_menu.price * v_qty;
  END LOOP;

  v_tax := round(v_subtotal * 0.05);

  INSERT INTO food_orders (reference, items, subtotal, tax, total, customer_name, customer_phone)
  VALUES (v_reference, v_lines, v_subtotal, v_tax, v_subtotal + v_tax,
          trim(p_customer_name), trim(p_customer_phone));

  RETURN QUERY SELECT v_reference, v_subtotal, v_tax, v_subtotal + v_tax;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_bookings(p_reference text, p_email text)
RETURNS TABLE (
  out_reference text,
  out_booking_type text,
  out_room_number text,
  out_room_type text,
  out_hall_name text,
  out_check_in date,
  out_check_out date,
  out_time_slot text,
  out_guests integer,
  out_total_amount integer,
  out_status text,
  out_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT b.reference, b.booking_type, r.room_number, r.room_type, h.name,
         b.check_in, b.check_out, b.time_slot, b.guests, b.total_amount, b.status, b.created_at
  FROM bookings b
  LEFT JOIN rooms r ON r.id = b.room_id
  LEFT JOIN halls h ON h.id = b.hall_id
  WHERE b.reference = upper(trim(coalesce(p_reference, '')))
    AND lower(b.guest_email) = lower(trim(coalesce(p_email, '')))
  ORDER BY b.check_in DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_booking(text, uuid, uuid, date, date, text, integer, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking(text, uuid, uuid, date, date, text, integer, text, text, text, text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.create_food_order(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_food_order(text, text, jsonb) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.find_bookings(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_bookings(text, text) TO anon, authenticated;
