"use client";

import { useState } from "react";
import {
  RotateCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RotationMechanicsCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border border-line bg-surface-1 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-bold text-[10px]">
                <RotateCw className="mr-1 h-3 w-3 animate-spin duration-1000" />
                The Rueda Dynamic
              </Badge>
              <span className="text-xs font-semibold text-blue-300">
                100% Equal Practice Time
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold">
              How Partner Rotation Works (Zero Pressure Guarantee)
            </CardTitle>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs h-7 border-blue-500/30 text-blue-300 self-start sm:self-auto"
          >
            {isExpanded ? (
              <>
                Less Detail <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                How It Works <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>

        <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
          Nervous about coming alone or dancing with strangers? In Cuban Salsa, everyone stands in a circle (the <em>Rueda</em>). Here is why this is the safest, friendliest way to learn:
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 text-xs">
        {/* Visual 3-Stage Rotation Strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-400 text-xs">
                Stage 1: Drill in Place
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Counts 1-2-3</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-snug">
              You practice the basic Guapea step or Dile Que No with your current partner while Maestro Enrique demonstrates.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/[0.05] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-400 text-xs">
                Stage 2: The Call &ldquo;¡Dame!&rdquo;
              </span>
              <span className="text-[10px] text-amber-700 font-bold">Switch!</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-snug">
              The caller shouts <em>&ldquo;¡Dame!&rdquo;</em> (Give me another). Leads step forward around the circle to the next partner on 5-6-7.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-400 text-xs">
                Stage 3: Fresh Reset
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">New Smile</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-snug">
              You greet a new partner with a quick smile and try the combination again. Zero awkwardness—everyone rotates!
            </p>
          </div>
        </div>

        {/* Collapsible Deep-Dive FAQs */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-border/60 animate-in fade-in duration-200">
            <div className="grid gap-2.5 sm:grid-cols-2 text-[11px] text-muted-foreground">
              <div className="rounded-lg border bg-muted/20 p-2.5 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> What if I make a mistake?
                </span>
                <p>
                  You are warmly expected to! Mistakes in Cuban dance are just unchoreographed moments. You laugh, step back on beat 1, and keep going.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-2.5 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <HeartHandshake className="h-3 w-3 text-blue-500" /> Can I come with a partner and not rotate?
                </span>
                <p>
                  Couples are welcome to stay together during partner drills if preferred, but rotating for at least 15 minutes is proven to build lead/follow confidence 3x faster!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
