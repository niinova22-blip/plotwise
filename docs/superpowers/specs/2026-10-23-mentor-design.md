# Mentor — design

Status: approved by founder · 2026-10-23 (founder: "finish the whole thing, I'll review and send fixes")

## Intent

Plotwise works, but it asks people to read a lot. The founder wants the app to feel like being guided by a person: a wise, warm, slightly chubby elder ("tonton") who greets you, explains each step out loud and reacts to what you write. Think of the way Duolingo's characters pop in and talk, crossed with a Dumbledore-style storyteller, but as an original character.

The founder's own words for the bar: smooth animation, high sound and image quality, "the most professional option". Everything has to stay **free** (no paid services, no designers), **offline** and **iOS-only**. App size does not matter.

## Goals

1. A mentor character who narrates every flow (Home, Thinking Lab, Future Simulator, Daily Training) line by line. Tapping moves to the next line.
2. A real voice: pre-recorded lines played on device, in Turkish and English, with the tone matching the mood of each line.
3. Reactions to what the user writes that fit the content, even for niche input. Example: "I don't get along with people at work" gets "Ah, people… the most complicated puzzle in the world."
4. Face, gaze, gesture and speaking pace change with the reaction.
5. On-screen text gets shorter. The mentor explains, and the screen keeps only what the user needs to act on.

## Non-goals

- No generated (LLM) speech, no network AI, no server. The worker in `worker/` stays as is.
- The mentor never speaks the user's own words aloud, because those can't be pre-recorded. The user's words stay on screen.
- No Android.
- No new modules. Notebook and Settings get no mentor, apart from the settings listed below.

## Anti-goals (a failure even if it technically works)

- A reaction that's wrong or silly for what the user wrote. A warm, generic line always beats a confident wrong one.
- Anything that looks artificial or glitchy: features sliding out of place, lashes drifting into the eye, pieces overlapping, tube-like limbs with visible joints, jerky or hurried motion. The founder rejected the web prototypes for exactly these things.
- Being slowed down. Repeat users must be able to skip.
- Resemblance to Dumbledore or any existing character.

## The character

**Name:** "Ozan", Turkish for bard or storyteller, and easy to say in English. *(My call.)*

**Look.** This is the direction the founder approved: concept "B, the lantern companion", iterated with their feedback. The reference rig is `.superpowers/brainstorm/1469-1792775969/content/mentor-rig-v4.html`. It is a reference for **parts and behaviour only, not for quality**: the founder judged its body, shoulders, joints and hands as wrong.

- **Style:** flat-but-soft, Duolingo-like vector art with subtle gradients and soft shading. Warm palette: terracotta cloak, cream tunic, brass accents, white hair and beard.
- **Head and face:** the round, chubby face is approved. Detail it fully:
  - eyes with whites, a brown iris, a pupil and highlights;
  - upper and lower eyelids;
  - bushy white brows with hair flicks and drooping ends;
  - forehead lines that deepen when the brows rise, crow's feet when smiling, soft under-eye bags and a few faint age spots;
  - a round nose with shading, pink cheeks;
  - a bald crown with fine wisps, and fluffy side hair with visible strands.
- **Beard and moustache:** fluffy and organic, built from flowing strands, never from stacked circles. The moustache is curled with strands, plus a small tuft under the lip. The lower beard moves with the jaw.
- **Lashes:** the lash line *is* the upper lid's bottom edge, clipped to the eye shape. It can never sit inside the eye. A soft lower lash line appears when squinting.
- **Body:** a **slimmer silhouette** with naturally sloping shoulders. No thick, boxy torso.
  - The cloak has a lowered hood resting on the shoulders (it never covers the head), a brass clasp, a rope belt with a knot, inner lining, fabric folds and a rounded hem.
  - The whole character fits on screen and never collides with the speech bubble.
- **Arms and hands:**
  - Sleeves are filled, tapered shapes with fabric folds, wide bell cuffs and smooth shoulder and elbow transitions. They are never thick strokes or tubes.
  - At rest, both hands are tucked into the sleeves in front.
  - When gesturing, one hand comes out of the cuff. Hands are simple, clean, rounded "mitten" shapes in the Duolingo spirit: a clear silhouette and at most a hint of finger separation. Never small fussy fingers.
