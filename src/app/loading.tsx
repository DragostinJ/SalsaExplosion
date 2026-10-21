import { Flame } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse space-y-8">
      <div className="h-44 sm:h-56 rounded-3xl bg-muted/40 flex flex-col items-center justify-center p-6 space-y-3">
        <div className="h-10 w-10 rounded-2xl bg-primary-base/20 flex items-center justify-center text-primary-base">
          <Flame className="h-5 w-5" />
        </div>
        <div className="h-4 w-40 rounded-full bg-muted/80" />
        <div className="h-3 w-64 rounded-full bg-muted/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 rounded-2xl bg-muted/30" />
        <div className="h-36 rounded-2xl bg-muted/30" />
        <div className="h-36 rounded-2xl bg-muted/30" />
      </div>
    </div>
  );
}
