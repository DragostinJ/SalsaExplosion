import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      tone: {
        success: "bg-success-soft text-success border-success-line",
        warning: "bg-warning-soft text-warning border-warning-line",
        danger: "bg-danger-soft text-danger border-danger-line",
        info: "bg-info-soft text-info border-info-line",
        neutral: "bg-surface-3 text-ivory-muted border-line",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  tone?: StatusTone;
}

export function StatusBadge({
  tone = "neutral",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
