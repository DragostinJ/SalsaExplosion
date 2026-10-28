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
  compact?: boolean;
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
  compact = false,
  className,
}: PageHeaderProps) {
  const effectiveEyebrowLeft = eyebrowLeft ?? eyebrow;
  const effectiveHighlight = highlight ?? titleHighlight;

  if (compact) {
    return (
      <div
        data-testid="page-header"
        className={cn(
          "relative overflow-hidden rounded-2xl border border-line bg-surface-2 px-3.5 py-2.5 sm:px-5 sm:py-3 text-ivory shadow-xs",
          className
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-3 px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-ivory transition-colors shrink-0"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>{backLabel}</span>
              </Link>
            )}
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ivory leading-tight">
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
            {badge && (
              <span className="hidden sm:inline-flex items-center rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1 lg:max-w-md lg:text-right">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
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
        className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-5 sm:p-8 text-ivory shadow-xs"
      >
        {(effectiveEyebrowLeft || eyebrowRight) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5 text-xs font-black uppercase tracking-widest text-gold">
            <span>{effectiveEyebrowLeft}</span>
            {eyebrowRight && (
              <span className="text-muted-foreground font-bold">{eyebrowRight}</span>
            )}
          </div>
        )}

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 max-w-3xl">
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ivory leading-tight">
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
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
