"use client";

import { useState } from "react";
import {
  Play,
  Heart,
  Eye,
  Music2,
  Star,
  Quote,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Users,
  Video,
  Award,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

type FilterTab = "all" | "reels" | "testimonials" | "congress";

interface MediaReel {
  id: string;
  type: "reel";
  category: "reels" | "congress";
  title: string;
  views: string;
  likes: string;
  track: string;
  caption: string;
  tags: string[];
  gradient: string;
  duration: string;
  badgeText: string;
  instagramUrl: string;
}

interface Testimonial {
  id: string;
  type: "testimonial";
  category: "testimonials";
  name: string;
  location: string;
  role: "Lead" | "Follow" | "Lead & Follow";
  level: string;
  avatarInitials: string;
  quote: string;
  rating: number;
  monthsActive: string;
}

type SocialItem = MediaReel | Testimonial;

const SOCIAL_ITEMS: SocialItem[] = [
  {
    id: "reel-1",
    type: "reel",
    category: "reels",
    title: "Thursday Night Rueda de Casino at BOH Studios",
    views: "34.8K",
    likes: "2,840",
    track: "Alexander Abreu y Havana D'Primera - Me Dicen Cuba",
    caption:
      "When the Clave drops and 60+ Casineros rotate as one! Pure Havana energy in Bournemouth. No partner needed — everyone rotates with strict ratio balance.",
    tags: ["#SalsaExplosion", "#RuedaDeCasino", "#Bournemouth", "#CubanSalsa"],
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    duration: "0:48",
    badgeText: "Viral Thursday Social",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
  },
  {
    id: "test-1",
    type: "testimonial",
    category: "testimonials",
    name: "Mark Townsend",
    location: "Bournemouth",
    role: "Lead",
    level: "Level 3 • Intermediate",
    avatarInitials: "MT",
    quote:
      "Before Salsa Explosion, salsa nights were a lottery with way too many followers waiting around. Enrique's ratio balance system fixes that completely. The partner rotation is continuous and the Cuban timing drills at BOH Studios are unmatched.",
    rating: 5,
    monthsActive: "Student for 2 years",
  },
  {
    id: "reel-3",
    type: "reel",
    category: "congress",
    title: "MADE IN CUBA Dance Festival Havana Fiesta Social",
    views: "42.1K",
    likes: "4,120",
    track: "Maykel Blanco y Su Salsa Mayor - Chaca Chaca",
    caption:
      "3 nights of parties, 2 dedicated rooms, live Cuban percussion, and dancers from across the UK and abroad! Celebrating 25+ years of Salsa Explosion heritage.",
    tags: ["#MadeInCuba2026", "#SalsaExplosion", "#HavanaFiesta", "#CubanSalsaUK"],
    gradient: "from-rose-600 via-purple-700 to-amber-700",
    duration: "0:56",
    badgeText: "Festival Gala",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
  },
];

export function SocialProofGrid() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedReel, setSelectedReel] = useState<MediaReel | null>(null);

  const filteredItems = SOCIAL_ITEMS.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "reels") return item.type === "reel";
    if (activeTab === "testimonials") return item.type === "testimonial";
    if (activeTab === "congress") return item.category === "congress";
    return true;
  });

  return (
    <section className="py-16 sm:py-20 bg-canvas border-t border-amber-500/15 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
            <InstagramIcon className="h-3.5 w-3.5" />
            <span>@salsaexplosion Community</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Feel the Energy of{" "}
            <span className="font-display italic font-normal text-amber-300 drop-shadow-sm">
              Bournemouth&apos;s Cuban Community
            </span>
          </h2>

          <p className="text-sm sm:text-base text-ivory-muted leading-relaxed">
            From packed Thursday &amp; Sunday Rueda circles at BOH Studios to the international Bournemouth Cuban Congress — see why over 4,200 dancers call Salsa Explosion their home.
          </p>

          {/* Social Filter Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 pt-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar w-full">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
              className={`rounded-full text-xs font-semibold min-h-10 px-4 shrink-0 whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-primary-base text-white hover:bg-primary-hover shadow-xs"
                  : "border-amber-500/20 bg-black/40 text-ivory-muted hover:text-white hover:bg-black/60"
              }`}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              All Highlights
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "reels" ? "default" : "outline"}
              onClick={() => setActiveTab("reels")}
              className={`rounded-full text-xs font-semibold min-h-10 px-4 shrink-0 whitespace-nowrap ${
                activeTab === "reels"
                  ? "bg-primary-base text-white hover:bg-primary-hover shadow-xs"
                  : "border-amber-500/20 bg-black/40 text-ivory-muted hover:text-white hover:bg-black/60"
              }`}
            >
              <Video className="mr-1.5 h-3.5 w-3.5 text-pink-500" />
              Reels & Class Clips
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "testimonials" ? "default" : "outline"}
              onClick={() => setActiveTab("testimonials")}
              className={`rounded-full text-xs font-semibold min-h-10 px-4 shrink-0 whitespace-nowrap ${
                activeTab === "testimonials"
                  ? "bg-primary-base text-white hover:bg-primary-hover shadow-xs"
                  : "border-amber-500/20 bg-black/40 text-ivory-muted hover:text-white hover:bg-black/60"
              }`}
            >
              <Users className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              Dancer Stories
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "congress" ? "default" : "outline"}
              onClick={() => setActiveTab("congress")}
              className={`rounded-full text-xs font-semibold min-h-10 px-4 shrink-0 whitespace-nowrap ${
                activeTab === "congress"
                  ? "bg-primary-base text-white hover:bg-primary-hover shadow-xs"
                  : "border-amber-500/20 bg-black/40 text-ivory-muted hover:text-white hover:bg-black/60"
              }`}
            >
              <Award className="mr-1.5 h-3.5 w-3.5 text-gold" />
              Congress Vibe
            </Button>
          </div>
        </div>

        {/* Media & Testimonial Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredItems.map((item, idx) => {
            const staggerClass =
              idx % 3 === 0 ? "lg:mt-0" : idx % 3 === 1 ? "lg:mt-8" : "lg:mt-4";
            if (item.type === "reel") {
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReel(item)}
                  className={`art-card group relative cursor-pointer rounded-3xl border border-amber-500/20 shadow-sm flex flex-col ${staggerClass}`}
                >
                  {/* Vertical Cinema Reel Thumbnail Banner */}
                  <div
                    className="relative h-72 w-full bg-surface-3 p-5 flex flex-col justify-between text-white overflow-hidden"
                  >
                    {/* Cinematic Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="flex items-center justify-between z-10">
                      <Badge className="bg-black/60 text-amber-300 backdrop-blur-md text-[11px] font-bold border border-amber-500/30">
                        {item.badgeText}
                      </Badge>
                      <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md border border-white/10">
                        <InstagramIcon className="h-3 w-3 text-pink-300" />
                        {item.duration}
                      </span>
                    </div>

                    {/* Pulsing Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute h-16 w-16 rounded-full bg-amber-400/20 animate-ping group-hover:scale-125 transition-transform" />
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 border border-amber-400/40 text-amber-300 backdrop-blur-md shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-110">
                          <Play className="h-6 w-6 fill-amber-300 ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats & Vinyl Sound Track */}
                    <div className="space-y-2 z-10">
                      <div className="flex items-center gap-3 text-xs font-semibold drop-shadow-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                          {item.likes}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-black/70 border border-gold/30 px-3 py-1 text-[11px] font-semibold text-gold backdrop-blur-md drop-shadow-xs max-w-full truncate">
                        <Music2 className="h-3 w-3 text-gold shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.track}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Caption */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-ivory-muted line-clamp-3 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-ivory-muted">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs font-medium text-amber-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-stone-200 inline-flex items-center gap-1 group-hover:translate-x-0.5 group-hover:text-amber-300 transition-transform">
                        Preview Clip
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Testimonial Card
            return (
              <Card
                key={item.id}
                className={`art-card rounded-3xl border border-amber-500/15 p-6 shadow-sm flex flex-col justify-between space-y-4 ${staggerClass}`}
              >
                <CardContent className="p-0 space-y-4">
                  {/* Star Rating & Quote Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-amber-500/20" />
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </CardContent>

                {/* Author Info */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-3 text-gold border border-gold/30 text-xs font-bold shadow-xs">
                      {item.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {item.name}
                        </span>
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      </div>
                      <span className="text-xs text-ivory-muted">
                        {item.location} • {item.role}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs font-semibold border-amber-500/30 text-amber-300">
                    {item.level.split("•")[0]?.trim()}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Global Social Call-to-Action Bar */}
        <div className="rounded-3xl border border-line bg-surface-2 p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2">
              <Badge className="bg-surface-3 text-ivory border border-line font-bold text-xs uppercase tracking-wider">
                Official Channels
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">
                Updated Daily with Class Recaps & Social Nights
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Follow Salsa Explosion on Instagram & Facebook
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Stay connected with weekly class routines, visiting Cuban maestro announcements, and Thursday & Sunday Havana Fiesta photo galleries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
            >
              <a
                href="https://www.instagram.com/salsaexplosion/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="mr-2 h-4 w-4" />
                Follow @salsaexplosion
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-[#0866ff] hover:bg-[#0756d6] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
            >
              <a
                href="https://www.facebook.com/salsaexplosion"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="mr-2 h-4 w-4 text-white" />
                Facebook Community Page
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Reel Preview Modal */}
      {selectedReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReel(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 text-white shadow-xs">
                  <InstagramIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">
                    {selectedReel.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    @salsaexplosion • {selectedReel.views} views
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close reel preview"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setSelectedReel(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Simulated Reel Display */}
            <div className="relative h-60 w-full rounded-xl bg-surface-3 p-6 flex flex-col justify-between text-white shadow-inner overflow-hidden">
              <Badge className="w-fit bg-black/40 text-white text-xs border-none backdrop-blur-md">
                {selectedReel.badgeText}
              </Badge>

              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white shadow-lg animate-pulse">
                  <Play className="h-7 w-7 fill-white ml-0.5" />
                </div>
                <p className="text-xs font-semibold text-white/90">
                  Click below to watch the full clip with original audio on Instagram
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 drop-shadow-xs">
                <span className="flex items-center gap-1 text-[11px]">
                  <Music2 className="h-3 w-3" />
                  {selectedReel.track}
                </span>
                <span className="font-bold">{selectedReel.duration}</span>
              </div>
            </div>

            {/* Caption & Tags */}
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {selectedReel.caption}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedReel.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReel(null)}
              >
                Close
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold"
              >
                <a
                  href={selectedReel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon className="mr-1.5 h-3.5 w-3.5" />
                  Watch on Instagram
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
