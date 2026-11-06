import type { Hall, MenuCategory, MenuItem, Room, RoomType } from '@/types/hotel';

const ROOM_IMAGES: Record<RoomType, string> = {
  'King Size Double Bed':
    'https://images.pexels.com/photos/6876834/pexels-photo-6876834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Medium Size Single Bed':
    'https://images.pexels.com/photos/39333414/pexels-photo-39333414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'Small Size Single Bed':
    'https://images.pexels.com/photos/189293/pexels-photo-189293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

type RoomRow = [id: string, number: string, type: RoomType, ac: boolean, floor: number, window: boolean, price: number, guests: number, description: string];

const ROOM_ROWS: RoomRow[] = [
  ['10000000-0000-4000-8000-000000000101', '101', 'King Size Double Bed', true, 1, true, 4200, 2, 'A spacious king bed beside a garden-facing window, with a marble bath and blackout drapes.'],
  ['10000000-0000-4000-8000-000000000102', '102', 'Small Size Single Bed', false, 1, false, 1100, 1, 'A compact, peaceful room ideal for solo travellers on a budget.'],
  ['10000000-0000-4000-8000-000000000201', '201', 'Medium Size Single Bed', true, 2, true, 2600, 2, 'A bright, airy room with a cosy single bed and a city-view window.'],
  ['10000000-0000-4000-8000-000000000202', '202', 'King Size Double Bed', false, 2, false, 2900, 2, 'Warm wood finishes and a plush king bed, quiet and tucked away from the lift.'],
  ['10000000-0000-4000-8000-000000000301', '301', 'King Size Double Bed', true, 3, true, 4400, 3, 'Our signature king suite-style room with a sitting corner and a large window.'],
  ['10000000-0000-4000-8000-000000000302', '302', 'Small Size Single Bed', true, 3, false, 1800, 1, 'Efficient and well-appointed, with a work desk and rain shower.'],
  ['10000000-0000-4000-8000-000000000401', '401', 'Medium Size Single Bed', false, 4, true, 1900, 2, 'Simple comfort with a window that frames the courtyard in soft morning light.'],
  ['10000000-0000-4000-8000-000000000402', '402', 'King Size Double Bed', true, 4, false, 3800, 2, 'A king bed, climate-controlled and calm, with premium bedding throughout.'],
  ['10000000-0000-4000-8000-000000000501', '501', 'King Size Double Bed', false, 5, true, 3100, 2, 'A king bed with a skylight-style window and a reading nook by the glass.'],
  ['10000000-0000-4000-8000-000000000502', '502', 'Medium Size Single Bed', true, 5, false, 2400, 2, 'Modern and quiet, with blackout curtains and a generous writing table.'],
  ['10000000-0000-4000-8000-000000000601', '601', 'Small Size Single Bed', true, 6, true, 1900, 1, 'A cosy air-conditioned room with a window overlooking the skyline.'],
  ['10000000-0000-4000-8000-000000000602', '602', 'Medium Size Single Bed', false, 6, false, 1500, 2, 'Good value comfort with a clean, minimal design and a soft single bed.'],
  ['10000000-0000-4000-8000-000000000701', '701', 'King Size Double Bed', true, 7, true, 5600, 3, 'Our top-floor premium room with panoramic windows and a private balcony view.'],
  ['10000000-0000-4000-8000-000000000702', '702', 'Small Size Single Bed', false, 7, true, 1200, 1, 'A bright top-floor single room with a window and a calm, budget-friendly stay.'],
];

export const MOCK_ROOMS: Room[] = ROOM_ROWS.map(([id, room_number, room_type, is_ac, floor, is_window, price_per_night, max_guests, description]) => ({
  id,
  room_number,
  room_type,
  is_ac,
  floor,
  is_window,
  price_per_night,
  max_guests,
  description,
  image_url: ROOM_IMAGES[room_type],
}));

type MenuRow = [id: string, name: string, category: MenuCategory, veg: boolean, description: string, price: number];

const MENU_ROWS: MenuRow[] = [
  ['20000000-0000-4000-8000-000000000001', 'Masala Chai', 'Breakfast', true, 'Ginger and cardamom spiced tea brewed with fresh milk.', 60],
  ['20000000-0000-4000-8000-000000000002', 'Aloo Paratha Platter', 'Breakfast', true, 'Two stuffed potato parathas with curd, pickle and butter.', 180],
  ['20000000-0000-4000-8000-000000000003', 'Masala Omelette', 'Breakfast', false, 'Three-egg omelette with onion, green chilli and coriander, served with toast.', 160],
  ['20000000-0000-4000-8000-000000000004', 'Poha with Sev', 'Breakfast', true, 'Flattened rice tempered with mustard seeds, peanuts and lemon.', 120],
  ['20000000-0000-4000-8000-000000000005', 'Paneer Butter Masala', 'Main Course', true, 'Cottage cheese simmered in a silky tomato and cashew gravy.', 320],
  ['20000000-0000-4000-8000-000000000006', 'Dal Makhani', 'Main Course', true, 'Slow-cooked black lentils finished with butter and cream.', 260],
  ['20000000-0000-4000-8000-000000000007', 'Butter Chicken', 'Main Course', false, 'Tender chicken in our house makhani sauce, served with naan.', 380],
  ['20000000-0000-4000-8000-000000000008', 'Mutton Rogan Josh', 'Main Course', false, 'Kashmiri-style slow-braised mutton with aromatic whole spices.', 460],
  ['20000000-0000-4000-8000-000000000009', 'Veg Biryani', 'Main Course', true, 'Basmati rice layered with seasonal vegetables, saffron and mint raita.', 280],
  ['20000000-0000-4000-8000-000000000010', 'Chicken Dum Biryani', 'Main Course', false, 'Dum-cooked biryani with marinated chicken and fried onions.', 340],
  ['20000000-0000-4000-8000-000000000011', 'Samosa Chaat', 'Snacks', true, 'Crushed samosas topped with chickpeas, yogurt, tamarind and chutneys.', 140],
  ['20000000-0000-4000-8000-000000000012', 'Veg Spring Rolls', 'Snacks', true, 'Crisp rolls filled with shredded vegetables and sweet chilli dip.', 180],
  ['20000000-0000-4000-8000-000000000013', 'Chicken 65', 'Snacks', false, 'Spiced, deep-fried chicken bites with curry leaves and lemon.', 260],
  ['20000000-0000-4000-8000-000000000014', 'Paneer Tikka', 'Snacks', true, 'Charcoal-grilled paneer marinated in yogurt and tandoori spices.', 290],
  ['20000000-0000-4000-8000-000000000015', 'Gulab Jamun', 'Desserts', true, 'Warm milk-solid dumplings soaked in rose and cardamom syrup.', 120],
  ['20000000-0000-4000-8000-000000000016', 'Rasmalai', 'Desserts', true, 'Soft cottage cheese discs in chilled saffron-scented milk.', 150],
  ['20000000-0000-4000-8000-000000000017', 'Mango Kulfi', 'Desserts', true, 'Traditional slow-churned kulfi made with Alphonso mango.', 160],
  ['20000000-0000-4000-8000-000000000018', 'Chocolate Lava Cake', 'Desserts', true, 'Warm dark chocolate cake with a molten centre and vanilla ice cream.', 240],
  ['20000000-0000-4000-8000-000000000019', 'Fresh Lime Soda', 'Drinks', true, 'Sweet or salted, freshly pressed lime with sparkling soda.', 90],
  ['20000000-0000-4000-8000-000000000020', 'Mango Lassi', 'Drinks', true, 'Thick, chilled yogurt blended with ripe mango and cardamom.', 130],
  ['20000000-0000-4000-8000-000000000021', 'Filter Coffee', 'Drinks', true, 'South Indian style strong coffee frothed with hot milk.', 80],
  ['20000000-0000-4000-8000-000000000022', 'Masala Buttermilk', 'Drinks', true, 'Chilled churned buttermilk with roasted cumin and fresh mint.', 70],
  ['20000000-0000-4000-8000-000000000023', 'Cold Coffee with Ice Cream', 'Drinks', true, 'Chilled espresso blended with milk and a scoop of vanilla ice cream.', 220],
  ['20000000-0000-4000-8000-000000000024', 'Fresh Fruit Juice', 'Drinks', true, 'Seasonal fruit pressed to order, served chilled without added sugar.', 150],
];

export const MOCK_MENU_ITEMS: MenuItem[] = MENU_ROWS.map(([id, name, category, is_veg, description, price]) => ({
  id,
  name,
  category,
  is_veg,
  description,
  price,
}));

export const MOCK_HALLS: Hall[] = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    name: 'Big Hall',
    hall_type: 'big',
    capacity: 500,
    tagline: 'The Grand Ballroom',
    description: 'Our flagship ballroom with crystal chandeliers, a stage, and a dedicated bridal lounge. Ideal for weddings, galas and large celebrations.',
    price_morning: 60000,
    price_evening: 75000,
    price_full_day: 110000,
    features: ['Crystal chandeliers', 'Stage and lighting rig', 'Bridal lounge', 'Valet parking'],
    image_url: 'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    name: 'Medium Hall',
    hall_type: 'medium',
    capacity: 200,
    tagline: 'Conferences and Receptions',
    description: 'A versatile space with flexible seating, AV equipment and a built-in pantry. Perfect for corporate conferences and engagement receptions.',
    price_morning: 30000,
    price_evening: 38000,
    price_full_day: 55000,
    features: ['Projector and sound system', 'Flexible seating', 'Built-in pantry', 'Wi-Fi'],
    image_url: 'https://images.pexels.com/photos/15621210/pexels-photo-15621210.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    name: 'Small Hall',
    hall_type: 'small',
    capacity: 50,
    tagline: 'Private Dining and Meetings',
    description: 'An intimate, soundproofed room for private dinners, board meetings and small celebrations with a personal touch.',
    price_morning: 12000,
    price_evening: 15000,
    price_full_day: 22000,
    features: ['Soundproofed', 'Boardroom table', 'Private dining setup', 'Wi-Fi'],
    image_url: 'https://images.pexels.com/photos/27138849/pexels-photo-27138849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];
