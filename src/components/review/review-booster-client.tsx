"use client";

import { useState } from "react";
import {
  Star,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Heart,
  MapPin,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  REVIEW_FAVORITE_ASPECTS,
  REVIEW_INSTRUCTOR_HIGHLIGHTS,
  REVIEW_DANCER_LEVELS,
  GoogleReviewDraftOutput,
} from "@/lib/validations/ai-studio.schema";
import { generateGoogleReviewHelperAction } from "@/actions/ai-studio.actions";

export function ReviewBoosterClient() {
  const [favoriteAspect, setFavoriteAspect] = useState<
    typeof REVIEW_FAVORITE_ASPECTS[number]
  >(REVIEW_FAVORITE_ASPECTS[0]);

  const [instructorHighlight, setInstructorHighlight] = useState<
    typeof REVIEW_INSTRUCTOR_HIGHLIGHTS[number]
  >(REVIEW_INSTRUCTOR_HIGHLIGHTS[0]);

  const [dancerLevel, setDancerLevel] = useState<
    typeof REVIEW_DANCER_LEVELS[number]
  >(REVIEW_DANCER_LEVELS[1]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewResult, setReviewResult] = useState<GoogleReviewDraftOutput | null>(
    null
  );
  const [editableReview, setEditableReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Direct Google Maps write-review query URL for BOH Studios / Salsa Explosion UK
  const googleMapsReviewUrl =
    "https://search.google.com/local/writereview?placeid=ChIJwWv97XFcc0gRh1F2qF25Mv4";

  const handleGenerateReview = async () => {
    setIsGenerating(true);
    setCopied(false);

    const res = await generateGoogleReviewHelperAction({
      favoriteAspect,
      instructorHighlight,
      dancerLevel,
    });

    setIsGenerating(false);
    if (res.success && res.data) {
      setReviewResult(res.data);
      setEditableReview(res.data.reviewText);
    }
  };

  const handleCopyReview = () => {
    if (!editableReview) return;
    navigator.clipboard.writeText(editableReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-1 p-6 sm:p-10 shadow-2xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold mb-4">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          30-Second BOH Studios Dancer Voice
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ivory max-w-2xl mx-auto leading-tight">
          Help Bournemouth Find Real Cuban Salsa
        </h1>

        <div className="flex items-center justify-center gap-1.5 my-3 text-gold">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-gold text-gold" />
          ))}
        </div>

        <p className="text-sm text-ivory-muted max-w-xl mx-auto leading-relaxed">
          Leave a genuine 5-star Google review for Maestro Enrique Perez Valdes and the Salsa Explosion family at BOH Studios Bournemouth. Tap 3 options below to draft your review in seconds!
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-ivory-muted">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            BOH Studios, 104 Commercial Rd, BH2 5LR
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            Thursdays & Sundays Weekly
          </span>
        </div>
      </div>

      {/* 3-Step Review Assistant Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 3 Taps */}
        <div className="lg:col-span-6 rounded-3xl border border-line bg-surface-1 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ivory flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              What Did You Enjoy Most?
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(!showQrModal)}
              className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[36px]"
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5 text-gold" />
              Desk QR
            </Button>
          </div>

          {/* Option 1: Favorite Aspect */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ivory">
              1. Your Favorite Highlight:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REVIEW_FAVORITE_ASPECTS.map((aspect) => (
                <button
                  key={aspect}
                  type="button"
                  onClick={() => setFavoriteAspect(aspect)}
                  className={`text-left rounded-2xl p-3 text-xs font-semibold transition-all min-h-[44px] ${
                    favoriteAspect === aspect
                      ? "bg-gold text-canvas font-bold shadow-md"
                      : "border border-line bg-surface-2 text-ivory-muted hover:text-ivory hover:bg-surface-3"
                  }`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>

          {/* Option 2: Teacher Highlight */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ivory">
              2. Who Taught or Inspired You Tonight?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REVIEW_INSTRUCTOR_HIGHLIGHTS.map((highlight) => (
                <button
                  key={highlight}
                  type="button"
                  onClick={() => setInstructorHighlight(highlight)}
                  className={`text-center rounded-2xl p-3 text-xs font-semibold transition-all min-h-[44px] ${
                    instructorHighlight === highlight
                      ? "bg-gold text-canvas font-bold shadow-md"
                      : "border border-line bg-surface-2 text-ivory-muted hover:text-ivory hover:bg-surface-3"
                  }`}
                >
                  {highlight}
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ivory">
              3. Your Dance Background:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REVIEW_DANCER_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDancerLevel(lvl)}
                  className={`text-center rounded-2xl p-3 text-xs font-semibold transition-all min-h-[44px] ${
                    dancerLevel === lvl
                      ? "bg-gold text-canvas font-bold shadow-md"
                      : "border border-line bg-surface-2 text-ivory-muted hover:text-ivory hover:bg-surface-3"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerateReview}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-gold hover:bg-gold-light text-canvas font-bold text-sm min-h-[46px] transition-all"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 animate-spin" />
                Crafting Your Review Draft...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Draft My 5-Star Review
              </span>
            )}
          </Button>
        </div>

        {/* Right Output: Ready-to-Copy Review */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-line bg-surface-1 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                <Star className="h-4 w-4 fill-gold text-gold" />
                Your Custom Review Draft
              </h2>
              {editableReview && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono"
                >
                  Ready to Post
                </Badge>
              )}
            </div>

            {editableReview ? (
              <div className="space-y-4">
                <textarea
                  value={editableReview}
                  onChange={(e) => setEditableReview(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-line bg-surface-3 p-4 text-xs text-ivory leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none font-sans"
                />

                {reviewResult && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider">
                      Local SEO Keywords Included:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewResult.localSeoKeywordsIncluded.map((kw, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-line bg-surface-2 text-[10px] text-gold font-mono"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2-Step Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleCopyReview}
                    className="w-full rounded-2xl bg-surface-2 hover:bg-surface-3 text-ivory font-bold text-xs min-h-[46px] border border-line transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-300">
                          1. Review Text Copied to Clipboard! ✓
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-gold" />
                        <span>1. Copy My Review Text</span>
                      </>
                    )}
                  </Button>

                  <a
                    href={googleMapsReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-2xl bg-gold hover:bg-gold-light text-canvas font-bold text-sm min-h-[46px] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>2. Open Google Maps & Paste Review</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-surface-1/50 p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
                <Star className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-ivory">
                  Select Your Preferences
                </p>
                <p className="text-xs text-ivory-muted mt-1 max-w-sm">
                  Choose your highlight and experience level on the left, then click <strong className="text-gold font-semibold">Draft My 5-Star Review</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Door Desk QR Share Card */}
          {showQrModal && (
            <div className="rounded-3xl border border-gold/40 bg-surface-2 p-6 shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
              <Badge
                variant="outline"
                className="border-gold/50 bg-gold/10 text-gold text-xs font-mono"
              >
                Studio Door Desk Display
              </Badge>
              <h3 className="text-base font-bold text-ivory">
                BOH Studios Table QR & Link
              </h3>
              <p className="text-xs text-ivory-muted">
                Show this to dancers at the registration desk on Thursday and Sunday nights:
              </p>
              <div className="rounded-2xl bg-white p-4 inline-block shadow-lg mx-auto">
                <div className="h-36 w-36 bg-stone-900 rounded-xl flex items-center justify-center text-white text-xs font-mono text-center p-2">
                  <span className="text-[11px] text-amber-300">
                    salsaexplosion.co.uk/review
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono text-gold">
                URL: https://salsaexplosion-bkgf.vercel.app/review
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
