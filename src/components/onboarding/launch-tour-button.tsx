"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { triggerStudioTutorial } from "@/components/onboarding/interactive-tutorial-modal";

interface LaunchTourButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  label?: string;
}

export function LaunchTourButton({
  className,
  variant = "default",
  size = "default",
  label = "Launch 60-Second Interactive Simulator",
}: LaunchTourButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={triggerStudioTutorial}
      className={className}
    >
      <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
      {label}
    </Button>
  );
}
