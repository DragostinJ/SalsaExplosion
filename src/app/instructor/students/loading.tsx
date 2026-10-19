export default function StudentsRosterLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded bg-muted" />
          <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 rounded-xl bg-muted" />
        <div className="h-10 w-44 rounded-xl bg-muted" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <div className="h-12 border-b bg-muted/20 px-6 flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="divide-y p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 rounded bg-muted" />
                <div className="h-8 w-20 rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
