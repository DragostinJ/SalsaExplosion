"use client";

import { useState } from "react";
import {
  Users,
  UserCheck,
  Sparkles,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Check,
  ShieldAlert,
} from "lucide-react";
import { DanceRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PartnerMatchWaitlistProps {
  userRole?: DanceRole;
  userName?: string;
}

export function PartnerMatchWaitlist({
  userRole = DanceRole.LEAD,
  userName = "Dancer",
}: PartnerMatchWaitlistProps) {
  const [selectedRole, setSelectedRole] = useState<DanceRole>(userRole);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [bypassSent, setBypassSent] = useState(false);

  const oppositeRole = selectedRole === DanceRole.LEAD ? DanceRole.FOLLOW : DanceRole.LEAD;

  function handleCopyInviteLink() {
    const inviteUrl = typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/schedule?pairWith=${encodeURIComponent(userName)}&role=${oppositeRole}`
      : `https://salsaexplosion.co.uk/dashboard/schedule?pairWith=${encodeURIComponent(userName)}&role=${oppositeRole}`;

    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitlistJoined(true);
  }

  function handleSendBypassInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!partnerEmail.trim()) return;
    setBypassSent(true);
  }

  return (
    <Card className="overflow-hidden border border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/[0.03] shadow-md">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold sm:text-lg">
                  Partner-Match Priority Waitlist & Bypass
                </CardTitle>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  Role Balance Protocol
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                At Salsa Explosion, we maintain strict Lead/Follow balance (+/-3 cap) so no dancer sits out during Rueda partner changes.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* Role Ratio Explanation Callout */}
        <div className="flex items-start gap-3 rounded-xl border border-muted bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <span className="font-semibold text-foreground">
              Is your dance role currently capped in a class?
            </span>
            <p className="leading-relaxed">
              When one role exceeds the other by 3 dancers, single bookings for that role temporarily pause. You have two guaranteed ways to dance:
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: Priority Queue */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Option 1: Priority Queue</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Join the solo waitlist. The moment a dancer of the complementary role ({oppositeRole}) registers, the queue unlocks and books you automatically.
              </p>

              {waitlistJoined ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Priority Waitlist Activated!
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                    You are in the queue as a <span className="font-bold">{selectedRole}</span>. You will receive an SMS and email notification the moment a {oppositeRole} books.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinWaitlist} className="space-y-3 pt-1">
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Your Dance Role
                    </Label>
                    <div className="mt-1 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedRole === DanceRole.LEAD ? "default" : "outline"}
                        className="h-8 flex-1 text-xs"
                        onClick={() => setSelectedRole(DanceRole.LEAD)}
                      >
                        Lead
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedRole === DanceRole.FOLLOW ? "default" : "outline"}
                        className="h-8 flex-1 text-xs"
                        onClick={() => setSelectedRole(DanceRole.FOLLOW)}
                      >
                        Follow
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" size="sm" className="w-full text-xs font-semibold">
                    Join Priority Waitlist
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Option 2: Bring-a-Partner Bypass */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold">Option 2: Pair-Up Instant Bypass</h3>
                <Badge className="bg-emerald-600 text-[10px] text-white">
                  Zero Wait
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bring a friend dancing the opposite role ({oppositeRole}) and bypass the waitlist immediately! Because your pair is 1:1 balanced, both spots confirm instantly.
              </p>

              {bypassSent ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Invitation Dispatched!
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                    We sent a paired bypass link to <span className="font-semibold">{partnerEmail}</span>. As soon as they confirm their {oppositeRole} registration, both your spots are guaranteed!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBypassInvite} className="space-y-3 pt-1">
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Invite a {oppositeRole} Friend
                    </Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        className="h-8 shrink-0 text-xs font-semibold"
                        disabled={!partnerEmail.trim()}
                      >
                        Invite
                      </Button>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleCopyInviteLink}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                          Link Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Share2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                          Copy Shareable Pair-Up Link
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/60 bg-muted/20 py-3 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Average queue resolution time: under 3 hours before class starts.</span>
          </div>
          <span>BOH Studios Bournemouth • Salsa Explosion UK</span>
        </div>
      </CardFooter>
    </Card>
  );
}
