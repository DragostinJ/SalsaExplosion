export default function InstructorRosterLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 rounded-xl bg-white/[0.06]" />
        <div className="h-10 w-28 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-line bg-surface-2" />
        ))}
      </div>
      <div className="h-96 rounded-2xl border border-line bg-surface-2" />
    </main>
  );
}
