# AI Studio song maker (Argus)

How to set up Google AI Studio so it returns song maps the practice player accepts as-is.
Both files here are generated from the app's own values: re-run
`npx tsx scripts/ai-studio-song-maker.ts` after changing gears, styles, timing modes or moves.

## One-time setup

1. AI Studio → **Playground** → new chat. Model: **Gemini 4 Argon** (paid). On Marcando La
   Distancia (31 Oct 2026) two Argon runs agreed within 0.5 s on 9 of 11 section starts;
   Gemini Pro Latest (3.1 Pro Preview) matched only 4 of them.
2. **System instructions**: replace everything with the contents of `system-instructions.txt`.
3. **Temperature**: leave the default `1` (Google advises against lowering it for Gemini 3
   models). **Thinking level**: `High`.
4. **Structured outputs**: on → **Edit** → code editor → replace everything with
   `response-schema.json` → Save.
5. Tools: **Code execution, Function calling, Grounding with Google Search, Grounding
   with Google Maps and URL context all off.** (Search pulls timings from other versions.)
6. Advanced settings (optional): if there's a **Media resolution** option, `Low` is
   enough. Timing comes from the audio, and Low uses fewer tokens.
7. Save the prompt (name it e.g. "Argus song maker") so you can reuse the setup.

## Each song (one song per run)

1. **Start a brand-new chat for every song** (a fresh copy of the saved prompt). Don't
   continue the chat you used for the last song: the model copies the earlier song's
   video id, length and times. That happened with Temba, Tumba, Timba on 31 Oct 2026.
   In the new chat, check the System instructions box starts with
   "You are Argus, the song maker for RitmoFlow".
2. Attach the video: **+** (insert) → **YouTube video** → paste the link. The video must
   appear as an attachment (a thumbnail in your message, and the token count goes up by
   tens of thousands). A link typed as text is not watched, and the model then guesses
   timings from memory.
3. Message (fill in the id and the length shown on YouTube, in seconds):

   ```
   Time this song: <Title> by <Artist>.
   The attached video is the exact upload the app plays.
   youtubeVideoId: <id>, youtubeUrl: https://www.youtube.com/watch?v=<id>, durationSeconds: <length>
   ```

4. Run, copy the JSON, paste it to Claude (or into /instructor/song-maps).
5. Ear-calibrate the starts listed in `unsureBoundaries` first (`/music/<song>?calibrate=1`).

## If something looks wrong

- `"On1"`, a missing `style`, or adjectives in `handGesture` mean the schema wasn't
  applied: check Structured outputs is on and the saved schema is this one.
- Wildly wrong section times: check the video was attached (step 2), not just linked.
- "An internal error has occurred" with the JSON cut off: run it again (Argon stopped once after
  about 60 s). Don't paste a cut-off answer; the importer can't read it.
- bpm around 180-220: the model counted half-beats. The importer warns; halve bpm and bars.
- Times like `118` where formattedRange says `1:18`: the model typed m:ss as digits. The
  importer repairs this from formattedRange and says so; still check those starts by ear.
- A video id that isn't the one you gave (e.g. `vanvantemba`): the importer warns that it
  looks made up. Put the real id in the message (step 3).
