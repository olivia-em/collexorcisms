# Collected Exorcisms — Complete Mechanics Summary

## The Timer Gate

Before any obit command works, the timer must have elapsed. It starts automatically when onboarding completes. Currently set to 11 \* 60 (production timing).

Error behavior: First obit attempt while timer is running shows time remaining without resetting. Second attempt resets the timer to full duration.

## The Two-Tier Completion System

Every piece has two possible states in GameContext:

- **completedPieces** — written by markInteracted, markCompleted, and markVisited (on visit-only pieces). This is the "I touched it" map.
- **fullyCompletedPieces** — written only by markCompleted, custom trackers at their final threshold, and markVisited on visit-only pieces. This is the "I actually finished it" map.

\_checkObituaryUnlocks uses completedPieces for everyone except Olivia, and fullyCompletedPieces for Olivia. This means non-Olivia people unlock on a single meaningful interaction with their pieces, while Olivia requires every piece to be genuinely finished.

## How ls Strikethrough Works (isTitleComplete)

A title crosses out in ls when:

- **Olivia-only pieces** (justBones, cursedVisions, untitled, fetish, parthenogenesis, 129) — cross out as soon as the piece is in completedPieces. Since these pieces have no non-Olivia people mapped to them, the check short-circuits to !!state.completedPieces[slug]. justBones starts pre-crossed because it's pre-completed in defaultState.
- **All other pieces** — cross out when every non-Olivia person associated with that piece has their obituary unlocked. So silhouettes won't cross out until Ari, AJ, and Derek all have obits. Pieces shared between many people are the last to cross out.

## Every Piece and What It Requires

**Piece 1 — justBones**

- Pre-completed and pre-visited in defaultState. Already crossed out from the start. Counts toward Olivia immediately.

**Piece 2 — 129**

- Visit all 5 pages: 1920, 2122, 2324, 192123, 202224. Each call to trackPage129(pageId) accumulates page IDs. When all 5 are present, the piece sits at 99% until you click the `129` home link, which calls complete129FromHome and writes both completedPieces and fullyCompletedPieces. No markInteracted step — the custom tracker handles page accumulation and the title/home click finalizes completion.

**Piece 3 — lack_of_flight**

- Click both birds to open both files: LOF.JPG and LOF.txt. trackLofFile(filename) accumulates. When both are opened, writes both completion maps. Derek's obit requires this.

**Piece 4 — my_familiar**

- Open all 4 files: MF.txt, MF1.png, MF2.png, MF3.JPG. trackMfFile(filename) accumulates. When all 4 are opened, writes both completion maps. AJ's obit requires this.

**Piece 5 — cass_ra**

- Single interaction (markInteracted). Writes completedPieces only. Michael's obit requires this piece plus three others, so Michael won't unlock until all four are interacted with.

**Piece 6 — cursedVisions**

- **Audio-based completion.** Click the "cursedVisions" title button to play audio (`piece6/love_audio_collage.mp3`). The audio plays until completion, then calls markCompleted, which writes both maps immediately. Olivia-only, crosses out when audio finishes.

**Piece 7 — untitled**

- **Dual-condition completion.** On first click, audio starts (`piece7/untitled.mp3`). Piece7 click count is tracked globally via `incrementPiece7`. Piece completes only when both are true: (1) 11 clicks reached and (2) audio finished (`onended`), then `markCompleted("untitled")` writes both maps. Olivia-only, crosses out after both conditions are met.

**Piece 8 — objects_in_eleven**

- **Progressive completion with audio side-effect.** First button click calls `markInteracted` (for Nick/AJ/Michael obituary progression) and starts audio (`piece8/objects.mp3`). Each press advances the diffed version. Reaching version 11 (index 10) now marks the piece complete immediately; the audio still plays on the first and last clicks, but it no longer gates completion.

**Piece 9 — silhouettes**

- Single interaction (markInteracted). Required by Ari, AJ, and Derek. Piece doesn't cross out until all three have obits.

**Piece 10 — confessions**

- **Playback-end completion.** Clicking the Confessions play button starts the paired videos; completion is granted when the spoken-word video ends (`onEnded` → `markCompleted`). Required by Mark, AJ, Nick, and Michael, so it is often one of the later shared-title cross-outs.

**Piece 11 — secrets**

- Row submissions are tracked with `trackSecretSubmit(rowIndex)`. Pressing all 3 unique "shh..." submits opens `/assets/piece11/secrets.txt` on the third successful submit milestone.
- Full piece completion requires both conditions: all 3 rows submitted **and** the `secret` link clicked in Piece 17 (`n23`). Once both are true, Piece 11 calls `markCompleted`.

**Piece 12 — parasite**

- Two-link completion. Opening either `oneside.txt` or `andtheother.txt` counts as the first meaningful interaction and unlocks Jake's obit; opening the second distinct link completes the piece and writes both maps. The title line auto-cycles the two versions and can trigger the link opens in sequence.

**Piece 13 — the_empathy_machine**

