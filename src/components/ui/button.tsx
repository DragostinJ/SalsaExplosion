import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center max-w-full text-center leading-tight whitespace-normal sm:whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-xs hover:bg-brand-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-line bg-transparent text-ivory shadow-xs hover:bg-surface-3",
        secondary:
          "bg-surface-3 text-ivory shadow-xs hover:bg-surface-2",
        ghost: "text-muted-foreground hover:text-ivory hover:bg-surface-3",
        gold: "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20",
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 h-auto px-4 py-2",
        sm: "min-h-8 h-auto rounded-lg px-3 py-1 text-xs",
        lg: "min-h-10 h-auto rounded-xl px-6 py-2.5 sm:px-8",
        icon: "h-9 w-9 shrink-0 whitespace-nowrap",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
