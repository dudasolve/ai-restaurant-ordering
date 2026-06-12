# n8n Workflows — Order & Context Pipeline (current production)
## Beyond Juicery + Eatery — Bea (Vapi assistant `b9c95d99-575d-4202-90af-652a19509b8b`)
## Updated: 2026-06-08

These four workflows are what Bea calls during a live phone call. JSON snapshots are in
[`../workflows/`](../workflows/) — **all secrets have been replaced with the placeholder
`REDACTED__SET_AS_N8N_ENV_VAR_AIRTABLE_PAT`**. The deployed copies in n8n contain the real
token; never commit that value here.

| Workflow | File | Webhook path | Purpose |
|---|---|---|---|
| `vapi_call_start_context` | `workflow_vapi_call_start_context_v1.json` | `/vapi-call-start` | Pre-loads active store locations into the assistant's context at call start (cached 6h); on `end-of-call-report` it patches the matching Orders record with the Recording URL + Transcript |
| `toast_order_push_v1` | `workflow_toast_order_push_v1.json` | `/vapi-push-order` | Receives the `pushOrder` tool call, parses items + customization notes, looks up each item's price in the **Menu Knowledge Base** to compute the order total, writes a new record to the Airtable **Orders** table with `Order Status = New`, and (once a notification number is set) sends a Twilio SMS alert |
| `vapi_get_locations` | `workflow_vapi_get_locations_v1.json` | `/vapi-get-locations` | Fallback location lookup by city/state/name (cached 6h) |
| `vapi_get_menu_info` | `workflow_vapi_get_menu_info_v1.json` | `/vapi-get-menu-info` | Ingredient/allergen lookups only — ordinary menu items are answered straight from the prompt for speed (cached 30min) |

## How the Airtable token is wired in

Each workflow's Code node calls the Airtable REST API directly via `this.helpers.httpRequest`
with a Bearer token, instead of using a separate HTTP Request node + n8n credential — this
removes a hop and keeps latency down on live calls.

To deploy or rotate the token:
1. In n8n, set an environment variable (Settings → Environments, or `N8N_` config) named
   `AIRTABLE_PAT` holding the Personal Access Token.
2. Replace the `const PAT = 'REDACTED__SET_AS_N8N_ENV_VAR_AIRTABLE_PAT';` line in the Code
   node with `const PAT = $env.AIRTABLE_PAT;` — this keeps the secret out of the workflow
   JSON entirely (and out of any future export/backup).
3. Re-activate the workflow.

## Orders table — new fields added for this pipeline

| Field | ID | Type | Populated by |
|---|---|---|---|
| Location | `fldzT5EEtMrmx2Smp` | Single line text | `toast_order_push_v1` |
| Phone | `fldHWx4jyAI8ih68i` | Phone number | `toast_order_push_v1` |
| Total | `fldZpM4vLB5ryl2Eg` | Currency | `toast_order_push_v1` |
| Call ID | `fldBpeYTgz9dBVbwH` | Single line text | `toast_order_push_v1` |
| Order Status | `fldGDlt6DNHF1iH4m` | Single select (New/Accepted/Rejected/Completed) | `toast_order_push_v1` (set to `New`); updated by the dashboard |
| Recording URL | `fldgEdVyTu9OjeaFY` | URL | `vapi_call_start_context` (`end-of-call-report`) |
| Transcript | `fldbApN3f2mBSi3Ea` | Long text | `vapi_call_start_context` (`end-of-call-report`) |
| Ticket ID | `fldIbTNi6PPYBT3po` | Number (integer) | `toast_order_push_v1` |
| Pickup Time | `fldHGqRFXOG12pdfF` | Single line text | `toast_order_push_v1` |

Recording URL and Transcript only populate **after** a call ends — Vapi sends the
`end-of-call-report` event once the call is complete, and the workflow matches it back to
the order by `Call ID`.

## RESOLVED — n8n execution limit (2026-06-12)

Earlier on 2026-06-12 (~03:25 UTC), the n8n Cloud account hit its execution limit and every
workflow (order push, menu info, locations, call-start context, callback receiver) was
failing with "Execution limit reached. Consider upgrading your plan." Hassan upgraded the
n8n Cloud plan the same day — executions are succeeding again (verified via
`/api/v1/executions`), and the Ticket ID + Pickup Time fix below was tested end-to-end
successfully.

## Order total + modifications fix (2026-06-12)

Client feedback after testing the dashboard:
1. Order total wasn't showing (always $0.00).
2. Customizations (e.g. "Total Energy + peanut butter") weren't carried into "Order Items".

Root cause: the live `pushOrder` tool call sends `items: [{ name, notes, quantity, menuItemId }]`
— no `price`/`estimatedTotal`, and the old Code node only wrote `Nx ItemName` to "Order Items",
dropping `notes` entirely.

Fix applied in `workflow_toast_order_push_v1.json`:
- "Order Items" now appends `notes`/`modifiers` in parentheses, e.g. `1x Total Energy Smoothie (No banana, add whey protein) - $7.75`.
- "Total" (`fldZpM4vLB5ryl2Eg`) is computed automatically by looking up each item's price in
  the **Menu Knowledge Base** (now fully populated with live prices — see the menu sync done
  the same week) via fuzzy name matching, cached for 30 minutes (same pattern as
  `vapi_get_menu_info`). If Vapi ever sends `price`/`estimatedTotal` directly, those take
  precedence.

**To deploy:** re-import/update the "Parse and Log Order" Code node in n8n with the new
`workflow_toast_order_push_v1.json`, and replace the hardcoded `PAT` line with
`$env.AIRTABLE_PAT` (env var must be set — see "How the Airtable token is wired in" above).

