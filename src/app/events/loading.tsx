export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-muted" />

      {/* Header Skeleton */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-2">
        <div className="h-8 w-80 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            <div className="h-44 w-full bg-gradient-to-tr from-muted/80 to-muted/40 p-6 flex flex-col justify-between" />
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded bg-muted" />
                <div className="h-5 w-24 rounded bg-muted" />
              </div>
              <div className="h-4 w-full rounded bg-muted/60" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-36 rounded bg-muted/50" />
                <div className="h-4 w-48 rounded bg-muted/50" />
              </div>
              <div className="h-10 w-full rounded-lg bg-muted pt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