- **Lantern:** stands on the ground beside him and should look *cute and detailed*:
  - rounded proportions, a brass domed cap and base, rivets and a carrying ring;
  - glass panes with a warm tint, a soft flickering flame;
  - a gentle animated glow lighting the ground and the cloak edge.

**Moods** (each has a face, a gesture, gaze behaviour and a speaking style):

| Mood | Face | Gesture | Gaze | Speech |
|---|---|---|---|---|
| warm (default) | soft smile | open palm, small beats on stressed words | at the user | normal pace |
| empathy | inner brows raised, gentle half-smile, head tilted | hand on chest | down, then back to the user | slower, softer, longer pauses |
| happy | big smile with teeth, smiling eyes | raised hand | at the user | livelier |
| think | one brow up, lips pursed | strokes his beard | up and to the side, then back | slower, "hmm" pauses |
| curious | both brows up, eyes wide, mouth slightly open | open palm | at the user | slightly quicker, rising end |

**Always-on life** (all subtle and slow, never hurried):
- slow breathing;
- small idle head drift;
- blinks on irregular 2–6 s timers, sometimes double;
- tiny gaze micro-saccades;
- a glance toward whatever the user taps;
- a lantern flicker.

Transitions between moods ease over about 0.4–0.6 s.

## How it's built (my calls)

**Rendering:** `@shopify/react-native-skia`, with the animation driven by `react-native-reanimated` shared values on the UI thread.
- The character is a **parametric rig**: a small set of parameters (smile, jaw, lid, squint, four brow values, gaze x/y, head tilt and nod, wrist/elbow/hand pose, hand visibility, blush) drives path geometry.
- Each parameter follows a critically damped spring, integrated in fixed small substeps, and is **clamped to safe limits** so no feature can leave its place. Both rules come from the prototype bugs.
- Target: 60 fps on iPhone 11.
- Verification happens on Expo web (Skia via CanvasKit) with screenshots of every mood, mid-speech, before any device build.

**Voice:**
- Lines are rendered on the founder's PC (RTX 5070) with **Chatterbox Multilingual** (MIT, supports Turkish and English, has an emotion-intensity control). Per-mood settings give the empathy, happy and other speaking styles.
- A small Python tool in `tools/voice/` reads the script files and writes one compressed audio file per line and language. It also writes a manifest with each clip's duration and a loudness envelope (about 20 ms steps).
- The app plays clips with `expo-audio`. The mouth is driven from the precomputed envelope, because expo-audio's live sample access isn't reliable on every platform. The subtitle reveals in sync.
- **Reference voice (founder chose "use available licensed voices"):** one clearly licensed synthetic voice is the reference for both languages, so Ozan sounds the same in Turkish and English. First choice is Kokoro-82M's warm older British male presets (Apache-2.0; `bm_george` / `bm_lewis`). For Turkish, use Chatterbox's documented setting for a reference in a different language (`cfg_weight` near 0) to avoid accent carry-over. If the Turkish result still sounds foreign, fall back to a clearly licensed Turkish reference. No real person's voice is used.
- If a clip is missing, the line still works with subtitle and procedural mouth movement.

**Reaction engine:** on-device sentence embeddings.
- Runtime: `react-native-executorch` (Software Mansion) with a multilingual sentence-embedding model. The builder picks between `paraphrase-multilingual-MiniLM-L12-v2` and `distiluse-base-multilingual-cased-v2` by measured Turkish accuracy and speed on iPhone 11.
- The model is **bundled in the app** so it works offline from the first launch. If bundling proves impossible, a one-time download on first launch is acceptable, with the keyword engine covering until the model is ready. No user text ever leaves the device.
- **Situation library:** about 100–150 situations, such as "conflict with people at work", "fear of quitting", "money worry", "creative block" or "excited about an idea". Each has example sentences in Turkish and English, several reaction lines, a mood and a gesture. The examples are embedded at build time with the same model and shipped as data, so at runtime only the user's text is embedded.
- **Matching:**
  - cosine similarity, with a confidence threshold and a margin between the best and second-best match;
  - the existing keyword topic detector acts as a tie-breaker;
  - below the threshold, a warm **universal** reaction is used;
  - recently used lines are avoided so it doesn't feel repetitive.
