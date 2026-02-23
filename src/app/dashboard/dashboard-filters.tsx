import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";

const inputClass =
  "w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors";

export function DashboardFilters({
  initialQ,
  initialStatus,
  initialMediaType,
  action = "/library",
}: {
  initialQ?: string;
  initialStatus?: string;
  initialMediaType?: string;
  action?: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3"
    >
      <div className="min-w-0 flex-1 sm:max-w-[200px]">
        <label htmlFor="filter-q" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Search
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={initialQ}
          placeholder="Title..."
          className={inputClass}
        />
      </div>
      <div className="min-w-0 flex-1 sm:max-w-[140px]">
        <label htmlFor="filter-status" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Status
        </label>
        <select
          id="filter-status"
          name="status"
          defaultValue={initialStatus ?? ""}
          className={inputClass}
        >
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
        <select
          id="filter-media_type"
          name="media_type"
          defaultValue={initialMediaType ?? ""}
          className={inputClass}
        >
          <option value="">All</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 sm:w-auto"
      >
        Apply filters
      </button>
    </form>
  );
}
