export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="h-8 w-72 rounded bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-muted" />
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/60" />
              <div className="h-7 w-7 rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-28 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted/50" />
          </div>
        ))}
      </div>

      {/* Analytics Chart & Table Skeletons */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 h-80 space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-56 w-full rounded-xl bg-muted/30" />
        </div>

        <div className="rounded-2xl border bg-card p-6 h-80 space-y-4">
          <div className="h-6 w-36 rounded bg-muted" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between items-center">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-4 w-12 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
