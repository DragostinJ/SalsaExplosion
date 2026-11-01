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
          "relative overflow-hidden border-4 border-ink bg-surface-1 px-3.5 py-3 sm:px-5 text-ivory",
          className
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex min-h-[40px] items-center gap-1 border-2 border-ink px-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors shrink-0"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>{backLabel}</span>
              </Link>
            )}
            <h1 className="text-3xl sm:text-5xl text-ivory leading-[0.95]">
              {title}
              {effectiveHighlight && (
                <>
                  {" "}
                  <span className="text-poster-red">{effectiveHighlight}</span>
                </>
              )}
            </h1>
            {badge && (
              <span className="hidden sm:inline-flex items-center border-2 border-ink bg-poster-mustard px-2 py-0.5 text-xs font-bold uppercase text-ink">
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
            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:underline py-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      <div
        data-testid="page-header"
        className="relative overflow-hidden border-4 border-ink bg-surface-1 p-5 sm:p-8 text-ivory"
      >
        {(effectiveEyebrowLeft || eyebrowRight) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-ink pb-2.5 text-xs font-bold uppercase tracking-[0.3em] text-ink">
            <span>{effectiveEyebrowLeft}</span>
            {eyebrowRight && (
              <span className="text-muted-foreground font-bold">{eyebrowRight}</span>
            )}
          </div>
        )}

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl text-ivory leading-[0.92]">
            {title}
            {effectiveHighlight && (
              <>
                {" "}
                <span className="text-poster-red">{effectiveHighlight}</span>
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
