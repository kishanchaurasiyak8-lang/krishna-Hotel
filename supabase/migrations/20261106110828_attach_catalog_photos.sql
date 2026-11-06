/*
# Attach hotel photos to room types and banquet halls

Plain-English summary
Adds a photo to each room type and each banquet hall so the room cards and hall cards look
complete. Only the photo web addresses change; no prices, guests or bookings are touched.

1. Modified Tables
- `rooms.image_url`: set for every room based on its room type (King, Medium Single, Small Single).
- `halls.image_url`: set for Big Hall, Medium Hall and Small Hall.

2. Security
- No access rules change.

3. Important notes
- Rows are matched by stable values (room type and hall type), so this is safe on a rebuild.
*/

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/6876834/pexels-photo-6876834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE room_type = 'King Size Double Bed';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/39333414/pexels-photo-39333414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE room_type = 'Medium Size Single Bed';

UPDATE rooms SET image_url = 'https://images.pexels.com/photos/189293/pexels-photo-189293.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE room_type = 'Small Size Single Bed';

UPDATE halls SET image_url = 'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE hall_type = 'big';

UPDATE halls SET image_url = 'https://images.pexels.com/photos/15621210/pexels-photo-15621210.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE hall_type = 'medium';

UPDATE halls SET image_url = 'https://images.pexels.com/photos/27138849/pexels-photo-27138849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE hall_type = 'small';
