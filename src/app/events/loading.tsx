export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-6 w-32 border-2 border-ink bg-surface-2" />

      {/* Header Skeleton */}
      <div className="border-4 border-ink bg-paper p-8 shadow-[8px_8px_0_0_var(--color-ink)] space-y-4">
        <div className="h-4 w-48 bg-surface-2" />
        <div className="h-14 w-80 bg-surface-2" />
        <div className="h-12 w-full max-w-xl bg-surface-2" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex border-4 border-ink bg-paper"
          >
            <div className="w-12 border-r-4 border-dashed border-ink bg-surface-2" />
            <div className="flex-1 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-surface-2" />
                <div className="h-4 w-16 bg-surface-2" />
              </div>
              <div className="h-8 w-3/4 bg-surface-2" />
              <div className="h-10 w-full bg-surface-2" />
              <div className="h-10 w-28 bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
