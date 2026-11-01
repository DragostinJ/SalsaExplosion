# AI Studio Move Maker

How to set up Google AI Studio to draft rich, anatomically accurate move entries for the RitmoFlow Cuban dance curriculum and move library.

Both setup files here are generated directly from the application's Zod schemas and enums:
Re-run `npx tsx scripts/ai-studio-move-maker.ts` whenever categories, levels, rueda calls, or curriculum items are updated.

---

## 1. One-Time Setup in Google AI Studio

1. Navigate to [Google AI Studio](https://aistudio.google.com/) -> **Playground** -> **New Chat**.
2. **Model**: Select **Gemini 2.5 Pro** or **Gemini 4 Argon** (with **Thinking Process** enabled).
3. **System instructions**: Copy the entire contents of [`system-instructions.txt`](system-instructions.txt) and paste it into the System Instructions box.
4. **Structured Outputs**:
   - Toggle **Structured Outputs** to **ON**.
   - Click **Edit** (code editor mode).
   - Paste the entire contents of [`response-schema.json`](response-schema.json).
   - Click **Save**.
5. **Tools**: Ensure **Google Search**, **Code Execution**, and **URL Context** are turned **OFF** so the model relies on authentic Cuban terminology rather than generic linear salsa blog posts.
6. **Save Prompt**: Name it e.g. `"RitmoFlow Move Maker"` for easy reuse.

---

## 2. Drafting Each Move (Per-Move Steps)

1. **Start a Fresh Chat** or clear history to avoid cross-contamination of move IDs or figures.
2. Send a prompt with the move you wish to draft:
   ```text
   Draft the Cuban dance entry for: "Enchufla Doble" (Level: Improver, Category: "Casino figure").
   Prerequisites: enchufla, dile-que-no.
   Provide authentic Cuban circular mechanics, counts 1-8 (pausing 4 and 8), separate leader and follower steps, and safety warnings for shoulder tension.
   ```
3. Run the prompt. Gemini will return a structured JSON response matching [`response-schema.json`](response-schema.json).
4. Copy the JSON output.

---

## 3. Mandatory Teacher Review Before Publishing

> [!IMPORTANT]
> **Anti-Hallucination & Dancer Safety Requirement**
> AI Studio produces **drafts only**. AI frequently misses partner connection subtleties, wrist tension, or weight transfer nuances.
> 
> **Every single move drafted by AI must be physically verified by a qualified instructor** before it is published to students:
> 1. Verify `leaderSteps` and `followerSteps` match authentic Cuban circular body mechanics.
> 2. Verify `eightCounts` (whether the figure takes 1 eight-count, 2 eight-counts, or more).
> 3. Verify safety warnings for any dips, wraps, neck drapes, or arm hooks.
> 4. Once verified, populate the **`reviewedBy`** field with the teacher's name (e.g. `"Enrique Perez"`).
> 
> Unreviewed moves remain tagged as drafts (`reviewedBy` empty or undefined) and will not be displayed as certified curriculum technique.

---

## 4. Video Integration Note

- The Move Maker schema **deliberately does not include a `videos` field**. Gemini frequently hallucinates YouTube video IDs that point to broken links or wrong videos.
- Video candidates are sourced using the automated YouTube candidate finder (`scripts/find-move-videos.ts`) and curated manually with verified start and end timestamps.
