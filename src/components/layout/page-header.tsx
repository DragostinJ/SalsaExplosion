import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: string;
  eyebrowLeft?: string;
  eyebrowRight?: string;
  title: string;
  highlight?: string;
  titleHighlight?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowLeft,
  eyebrowRight,
  title,
  highlight,
  titleHighlight,
  description,
  actions,
  backHref,
  backLabel = "Back",
  badge,
  className,
}: PageHeaderProps) {
  const effectiveEyebrowLeft = eyebrowLeft ?? eyebrow;
  const effectiveHighlight = highlight ?? titleHighlight;

  return (
    <div className={cn("space-y-4", className)}>
      {backHref && (
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-ivory transition-colors py-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      <div
        data-testid="page-header"
        className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-5 sm:p-10 text-ivory shadow-xs"
      >
        {(effectiveEyebrowLeft || eyebrowRight) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5 sm:pb-3 text-[11px] font-black uppercase tracking-widest text-gold">
            <span>{effectiveEyebrowLeft}</span>
            {eyebrowRight && (
              <span className="text-muted-foreground font-bold">{eyebrowRight}</span>
            )}
          </div>
        )}

        <div className="mt-3.5 sm:mt-5 space-y-3 sm:space-y-4 max-w-3xl">
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ivory leading-tight">
            {title}
            {effectiveHighlight && (
              <>
                {" "}
                <span className="italic font-normal text-gold">
                  {effectiveHighlight}
                </span>
              </>
            )}
          </h1>

          {description && (
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              {description}
            </div>
          )}

          {badge && <div>{badge}</div>}

          {actions && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
