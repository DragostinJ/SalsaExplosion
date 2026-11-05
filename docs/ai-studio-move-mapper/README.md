# AI Studio Move Mapper

The Move Mapper watches a YouTube clip of dancers and writes down what they dance, row by row: the figures, shines, rumba, body movement, and how they react to the music. A teacher checks every row against the video before any dancer sees it.

Everything here except this README, `build-app-prompt.md` and `chat-version.md` is generated from the app's move library and songs:

```bash
npx tsx scripts/ai-studio-move-mapper.ts   # re-run after the library or the songs change
```

| File | What it is |
|---|---|
| `build-app-prompt.md` | Paste into AI Studio **Build** to (re)build the Move Mapper app. It runs on the free API key (20 requests a day on 3.8 Flash, no Argon). |
| `chat-version.md` | The same job in a plain AI Studio chat, on the Google AI Pro allowance with Argon. `scripts/move-mapper-chat.ts` cuts the pieces and joins the answers. |
| `system-instructions.txt` | Pass 2, the mapper: how to describe and name what is danced, plus the catalogue of every move dancers can see. |
| `response-schema.json` | Pass 2 structured output. Gemini can only answer with real move ids. |
| `response-schema-lite.json` | The same without the move-id list. Use it only if AI Studio says the schema is too big. |
| `segmenter-instructions.txt`, `segmenter-schema.json` | Pass 1: find where each piece of dancing starts and ends. |
| `gold-set.md` | 26 clips with a known answer, to measure the Mapper. |
| `song-maps.md` | Each song's sections, to paste as "Song map:" when the clip is that song's video. |

## Why it works this way

The first run on Paolo & Alina got the big picture right (casino, then rumba, then despelote) but the figure names wrong. There were three causes, and each change below answers one:

1. **It saw about 1 frame per second.** That is Gemini's default for video, and Google's docs warn that fast action loses detail. A hand change takes less than a second. **Fix:** pass 2 looks at one piece of 8–30 s at a time, at 8 frames per second. The API can do this; the plain chat window may not, which is why the app exists.
2. **It was asked for names straight away,** and guessed the nearest famous one. **Fix:** describe first, name last. Each row says count by count which hands hold, who turns which way and where the hands travel. Only then does it pick a move. A teacher can check a description in seconds, even when the name is wrong.
3. **It cut the video every ~11 seconds,** whatever was danced. **Fix:** pass 1 cuts where the dancing changes (a figure ends back in open position, the music changes section).

It also has to be honest:
- confidence is "high" only when the holds and turns were clearly visible;
- it says when the camera cut or the hands were hidden;
- "not-in-library" when nothing fits (two gold clips test exactly this);
- "Name heard:" when the video says the name out loud.

## Step 1: measure it on the gold set (do this first)

1. Build the app with `build-app-prompt.md`.
2. Run the 26 clips in `gold-set.md`, saving each answer as `<clip id>.json` in one folder outside the repo, for example `../mapper-answers`.
3. Score them (pass the folder; PowerShell does not expand `*.json`):
   ```bash
   npx tsx scripts/score-move-mapper.ts ../mapper-answers
   ```
4. Send Claude the score and the misses. Each miss shows what to fix in the instructions; we change them, regenerate, and run again.

A good first target: at least 18 of the 24 named figures "seen" or "heard", and both not-in-library clips "honest". Until it gets there, treat its names on pro clips as suggestions only.

## Step 2: pro clips

Good clips are easy to read:
- **one couple;**
- **a fixed, wide camera** with their whole bodies in view;
- **few camera cuts;**
- **good light.**

Congress workshop demos are ideal, because the teachers dance the combination slowly and then at speed. Social-floor clips with crowds and camera cuts are much harder.

1. In the app, fill in the header from YouTube: title, channel, dancers, and a song id if the clip is one of our songs' own videos.
2. Run pass 1, check the pieces, then run pass 2. Tick "Second opinion" for anything that will reach dancers.
3. Copy the JSON. Paste it into `/instructor/clips`, the teacher review page (being built on `feat/pro-clips-foundation`), or send it to Claude until that page is live.
4. A teacher plays each row, then confirms, fixes or rejects it. Only confirmed rows are saved.

## Step 3: musicality

Set Focus to **musicality**. If the clip is one of our songs' own videos, paste that song's block from `song-maps.md` as the song map. Every reaction to the music becomes its own row, for example "brass hits on 1 and 2: both freeze". This is where pros teach the most, and it is easier for Gemini than hand changes, because the whole body moves.

## Without the app (plain AI Studio chat)

Use `chat-version.md`: a script writes every message below for you and joins the answers. By hand:

1. Choose the strongest Gemini model that accepts video.
2. Set System instructions to `system-instructions.txt`.
3. Turn Structured output ON with `response-schema.json`.
4. Add the YouTube video. If the video settings let you set a start, an end and a frame rate, use one piece at a time at 8 fps.
5. Send this message:
   ```
   Video: https://www.youtube.com/watch?v=<id>
   Piece: 0:56 to 1:18 (times in the original video)
   Clip id: <kebab-case id>
   Title: <as on YouTube>
   Channel: <as on YouTube>
   Dancers: <names>
   Song id: <one of ours, or leave this line out>
   Song map: <block from song-maps.md, or leave this line out>
   Frames per second: 8
   Focus: moves
   ```

Use a new chat for every video, so nothing carries over from the last one.

## Rules that never change

- **Video:** the YouTube URL is read by Gemini, so nothing is downloaded or re-hosted. The app and the site show videos only in YouTube's own player, at least 200×200, never covered.
- **Credit:** credit the dancers and the channel. If one couple ends up featured a lot, ask them first.
- **Facts:** the Mapper never invents ids, names or moves, and song timings still come only from the song maker.