- **Crisis:** the existing phrase check stays. Crisis situations are added to the library with a lower threshold, and both lead to the existing support screen. There is no mentor joking near this.
- Requires a development build (not Expo Go). That is fine, since the app is already built with EAS.

**Script:**
- All mentor lines live in script files next to i18n, in English and Turkish, with the same keys. Each line carries an id, text, mood and gesture.
- The existing content banks in `src/ai/offline/content.ts` are fixed strings, so they get recorded too: the mentor can read a question or a scenario aloud.
- Lines that embed the user's words (for example "Suppose '…' is false") are split into a recorded lead-in plus the user's text shown on screen.

## Experience

- **Home:** Ozan greets the user ("What will you think about today? Let's start the journey.") above the three doors, then waits. Returning later the same day gets a shorter greeting.
- **Each flow step:** Ozan speaks 1–3 short lines that explain the step. Tapping the bubble or the stage advances. After the last line, the step's input or choices appear.
- **When the user submits text:** Ozan reacts first (the reaction engine), then continues.
- **Skip:** a visible skip control jumps to the step's actions.
- **Settings:** "Mentor voice" (on/off). When off, Ozan still animates and subtitles show. A separate "Quiet mode" hides Ozan and returns to the current compact text UI.
- Subtitles are always visible in the bubble. Lines respect the device's silent switch only if the founder wants that; default is to play (the expo-audio default).

## Constraints

Free tools only; on-device only; iOS only; tested target iPhone 11 (iOS 26-capable, no Apple Intelligence); English and Turkish; app size not a concern; original IP; existing crisis safety must not regress; lint and typecheck clean.

## Phasing and checkpoints (my calls)

**Founder decision:** build everything in one go, with no Ozan-only checkpoint build. The founder reviews the finished build on device (look, motion, Turkish pronunciation, reaction fit) and sends fixes. So every quality check before that falls on me: Expo web screenshots of every mood mid-speech, plus listening checks of the rendered audio where possible.

Build order (my call): rig → app restyle → voice pipeline → reaction engine → flow narration and settings → one TestFlight build.

**Offline only.** The mentor is built for the on-device engine. If the AI path (`EXPO_PUBLIC_AI_URL`) is ever switched back on, Ozan only introduces steps and reacts with recorded lines, and dynamic AI text stays subtitle-only. Fuller AI support would be a new design. *(My call.)*

**Crisis.** A phrase match blocks the flow with the support screen, exactly as today. An embedding-only crisis match shows the support screen as an offer with a "continue" option, so someone venting about a hard day doesn't lose their session. Thresholds are tuned against a small labelled test set in both languages. *(My call. Safety-conservative: it never weakens today's behaviour.)*

**Runtime fallback.** If `react-native-executorch` won't build on this stack, use ONNX Runtime with the same model. If neither works, ship keyword-plus-universal reactions and add embeddings later. The reaction engine never blocks a release. *(My call.)*

## Left to the builder

Exact geometry and colours within the art direction above, file layout, rig parameter details, spring constants, the clip format and bitrate, situation list wording, line counts per step, and the order of implementation.

## App restyle (founder: "update the UI, colours and animations to match; that part is yours, don't ask")

The rest of the app moves to Ozan's world: the warm palette (cream paper background, terracotta, brass, lantern-amber accents, soft dark mode with a lantern glow), rounded friendly shapes, and soft springy motion (entrances, card presses, step transitions, a progress "path" that reads like a journey). Typography stays serif display plus system body. Light and dark themes both stay. *(All of it is my call.)*

## Founder review after the build

Turkish pronunciation and stress, reaction fit, look and motion, all on device via TestFlight. The founder sends fixes. Rendered lines get a review sheet (line, audio, situation) so fixes are easy to point at.
