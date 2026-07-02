# Beyond Juicery + Eatery — AI Ordering System
## Operations & Maintenance Guide

---

## What this system does

When a customer calls the restaurant, an AI assistant named **Bea** answers the call, takes the order in English, Arabic, or Spanish, and sends it directly to your Order Dashboard in real time. When you accept an order, the customer receives an automatic text confirmation with their pickup time and location.

Everything flows through three places you already use:
- **Airtable** — menu prices, store locations, and order history
- **Order Dashboard** — where you accept, reject, and complete orders
- **Your phone** — call and text notifications

---

## Order Dashboard

**URL:** https://beyond-juicery-dashboard-hka-connections.vercel.app

**Login:** use the password set up during onboarding

### Daily workflow

1. Open the dashboard on a tablet or computer at the start of each shift
2. New orders appear automatically — a red alert badge and an audio beep will notify you
3. For each new order: read it, then tap **Accept** or **Reject**
4. When the order is ready for pickup, tap **Mark Completed**
5. Use the **Call** button to call the customer directly if you need to clarify anything

### Views

- **Grid** — card layout, one order per card (good for busy periods)
- **List** — table layout, more orders visible at once (good for history review)
- Switch between them using the icons in the top-right corner of the dashboard

### Tabs

- **Active** — shows New and Accepted orders (your working queue)
- **History** — shows Completed and Rejected orders

---

## Updating the Menu

> **Critical rule: Update the menu at least 30 minutes before opening or before the first call of the day.**
>
> The AI loads menu prices fresh at the start of each call. If you update a price at 10:03 AM and your first call comes in at 10:05 AM, the AI will already have the old price cached. Updating by 9:30 AM (for a 10:00 AM opening) guarantees accuracy.

### How to update a price

1. Open Airtable → **Menu KB** table
2. Find the item by name (use the search bar at the top)
3. Click the price field and type the new amount
4. Save — that's it. No other changes needed.

The AI, the dashboard totals, and the order history all pull prices from this same table automatically.

### How to add a new menu item

1. In Airtable → **Menu KB**, click **+ Add a record** at the bottom
2. Fill in: **Item Name**, **Price**, and **Category**
3. Make sure the spelling matches exactly how staff would recognize it (e.g., "Chicken Caesar Wrap", not "chkn caesar")
4. The AI will recognize the item by name on the next call

### How to remove or temporarily disable an item

- To permanently remove: delete the row in Airtable → Menu KB
- To temporarily disable (e.g., out of stock): add a note in Airtable, then update the Bea prompt to say the item is unavailable for that day — contact your setup team for prompt updates

### What to never do

- Do not edit prices in the dashboard or anywhere else — Airtable Menu KB is the only place
- Do not skip the 30-minute lead time before opening
- Do not add items with $0 or blank prices — they will be skipped by the AI

---

## Managing Store Locations

Store locations (address, phone, active status) are managed in Airtable → **Store Locations** table.

### To add a new location

1. Add a new row in the Store Locations table
2. Fill in: Location Name, Address, City, State, Phone
3. Set the **Active** field to ✓ (checked)

### To temporarily close a location

- Uncheck the **Active** field — Bea will stop mentioning it within 6 hours (location data refreshes every 6 hours)
- For immediate effect, contact your setup team

### To permanently close a location

- Delete the row from the Store Locations table

---

## When Things Go Wrong

### Bea quoted the wrong price to a customer

- Accept the order and honor the price the customer was quoted
- Then update the price in Airtable → Menu KB
- Going forward, prices will be correct

### A customer says Bea couldn't understand them

- Review the call recording in Airtable → Orders table (Recording column)
- If it's a recurring issue with a specific item name or pronunciation, contact your setup team — the AI can be trained to recognize it

### Bea tried to take a catering order

- Bea is configured to redirect catering requests to a human callback
- Make sure someone from the team returns those calls
- Catering orders are not processed by the AI

### A customer complained and Bea didn't transfer them

- Bea is configured to say a phrase and request a human callback for complaints
- Review the call recording to confirm what happened
- The callback alert system will notify your team (see Callback Alerts below)

### Dashboard is not loading

- Refresh the page first
- If it still doesn't load, check your internet connection
- If the problem persists, contact your setup team — the system may need a redeployment

### Orders are not appearing on the dashboard

- Check if Bea is still active in the Vapi dashboard (contact setup team for access)
- Verify the n8n automation workflows are running (contact setup team)

---

## Callback Alerts

When a customer asks to speak to a human, or when a complaint or catering request comes in, Bea says a scripted phrase and flags the call for a human follow-up.

Your team should check for callback requests and return those calls promptly — within 30 minutes during business hours.

---

## Best Practices

**Start of day**
- Confirm Airtable menu prices are up to date (at least 30 min before opening)
- Have the dashboard open and visible before the first call
- Confirm the location's Active status in Airtable if there are any location changes

**During service**
- Keep the dashboard tab open and audio on — new orders trigger a beep
- Accept orders promptly — the customer is waiting
- Use the Call button for any order that needs clarification rather than waiting

**End of day**
- Mark all completed orders as Completed in the dashboard
- Review the History tab for any orders that were rejected — follow up if needed

**Menu changes**
- Always update Airtable first, 30+ minutes before opening
- After a price change, spot-check by calling and ordering the item yourself to verify Bea reads the new price

**Recurring issues**
- If Bea repeatedly misunderstands a specific item or phrase, note it and contact your setup team — the AI prompt can be updated to handle it

---

## Contact for Support

For system issues, prompt updates, or anything that requires technical changes, contact your setup team with:

1. A description of what happened
2. The ticket number or customer name (if it's about a specific order)
3. The call recording from Airtable (if available)

---

*Last updated: June 2026*
