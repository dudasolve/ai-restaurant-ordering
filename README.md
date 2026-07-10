# AI Restaurant Phone Ordering System

> **Project status:** delivered and fully operational; paused at the client's request in July 2026 after Phase 1 completion and Phase 2 Week 1 (onboarding blueprint + intake form). All systems left running.

A production voice-AI ordering platform: customers call the restaurant's regular phone number, an AI agent ("Bea") takes the full order in natural conversation — in **English, Arabic, or Spanish** — and the restaurant manages everything from a real-time dashboard.

Built end-to-end for **Beyond Juicery + Eatery** (2 locations, Dearborn MI) under HKA Connections LLC.

## Architecture

```
Customer call
     │
     ▼
Vapi voice agent (GPT-4.1 + ElevenLabs TTS + Deepgram STT)
     │  tools: getMenuInfo · getLocations · pushOrder · notifyCallback
     ▼
n8n workflows (fast-respond pattern: reply to Vapi in ~500ms, persist async)
     │
     ▼
Airtable (orders · live menu · locations · callbacks)
     │
     ├──► Twilio SMS to customer (order received / confirmed / rejected — A2P 10DLC registered)
     │
     └──► Next.js dashboard (accept / reject with reason / complete · callbacks · analytics)
```

- **Dashboard repo:** [beyond-juicery-dashboard](https://github.com/dudasolve/beyond-juicery-dashboard) (Next.js App Router, deployed on Vercel)
- **Intake form repo:** [restaurant-intake-form](https://github.com/dudasolve/restaurant-intake-form) (Phase 2 — public onboarding form → n8n → dedicated Airtable pipeline)

## What the agent handles

- Full order flow: location → items with per-item customization → name → phone → closing summary with calculated total, pickup time, and address
- Live menu knowledge from Airtable (`getMenuInfo` tool filters to available items only) — prices/descriptions update with zero code changes
- Menu auto-sync that imports items, prices, and per-branch availability from the restaurant's online ordering platform (Appfront)
- Multilingual with hard language lock (no mid-call switching), dialectal Arabic support
- Careful conversational rules learned from real call-log review: one question at a time, confirm once, no cart re-reading, digit-by-digit street numbers and phone readback, cancel-word disambiguation
- Human escalation: callback requests logged with reason and surfaced on the dashboard in real time with audio alerts

## SMS lifecycle (Twilio, A2P 10DLC approved)

1. **Order received** — sent by n8n the moment the order is saved
2. **Order confirmed** — sent when the restaurant accepts on the dashboard
3. **Order rejected** — restaurant picks a reason (kitchen busy, item unavailable, closing soon, custom…) and the customer is notified automatically

## Repo layout

| Folder | Contents |
|---|---|
| `prompts/` | Versioned system prompts (v7 → v16.5, the live version) — a record of iterative refinement from real test calls |
| `workflows/` | Sanitized n8n workflow exports (order push, call-start context injection, menu/location tools, callback receiver) |
| `docs/` | Onboarding guides, operations guide, test-call scripts, Phase 2 scaling plan |
| `scripts/` | Deployment and document-generation utilities |
| `archive/` | Phase 1 documents and the original Zo's Good Burger pilot files |

## Airtable base structure

1. **Orders** — order records pushed from AI calls (status: New / Accepted / Rejected / Completed)
2. **Callbacks** — human-escalation queue with caller name, phone, and reason
3. **Locations** — restaurant branches (address, phone, active flag)
4. **Menu** — live menu the AI reads at call start and via the `getMenuInfo` tool

## Engineering notes

- **Fast-respond n8n pattern:** Vapi tool calls time out fast; node 1 computes the reply and responds immediately, node 2 persists to Airtable and fires SMS asynchronously.
- **Menu caching:** call-start context injects live prices with a 30-min cache in workflow static data.
- **Legal/compliance:** privacy policy + ToS pages deployed for A2P campaign approval; consent captured verbally and phone confirmed digit-by-digit before any SMS.

> Credentials are not in this repo. All secrets in workflow exports are redacted; live values are stored in the n8n instance.
