# AI Restaurant Ordering System

An AI-powered phone ordering system for restaurants using **VAPI** (voice AI), **n8n** (automation workflows), and **Airtable** (order management).

## Current Client: Beyond Juicery + Eatery

- **AI Assistant:** Bea
- **Phone:** (313) 209-4499 / (313) 209-6671
- **Languages:** English, Arabic, Spanish (auto-detected)
- **Phone Provider:** Cronus Communications (Hosted VoIP)

## Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Voice AI | VAPI | Phone call handling + language detection |
| Automation | n8n | Workflow orchestration |
| Database | Airtable | Orders, menu, callbacks |
| POS Bridge | Deliverect | Menu + order sync to POS |

## Repo Structure

```
prompts/          # VAPI system prompts (current versions)
workflows/        # n8n workflow JSON exports
docs/             # Setup guides and client communications
scripts/          # Document generation scripts
archive/          # Previous versions and legacy client files
```

## Key Files

- [`prompts/order_taker_v7.md`](prompts/order_taker_v7.md) — Current VAPI system prompt (Bea, v7.1)
- [`docs/n8n_airtable_setup_guide_v2.md`](docs/n8n_airtable_setup_guide_v2.md) — Airtable + n8n setup guide (Beyond Juicery)
- [`workflows/workflow_vapi_callback_receiver_v1.json`](workflows/workflow_vapi_callback_receiver_v1.json) — n8n: handles VAPI post-call callbacks
- [`workflows/workflow_toast_order_push_v1.json`](workflows/workflow_toast_order_push_v1.json) — n8n: pushes orders to Toast POS

## Previous Client: Zo's Good Burger

Phase 1 documents and the original v1 prompt/guide are preserved in [`archive/`](archive/).

## Airtable Base Structure (v2)

1. **Orders** — incoming order records from AI calls
2. **Callbacks** — missed call / callback request queue
3. **Settings** — restaurant config (hours, locations, etc.)
4. **Menu Knowledge Base** — live menu data for Airtable lookup via `getMenuInfo` tool
