export default function EventDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-9 w-32 rounded-xl bg-white/[0.06]" />
      <div className="h-64 sm:h-80 rounded-3xl border border-line bg-surface-2 p-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 rounded-2xl border border-line bg-surface-2" />
          <div className="h-72 rounded-2xl border border-line bg-surface-2" />
        </div>
        <div className="space-y-6">
          <div className="h-80 rounded-2xl border border-line bg-surface-2" />
        </div>
      </div>
    </main>
  );
}
