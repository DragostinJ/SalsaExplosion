import {
  AiCoachingInput,
  AiCoachingOutput,
  ParsedEventCard,
  VideoPreCheckInput,
  VideoPreCheckAssessment,
  GoogleReviewDraftInput,
  GoogleReviewDraftOutput,
} from "@/lib/validations/ai-studio.schema";
import { VENUE_INFO, DOOR_PRICING, ACADEMY_METRICS } from "@/lib/academy-data";

export function generateDeterministicCoachingPlan(
  input: AiCoachingInput
): AiCoachingOutput {
  const { level, danceStyle, struggle } = input;

  return {
    drills: [
      {
        title: `Drill 1: Isolated Grounding & Clave Step (${danceStyle})`,
        steps: `Step on the spot with bent knees to count 1-2-3, hold 4, 5-6-7, hold 8. Focus intentionally on releasing tension related to: "${struggle.slice(0, 80)}".`,
        focusBeat: "Beat 1 (Strong accent) & Beat 5 (Direction change)",
        durationMinutes: 4,
      },
      {
        title: `Drill 2: Micro-Repetition Pattern (${level} Focus)`,
        steps: `Perform the movement slowly at 70% tempo without musical pressure. Emphasize body frame connection, engaging the core and matching the partner connection vector.`,
        focusBeat: "Beat 3 & Beat 7 (Compression & prep beats)",
        durationMinutes: 6,
      },
      {
        title: `Drill 3: Live Flow & Musicality Integration`,
        steps: `Run the full combo through 4 bars of high-energy Timba (e.g. Los Van Van or Havana D'Primera). Keep posture tall and breathe through transitions.`,
        focusBeat: "Beats 2-3 (Son clave accent) & Beat 8 (Upbeat preparation)",
        durationMinutes: 5,
      },
    ],
    claveCue: `Listen for the conga slap on Beat 2 and the open tones on Beats 4 & 4&. In 2:3 Son Clave, wait patiently for the second beat before initiating your extension.`,
    rhythmTip: `Never rush the silence on beat 4 and beat 8. In Cuban salsa, your pause on counts 4 and 8 is what allows your partner to process direction changes.`,
    feedbackNote: `¡Oye familia! Great work on your ${danceStyle} today at BOH Studios. Keep your knees relaxed on beat 1 and trust the rhythm—the clave is your anchor. Practice the 4-minute grounding drill twice this week and let's polish it Thursday night! 🇨🇺🔥`,
  };
}

export function generateDeterministicFacebookEvent(
  rawText?: string,
  hasFlyer?: boolean
): ParsedEventCard {
  const text = rawText || "";
  const lower = text.toLowerCase();

  const isFestivalOrCongress =
    lower.includes("festival") ||
    lower.includes("congress") ||
    lower.includes("all-dayer") ||
    lower.includes("alldayer") ||
    lower.includes("advance ticket") ||
    lower.includes("early bird") ||
    lower.includes("pass");

  const bookingType: "DOOR_ONLY" | "ONLINE_TICKET" = isFestivalOrCongress
    ? "ONLINE_TICKET"
    : "DOOR_ONLY";

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const matchedDay = days.find((d) => lower.includes(d));
  const dateDisplay = matchedDay
    ? `${matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1)}, Upcoming Salsa Fiesta`
    : "Saturday, Special Havana Night";

  let doorsTime = "19:30 Doors Open (Classes 20:00)";
  if (lower.includes("20:00") || lower.includes("8pm")) {
    doorsTime = "20:00";
  } else if (lower.includes("19:00") || lower.includes("7pm")) {
    doorsTime = "19:00";
  } else if (lower.includes("21:00") || lower.includes("9pm")) {
    doorsTime = "21:00";
  }

  let priceDisplay = `${DOOR_PRICING.summaryBadge}`;
  if (isFestivalOrCongress) {
    priceDisplay = "£25 Full Pass / £15 Evening Fiesta";
  } else if (lower.includes("£") || lower.includes("pounds")) {
    const priceMatch = text.match(/£\d+(\s*\/\s*£\d+)?/);
    if (priceMatch) {
      priceDisplay = priceMatch[0];
    }
  }

  const rawTitle = text.length > 50 ? text.slice(0, 48).trim().replace(/[^\w\s-]/g, "") : "";
  const title = rawTitle || (hasFlyer ? "Cuban Havana Fiesta & Party Poster" : "Cuban Salsa Fiesta at BOH Studios");

  return {
    id: `event-${Date.now()}`,
    title,
    subtitle: `Hosted by ${ACADEMY_METRICS.founderTitleName} • ${ACADEMY_METRICS.yearsInUkLabel}`,
    dateDisplay,
    doorsTime,
    venue: VENUE_INFO.fullAddress,
    priceDisplay,
    bookingType,
    highlights: [
      "Authentic Cuban Salsa & Rueda de Casino masterclasses with Maestro Enrique Perez",
      `Canadian Sprung Maple Floor at ${VENUE_INFO.name}`,
      "Authentic Havana party energy with live Timba & Bachata social dancing until midnight",
    ],
    instagramOrFbSummary: `Join Maestro Enrique Perez at BOH Studios for an unmissable night of authentic Cuban rhythm, community, and social dancing. Free parking after 18:00 and zero partner required to join.`,
    ctaUrl: "/events",
  };
}

