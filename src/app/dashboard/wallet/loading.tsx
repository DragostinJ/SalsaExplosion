export default function WalletLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-9 w-32 rounded-xl bg-white/[0.06]" />
      <div className="h-32 rounded-3xl border border-line bg-surface-2 p-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-line bg-surface-2" />
        <div className="h-64 rounded-2xl border border-line bg-surface-2" />
      </div>
      <div className="h-96 rounded-2xl border border-line bg-surface-2" />
    </main>
  );
}
