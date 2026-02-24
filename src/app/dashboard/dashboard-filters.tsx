import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";
import { CustomSelect } from "@/components/ui/custom-select";

const inputClass =
  "w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors";

export function DashboardFilters({
  initialQ,
  initialStatus,
  initialMediaType,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  typeValue,
  onTypeChange,
  onClearFilters,
  hasActiveFilters,
}: {
  initialQ?: string;
  initialStatus?: string;
  initialMediaType?: string;
  /** Client-side filtering: when provided, filters update instantly (no form submit). */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  typeValue?: string;
  onTypeChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}) {
  const isClientFiltering =
    searchValue !== undefined &&
    onSearchChange != null &&
    statusValue !== undefined &&
    onStatusChange != null &&
    typeValue !== undefined &&
    onTypeChange != null;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
      <div className="min-w-0 flex-1 sm:max-w-[200px]">
        <label htmlFor="filter-q" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Search
        </label>
        <input
          id="filter-q"
          type="search"
          value={isClientFiltering ? searchValue : undefined}
          defaultValue={isClientFiltering ? undefined : initialQ}
          placeholder="Title..."
          className={inputClass}
          onChange={isClientFiltering ? (e) => onSearchChange(e.target.value) : undefined}
          autoComplete="off"
        />
      </div>
      {isClientFiltering ? (
        <>
          <CustomSelect
            id="filter-status"
            label="Status"
            value={statusValue}
            onChange={onStatusChange}
            options={MEDIA_STATUSES}
            placeholder="All"
            openUp
          />
          <CustomSelect
            id="filter-media_type"
            label="Type"
            value={typeValue}
            onChange={onTypeChange}
            options={MEDIA_TYPES}
            placeholder="All"
            openUp
          />
        </>
      ) : (
        <>
      <div className="min-w-0 flex-1 sm:max-w-[140px]">
        <label htmlFor="filter-status" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Status
        </label>
        <select id="filter-status" defaultValue={initialStatus ?? ""} className={inputClass}>
          <option value="">All</option>
          {MEDIA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0 flex-1 sm:max-w-[140px]">
        <label htmlFor="filter-media_type" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Type
        </label>
        <select id="filter-media_type" defaultValue={initialMediaType ?? ""} className={inputClass}>
          <option value="">All</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
        </>
      )}
      {isClientFiltering && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 sm:w-auto ${
            hasActiveFilters
              ? "bg-white/10 text-zinc-200 hover:bg-white/20 border border-white/20"
              : "cursor-default border border-zinc-600 bg-zinc-800/50 text-zinc-500"
          }`}
          disabled={!hasActiveFilters}
          aria-label="Clear all filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
