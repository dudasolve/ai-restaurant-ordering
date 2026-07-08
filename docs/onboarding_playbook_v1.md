# Restaurant Onboarding Playbook — v1 (Phase 2, Week 1)

Goal: take a new restaurant from signed agreement to live AI phone ordering in **under 1 week**, following the same steps every time. Built from everything learned onboarding Beyond Juicery + Eatery.

---

## Stage 0 — Intake (Day 0, restaurant's side: ~20 min)

Send the restaurant the **Intake Form** (see `restaurant_intake_form.md`). Nothing starts until it's complete. The form collects:

1. **Business basics** — legal name, DBA, owner contact, EIN (needed for SMS compliance)
2. **Locations** — which stores will take AI orders (address, phone, hours per store)
3. **Phone system** — provider (carrier vs VoIP), portal access or support contact, current forwarding behavior
4. **Menu source** — online ordering URL (Appfront/Toast/Square/etc.) or filled menu spreadsheet template
5. **Agent personality** — assistant name, greeting preference, tone (warm/professional/playful), languages needed
6. **FAQs** — top 10 questions customers actually call about (hours, parking, allergens, catering...)
7. **Order workflow** — who watches the dashboard, device used (tablet/phone/PC), rejection reasons they want preset
8. **SMS consent language sign-off** — confirm they accept the standard opt-in script

**Owner of this stage:** Hassan (client-facing) · **Blocker flag:** missing EIN or phone-system access stalls Stages 3 and 5.

## Stage 1 — Infrastructure setup (Day 1, our side)

- [ ] Buy dedicated Twilio number (local area code)
- [ ] **Start A2P 10DLC registration immediately** (brand + campaign — takes 1–5 business days; this is the long pole, never leave it for later)
- [ ] Deploy privacy policy + terms pages (template repo, ~30 min)
- [ ] Create Airtable base from template (Orders / Callbacks / Locations / Menu)
- [ ] Clone n8n workflow set, update IDs/credentials
- [ ] Create **dedicated OpenAI API key** for this restaurant (per-client cost visibility)

## Stage 2 — Menu import (Day 1–2, our side)

- [ ] If online ordering exists: run menu import from the platform (Appfront proven; Toast/Square per runbook)
- [ ] Else: import from the filled spreadsheet template
- [ ] Per-location price overrides where applicable
- [ ] Owner reviews menu in Airtable and confirms prices — **sign-off required before test calls**

## Stage 3 — Agent configuration (Day 2–3, our side)

- [ ] Instantiate agent from prompt template with intake variables: name, greeting, locations, tone, languages, FAQs
- [ ] Orders restricted to the enrolled locations only (hard rule in prompt)
- [ ] Wire tools (getMenuInfo, getLocations, pushOrder, notifyCallback) to the new n8n workflows
- [ ] Configure voice + transcriber keyword boosting with the restaurant's item names

## Stage 4 — Internal test week gate (Day 3–5)

- [ ] Run the standard **test-call script** (20 scenarios: happy path, corrections, cancel words, other-location requests, phone/no-phone, each language)
- [ ] Verify: order in Airtable + dashboard alert + SMS received + accept/reject/complete flows + callback flow
- [ ] Owner does 5+ test calls themselves and approves
- **Go/no-go checklist signed by both sides before anything goes live**

## Stage 5 — Go live (Day 5–7)

- [ ] Confirm A2P campaign is VERIFIED (SMS will not deliver otherwise)
- [ ] Configure call forwarding at the restaurant's phone provider (mode agreed with owner: manual / scheduled / busy-overflow)
- [ ] Dashboard access handed over (password, device setup, 5-min walkthrough or Loom)
- [ ] First-day monitoring: we watch call logs live for the first hours; owner has direct escalation channel

## Stage 6 — First month care

- [ ] Weekly call-log review → prompt refinements
- [ ] Week-2 check-in call with owner
- [ ] Log every refinement in the client's changelog

---

## Roles

| Step | Us (Eduarda/Tiago) | Client (Hassan) | Restaurant owner |
|---|---|---|---|
| Intake | Provide form, review | Send form, chase completion | Fill form |
| Infra + menu + agent | Execute | — | Menu sign-off |
| Test gate | Run script, fix issues | Coordinate owner tests | 5+ test calls, approve |
| Go live | Forwarding config, monitoring | Owner comms | Confirm forwarding mode |
| First month | Call reviews, fixes | Collect owner feedback | Report issues |

## Standard timeline

**7 calendar days** intake-to-live, assuming: intake complete on Day 0, A2P approves within 5 days, owner responsive on sign-offs. A2P is the only step we cannot compress.
