# n8n + Airtable Setup Guide v2
## Beyond Juicery + Eatery — AI Ordering System
## Updated: 2026-06-04 (migrated from Zo's Good Burger)

---

## What Changed from v1

| Item | v1 (Zo's Good Burger) | v2 (Beyond Juicery + Eatery) |
|------|----------------------|------------------------------|
| Airtable Base Name | ZosGoodBurger - AI Orders | BeyondJuicery - AI Orders |
| AI Name | Zo | Bea |
| Menu Source | Static inside prompt | Live Airtable Menu Knowledge Base |
| New Table Added | — | Menu Knowledge Base (Table 4) |
| Phone Numbers | +1 (313) 631-1176 | (313) 209-4499 / (313) 209-6671 |
| Phone Provider | — | Cronus Communications (Hosted VoIP) |

---

## Airtable Base Structure

### Table 1 — Orders
(Same as before — receives orders from Vapi via n8n)

Fields:
- Order ID (Auto-number)
- Caller Name (Single line text)
- Order Items (Long text)
- Language (Single select: en / ar / es)
- Estimated Total (Currency)
- Timestamp (Date/time)
- Raw Order JSON (Long text)
- Call Recording (URL)
- Status (Single select: New / In Progress / Completed / Cancelled)

### Table 2 — Callback Requests
(Same as before)

Fields:
- Caller Name (Single line text)
- Phone (Phone)
- Notes / Reason (Long text)
- Timestamp (Date/time)
- Resolved (Checkbox)

### Table 3 — Test Log (QA Tracking)
NEW — for daily testing and tuning (agreed in meeting 2026-06-03)

Fields:
- Test Date (Date)
- Call ID (Single line text — Vapi call ID)
- Tester (Single line text)
- Language (Single select: en / ar / es)
- What Worked (Long text)
- What Went Wrong (Long text)
- Expected Behavior (Long text)
- Suggested Fix (Long text)
- Status (Single select: Open / Fixed / Won't Fix)
- Recording Link (URL)

### Table 4 — Menu Knowledge Base
NEW — primary menu source, read by the AI via getMenuInfo tool.
Updating this table = AI menu stays current without touching the prompt.

Fields:
- Item Name (Single line text) — e.g. "Chicken Caesar Wrap"
- Category (Single select) — Wraps / Classic Smoothies / Specialty Smoothies / Sorbet Bowls / Salads / Breakfast / Bottled Juices / Raw Juice / Wellness Shots / Coffee & Matcha / Limited Time
- Item ID (Single line text) — e.g. BJE-W02-CHKN-CAESAR
- Description (Long text)
- Ingredients (Long text) — full ingredient list
- Available Sizes (Single line text) — e.g. "12oz, 20oz"
- Protein Options (Single line text) — e.g. "Chicken, Turkey, Veggie"
- Tortilla Options (Single line text) — e.g. "Spinach, Wheat, Low Carb, Gluten Friendly"
- Available Modifiers (Long text) — what can be added/removed/swapped
- Add-ons (Long text) — optional extras
- Allergens (Long text) — e.g. "Contains: gluten, dairy"
- Price (Currency) — base price
- Popularity Ranking (Number) — 1 = most popular
- Active (Checkbox) — uncheck to hide from AI without deleting
- Notes (Long text) — seasonal info, internal notes

---

## How to Populate the Menu Knowledge Base

Full menu source: https://beyondjuiceryeatery.com/menu/

Prices are NOT shown on the website. Hassan needs to provide pricing for each item.
Until prices are confirmed, use $0.00 as placeholder.

Sample entries to start with:

ITEM: Chicken Caesar Wrap
  Item ID: BJE-W02-CHKN-CAESAR
  Category: Wraps
  Description: Grilled chicken, parmesan cheese, crisp romaine lettuce, croutons, Beyond-made caesar dressing
  Ingredients: Grilled chicken, parmesan, romaine lettuce, croutons, caesar dressing
  Tortilla Options: Spinach, Wheat, Low Carb (upcharge), Gluten Friendly (upcharge)
  Allergens: Contains gluten (croutons, tortilla), dairy (parmesan)
  Popularity Ranking: 1

ITEM: Total Energy Smoothie
  Item ID: BJE-SM02-TOTAL-ENERGY
  Category: Classic Smoothies
  Description: Simple refreshing strawberry banana blend
  Ingredients: Strawberry, Banana
  Available Sizes: 12oz, 20oz (confirm with restaurant)
  Allergens: None (confirm with restaurant)
  Popularity Ranking: 1

ITEM: Mango Tango Smoothie
  Item ID: BJE-SM04-MANGO-TANGO
  Category: Classic Smoothies
  Description: Tropical blend of mango, pineapple, banana, cream of coconut, and honey
  Ingredients: Mango, Pineapple, Banana, Cream of Coconut, Honey
  Available Sizes: 12oz, 20oz (confirm with restaurant)
  Allergens: Contains coconut (tree nut)
  Popularity Ranking: 2

---

## Step 1 — Create New Airtable Base

1. Log into Airtable (dudasolve account)
2. Create a new base: "BeyondJuicery - AI Orders"
3. Create all 4 tables with the fields listed above
4. Note down the new Base ID and all Table IDs from the URL:
   airtable.com/[BASE_ID]/[TABLE_ID]

Note: Transfer ownership to Hkaconnections@gmail.com when ready:
  Airtable base > Share > Transfer ownership

---

## Step 2 — Add Airtable Credential in n8n

1. Log into hkaconnectionsllc.app.n8n.cloud
2. Settings > Credentials > New Credential
3. Search "Airtable" > select "Airtable Personal Access Token API"
4. Name: "BeyondJuicery Airtable"
5. Access Token: (use same PAT or generate new one with access to new base)
6. Click Save

---

## Step 3 — Update Workflow: toast_order_push_v1 (ID: TTwJe4aQwFcORxgf)

1. Open the workflow
2. Find the Airtable node
3. Update:
   - Base ID → new BeyondJuicery base ID
   - Table ID → Orders table ID
4. Field mapping stays the same
5. Save

---

## Step 4 — Update Workflow: vapi_callback_receiver_v1 (ID: 4gll0kRrJBIglN9z)

1. Open the workflow
2. Update Airtable node with new Base ID + Callback Requests Table ID
3. Save

---

## Step 5 — Create New Workflow: beyond_menu_lookup_v1 (NEW)

The AI prompt v7 uses a getMenuInfo tool that queries Airtable for live menu data.

Create a new n8n workflow:

  Workflow name: beyond_menu_lookup_v1

  Node 1 — Webhook (trigger):
    Method: POST
    Path: beyond-menu-lookup
    This gives URL: https://hkaconnectionsllc.app.n8n.cloud/webhook/beyond-menu-lookup

  Node 2 — Set (extract query):
    Extract: {{ $json.body.query }}

  Node 3 — Airtable (search):
    Operation: Search Records
    Base: BeyondJuicery - AI Orders
    Table: Menu Knowledge Base
    Filter by formula: SEARCH(LOWER("{{ query }}"), LOWER({Item Name})) OR SEARCH(LOWER("{{ query }}"), LOWER({Ingredients}))

  Node 4 — Respond to Webhook:
    Response body: {{ JSON.stringify($json) }}
    Status: 200

Register this webhook URL in Vapi as the getMenuInfo tool endpoint.

---

## Step 6 — Update Vapi Assistant

1. Log into Vapi dashboard
2. Clone the existing assistant (ID: b9c95d99-575d-4202-90af-652a19509b8b) OR edit directly
3. Rename to: "Beyond Juicery - Order Taker"
4. Replace system prompt with content from order_taker_v7.md
5. Update tools:
   - pushOrder: keep same webhook URL
   - notifyCallback: keep same
   - getMenuInfo (NEW TOOL): POST to https://hkaconnectionsllc.app.n8n.cloud/webhook/beyond-menu-lookup
     Input schema: { "query": "string" }
6. Save

---

## Step 7 — Set Up Call Forwarding

Provider: Cronus Communications (Hosted VoIP)
Feature available: Call Forwarding / No Answer Forwarding (listed in their features)

Numbers to configure:
  (313) 209-4499
  (313) 209-6671

Ask Hassan to log into the Cronus Communications customer portal and set:
  Forward to: Vapi phone number (the Twilio/Vapi number that handles AI calls)
  No Answer Forwarding: also forward to Vapi number

---

## Step 8 — Test End-to-End

1. Place a test call via Vapi directly (no forwarding needed to test)
2. Order something — check Orders table in Airtable
3. Ask "What's in the Total Energy smoothie?" — AI should answer from Airtable
4. Ask to speak to a human — check Callback Requests table
5. Log test results in the Test Log table

---

## Quick Reference

n8n Webhook URLs:
  Orders:      https://hkaconnectionsllc.app.n8n.cloud/webhook/vapi-push-order
  Callbacks:   https://hkaconnectionsllc.app.n8n.cloud/webhook/vapi-callback-request
  Menu Lookup: https://hkaconnectionsllc.app.n8n.cloud/webhook/beyond-menu-lookup (NEW)

Beyond Juicery Menu: https://beyondjuiceryeatery.com/menu/
Restaurant Phones: (313) 209-4499 | (313) 209-6671
Phone System: Cronus Communications — Hosted VoIP

Old Vapi Assistant ID (Zo's): b9c95d99-575d-4202-90af-652a19509b8b

---

## Pending From Hassan (Blockers)

Before going live on the Beyond Juicery phone lines:

[ ] Restaurant address — which specific location? (needed for AI closing script)
[ ] Menu prices — not on website, needed to populate Menu Knowledge Base
[ ] Deliverect account credentials — for end-to-end POS integration
[ ] Any additional charges: tax rate, service fee, delivery fee, upcharge amounts
[ ] Confirm call forwarding setup with Cronus Communications customer portal