export function generateDeterministicVideoAssessment(
  input: VideoPreCheckInput
): VideoPreCheckAssessment {
  const { studentName, level, moveOrSong } = input;

  return {
    overallReadiness: "READY_FOR_APPROVAL",
    confidenceScore: 92,
    timestampedObservations: [
      {
        timestamp: "0:04",
        zone: "Frame & Posture",
        observation: `Solid chest-up posture through the initial Guapea. Shoulders remain dropped and connected to the latissimus without collapsing downward.`,
        fixCue: "Maintain elastic tension in the left elbow during the outside break.",
      },
      {
        timestamp: "0:11",
        zone: "Clave & Timing",
        observation: `Clear step accents on beats 1 and 5 matching the Son Clave conga cadence. Break step on 1 is crisp and deliberate.`,
        fixCue: "Let count 4 and 8 breathe fully rather than rushing the transition step.",
      },
      {
        timestamp: "0:18",
        zone: "Footwork & Weight Transfer",
        observation: `Excellent weight commitment on the ball of the foot during the rotational pivot of ${moveOrSong}. Sprung maple floor rebound is used efficiently.`,
        fixCue: "Keep toes pointing outward slightly at 45 degrees to protect the knees during tight spins.",
      },
    ],
    instructorDraftReply: `¡Excelente trabajo, ${studentName}! Your execution of ${moveOrSong} shows fantastic Cuban flavor and rhythmic discipline for the ${level} syllabus. Your grounding on count 1 is right in the pocket. Let's sharpen the elbow connection on the turn this Thursday at BOH Studios! 🇨🇺🔥`,
  };
}

export function generateDeterministicGoogleReview(
  input: GoogleReviewDraftInput
): GoogleReviewDraftOutput {
  const { favoriteAspect, instructorHighlight, dancerLevel } = input;

  let reviewText = "";
  if (favoriteAspect === "Thursday & Sunday Social Vibe") {
    reviewText = `The Thursday and Sunday Cuban Salsa nights at BOH Studios Bournemouth are genuinely world-class! Whether you are a ${dancerLevel.toLowerCase()} or experienced dancer, ${instructorHighlight} and the community make you feel instantly at home. The Canadian sprung dance floor is incredible and the energy is unmatched!`;
  } else if (favoriteAspect === "Enrique's Authentic Cuban Teaching") {
    reviewText = `Learning Cuban Salsa in Bournemouth with ${instructorHighlight} is the real deal! You learn authentic clave rhythm, Cuban culture, and Rueda de Casino at BOH Studios with zero partner required. If you want proper Cuban dance teaching in Dorset, Salsa Explosion is hands down the best!`;
  } else if (favoriteAspect === "Beginner-Friendly Rueda de Casino") {
    reviewText = `I joined Salsa Explosion as a ${dancerLevel.toLowerCase()} and was blown away by how welcoming the Rueda de Casino classes are at BOH Studios Bournemouth. ${instructorHighlight} breaks everything down with so much humor and patience. Best Thursday and Sunday night out in Bournemouth!`;
  } else {
    reviewText = `The Timba music and Havana social atmosphere at BOH Studios is unbeatable! ${instructorHighlight} brings pure Cuban energy to Bournemouth every single week. Highly recommend Salsa Explosion to anyone looking for genuine Cuban Salsa classes and vibrant social dancing!`;
  }

  return {
    reviewText,
    localSeoKeywordsIncluded: [
      "Cuban Salsa Bournemouth",
      "BOH Studios Bournemouth",
      "Rueda de Casino",
      "Maestro Enrique Perez",
    ],
  };
}
