# Gemini move check

The 210 drafts in `src/lib/moves/data/move-drafts.json` were written by Gemini from move names. Before the teachers review them, a second Gemini pass looks for clear mistakes and returns exact text replacements. Claude checks every replacement, applies the ones that hold up, and turns doubtful ones into "UNSURE:" notes for the teachers.

Each batch is one self-contained message for the Gemini app: the rules below, then about 12 moves as one JSON object per line (id, name, category, level, eightCounts, summary, steps, common mistakes, variations, notes). The Gemini Batch Day page builds the batches from the drafts file, beginners first.

## The rules sent with every batch

```text
You are checking Cuban salsa (casino) and rueda de casino move descriptions for a dance school's website, before the teachers review them. An AI wrote these drafts and they may contain mistakes. Find the clear mistakes and give exact corrections.

Conventions to check against:
- Casino steps on 1, 2, 3 and 5, 6, 7, and pauses on 4 and 8. A weight change written on 4 or 8 is a mistake unless the text says it is a tap, a hold or a syncopation.
- Open hold: the leader's left hand holds the follower's right hand. Closed hold: the leader's right hand is on the follower's back and his left hand holds her right. Right hand to right hand (a handshake hold) is only correct where the move says it switches to that hold.
- Step labels "1-3" and "5-7" are the first eight-count, "9-11" and "13-15" the second, and so on. The labels must fit the move's eightCounts.
- Turning left means turning anticlockwise seen from above. The summary, the leader's steps and the follower's steps must agree on every turn and on where each dancer ends up.
- In rueda, the summary and the steps must agree on whether the leader changes partner.

Report only these kinds of problems:
- hold: a wrong hand or hold;
- counts: a weight change on 4 or 8, labels that don't fit eightCounts, or counts that contradict the text;
- contradiction: the summary, the leader's steps and the follower's steps disagree;
- direction: a turn or travel direction that contradicts another part of the same move;
- safety: advice that could hurt someone;
- wording: a non-English word inside an English sentence (Spanish move names and dance terms are fine), a typo, or a broken sentence.

Don't change style, length, names, ids, levels or categories. Don't add moves, steps, facts or variations. If something looks doubtful but you are not sure it is wrong (for example a school-specific way of dancing a call), put it in flags, not in fixes.

Reply with exactly one JSON code block and nothing else, in this shape:
{"batch": "<batch id>", "fixes": [{"id": "<move id>", "field": "summary | leaderSteps | followerSteps | commonMistakes | variations | notes", "from": "<exact text copied from that field>", "to": "<corrected text>", "kind": "hold | counts | contradiction | direction | safety | wording", "why": "<one short sentence>"}], "flags": [{"id": "<move id>", "issue": "<one short sentence a teacher should confirm>"}]}

Rules for fixes:
- "from" is copied character for character from one field of one move and appears only once in that field. Keep it short: the words that change plus a few around them.
- "to" replaces only "from". Change as few words as possible.
- For leaderSteps, followerSteps, commonMistakes and variations, "from" is text inside one item.
- Empty arrays are a fine answer when a batch has no clear mistakes.
```

## How Claude applies the answers

- The answers land in Downloads as `gemini-code-*.json`, one per batch.
- A fix is applied only when its "from" text is found exactly once in the named field. Hold, direction and count fixes are read one by one against the rest of the move. A fix that changes what a dancer does, and that Claude can't confirm, becomes an "UNSURE:" note instead.
- Flags become "UNSURE:" notes on the move, for the teachers.
