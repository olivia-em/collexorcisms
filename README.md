# Collected Exorcisms — Complete Mechanics Summary

Printed edition: [Collected Exorcisms](https://www.lulu.com/shop/olivia-lee/collected-exorcisms/paperback/product-kv679gk.html?page=1&pageSize=4)

## UI Overview

- The app opens with the onboarding terminal sequence.
- If onboarding is already complete, returning users see the main shell fade in instead of snapping in instantly.
- The main play area is the 3D scroll stack, with the collage background sitting behind it and the pieces layered above it.
- The bottom-right dock holds the map button, terminal button, and the settings tool.
- The settings tool opens a popup with mute/unmute and invert-scroll controls.
- TXT popups and the completion desktop appear on top of the main shell when they are unlocked.
- The visual layering depends on the collage, the scroll stack, and the piece-specific blend styles staying in their current positions.

## The Timer Gate

Before any obit command works, the timer must have elapsed. It starts automatically when onboarding completes. Currently set to 11 \* 60 (production timing).

Error behavior: First obit attempt while timer is running shows time remaining without resetting. Second attempt resets the timer to full duration.

## The Two-Tier Completion System

Every piece has two possible states in GameContext:

- **completedPieces** — written by markInteracted, markCompleted, and markVisited (on visit-only pieces). This is the "I touched it" map.
- **fullyCompletedPieces** — written only by markCompleted, custom trackers at their final threshold, and markVisited on visit-only pieces. This is the "I actually finished it" map.

\_checkObituaryUnlocks uses completedPieces for numbered obituaries and fullyCompletedPieces for the final obituary. This means numbered obituaries unlock on a single meaningful interaction with their pieces, while the final obituary requires every piece to be genuinely finished.

## How ls Strikethrough Works (isTitleComplete)

A title crosses out in ls when:

- **Final-obituary-only pieces** (justBones, cursedVisions, untitled, fetish, parthenogenesis, 129) — cross out as soon as the piece is in completedPieces. Since these pieces have no numbered obituary attached to them, the check short-circuits to !!state.completedPieces[slug]. justBones starts pre-crossed because it's pre-completed in defaultState.
- **All other pieces** — cross out when every numbered obituary associated with that piece has been unlocked. So silhouettes will not cross out until all of its numbered requirements have been unlocked. Pieces shared between many numbers are the last to cross out.

## Every Piece and What It Requires

| Piece                    | Requirement                                                                           | Numbers affected     |
| ------------------------ | ------------------------------------------------------------------------------------- | -------------------- |
| 1 - justBones            | Visit once. This piece is pre-completed and pre-visited.                              | Final obituary only  |
| 2 - 129                  | Visit all 5 page combinations, then click the home link to finalize it.               | Final obituary only  |
| 3 - lack_of_flight       | Open both files: LOF.JPG and LOF.txt.                                                 | 1, final             |
| 4 - my_familiar          | Open all 4 files: MF.txt, MF1.png, MF2.png, MF3.JPG.                                  | 6, final             |
| 5 - cass_ra              | Single interaction.                                                                   | 5, final             |
| 6 - cursedVisions        | Finish the audio playback.                                                            | 5, final             |
| 7 - untitled             | Reach 11 clicks and finish the audio.                                                 | Final obituary only  |
| 8 - objects_in_eleven    | Reach version 11.                                                                     | 3, 5, 6, final       |
| 9 - silhouettes          | Single interaction.                                                                   | 1, 4, 6, final       |
| 10 - confessions         | Let the spoken-word playback reach the end.                                           | 3, 5, 6, 7, final    |
| 11 - secrets             | Submit all 3 rows, and click the secret link in 17.                                   | 7, final             |
| 12 - parasite            | Open both links: oneside.txt and andtheother.txt.                                     | 2, final             |
| 13 - the_empathy_machine | Click the link to open the text file.                                                 | 4, final             |
| 14 - s_curves            | Single interaction.                                                                   | 9, final             |
| 15 - 31                  | Single interaction.                                                                   | 3, final             |
| 16 - shedding_light      | Rotate the 3D object a full 360 degrees.                                              | 9, final             |
| 17 - n23                 | Click all 4 links. The first link unlocks 8, and the other links gate 3, 5, 6, and 7. | 3, 5, 6, 7, 8, final |
| 18 - i_am_malicious      | Single interaction.                                                                   | 5, final             |
| 19 - first_on_first      | Single interaction.                                                                   | 1, 6, 10, final      |
| 20 - teethmarks          | Single interaction.                                                                   | 11, final            |
| 21 - fetish              | Start the animation and let it complete.                                              | Final obituary only  |
| 22 - parthenogenesis     | Hover the p5 canvas and let the audio complete.                                       | Final obituary only  |

## Obituary Requirements by Number

Each numbered obituary unlocks the moment all of its pieces are in completedPieces (one touch each):

| Number | Pieces required                                                              | Unlocks on                                                                                                                         |
| ------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1      | silhouettes + lack_of_flight                                                 | Interacting with Piece 9 and opening both files in Piece 3                                                                         |
| 2      | parasite                                                                     | Clicking both links in Piece 12                                                                                                    |
| 3      | 31 + confessions + objects_in_eleven                                         | Interacting with Piece 15, finishing Piece 10 playback, and the first click of Piece 8                                             |
| 4      | the_empathy_machine + silhouettes                                            | Clicking the Piece 13 link and interacting with Piece 9                                                                            |
| 5      | cass_ra + i_am_malicious + confessions + objects_in_eleven                   | Interacting with Pieces 5 and 18, finishing Piece 10 playback, and the first click of Piece 8                                      |
| 6      | my_familiar + first_on_first + confessions + silhouettes + objects_in_eleven | Opening all 4 files in Piece 4, plus interacting with Pieces 19 and 9, finishing Piece 10 playback, and the first click of Piece 8 |
| 7      | secrets + confessions                                                        | Completing Piece 11 and finishing Piece 10 playback                                                                                |
| 8      | n23                                                                          | First link click in Piece 17                                                                                                       |
| 9      | s_curves + shedding_light                                                    | Interacting with Piece 14 and rotating Piece 16 a full 360 degrees                                                                 |
| 10     | first_on_first                                                               | Interacting with Piece 19                                                                                                          |
| 11     | teethmarks                                                                   | Interacting with Piece 20                                                                                                          |

## Final Obituary Sequence

Once the timer has elapsed and all 22 pieces are in fullyCompletedPieces, the final obituary is unlocked:

1. The Python acrostic code prints to terminal
2. The final loop starts — builds a 6-line acrostic from exorcisms.txt, swaps lines in-place every 300ms
3. After 5 seconds, the final sequence fires automatically:
   - 3-phase glitch ramp on the acrostic lines (sparse fonts/colors → mixed → heavy symbols), matching Onboarding timing
   - Full !@#$%^&\*() flood overlay for 1.5 seconds
   - Lines clear; 27 ERROR messages print at 800–1200ms each
   - Brief 1-second pause
   - Same 3-phase glitch ramp on the error lines
   - Onboarding-identical stutter-out sequence [1,0,1,0,0.7,0,0.4,0,1,0] on the terminal window opacity
   - localStorage.clear() + window.location.reload() — full reset

## Dev Passkeys

- **0114** — Skip the Onboarding Terminal
- **3200** — Anywhere on page. Sets terminal passkey bypass mode for the timer gate and forces the win-state trackers (all pieces visited/completed, required counters and links) so the final obituary is available immediately.

## Current Visit-Only Pieces (in GameContext)

- 1 - justBones
