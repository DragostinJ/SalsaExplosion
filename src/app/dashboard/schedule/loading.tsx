export default function ScheduleLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Safety Hub Skeleton */}
      <div className="h-24 w-full rounded-2xl bg-secondary-light/20 border border-secondary-base/20" />

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-muted shrink-0" />
        ))}
      </div>

      {/* Class Schedule Cards Skeleton Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-muted" />
              <div className="h-5 w-20 rounded bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted/50" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted/60" />
              </div>
            </div>

            <div className="h-10 w-full rounded-lg bg-muted pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
