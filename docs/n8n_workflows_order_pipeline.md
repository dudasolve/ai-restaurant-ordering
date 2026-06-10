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
| `toast_order_push_v1` | `workflow_toast_order_push_v1.json` | `/vapi-push-order` | Receives the `pushOrder` tool call, parses items/modifiers/total, writes a new record to the Airtable **Orders** table with `Order Status = New`, and (once a notification number is set) sends a Twilio SMS alert |
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

Recording URL and Transcript only populate **after** a call ends — Vapi sends the
`end-of-call-report` event once the call is complete, and the workflow matches it back to
the order by `Call ID`.

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
