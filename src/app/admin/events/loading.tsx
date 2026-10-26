export default function AdminEventsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 rounded-xl bg-white/[0.06]" />
        <div className="h-10 w-36 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl border border-line bg-surface-2" />
        <div className="h-72 rounded-2xl border border-line bg-surface-2" />
      </div>
    </main>
  );
}
