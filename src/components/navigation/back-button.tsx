"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackUrl = "/dashboard/schedule",
  label = "Back to Schedule",
  className = "",
}: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      <Link href={fallbackUrl}>
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}

