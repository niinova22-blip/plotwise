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
