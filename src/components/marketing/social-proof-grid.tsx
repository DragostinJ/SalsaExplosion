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
    title: "Friday Night Rueda de Casino at BOH Studios",
    views: "34.8K",
    likes: "2,840",
    track: "Alexander Abreu y Havana D'Primera - Me Dicen Cuba",
    caption:
      "When the Clave drops and 60+ Casineros rotate as one! Pure Havana energy in Bournemouth. No partner needed — everyone rotates with strict ratio balance.",
    tags: ["#SalsaExplosion", "#RuedaDeCasino", "#Bournemouth", "#CubanSalsa"],
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    duration: "0:48",
    badgeText: "Viral Friday Social",
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
    id: "reel-2",
    type: "reel",
    category: "reels",
    title: "Maestro Enrique Breaks Down Dile Que No & Setenta",
    views: "19.4K",
    likes: "1,560",
    track: "Los Van Van - Este Amor Que Se Muere",
    caption:
      "Cuban tension and footwork preparation on beat 1. Look at the connection and arm prep. Weekly syllabus masterclass at BOH Studios Bournemouth.",
    tags: ["#EnriquePerez", "#CubanTechnique", "#CasinoSalsa", "#BOHStudios"],
    gradient: "from-orange-600 via-amber-700 to-yellow-600",
    duration: "1:12",
    badgeText: "Technique Breakdown",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
  },
  {
    id: "test-2",
    type: "testimonial",
    category: "testimonials",
    name: "Sophie Laurent",
    location: "Poole",
    role: "Follow",
    level: "Level 2 • Improver",
    avatarInitials: "SL",
    quote:
      "I came alone with zero dance background and two left feet. Within 8 weeks, I knew Guapea, Vacilala, and Setenta with real confidence. Everyone rotates, the vibe is warm and inclusive, and Enrique's musicality makes it impossible not to smile.",
    rating: 5,
    monthsActive: "Student for 7 months",
  },
  {
    id: "reel-3",
    type: "reel",
    category: "congress",
    title: "Bournemouth Summer Congress Havana Fiesta Social",
    views: "42.1K",
    likes: "4,120",
    track: "Maykel Blanco y Su Salsa Mayor - Chaca Chaca",
    caption:
      "3 ballrooms, live Cuban percussion, and dancers from 15 countries! The UK's premier Cuban Salsa festival right on Bournemouth beach. 2026 passes now live.",
    tags: ["#BournemouthCongress", "#CubanCongress", "#HavanaFiesta", "#LiveCubanBand"],
    gradient: "from-rose-600 via-purple-700 to-amber-700",
    duration: "0:56",
    badgeText: "Congress Gala",
    instagramUrl: "https://www.instagram.com/salsaexplosion/",
  },
  {
    id: "test-3",
    type: "testimonial",
    category: "testimonials",
    name: "David & Elena Jenkins",
    location: "Christchurch",
    role: "Lead & Follow",
    level: "Level 4 • Casinero Advanced",
    avatarInitials: "DJ",
    quote:
      "Enrique Perez Valdes is an absolute titan in UK Cuban Salsa. Having a Lifetime Achievement Award winner teaching Casino and Son right here in Dorset is extraordinary. The student recaps after each class also make practicing at home effortless.",
    rating: 5,
    monthsActive: "Dancers for 3 years",
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
    <section className="py-16 sm:py-20 bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-xs font-semibold text-pink-700 dark:text-pink-300">
            <InstagramIcon className="h-3.5 w-3.5" />
            <span>@salsaexplosion Community</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Feel the Energy of Bournemouth&apos;s Cuban Community
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From packed Friday Rueda circles at BOH Studios to the international Bournemouth Cuban Congress — see why over 4,200 dancers call Salsa Explosion their home.
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
                  : "border-muted hover:bg-muted"
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
                  : "border-muted hover:bg-muted"
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
                  : "border-muted hover:bg-muted"
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
                  : "border-muted hover:bg-muted"
              }`}
            >
              <Award className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
              Congress Vibe
            </Button>
          </div>
        </div>

        {/* Media & Testimonial Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            if (item.type === "reel") {
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReel(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/50 flex flex-col"
                >
                  {/* Reel Thumbnail Simulation Banner */}
                  <div
                    className={`relative h-64 w-full bg-gradient-to-br ${item.gradient} p-5 flex flex-col justify-between text-white overflow-hidden`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between z-10">
                      <Badge className="bg-black/40 text-white backdrop-blur-md text-[11px] font-bold border-none">
                        {item.badgeText}
                      </Badge>
                      <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                        <InstagramIcon className="h-3 w-3 text-pink-300" />
                        {item.duration}
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-lg">
                        <Play className="h-6 w-6 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Stats & Sound */}
                    <div className="space-y-1.5 z-10">
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
                      <div className="flex items-center gap-1 text-[11px] text-white/80 line-clamp-1 drop-shadow-xs">
                        <Music2 className="h-3 w-3 shrink-0" />
                        <span>{item.track}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Caption */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-foreground inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
                className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors"
              >
                <CardContent className="p-0 space-y-4">
                  {/* Star Rating & Quote Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-muted-foreground/30" />
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </CardContent>

                {/* Author Info */}
                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white text-xs font-bold shadow-xs">
                      {item.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {item.name}
                        </span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {item.location} • {item.role}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 text-amber-700 dark:text-amber-300">
                    {item.level.split("•")[0]?.trim()}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Global Social Call-to-Action Bar */}
        <div className="rounded-3xl border border-pink-500/25 bg-gradient-to-r from-pink-500/[0.05] via-amber-500/[0.05] to-orange-500/[0.05] p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2">
              <Badge className="bg-pink-600 text-white font-bold text-xs uppercase tracking-wider">
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
              Stay connected with weekly class routines, visiting Cuban maestro announcements, and Friday Havana Fiesta photo galleries.
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
                  <span className="text-[10px] text-muted-foreground">
                    @salsaexplosion • {selectedReel.views} views
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setSelectedReel(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Simulated Reel Display */}
            <div
              className={`relative h-60 w-full rounded-xl bg-gradient-to-br ${selectedReel.gradient} p-6 flex flex-col justify-between text-white shadow-inner overflow-hidden`}
            >
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
                  <Badge key={tag} variant="secondary" className="text-[10px]">
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
