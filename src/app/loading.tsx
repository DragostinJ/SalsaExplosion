import { Flame } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-base to-accent-tangerine text-white shadow-xl shadow-primary-base/25 animate-pulse">
        <Flame className="h-7 w-7 fill-white" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-extrabold text-foreground tracking-tight">
          Salsa Explosion
        </p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Setting the tempo...
        </p>
      </div>
    </div>
  );
}
