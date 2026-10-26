import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center max-w-full rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-tight whitespace-normal sm:whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-white shadow-xs hover:bg-brand-hover",
        gold:
          "border-gold/30 bg-gold/15 text-gold hover:bg-gold/25",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25",
        danger:
          "border-rose-500/30 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25",
        secondary:
          "border-line bg-surface-3 text-ivory hover:bg-surface-2",
        outline: "border-line text-ivory",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
