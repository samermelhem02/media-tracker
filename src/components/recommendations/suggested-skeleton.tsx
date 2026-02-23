export function SuggestedSkeleton() {
  return (
    <section>
      <h2 className="mt-section-heading">Suggested for you</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex h-[420px] animate-pulse flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900"
          >
            <div className="aspect-[2/3] w-full shrink-0 bg-zinc-800" />
            <div className="flex flex-col p-2">
              <div className="h-4 w-3/4 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
