# Module 3 — AI Intent & Sentiment Engine

Owner: Shayan (AI/ML Lead)
Part of: FashionFlow AI — AI Fashion Sales Assistant

## What this module does

Internal service that Modules 5 (WhatsApp) and 6 (Instagram) call after receiving a
customer message, to figure out **what the customer wants** (intent) and **how they
feel** (sentiment), and to generate a natural-language reply.

## Flow

1. **Intent detection** — rule-based keyword matching runs first (`src/intent/keywordRules.js`).
   If nothing matches, falls back to GPT (`gpt-4o-mini` via LangChain.js).
2. **Sentiment analysis** — quick lexicon check for obvious cases, GPT for everything else.
   Categories: `Happy`, `Angry`, `Frustrated`, `Interested`, `Neutral`.
3. **Reply generation** — takes intent + sentiment + optional product context (e.g. from
   Module 4's recommendation engine) and produces the final customer-facing reply.
4. **Caching** — repeated FAQ-style queries are cached in Redis for 1 hour so we don't
   re-pay for GPT calls on "what's the delivery time" for the 50th time.
5. **Prompt injection protection** — customer text is always sanitized and wrapped in
   `<customer_message>` tags, kept structurally separate from system instructions. The
   system prompt explicitly tells the model to treat that block as data, never commands.

## Endpoints (internal only — not exposed to WhatsApp/Instagram directly)

Mount into Usman's main Express app:

```js
const aiRoutes = require('./ai/routes/aiRoutes');
app.use('/ai', aiRoutes);
```

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/ai/intent` | POST | `{ message }` | `{ intent, confidence, method, flagged_injection_attempt }` |
| `/ai/sentiment` | POST | `{ message }` | `{ sentiment, confidence, method }` |
| `/ai/generate-reply` | POST | `{ message, intent, sentiment, productContext, customerName }` | `{ reply }` |

`method` tells you how the classification happened: `rule`, `lexicon`, `gpt`, or a
`_cached` variant of any of those — useful for debugging and for tracking GPT cost.

## Setup

```bash
npm install
cp .env.example .env   # fill in OPENAI_API_KEY and REDIS_URL
npm run dev             # standalone server on :5003, for local testing only
npm test                # runs tests/testCases.js against all query types
```

`REDIS_URL` should point at the **same** Redis instance Momin sets up in Module 2 —
this module only touches its own `ai:faqcache:*` keys, it doesn't manage sessions,
product cache, or order state (that's Module 2's job).

## Folder structure

```
src/
  config/          openai.js (LangChain client), redisClient.js
  prompts/         systemPrompts.js — all system instructions, kept separate from user input
  security/        promptInjectionGuard.js — sanitization + untrusted-data wrapping
  intent/          keywordRules.js, intentDetector.js, replyGenerator.js
  sentiment/       sentimentAnalyzer.js
  cache/           responseCache.js — Redis-backed FAQ cache (1hr TTL)
  controllers/      aiController.js — HTTP handlers
  routes/          aiRoutes.js — /ai/intent, /ai/sentiment, /ai/generate-reply
  index.js         standalone dev server (not used in final integration)
tests/
  testCases.js     covers all required query types + sentiment categories + injection test
```

## Integration notes for the team

- **Usman (Module 1):** mount `aiRoutes` on your Express app, protect behind your
  internal auth/rate-limit middleware as needed — these are internal endpoints, not
  public-facing.
- **Momin (Module 2):** this module shares your Redis instance for FAQ caching only.
  No schema dependencies.
- **Sultan (Module 4):** pass your recommendation results into `productContext` when
  calling `/ai/generate-reply` so replies can mention real products/prices/sizes instead
  of the model guessing.
- **Muzahir / Noor (Modules 5 & 6):** call `/ai/intent` → `/ai/sentiment` → (optionally
  Module 4 for product data) → `/ai/generate-reply`, then send the returned `reply` back
  through WhatsApp/Instagram.

## What's NOT in this module (Phase 2 / other modules)

- Conversation state machine / multi-turn order flow (Module 5/6)
- Product search/filtering logic (Module 4)
- Session storage (Module 2)
