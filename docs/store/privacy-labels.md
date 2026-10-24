# App Privacy answers (App Store Connect)

**Answer: "No, we do not collect data from this app."** The listing will show *Data Not Collected*.

Why this is accurate (checked against the code on 2026-10-24):

| What leaves the device | Where | Collected? |
|---|---|---|
| Nothing the user writes | No server; the AI proxy is off (`EXPO_PUBLIC_AI_URL` is unset in every EAS profile) | No |
| Reaction model download (first launch) | huggingface.co, a plain file download with no identifiers. Executorch telemetry is turned off (`setTelemetryEnabled(false)`) | No. Apple counts only data the developer or its partners collect and keep; an anonymous file fetch is not that |
| App update check | u.expo.dev (expo-updates), which sends runtime version, platform and update channel | No: no user or device identifier is linked, and the data is not used for tracking |
| Test summary (Settings) | Only if the user taps it: the system share sheet with a plain-text list of counts (no text, no install id). The user picks the recipient | No: the app sends nothing itself; it is user-initiated sharing like Export |
| Follow-up reminders | Local notifications scheduled on the device; no push token is requested | No |

- **Storage:** sessions, cards, training entries and settings live in AsyncStorage on the device. "Delete all my data" in Settings deletes them.
- **No accounts, analytics, crash reporting or ads.** None of those SDKs are installed.

**Re-check this page before release if any of these change:**
- The AI proxy is switched on, so text would be sent to the worker and an AI provider. Then "User Content: Other User Content, App Functionality, not linked" must be declared.
- Analytics, crash reporting or RevenueCat is added. RevenueCat means declaring "Purchases" and an identifier.
- Push notifications are added.
