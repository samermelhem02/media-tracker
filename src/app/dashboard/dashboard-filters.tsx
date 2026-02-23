import { MEDIA_TYPES, MEDIA_STATUSES } from "@/lib/db-types";

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
      className="mb-6 flex flex-wrap items-end gap-3"
    >
      <div>
        <label htmlFor="filter-q" className="mb-1 block text-sm font-medium">
          Search
        </label>
        <input
          id="filter-q"
          name="q"
          type="search"
          defaultValue={initialQ}
          placeholder="Title..."
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="filter-status" className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id="filter-status"
          name="status"
          defaultValue={initialStatus ?? ""}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="">All</option>
          {MEDIA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-media_type" className="mb-1 block text-sm font-medium">
          Type
        </label>
        <select
          id="filter-media_type"
          name="media_type"
          defaultValue={initialMediaType ?? ""}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
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
        className="rounded bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
      >
        Apply
      </button>
    </form>
  );
}
