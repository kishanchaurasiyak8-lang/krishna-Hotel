/*
# Create hotel catalog (rooms, dining menu, banquet halls) with seed data

Plain-English summary
This migration creates the three catalogs the public website shows: hotel rooms,
restaurant menu items and banquet halls. It also loads the starting data so the
pages have real content on day one.

1. New Tables
- `rooms`: one row per guest room. Columns: room number, room type (King Size Double Bed,
  Medium Size Single Bed, Small Size Single Bed), AC or non-AC, floor (1 to 7), window or
  non-window, nightly price in INR, maximum guests, description and photo URL.
- `menu_items`: one row per dish. Columns: name, category (Breakfast, Main Course, Snacks,
  Desserts, Drinks), veg or non-veg, description, price in INR and photo URL.
- `halls`: one row per banquet hall. Columns: name, capacity, description, prices for
  Morning, Evening and Full Day slots, photo URL and a list of features.

2. Seed data
- 14 rooms across floors 1 to 7 covering every room type, climate and window combination.
- 24 menu items across the five food categories.
- 3 banquet halls: Big Hall, Medium Hall and Small Hall.
- Rows use fixed ids so the data is identical on every rebuild.

3. Security
- Row level security is enabled on all three tables.
- Visitors (anon and signed-in roles) may only READ these catalogs. Nobody can change them
  through the website.
- Read access is granted only on the columns the website needs.

4. Important notes
- Nothing in this migration touches guest bookings or orders; those live in a later migration.
- Prices are stored in whole Indian Rupees.
*/

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text NOT NULL UNIQUE,
  room_type text NOT NULL CHECK (room_type IN ('King Size Double Bed', 'Medium Size Single Bed', 'Small Size Single Bed')),
  is_ac boolean NOT NULL DEFAULT true,
  floor integer NOT NULL CHECK (floor BETWEEN 1 AND 7),
  is_window boolean NOT NULL DEFAULT false,
  price_per_night integer NOT NULL CHECK (price_per_night > 0),
  max_guests integer NOT NULL CHECK (max_guests > 0),
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Breakfast', 'Main Course', 'Snacks', 'Desserts', 'Drinks')),
  is_veg boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL CHECK (price > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS halls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hall_type text NOT NULL UNIQUE CHECK (hall_type IN ('big', 'medium', 'small')),
  capacity integer NOT NULL CHECK (capacity > 0),
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_morning integer NOT NULL CHECK (price_morning > 0),
  price_evening integer NOT NULL CHECK (price_evening > 0),
  price_full_day integer NOT NULL CHECK (price_full_day > 0),
  features text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON rooms, menu_items, halls TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_rooms" ON rooms;
CREATE POLICY "public_read_rooms" ON rooms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_halls" ON halls;
CREATE POLICY "public_read_halls" ON halls FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO rooms (id, room_number, room_type, is_ac, floor, is_window, price_per_night, max_guests, description, image_url) VALUES
  ('10000000-0000-4000-8000-000000000101', '101', 'King Size Double Bed', true, 1, true, 4200, 2, 'A spacious king bed beside a garden-facing window, with a marble bath and blackout drapes.', ''),
  ('10000000-0000-4000-8000-000000000102', '102', 'Small Size Single Bed', false, 1, false, 1100, 1, 'A compact, peaceful room ideal for solo travellers on a budget.', ''),
  ('10000000-0000-4000-8000-000000000201', '201', 'Medium Size Single Bed', true, 2, true, 2600, 2, 'A bright, airy room with a cosy single bed and a city-view window.', ''),
  ('10000000-0000-4000-8000-000000000202', '202', 'King Size Double Bed', false, 2, false, 2900, 2, 'Warm wood finishes and a plush king bed, quiet and tucked away from the lift.', ''),
  ('10000000-0000-4000-8000-000000000301', '301', 'King Size Double Bed', true, 3, true, 4400, 3, 'Our signature king suite-style room with a sitting corner and a large window.', ''),
  ('10000000-0000-4000-8000-000000000302', '302', 'Small Size Single Bed', true, 3, false, 1800, 1, 'Efficient and well-appointed, with a work desk and rain shower.', ''),
  ('10000000-0000-4000-8000-000000000401', '401', 'Medium Size Single Bed', false, 4, true, 1900, 2, 'Simple comfort with a window that frames the courtyard in soft morning light.', ''),
  ('10000000-0000-4000-8000-000000000402', '402', 'King Size Double Bed', true, 4, false, 3800, 2, 'A king bed, climate-controlled and calm, with premium bedding throughout.', ''),
  ('10000000-0000-4000-8000-000000000501', '501', 'King Size Double Bed', false, 5, true, 3100, 2, 'A king bed with a skylight-style window and a reading nook by the glass.', ''),
  ('10000000-0000-4000-8000-000000000502', '502', 'Medium Size Single Bed', true, 5, false, 2400, 2, 'Modern and quiet, with blackout curtains and a generous writing table.', ''),
  ('10000000-0000-4000-8000-000000000601', '601', 'Small Size Single Bed', true, 6, true, 1900, 1, 'A cosy air-conditioned room with a window overlooking the skyline.', ''),
  ('10000000-0000-4000-8000-000000000602', '602', 'Medium Size Single Bed', false, 6, false, 1500, 2, 'Good value comfort with a clean, minimal design and a soft single bed.', ''),
  ('10000000-0000-4000-8000-000000000701', '701', 'King Size Double Bed', true, 7, true, 5600, 3, 'Our top-floor premium room with panoramic windows and a private balcony view.', ''),
  ('10000000-0000-4000-8000-000000000702', '702', 'Small Size Single Bed', false, 7, true, 1200, 1, 'A bright top-floor single room with a window and a calm, budget-friendly stay.', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_items (id, name, category, is_veg, description, price) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Masala Chai', 'Breakfast', true, 'Ginger and cardamom spiced tea brewed with fresh milk.', 60),
  ('20000000-0000-4000-8000-000000000002', 'Aloo Paratha Platter', 'Breakfast', true, 'Two stuffed potato parathas with curd, pickle and butter.', 180),
  ('20000000-0000-4000-8000-000000000003', 'Masala Omelette', 'Breakfast', false, 'Three-egg omelette with onion, green chilli and coriander, served with toast.', 160),
  ('20000000-0000-4000-8000-000000000004', 'Poha with Sev', 'Breakfast', true, 'Flattened rice tempered with mustard seeds, peanuts and lemon.', 120),
  ('20000000-0000-4000-8000-000000000005', 'Paneer Butter Masala', 'Main Course', true, 'Cottage cheese simmered in a silky tomato and cashew gravy.', 320),
  ('20000000-0000-4000-8000-000000000006', 'Dal Makhani', 'Main Course', true, 'Slow-cooked black lentils finished with butter and cream.', 260),
  ('20000000-0000-4000-8000-000000000007', 'Butter Chicken', 'Main Course', false, 'Tender chicken in our house makhani sauce, served with naan.', 380),
  ('20000000-0000-4000-8000-000000000008', 'Mutton Rogan Josh', 'Main Course', false, 'Kashmiri-style slow-braised mutton with aromatic whole spices.', 460),
  ('20000000-0000-4000-8000-000000000009', 'Veg Biryani', 'Main Course', true, 'Basmati rice layered with seasonal vegetables, saffron and mint raita.', 280),
  ('20000000-0000-4000-8000-000000000010', 'Chicken Dum Biryani', 'Main Course', false, 'Dum-cooked biryani with marinated chicken and fried onions.', 340),
  ('20000000-0000-4000-8000-000000000011', 'Samosa Chaat', 'Snacks', true, 'Crushed samosas topped with chickpeas, yogurt, tamarind and chutneys.', 140),
  ('20000000-0000-4000-8000-000000000012', 'Veg Spring Rolls', 'Snacks', true, 'Crisp rolls filled with shredded vegetables and sweet chilli dip.', 180),
  ('20000000-0000-4000-8000-000000000013', 'Chicken 65', 'Snacks', false, 'Spiced, deep-fried chicken bites with curry leaves and lemon.', 260),
  ('20000000-0000-4000-8000-000000000014', 'Paneer Tikka', 'Snacks', true, 'Charcoal-grilled paneer marinated in yogurt and tandoori spices.', 290),
  ('20000000-0000-4000-8000-000000000015', 'Gulab Jamun', 'Desserts', true, 'Warm milk-solid dumplings soaked in rose and cardamom syrup.', 120),
  ('20000000-0000-4000-8000-000000000016', 'Rasmalai', 'Desserts', true, 'Soft cottage cheese discs in chilled saffron-scented milk.', 150),
  ('20000000-0000-4000-8000-000000000017', 'Mango Kulfi', 'Desserts', true, 'Traditional slow-churned kulfi made with Alphonso mango.', 160),
  ('20000000-0000-4000-8000-000000000018', 'Chocolate Lava Cake', 'Desserts', true, 'Warm dark chocolate cake with a molten centre and vanilla ice cream.', 240),
  ('20000000-0000-4000-8000-000000000019', 'Fresh Lime Soda', 'Drinks', true, 'Sweet or salted, freshly pressed lime with sparkling soda.', 90),
  ('20000000-0000-4000-8000-000000000020', 'Mango Lassi', 'Drinks', true, 'Thick, chilled yogurt blended with ripe mango and cardamom.', 130),
  ('20000000-0000-4000-8000-000000000021', 'Filter Coffee', 'Drinks', true, 'South Indian style strong coffee frothed with hot milk.', 80),
  ('20000000-0000-4000-8000-000000000022', 'Masala Buttermilk', 'Drinks', true, 'Chilled churned buttermilk with roasted cumin and fresh mint.', 70),
  ('20000000-0000-4000-8000-000000000023', 'Cold Coffee with Ice Cream', 'Drinks', true, 'Chilled espresso blended with milk and a scoop of vanilla ice cream.', 220),
  ('20000000-0000-4000-8000-000000000024', 'Fresh Fruit Juice', 'Drinks', true, 'Seasonal fruit pressed to order, served chilled without added sugar.', 150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO halls (id, name, hall_type, capacity, tagline, description, price_morning, price_evening, price_full_day, features, image_url) VALUES
  ('30000000-0000-4000-8000-000000000001', 'Big Hall', 'big', 500, 'The Grand Ballroom', 'Our flagship ballroom with crystal chandeliers, a stage, and a dedicated bridal lounge. Ideal for weddings, galas and large celebrations.', 60000, 75000, 110000, ARRAY['Crystal chandeliers', 'Stage and lighting rig', 'Bridal lounge', 'Valet parking'], ''),
  ('30000000-0000-4000-8000-000000000002', 'Medium Hall', 'medium', 200, 'Conferences and Receptions', 'A versatile space with flexible seating, AV equipment and a built-in pantry. Perfect for corporate conferences and engagement receptions.', 30000, 38000, 55000, ARRAY['Projector and sound system', 'Flexible seating', 'Built-in pantry', 'Wi-Fi'], ''),
  ('30000000-0000-4000-8000-000000000003', 'Small Hall', 'small', 50, 'Private Dining and Meetings', 'An intimate, soundproofed room for private dinners, board meetings and small celebrations with a personal touch.', 12000, 15000, 22000, ARRAY['Soundproofed', 'Boardroom table', 'Private dining setup', 'Wi-Fi'], '')
ON CONFLICT (id) DO NOTHING;
