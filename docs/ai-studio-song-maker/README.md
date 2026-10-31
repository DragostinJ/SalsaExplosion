# AI Studio song maker (Argus)

How to set up Google AI Studio so it returns song maps the practice player accepts as-is.
Both files here are generated from the app's own values: re-run
`npx tsx scripts/ai-studio-song-maker.ts` after changing gears, styles, timing modes or moves.

## One-time setup

1. AI Studio → **Playground** → new chat. Model: **Gemini Pro (latest)**.
2. **System instructions**: replace everything with the contents of `system-instructions.txt`.
3. **Temperature**: `0.2`. **Thinking level**: `High`.
4. **Structured outputs**: on → **Edit** → code editor → replace everything with
   `response-schema.json` → Save.
5. Tools: **Code execution, Function calling, Grounding with Google Search, Grounding
   with Google Maps and URL context all off.** (Search pulls timings from other versions.)
6. Advanced settings (optional): if there's a **Media resolution** option, `Low` is
   enough. Timing comes from the audio, and Low uses fewer tokens.
7. Save the prompt (name it e.g. "Argus song maker") so you can reuse the setup.

## Each song (one song per run)

1. Open a fresh copy of the saved prompt (or a new chat with the same settings).
2. Attach the video: **+** (insert) → **YouTube video** → paste the link. The video must
   appear as an attachment. A link typed as text is not watched, and the model then
   guesses timings from memory.
3. Message:

   ```
   Time this song: <Title> by <Artist>.
   The attached video is the exact upload the app plays: https://www.youtube.com/watch?v=<id>
   ```

4. Run, copy the JSON, paste it to Claude (or into /instructor/song-maps).
5. Ear-calibrate the starts listed in `unsureBoundaries` first (`/music/<song>?calibrate=1`).

## If something looks wrong

- `"On1"`, a missing `style`, or adjectives in `handGesture` mean the schema wasn't
  applied: check Structured outputs is on and the saved schema is this one.
- Wildly wrong section times: check the video was attached (step 2), not just linked.
