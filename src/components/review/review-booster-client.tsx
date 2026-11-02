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

const DEFAULT_FAVORITE_ASPECT: (typeof REVIEW_FAVORITE_ASPECTS)[number] =
  "Thursday & Sunday Social Vibe";
const DEFAULT_INSTRUCTOR_HIGHLIGHT: (typeof REVIEW_INSTRUCTOR_HIGHLIGHTS)[number] =
  "Maestro Enrique";
const DEFAULT_DANCER_LEVEL: (typeof REVIEW_DANCER_LEVELS)[number] =
  "Regular Social Dancer";

export function ReviewBoosterClient() {
  const [favoriteAspect, setFavoriteAspect] = useState<
    (typeof REVIEW_FAVORITE_ASPECTS)[number]
  >(DEFAULT_FAVORITE_ASPECT);

  const [instructorHighlight, setInstructorHighlight] = useState<
    (typeof REVIEW_INSTRUCTOR_HIGHLIGHTS)[number]
  >(DEFAULT_INSTRUCTOR_HIGHLIGHT);

  const [dancerLevel, setDancerLevel] = useState<
    (typeof REVIEW_DANCER_LEVELS)[number]
  >(DEFAULT_DANCER_LEVEL);

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
      <div className="border-4 border-ink bg-paper p-6 sm:p-10 shadow-[6px_6px_0_var(--color-ink)] text-center text-ink">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink bg-poster-mustard px-4 py-1.5 text-xs font-black uppercase text-ink shadow-[2px_2px_0_var(--color-ink)] mb-4">
          <Sparkles className="h-3.5 w-3.5 text-ink" />
          30-Second BOH Studios Dancer Voice
        </div>

        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight text-ink max-w-2xl mx-auto leading-tight">
          Help Bournemouth Find Real Cuban Salsa
        </h1>

        <div className="flex items-center justify-center gap-1.5 my-3 text-accent-red">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-poster-red text-accent-red" />
          ))}
        </div>

        <p className="text-sm text-ink max-w-xl mx-auto leading-relaxed font-medium">
          Leave a genuine 5-star Google review for Maestro Enrique Perez Valdes and the Salsa Explosion family at BOH Studios Bournemouth. Tap 3 options below to draft your review in seconds!
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-ink font-bold">
          <span className="flex items-center gap-1.5 border-2 border-ink bg-paper-light px-3 py-1 shadow-[2px_2px_0_var(--color-ink)]">
            <MapPin className="h-3.5 w-3.5 text-accent-red" />
            BOH Studios, 104 Commercial Rd, BH2 5LR
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 border-2 border-ink bg-paper-light px-3 py-1 shadow-[2px_2px_0_var(--color-ink)]">
            <Calendar className="h-3.5 w-3.5 text-accent-red" />
            Thursdays &amp; Sundays Weekly
          </span>
        </div>
      </div>

      {/* 3-Step Review Assistant Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 3 Taps */}
        <div className="lg:col-span-6 border-4 border-ink bg-paper p-6 sm:p-8 shadow-[6px_6px_0_var(--color-ink)] space-y-6 text-ink">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-ink flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent-red" />
              What Did You Enjoy Most?
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(!showQrModal)}
              className="border-2 border-ink bg-paper hover:bg-poster-mustard text-ink text-xs font-bold shadow-[2px_2px_0_var(--color-ink)] min-h-[36px] rounded-none"
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5 text-ink" />
              Desk QR
            </Button>
          </div>

          {/* Option 1: Favorite Aspect */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-ink">
              1. Your Favorite Highlight:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REVIEW_FAVORITE_ASPECTS.map((aspect) => (
                <button
                  key={aspect}
                  type="button"
                  onClick={() => setFavoriteAspect(aspect)}
                  className={`text-left p-3 text-xs font-bold transition-all min-h-[44px] border-2 ${
                    favoriteAspect === aspect
                      ? "border-ink bg-poster-mustard text-ink font-black shadow-[2px_2px_0_var(--color-ink)]"
                      : "border-ink/40 bg-paper hover:border-ink hover:bg-paper-light text-ink"
                  }`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>

          {/* Option 2: Teacher Highlight */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-ink">
              2. Who Taught or Inspired You Tonight?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REVIEW_INSTRUCTOR_HIGHLIGHTS.map((highlight) => (
                <button
                  key={highlight}
                  type="button"
                  onClick={() => setInstructorHighlight(highlight)}
                  className={`text-center p-3 text-xs font-bold transition-all min-h-[44px] border-2 ${
                    instructorHighlight === highlight
                      ? "border-ink bg-poster-mustard text-ink font-black shadow-[2px_2px_0_var(--color-ink)]"
                      : "border-ink/40 bg-paper hover:border-ink hover:bg-paper-light text-ink"
                  }`}
                >
                  {highlight}
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-ink">
              3. Your Dance Background:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REVIEW_DANCER_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDancerLevel(lvl)}
                  className={`text-center p-3 text-xs font-bold transition-all min-h-[44px] border-2 ${
                    dancerLevel === lvl
                      ? "border-ink bg-poster-mustard text-ink font-black shadow-[2px_2px_0_var(--color-ink)]"
                      : "border-ink/40 bg-paper hover:border-ink hover:bg-paper-light text-ink"
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
            className="w-full border-2 border-ink bg-poster-red hover:bg-ink text-ink font-black uppercase tracking-wider text-sm min-h-[46px] shadow-[3px_3px_0_var(--color-ink)] transition-all rounded-none"
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
          <div className="border-4 border-ink bg-paper p-6 sm:p-8 shadow-[6px_6px_0_var(--color-ink)] space-y-5 text-ink">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <Star className="h-4 w-4 fill-poster-red text-accent-red" />
                Your Custom Review Draft
              </h2>
              {editableReview && (
                <Badge
                  variant="outline"
                  className="border-2 border-ink bg-poster-teal text-ink text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]"
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
                  className="w-full border-2 border-ink bg-paper-light p-4 text-xs text-ink leading-relaxed font-sans resize-none shadow-inner"
                />

                {reviewResult && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-ink">
                      Local SEO Keywords Included:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewResult.localSeoKeywordsIncluded.map((kw, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border border-ink bg-poster-mustard/40 text-xs text-ink font-bold font-mono"
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
                    className="w-full border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-ink font-black uppercase tracking-wider text-xs min-h-[46px] shadow-[2px_2px_0_var(--color-ink)] transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-accent-teal" />
                        <span className="text-accent-teal font-black">
                          1. Review Text Copied to Clipboard! ✓
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-ink" />
                        <span>1. Copy My Review Text</span>
                      </>
                    )}
                  </Button>

                  <a
                    href={googleMapsReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-2 border-ink bg-poster-red hover:bg-ink text-ink font-black uppercase tracking-wider text-sm min-h-[46px] shadow-[3px_3px_0_var(--color-ink)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>2. Open Google Maps &amp; Paste Review</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-ink bg-paper-light p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
                <Star className="h-10 w-10 text-ink/30 mb-3" />
                <p className="text-sm font-black uppercase tracking-wider text-ink">
                  Select Your Preferences
                </p>
                <p className="text-xs text-ink mt-1 max-w-sm font-medium">
                  Choose your highlight and experience level on the left, then click <strong className="text-accent-red font-bold">Draft My 5-Star Review</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Door Desk QR Share Card */}
          {showQrModal && (
            <div className="border-4 border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)] text-center space-y-4 animate-in fade-in duration-200">
              <Badge
                variant="outline"
                className="border-2 border-ink bg-poster-mustard text-ink text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]"
              >
                Studio Door Desk Display
              </Badge>
              <h3 className="text-base font-black uppercase tracking-wider text-ink">
                BOH Studios Table QR &amp; Link
              </h3>
              <p className="text-xs text-ink font-medium">
                Show this to dancers at the registration desk on Thursday and Sunday nights:
              </p>
              <div className="border-2 border-ink bg-paper p-4 inline-block shadow-[4px_4px_0_var(--color-ink)] mx-auto">
                <div className="h-36 w-36 bg-ink flex items-center justify-center text-paper text-xs font-mono text-center p-2">
                  <span className="text-xs text-poster-mustard font-bold">
                    salsaexplosion.co.uk/review
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono font-bold text-ink">
                URL: https://salsaexplosion-bkgf.vercel.app/review
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
