"use server";

import { GoogleGenAI, Type } from "@google/genai";
import {
  AiCoachingInput,
  AiCoachingInputSchema,
  AiCoachingOutput,
  AiCoachingOutputSchema,
  FacebookEventImportInput,
  FacebookEventImportInputSchema,
  FacebookEventImportOutputSchema,
  ParsedEventCard,
} from "@/lib/validations/ai-studio.schema";
import { VENUE_INFO, DOOR_PRICING, ACADEMY_METRICS } from "@/lib/academy-data";

export interface AiActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: "gemini" | "deterministic_fallback";
}

// -------------------------------------------------------------
// DETERMINISTIC FALLBACK GENERATORS (100% Reliable Offline/Demo)
// -------------------------------------------------------------

function generateDeterministicCoachingPlan(
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

function generateDeterministicFacebookEvent(
  rawText: string
): ParsedEventCard {
  const lower = rawText.toLowerCase();

  // Booking type inference based on BOH Studios rules:
  // Weekly Thursday/Sunday classes = DOOR_ONLY.
  // Special festivals, congresses, or all-nighters = ONLINE_TICKET.
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

  // Date heuristic extraction
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const matchedDay = days.find((d) => lower.includes(d));
  const dateDisplay = matchedDay
    ? `${matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1)}, Upcoming Salsa Fiesta`
    : "Saturday, Special Havana Night";

  // Doors time heuristic
  let doorsTime = "19:30 Doors Open (Classes 20:00)";
  if (lower.includes("20:00") || lower.includes("8pm")) {
    doorsTime = "20:00";
  } else if (lower.includes("19:00") || lower.includes("7pm")) {
    doorsTime = "19:00";
  } else if (lower.includes("21:00") || lower.includes("9pm")) {
    doorsTime = "21:00";
  }

  // Price heuristic
  let priceDisplay = `${DOOR_PRICING.summaryBadge}`;
  if (isFestivalOrCongress) {
    priceDisplay = "£25 Full Pass / £15 Evening Fiesta";
  } else if (lower.includes("£") || lower.includes("pounds")) {
    const priceMatch = rawText.match(/£\d+(\s*\/\s*£\d+)?/);
    if (priceMatch) {
      priceDisplay = priceMatch[0];
    }
  }

  return {
    title: rawText.length > 50 ? rawText.slice(0, 48).trim().replace(/[^\w\s-]/g, "") || "Cuban Salsa Fiesta at BOH Studios" : "Cuban Salsa Fiesta at BOH Studios",
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
  };
}

// -------------------------------------------------------------
// SERVER ACTIONS
// -------------------------------------------------------------

/**
 * AI Syllabus & Musicality Copilot Action
 * Converts student level + dance struggle into 3 structured micro-drills, clave cues, and feedback note.
 */
export async function generateCoachingPlanAction(
  rawInput: AiCoachingInput
): Promise<AiActionResponse<AiCoachingOutput>> {
  const parsedInput = AiCoachingInputSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    const errorMsg = parsedInput.error.issues[0]?.message || "Invalid input";
    return { success: false, error: errorMsg };
  }

  const { level, danceStyle, struggle } = parsedInput.data;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "mock_gemini_key_for_testing") {
    // Graceful deterministic fallback
    const fallback = generateDeterministicCoachingPlan(parsedInput.data);
    return { success: true, data: fallback, source: "deterministic_fallback" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Maestro Enrique Perez Valdes's senior Cuban dance pedagogue at Salsa Explosion UK (BOH Studios Bournemouth).
You teach authentic Cuban Salsa, Rueda de Casino, and Timba Musicality with 25+ years heritage.
Always structure advice strictly according to 2:3 or 3:2 Son/Rumba Clave, musical phrasing, and Canadian sprung maple dance floor ergonomics.
Provide warm, encouraging, and razor-sharp biomechanical instruction.`;

    const prompt = `A student with level "${level}" dancing "${danceStyle}" is experiencing this struggle:
"${struggle}"

Generate:
1. Exactly 3 micro-drills (title, steps, focusBeat, durationMinutes between 3-10).
2. claveCue: precise listening cue for conga, clave, or campana.
3. rhythmTip: advice on timing and musicality.
4. feedbackNote: a warm, WhatsApp-ready message signed off in Cuban style with emojis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  steps: { type: Type.STRING },
                  focusBeat: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                },
                required: ["title", "steps", "focusBeat", "durationMinutes"],
              },
            },
            claveCue: { type: Type.STRING },
            rhythmTip: { type: Type.STRING },
            feedbackNote: { type: Type.STRING },
          },
          required: ["drills", "claveCue", "rhythmTip", "feedbackNote"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const rawParsed = JSON.parse(responseText);
    const validatedOutput = AiCoachingOutputSchema.parse(rawParsed);

    return {
      success: true,
      data: validatedOutput,
      source: "gemini",
    };
  } catch (err: unknown) {
    console.error("Gemini Copilot Error, using fallback:", err);
    // Fail-soft to deterministic fallback
    const fallback = generateDeterministicCoachingPlan(parsedInput.data);
    return {
      success: true,
      data: fallback,
      source: "deterministic_fallback",
    };
  }
}

/**
 * Facebook Post-to-Website Event Importer Action
 * Ingests raw Facebook event posts and converts them into structured ParsedEventCard data.
 */
export async function parseFacebookPostToEventAction(
  rawInput: FacebookEventImportInput
): Promise<AiActionResponse<ParsedEventCard>> {
  const parsedInput = FacebookEventImportInputSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    const errorMsg = parsedInput.error.issues[0]?.message || "Invalid input";
    return { success: false, error: errorMsg };
  }

  const { rawFacebookText } = parsedInput.data;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "mock_gemini_key_for_testing") {
    const fallback = generateDeterministicFacebookEvent(rawFacebookText);
    return { success: true, data: fallback, source: "deterministic_fallback" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the executive event curator for Maestro Enrique Perez Valdes at Salsa Explosion UK (BOH Studios Bournemouth).
Extract structured website event card details from raw social media / Facebook event posts.
Canonical Venue: "${VENUE_INFO.fullAddress}".
Pricing rule:
- Regular weekly Thursday/Sunday classes at BOH Studios are strictly DOOR_ONLY (£12 1 class / £14 2 classes at the door).
- Special events, congresses, and festivals with guest artists or advance tickets are ONLINE_TICKET.
Format highlights concisely as 3 bullet points.`;

    const prompt = `Parse this raw Facebook post into our canonical event schema:
"""
${rawFacebookText}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            dateDisplay: { type: Type.STRING },
            doorsTime: { type: Type.STRING },
            venue: { type: Type.STRING },
            priceDisplay: { type: Type.STRING },
            bookingType: {
              type: Type.STRING,
              enum: ["DOOR_ONLY", "ONLINE_TICKET"],
            },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            instagramOrFbSummary: { type: Type.STRING },
          },
          required: [
            "title",
            "subtitle",
            "dateDisplay",
            "doorsTime",
            "venue",
            "priceDisplay",
            "bookingType",
            "highlights",
            "instagramOrFbSummary",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const rawParsed = JSON.parse(responseText);
    const validatedOutput = FacebookEventImportOutputSchema.parse(rawParsed);

    return {
      success: true,
      data: validatedOutput,
      source: "gemini",
    };
  } catch (err: unknown) {
    console.error("Gemini FB Importer Error, using fallback:", err);
    const fallback = generateDeterministicFacebookEvent(rawFacebookText);
    return {
      success: true,
      data: fallback,
      source: "deterministic_fallback",
    };
  }
}
