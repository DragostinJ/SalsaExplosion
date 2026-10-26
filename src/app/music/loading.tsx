export default function MusicLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-9 w-32 rounded-xl bg-white/[0.06]" />
        <div className="h-9 w-24 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="h-64 sm:h-96 rounded-2xl border border-line bg-surface-2 p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded-xl bg-white/[0.08]" />
          <div className="h-4 w-96 rounded-lg bg-white/[0.04]" />
        </div>
        <div className="h-16 w-full rounded-xl bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-40 rounded-2xl border border-line bg-surface-2" />
        <div className="h-40 rounded-2xl border border-line bg-surface-2" />
      </div>
    </main>
  );
}