Also updated `prompts/order_taker_v9.md` to document that `notes` is required for any
customization and that price/total no longer need to come from Bea.

## Ticket ID + Pickup Time (2026-06-12)

Second round of client feedback requested a ticket number system and visibility into
requested pickup timing.

Fix applied in `workflow_toast_order_push_v1.json`:
- **Ticket ID** (`fldIbTNi6PPYBT3po`): before writing the new record, the Code node queries
  Airtable for the current highest "Ticket ID" (`maxRecords=1`, sorted descending) and writes
  `previous max + 1`. Starts at `1000` if no orders have a Ticket ID yet (or if the lookup
  fails — non-fatal, falls back to `1000`).
- **Pickup Time** (`fldHGqRFXOG12pdfF`): captured from the new `pickupTime` field on the
  `pushOrder` tool call (free text, e.g. `"ASAP"`, `"in 2 hours"`, `"5:30 PM"`). Defaults to
  `"ASAP"` if not provided.
- The `result` returned to Vapi now includes the ticket number, e.g. *"Your ticket number is
  1004."* — `prompts/order_taker_v9.md` was updated so Bea reads this back to the customer in
  the closing recap along with the pickup time.

The dashboard (`beyond-juicery-dashboard`) now shows the ticket number as a badge on each
order card, displays the pickup time, and supports searching/filtering by ticket number,
customer name, phone, status, and date range. A new `/analytics` page shows order counts,
acceptance/rejection rates, revenue, and average order value.

**Deployed (2026-06-12):**
- n8n: live `toast_order_push_v1` workflow updated and verified (test order returned
  "Your ticket number is 1000" and wrote `Ticket ID`/`Pickup Time` correctly to Airtable).
- Vapi assistant `b9c95d99-575d-4202-90af-652a19509b8b` ("Beyond Juicery - Bea"): system
  prompt updated to `order_taker_v9.md` (with the pickup-time question and 6-element
  closing recap), and the `pushOrder` tool schema now includes `location`, `language`, and
  `pickupTime` as required parameters (alongside the existing `notes`/`menuItemId`).
- Dashboard: pushed to `beyond-juicery-dashboard` main, auto-deploys via Vercel.

## Customer SMS Confirmation (2026-06-12)

Client feedback item: confirm the customer's order with a text message, and confirm again
once the restaurant accepts it.

**Phone collection (`prompts/order_taker_v9.md`):**
- New "Step 2.5 — Phone number for order updates": Bea asks for a callback number and
  confirms it digit by digit before submitting the order.
- Captured as `customerPhone` and sent to `pushOrder` (now a **required** field on the
  live `pushOrder` tool schema, vapi tool `67e81ec8-2853-4aa0-9737-8cb209f9c3b4`).

**Order-received SMS (`workflow_toast_order_push_v1.json`):**
- `contactPhone = args.customerPhone || callerIdPhone` (caller ID is the fallback if Bea
  didn't capture a number for some reason).
- `contactPhone` is written to the Airtable "Phone" field (`fldHWx4jyAI8ih68i`).
- Immediately after the Airtable write, sends an SMS to `contactPhone` from
  `+13136311176`: *"We got your order! Ticket #[id]. Pickup: [time]. We will text you
  when the restaurant confirms it."* Wrapped in try/catch — SMS failure never blocks the
  order write.

**Order-accepted SMS (`beyond-juicery-dashboard/app/api/orders/[id]/route.js`):**
- When staff click "Accept" (PATCH status → `Accepted`), the route sends a second SMS to
  the order's `Phone` field from `+13136311176`: *"Your order #[ticket] has been
  confirmed! Pickup: [time] at [location]. See you soon!"* Also wrapped in try/catch.

**New Vercel env vars added to `beyond-juicery-dashboard`** (production/preview/dev):
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (`+13136311176`, same
number used for the n8n-side SMS).

**Deployed (2026-06-12):**
- n8n: live `toast_order_push_v1` updated and verified end-to-end (test order correctly
  wrote the confirmed `customerPhone` to the "Phone" field; cleaned up afterward).
- Vapi assistant: prompt updated with Step 2.5, and the `pushOrder` tool schema now
  requires `customerPhone`.
- Dashboard: pushed to `beyond-juicery-dashboard` main, auto-deploys via Vercel.

This is unrelated to the restaurant-side `TWILIO_TO` notification SMS, which remains
inert (`TWILIO_TO = ''`) — still pending Hassan's confirmation of a notification number.

## "Never Miss an Order" flow (Phase 1.5)

`toast_order_push_v1` now does two things on every new order:

1. Writes the order to Airtable with `Order Status = New` (field `fldGDlt6DNHF1iH4m`).
2. If `TWILIO_TO` is set in the Code node, sends an SMS via Twilio to the restaurant's
   notification number with the customer name, location, items, and total.

**Twilio is wired but inert** — `TWILIO_TO = ''` until Hassan confirms which phone
number staff want order alerts sent to. Once provided, update that one line in the
Code node (see `.credentials/credentials.local.md` for the Twilio Account SID/Auth
Token/from-number, kept locally and never committed).

The companion dashboard (`beyond-juicery-dashboard`, separate repo) polls the Orders
table every 5 seconds, plays an audible alert on new orders, and lets staff
Accept/Reject/Mark Completed (writing back to `Order Status`) or call the customer
directly from the `Phone` field.

To set the notification number:
1. In n8n, open `toast_order_push_v1` → "Parse and Log Order" Code node.
2. Set `const TWILIO_TO = '+1XXXXXXXXXX';` (E.164 format).
3. Save and the workflow re-activates automatically.
