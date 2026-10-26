import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  actions,
  align = "left",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-1.5",
        isCenter ? "text-center mx-auto max-w-2xl" : "max-w-3xl",
        className
      )}
    >
      {eyebrow && (
        <p className="text-[11px] font-black uppercase tracking-widest text-gold">
          {eyebrow}
        </p>
      )}

      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-4",
          isCenter && "justify-center"
        )}
      >
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ivory">
          {title}
          {highlight && (
            <>
              {" "}
              <span className="font-display italic font-normal text-gold normal-case">
                {highlight}
              </span>
            </>
          )}
        </h2>

        {actions && !isCenter && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {description && (
        <div className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </div>
      )}

      {actions && isCenter && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {actions}
        </div>
      )}
    </div>
  );
}
