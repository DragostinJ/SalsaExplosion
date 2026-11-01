import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A cinema-ticket stub: a perforated side strip (date, or a number) and the ticket body.
 * Used for festival passes, class reservations and the stubs you collect by attending.
 */
export function TicketStub({
  strip,
  children,
  aside,
  tone = "paper",
  className,
}: {
  /** Short text printed sideways on the tear-off strip */
  strip: string;
  children: ReactNode;
  /** Optional right-hand block (e.g. the QR code) */
  aside?: ReactNode;
  tone?: "paper" | "mustard" | "teal" | "red";
  className?: string;
}) {
  const body = {
    paper: "bg-paper text-ink",
    mustard: "bg-poster-mustard text-ink",
    teal: "bg-poster-teal text-ink",
    red: "bg-poster-red text-ink",
  }[tone];
  return (
    <div className={cn("flex border-4 border-ink", body, className)}>
      <p className="flex items-center border-r-4 border-dashed border-ink px-3 text-sm font-bold uppercase tracking-wider [writing-mode:vertical-rl]">
        {strip}
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">{children}</div>
      {aside && <div className="flex items-center border-l-4 border-dashed border-ink p-3">{aside}</div>}
    </div>
  );
}
