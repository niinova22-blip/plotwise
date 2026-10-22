# Plotwise

**Think in stories. Decide with clarity.** A mobile thinking partner that helps you question assumptions, imagine alternative futures and turn a messy problem into one small experiment. English first, Turkish included. iOS + Android from one Expo codebase.

Plotwise is an independent product inspired by research on narrative thinking and creativity. It is not affiliated with or endorsed by any author or publisher, and it is not an intelligence test.

## What's in v1

| Module | What it does | Needs AI? |
|---|---|---|
| **Thinking Lab** (`src/app/lab.tsx`) | Describe → clarify → mark assumptions → reframe + provocation → weigh → pick a 48-hour experiment | Yes (4 calls) |
| **Future Simulator** (`src/app/future.tsx`) | Three futures (tailwind / obstacle / pivot), two decision points with a twist, closing insight | Yes (3 calls per path) |
| **Daily Training** (`src/app/train.tsx`) | 35 original exercise templates × variable pools, adapted to history and interests, works offline | Optional nudge |
| **Notebook** (`src/app/notebook`) | Outcome cards from every session, experiment follow-ups after 3 days | No |

All user data stays on the device (AsyncStorage). Settings include export and delete-all.

## Architecture

```
app (Expo SDK 58, expo-router)  ──HTTPS──▶  worker/ (Cloudflare Worker)  ──▶  model provider (adapter)
  src/ai/contract.ts  ◀── shared types ──▶  worker/src/{schemas,prompts,providers}.ts
```

- The app never holds API keys. It sends `{task, context, input}` plus an anonymous install id.
- The worker owns prompts, JSON schemas (structured outputs), model choice, per-install daily quotas (KV) and crisis-flag handling.
- Swap models/providers by changing `MODEL` / `AI_PROVIDER` in `worker/wrangler.toml` — no app release needed.
- Without `EXPO_PUBLIC_AI_URL`, or while the worker has no key, the app runs in clearly labelled **demo mode** with canned responses.

## Run locally

```bash
npm install
npx expo start            # press w for web, or scan with a dev build
npx tsc --noEmit && npx eslint src
```

## AI proxy

```bash
cd worker && npm install
npx wrangler login
npx wrangler kv namespace create QUOTA      # paste id into wrangler.toml
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy                          # prints https://plotwise-ai.<you>.workers.dev
```

Then point the app at it and ship over the air (no new TestFlight build needed):

```bash
EXPO_PUBLIC_AI_URL=https://plotwise-ai.<you>.workers.dev npx eas-cli update --channel production -m "Enable AI"
```

## Builds

```bash
npx eas-cli build -p ios --profile production --auto-submit   # → TestFlight
npx eas-cli build -p android --profile preview                # → installable APK
```

See `docs/PLAN.md` for the product plan and `docs/DECISIONS.md` for decisions made along the way.
