# Build prompt: upgrade the "RitmoFlow Move Mapper" app

Paste everything below the line into AI Studio **Build** (the chat that made the Move Mapper app), and attach these 4 files from this folder:
`system-instructions.txt`, `response-schema.json`, `segmenter-instructions.txt`, `segmenter-schema.json`.

If the app breaks, start a new Build app with the same message.

---

Rebuild the RitmoFlow Move Mapper as a single-page app that analyses a YouTube dance video in two passes and outputs one JSON breakdown. I attached 4 files. Embed each one VERBATIM as a constant, never edited or summarised:
- `system-instructions.txt` → MAPPER_INSTRUCTIONS
- `response-schema.json` → MAPPER_SCHEMA
- `segmenter-instructions.txt` → SEGMENTER_INSTRUCTIONS
- `segmenter-schema.json` → SEGMENTER_SCHEMA

## 1. Inputs
- YouTube URL. Accept watch, youtu.be, shorts and embed links, and extract the 11-character id.
- Clip id (kebab-case). Suggest it from the title; the user can edit it.
- Title and channel, typed by me exactly as on YouTube.
- Dancers: a comma-separated list.
- Song id: a dropdown of the songId enum in MAPPER_SCHEMA, plus "none".
- Song map: an optional textarea, sent as it is.
- Focus: "moves" (default) or "musicality".
- Frames per second for pass 2: default 8, range 1–24.
- Longest piece: default 25 s.
- Model: a picker listing the Gemini models that accept video. Default to the strongest one.
- "Second opinion" checkbox, off by default (see section 6).

## 2. Video API (check this first)
Use the current Google Gen AI SDK with a public YouTube URL as the video part. Never download or re-host the video.
- Per the Gemini video docs, frame rate and clipping go in a `processing` object: `{ type: "static", fps, start_offset, end_offset }`, with offsets in seconds.
- If the SDK in this app uses `videoMetadata: { fps, startOffset: "12s", endOffset: "40s" }` instead, use that.
- Add a "Check clipping" button. It runs pass 2 on 0:30–0:40 and shows whether every returned row falls between 0:30 and 0:40 (absolute) or between 0:00 and 0:10 (relative). Section 4 depends on this.
- Before every run, show an estimate: frames = seconds × fps, at about 258 tokens per frame.

## 3. Pass 1: find the pieces
- One call over the whole video at fps 1, with SEGMENTER_INSTRUCTIONS, `responseMimeType: "application/json"` and SEGMENTER_SCHEMA.
- Show the pieces in an editable table with columns start, end, kind, label and include. "not-dancing" pieces start unticked.
- Let me edit start and end, delete a piece, add a piece, and split a piece in two.
- Any piece longer than "Longest piece" is split automatically into equal parts.

## 4. Pass 2: map each piece
- Run the included pieces in order, one call each:
  - the video part with fps = my setting, start_offset = piece start − 1 s (never below 0) and end_offset = piece end + 1 s;
  - MAPPER_INSTRUCTIONS and MAPPER_SCHEMA.
- The user message for each call is exactly:
  ```
  Video: <url>
  Piece: <start M:SS> to <end M:SS> (times in the original video)
  Clip id: <clip id>
  Title: <title>
  Channel: <channel>
  Dancers: <names>
  Song id: <song id, or leave this line out>
  Song map: <text, or leave this line out>
  Frames per second: <fps>
  Focus: <moves|musicality>
  ```
- Show progress ("piece 3 of 12"). Add a Stop button.
- After every call, show the response's `usageMetadata` (promptTokenCount, candidatesTokenCount, totalTokenCount) next to the piece, with the model and fps actually sent. Show the run total at the top of pass 2.
- On 429 or 503 errors, retry up to 3 times with backoff. Keep the pieces that succeeded and mark failed pieces so I can re-run only those.
- Time normalisation, per piece:
  - Parse every time ("M:SS", "M:SS.s", "H:MM:SS").
  - The clip-relative test: the piece starts after 0:05 and every row lies between 0 and (piece length + 2 s). If it holds, the model answered relative to the clip, so add the start offset to every time and show a small "times shifted" note on that piece.
  - Then clamp the rows to the piece.

## 5. Merge into one breakdown
- Header fields (kind, version 1, id, youtubeVideoId, title, channelTitle, dancers, songId) come from MY inputs, never from the model.
- `analysis`: the model name, my fps, and the notes of all pieces joined together.
- `rows`: all rows sorted by start.
  - Pieces are sent with 1 s of padding, so a figure on the border between two pieces can come back twice, once from each piece. If a row from one piece overlaps or nearly touches (gap under 1 s) a row from the next piece, and both have the same type and moveIds, make them one row: the earlier start, the later end, and the mechanics and confidence of the longer row.
  - Then, where two rows overlap, end the earlier row where the later one starts.
  - Drop rows shorter than 1 s.

## 6. Second opinion (when ticked)
- Run pass 2 twice per piece. The second run may use a second model I pick.
- For each row of run A, find the run B rows that overlap it by more than half.
- If their moveIds differ:
  - set the run A row's confidence to "low";
  - append ` Second run saw: <ids, or not-in-library>.` to its mechanics, shortening the original text so the total stays at most 1,200 characters.
- Show the agreement rate at the top: the share of rows where both runs named the same moves.

## 7. Output
Before enabling Copy, check:
- kind and version are present;
- there is at least 1 row;
- every time parses, and every start is before its end;
- the rows are sorted and don't overlap;
- every moveId is in the moveIds enum of MAPPER_SCHEMA;
- the clip id is kebab-case (lowercase letters, digits and single hyphens);
- 1 to 6 dancers, 1 to 200 rows, mechanics 20–1,200 characters, musicalMoment at most 300.

Then:
- List any problems in plain words.
- Show the final JSON pretty-printed in a read-only box, with "Copy JSON" and "Download <clip id>.json" buttons.

## 8. Video preview
- Show the video with the official YouTube embed (youtube-nocookie iframe), at least 200×200, with nothing drawn over it.
- Clicking a row or a piece reloads the embed at its start time.

## 9. Don'ts
- Never invent a title, channel, dancer or move id. They come from my inputs or the schema.
- Never put an API key in the code. Use AI Studio's built-in key handling.
- Never mix extra audio over the video or hide the player while it plays.
