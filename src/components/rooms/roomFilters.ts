import type { Room, RoomType } from '@/types/hotel';

export type ClimateFilter = 'all' | 'ac' | 'non-ac';
export type WindowFilter = 'all' | 'window' | 'non-window';

export interface RoomFilters {
  roomType: RoomType | 'all';
  climate: ClimateFilter;
  floor: number | 'all';
  window: WindowFilter;
  minGuests: number;
}

export const DEFAULT_ROOM_FILTERS: RoomFilters = {
  roomType: 'all',
  climate: 'all',
  floor: 'all',
  window: 'all',
  minGuests: 1,
};

export function applyRoomFilters(rooms: Room[], filters: RoomFilters): Room[] {
  return rooms.filter(
    (room) =>
      (filters.roomType === 'all' || room.room_type === filters.roomType) &&
      (filters.climate === 'all' || (filters.climate === 'ac') === room.is_ac) &&
      (filters.floor === 'all' || room.floor === filters.floor) &&
      (filters.window === 'all' || (filters.window === 'window') === room.is_window) &&
      room.max_guests >= filters.minGuests,
  );
}
