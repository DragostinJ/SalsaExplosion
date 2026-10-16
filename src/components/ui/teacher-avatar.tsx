"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface TeacherAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBadge?: boolean;
  specialty?: string | null;
}

const SIZE_MAP = {
  xs: {
    container: "h-6 w-6 text-[10px]",
    image: 24,
    badge: "h-2 w-2 right-0 bottom-0",
  },
  sm: {
    container: "h-8 w-8 text-xs",
    image: 32,
    badge: "h-2.5 w-2.5 right-0 bottom-0",
  },
  md: {
    container: "h-10 w-10 text-sm",
    image: 40,
    badge: "h-3 w-3 right-0 bottom-0",
  },
  lg: {
    container: "h-14 w-14 text-base",
    image: 56,
    badge: "h-3.5 w-3.5 right-0.5 bottom-0.5",
  },
  xl: {
    container: "h-20 w-20 text-xl",
    image: 80,
    badge: "h-4 w-4 right-1 bottom-1",
  },
  "2xl": {
    container: "h-28 w-28 text-2xl",
    image: 112,
    badge: "h-5 w-5 right-1.5 bottom-1.5",
  },
};

export function TeacherAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
  showBadge = true,
  specialty,
}: TeacherAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  // Extract initials (e.g. "Elena Reyes" -> "ER")
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const hasValidPhoto = Boolean(avatarUrl && !imageError);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-amber-500/30 shadow-xs ${sizeConfig.container} ${className}`}
      title={specialty ? `${name} • ${specialty}` : name}
    >
      {hasValidPhoto ? (
        <Image
          src={avatarUrl!}
          alt={name}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
          unoptimized={avatarUrl?.startsWith("http")}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 font-extrabold text-white shadow-inner">
          <span>{initials || "M"}</span>
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute flex items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold ring-2 ring-background ${sizeConfig.badge}`}
          title="Cuban Maestro"
        >
          <Sparkles className="h-2 w-2" />
        </span>
      )}
    </div>
  );
}
