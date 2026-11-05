# Move Mapper in a plain AI Studio chat

The Build app calls Gemini with the **free API key**: 20 requests a day on Gemini 3.8 Flash, and no Gemini 4 Argon at all. A **chat** in the AI Studio website runs on the Google AI Pro subscription instead: a higher allowance and Argon. The chat can't cut the video or join the answers, so a script does those two jobs, the same way the app did.

## 1. Prepare a run (one command)

```bash
# a gold-set clip (title and channel come from the gold set)
npx tsx scripts/move-mapper-chat.ts prepare --gold 1 --from 0:04 --to 0:19

# any YouTube clip (title and channel are read from YouTube, never typed)
npx tsx scripts/move-mapper-chat.ts prepare --url https://www.youtube.com/watch?v=<id> \
  --from 0:29 --to 1:07 --id paolo-alina-homenaje --dancers "Paolo, Alina" --song homenaje-a-la-musica-cubana
```

Options: `--piece 20` (longest piece in seconds), `--fps 8`, `--focus musicality`, `--model "Gemini 4 Argon"` (what you will pick in AI Studio), `--out <folder>`.

It makes `../mapper-answers/chat/<clip id>/` with:
- `messages.md`: the set-up, then for every piece the video settings (start, end, frame rate) and the exact message to paste;
- an empty `piece-01.json`, `piece-02.json`… for the answers;
- `pieces.json`: what the join step needs.

## 2. Run the pieces in AI Studio

Follow `messages.md`. Two rules:
- **Clear the chat between pieces** (or delete the last message and its answer). A chat sends its whole history every turn, so the old piece's video frames would be paid for again.
- **Check the model picker before each piece.** Don't trust the name in the answer's `analysis.model`: Argon calls itself "gemini-2.5-pro". The join step records the model you picked (`--model`, default Gemini 4 Argon).
- **Type the video settings as AI Studio wants them:** `0h0m3s`, `0h1m8s`. `messages.md` writes them that way.

If the video settings have no frame-rate box, run the piece anyway and say so: Gemini then sees 1 frame a second, which is too few for hand changes, and we'll know the chat can't replace the app for fast figures.

## 3. Join the answers

```bash
npx tsx scripts/move-mapper-chat.ts merge ../mapper-answers/chat/<clip id>
```

It:
- puts every row on the original video's clock (adds the clip start if the chat counted from the clip's first frame);
- joins a figure split across two pieces, ends a row where the next one starts, and drops rows under 1 s;
- takes the header (id, title, channel, dancers, song) from the run, never from the chat;
- checks the result with the same rules as `/instructor/clips`.

The answer is saved as `../mapper-answers/chat/<clip id>.json`. Paste it into `/instructor/clips`, score gold clips with `npx tsx scripts/score-move-mapper.ts ../mapper-answers/chat`, or send the piece answers to Claude.