- Link-based completion. Clicking the ♱ link opens /assets/piece13/machine.txt in a new tab and calls markCompleted. Hovering the symbol no longer marks completion. Required by Ari.

**Piece 14 — s_curves**

- Single interaction (markInteracted). Required by Lee.

**Piece 15 — 31**

- Single interaction (markInteracted). Required by Nick.

**Piece 16 — shedding_light**

- Rotate the 3D object a cumulative total of 360° (2π radians). trackShedLightRotation(deltaRadians) accumulates Math.abs(delta). At 2π, writes both maps. Required by Lee.

**Piece 17 — n23**

- Two-tier within the piece itself. First link click calls markInteracted → writes completedPieces → unlocks Adham's obit. All 4 links clicked (thirty-one, my-familiar, monster, secret) triggers markCompleted → writes fullyCompletedPieces → counts toward Olivia.

**Piece 18 — i_am_malicious**

- Single interaction (markInteracted). Required by Michael.

**Piece 19 — first_on_first**

- Single interaction (markInteracted). Required by AJ and Scott.

**Piece 20 — teethmarks**

- Single interaction (markInteracted). Required by Saf only.

**Piece 21 — fetish**

- Animation-based completion. Click title button → button slides out and lines animate sequentially in one-shot slides (left→center→right, final line holds). When final line enters hold state, automatically calls markCompleted, which writes both maps. Olivia-only, crosses out when animation completes.

**Piece 22 — parthenogenesis**

- **Audio-based completion.** Hover over the p5 canvas to trigger audio (`piece22/parthenogenesis.mp3`). Characters explode/return on hover. Audio plays until completion, then calls markCompleted, which writes both maps. Olivia-only, crosses out when audio finishes.

## Person Obituary Requirements

Each person's obit unlocks the moment all their pieces are in completedPieces (one touch each):

| Person  | Pieces required                                                              | Unlocks on                                                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jake    | parasite                                                                     | Clicking both links in Piece 12                                                                                                                                                                       |
| Saf     | teethmarks                                                                   | One interaction with Piece 20                                                                                                                                                                         |
| Scott   | first_on_first                                                               | One interaction with Piece 19                                                                                                                                                                         |
| Adham   | n23                                                                          | First link click in Piece 17                                                                                                                                                                          |
| Mark    | secrets + confessions                                                        | Completing Piece 11 (all 3 secret submits + `secret` clicked in Piece 17) and finishing Piece 10 video playback                                                                                       |
| Lee     | s_curves + shedding_light                                                    | Interacting with Piece 14, and rotating Piece 16 a full 360°                                                                                                                                          |
| Ari     | the_empathy_machine + silhouettes                                            | Clicking the Piece 13 ♱ link and interacting with Piece 9                                                                                                                                             |
| Derek   | silhouettes + lack_of_flight                                                 | Interacting with Piece 9, and opening both files in Piece 3                                                                                                                                           |
| Nick    | 31 + confessions + objects_in_eleven                                         | Interacting with Piece 15, finishing Piece 10 video playback, and first click of Piece 8                                                                                                              |
| AJ      | my_familiar + first_on_first + confessions + silhouettes + objects_in_eleven | All 4 files in Piece 4, plus interacting with Pieces 19 and 9, finishing Piece 10 video playback, and first click of Piece 8                                                                          |
| Michael | cass_ra + i_am_malicious + confessions + objects_in_eleven                   | Interacting with Pieces 5 and 18, finishing Piece 10 video playback, and first click of Piece 8                                                                                                       |
| Olivia  | All 22 pieces in fullyCompletedPieces                                        | Everything above fully completed, plus: 129 all 5 pages and the home-link click, untitled (11 clicks + completed audio), fetish animation completion, n23 all 4 links, objects_in_eleven (version 11) |

## The Olivia Obituary Sequence

Once the timer has elapsed and all 22 pieces are in fullyCompletedPieces, obit Olivia is unlocked:

1. The Python acrostic code prints to terminal
2. runOliviaLoop starts — builds a 6-line OLIVIA acrostic from exorcisms.txt, swaps lines in-place every 300ms
3. After 5 seconds, runOliviaFinalSequence fires automatically:
   - 3-phase glitch ramp on the acrostic lines (sparse fonts/colors → mixed → heavy symbols), matching Onboarding timing
   - Full !@#$%^&\*() flood overlay for 1.5 seconds
   - Lines clear; 27 ERROR messages print at 800–1200ms each
   - Brief 1-second pause
   - Same 3-phase glitch ramp on the error lines
   - Onboarding-identical stutter-out sequence [1,0,1,0,0.7,0,0.4,0,1,0] on the terminal window opacity
   - localStorage.clear() + window.location.reload() — full reset

## Dev Passkeys

- **0114** — Skip the Onboarding Terminal
- **3200** — Anywhere on page. Sets terminal passkey bypass mode for the timer gate and forces the win-state trackers (all pieces visited/completed, required counters and links) so `obit Olivia` is available immediately.

## Current Visit-Only Pieces (in GameContext)

- justBones
