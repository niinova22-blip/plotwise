# Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-10-23 | Product name **Plotwise** (working title was "Primal Mind") | Avoid confusion with the book *Primal Intelligence*; "plot" = stories and branching futures. Trademark search still needed before launch. |
| 2026-10-23 | English primary, Turkish second; UI strings in `src/i18n` | Global launch, founder's home market. |
| 2026-10-23 | Merged "Intuition & Decision Lab" into Future Simulator (the *twist* step) | Same mechanic: decide → new information → reconsider. |
| 2026-10-23 | Creativity Engine is an exercise type (`connect`) in Daily Training | Keeps the home screen to three doors. |
| 2026-10-23 | Progress map deferred; v1 keeps a Notebook of outcome cards | Avoid pseudo-scientific scores; the cards are the raw data for later, count-based progress. |
| 2026-10-23 | Voice input = OS keyboard dictation | Free, private, already localized. |
| 2026-10-23 | Expo SDK 58 + expo-router, AsyncStorage, no account | Lowest cost, one codebase, data stays on device. SQLite can replace the store later behind `src/store`. |
| 2026-10-23 | Cloudflare Worker proxy with provider adapter; structured JSON outputs per task | Keys off-device, prompts updatable without app releases, vendor-swappable. |
| 2026-10-23 | Default model `claude-opus-5-5` with per-task effort (low/medium) and server-side refusal fallback | Quality first while testing. A cheaper model (e.g. `claude-haiku-5-5`) is a one-line change in `worker/wrangler.toml` — decide after measuring cost per session in testing. |
| 2026-10-23 | No paywall in the test phase; per-install daily quota (40 calls) on the worker | Learn which features people repeat before pricing; cap cost meanwhile. |
| 2026-10-23 | Demo mode when the proxy is missing or unconfigured | Builds can ship to TestFlight before the AI key exists; enabling AI later is an OTA update. |
| 2026-10-23 | Crisis flag in every AI schema → support screen with emergency + findahelpline.com | Store safety requirements and user wellbeing. |
| 2026-10-23 | Progress screen is count-based (sessions, 4-week rhythm, streak, experiments reflected on, exercise variety); no scores | Keeps the onboarding promise "no scores, no labels" while still showing momentum and nudging variety. |
| 2026-10-23 | iOS only for now — no Android build or Play Store release | Founder's decision. |
| 2026-10-23 | **No AI for now**: Lab, Simulator and training nudges run on an on-device engine (`src/ai/offline`) — topic detection, original EN/TR content packs, the user's own doubted assumptions and choices drive the picks; offline crisis phrase check | Founder's choice: no server, no cost. Testers use iPhone 11 (no Apple Intelligence). The worker stays in the repo; setting `EXPO_PUBLIC_AI_URL` switches back to the AI path with the same contract. |
| 2026-10-23 | Lab lets users add their own assumption (starts as "might be wrong") | Offline picks are generic; the user's own doubt makes the session personal. |
| 2026-10-23 | **Mentor “Ozan”** narrates Home, Lab, Simulator and Training; tap to advance, Skip, voice on/off, Quiet mode (compact text UI) | Founder wants to be guided by a warm, wise character instead of reading. Design: `docs/superpowers/specs/2026-10-23-mentor-design.md`. |
| 2026-10-23 | Ozan is a parametric Skia + Reanimated rig (springs in ≤4 ms substeps, every parameter clamped) | Smooth 60 fps on iPhone 11; no feature can slide out of place (the founder's main complaint about the prototypes). |
| 2026-10-23 | Voice: lines pre-rendered locally with Chatterbox Multilingual (MIT), cloned from one Kokoro `bm_george` reference (Apache-2.0) so Ozan sounds the same in TR and EN; mouth driven by a 20 ms loudness envelope | Free, offline, licensed; no real person's voice. Founder reviews Turkish pronunciation and sends fixes (`tools/voice/out/review.html`, re-render with `render.py --only`). |
| 2026-10-23 | Reactions: on-device paraphrase-multilingual-MiniLM via react-native-executorch (downloaded once on first launch), 60 situations, family-aware thresholds tuned on held-out sentences; anything uncertain gets a warm universal line | A wrong confident reaction is worse than a generic one. Held-out: 38% specific fitting reaction, 5% wrong family, 0% off-topic misfires. Upgrade path: more examples or mpnet (51% measured). |
| 2026-10-23 | App restyled around Ozan: cream/terracotta/brass/lantern palette, tactile buttons, spring press, card entrances, Journey progress with a lantern | Founder handed the restyle over. |
| 2026-10-23 | iOS deployment target 17.0 | Required by react-native-executorch; testers' iPhone 11 runs iOS 26. |
| 2026-10-24 | Ozan only talks and moves on the screen in front; a covered screen stops and picks its unfinished step up again on return. A language change re-narrates the current step in the new language; Quiet mode silences him mid-line | Review follow-ups: audio from a screen under Settings, lost narration after a language switch. |
| 2026-10-24 | The reaction model still downloads in Quiet mode, and retries a failed download (15 s, doubling, max 5 min, resumes) | The embedding check also catches crisis wording that the phrase list misses; that safety net should not depend on a display setting. |
| 2026-10-24 | Reduce Motion: Ozan keeps his hands down and head still; blinks and talking stay | Accessibility. |
| 2026-10-24 | Keep `@kesha-antonov/react-native-background-downloader` | react-native-executorch uses it when installed so the model download survives the app going to the background. |
