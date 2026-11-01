import Link from "next/link";
import { cn } from "@/lib/utils";

/** The rooms behind the Canciones door: everything you practise at home. */
const CANCIONES_TABS = [
  { href: "/music", label: "Canciones", english: "Songs" },
  { href: "/dashboard/rueda", label: "Rueda", english: "Call dictionary" },
  { href: "/dashboard/rueda/tarjetas", label: "Tarjetas", english: "Flashcards" },
] as const;

export type CancionesTab = (typeof CANCIONES_TABS)[number]["href"];

/** Poster tab strip shown at the top of each practice page. */
export function CancionesTabs({ current, className }: { current: CancionesTab; className?: string }) {
  return (
    <nav aria-label="Practice" className={cn("flex border-4 border-ink", className)}>
      {CANCIONES_TABS.map((tab) => {
        const active = tab.href === current;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[48px] flex-1 flex-col items-center justify-center px-2 text-center leading-tight [&:not(:last-child)]:border-r-4 [&:not(:last-child)]:border-ink",
              active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-poster-mustard"
            )}
          >
            <span className="font-display text-2xl leading-none">{tab.label}</span>
            <span className="text-xs font-semibold">{tab.english}</span>
          </Link>
        );
      })}
    </nav>
  );
}
