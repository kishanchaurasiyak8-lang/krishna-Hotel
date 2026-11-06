import { RotateCcw } from 'lucide-react';
import { ROOM_TYPES } from '@/types/hotel';
import { DEFAULT_ROOM_FILTERS, type RoomFilters } from '@/components/rooms/roomFilters';

interface RoomFilterBarProps {
  filters: RoomFilters;
  onChange: (next: RoomFilters) => void;
  resultCount: number;
}

interface ChipOption<T extends string | number> {
  value: T;
  label: string;
}

const FLOOR_OPTIONS: ChipOption<number>[] = [1, 2, 3, 4, 5, 6, 7].map((floor) => ({
  value: floor,
  label: `Floor ${floor}`,
}));

function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="label-base">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RoomFilterBar({ filters, onChange, resultCount }: RoomFilterBarProps) {
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_ROOM_FILTERS);

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ChipGroup
          label="Room Type"
          value={filters.roomType}
          options={[
            { value: 'all', label: 'All' },
            ...ROOM_TYPES.map((type) => ({ value: type, label: type })),
          ]}
          onSelect={(roomType) => onChange({ ...filters, roomType })}
        />
        <ChipGroup
          label="Climate"
          value={filters.climate}
          options={[
            { value: 'all', label: 'All' },
            { value: 'ac', label: 'AC' },
            { value: 'non-ac', label: 'Non-AC' },
          ]}
          onSelect={(climate) => onChange({ ...filters, climate })}
        />
        <ChipGroup
          label="Floor"
          value={filters.floor}
          options={[{ value: 'all' as const, label: 'All' }, ...FLOOR_OPTIONS]}
          onSelect={(floor) => onChange({ ...filters, floor })}
        />
        <ChipGroup
          label="Feature"
          value={filters.window}
          options={[
            { value: 'all', label: 'All' },
            { value: 'window', label: 'Window Room' },
            { value: 'non-window', label: 'Non-Window Room' },
          ]}
          onSelect={(window) => onChange({ ...filters, window })}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4">
        <p className="text-sm text-navy-600" aria-live="polite">
          Showing <span className="font-semibold text-navy-900">{resultCount}</span>{' '}
          {resultCount === 1 ? 'room' : 'rooms'}
          {filters.minGuests > 1 && ` for ${filters.minGuests} guests`}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_ROOM_FILTERS)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 transition hover:text-gold-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
