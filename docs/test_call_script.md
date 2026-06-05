# Test Call Script — Beyond Juicery + Eatery (Bea)
# Phone: (313) 209-4499 or (313) 209-6671
# Run each test separately. Check: no awkward silences, correct prices, correct closing.

---

## TEST 1 — Basic order + location lookup (English)
**Goal:** location loads from pre-injected context, order flows clean, closing has all 5 required elements

> "Hi"

Expected: Bea greets and asks for pickup location.

> "West Dearborn"

Expected: confirms "22370 Michigan Ave, Dearborn" — NO tool call pause here (pre-loaded).

> "I'd like a Chicken Caesar Wrap and a Total Energy smoothie"

Expected: asks tortilla choice for the wrap first.

> "Spinach"

Expected: confirms wrap with spinach tortilla, then confirms the smoothie (no further questions needed for Total Energy).

> "That's it"

Expected: reads back full order, asks for name.

> "Hassan"

Expected: spells back "H-A-S-S-A-N", asks to confirm.

> "Yes"

Expected: submits order, then reads closing with ALL 5:
- ✅ Name: Hassan
- ✅ Order recap: Chicken Caesar Wrap on spinach + Total Energy smoothie
- ✅ Total in words (not decimals): "nineteen dollars and seventy-four cents" (approx)
- ✅ Address: 22370 Michigan Ave, Dearborn
- ✅ "ready in about 15 to 20 minutes"

---

## TEST 2 — Customer doesn't know the location (city lookup)
**Goal:** getLocations still works as fallback, returns fast from cache

> "Hi, I want to place an order"

> "I'm not sure which location, I'm in Troy"

Expected: Bea responds with Troy options (3 locations) — should be fast, no long pause.

> "Somerset Collection"

Expected: confirms "2800 Big Beaver Rd, Troy" and proceeds to order.

> "I'll have an Acai Cosmic Dream Bowl"

Expected: asks which nut butter (peanut / almond / Nutella).

> "Peanut butter"

> "That's all, name is Maria"

Expected: spells back "M-A-R-I-A", confirms, submits, closing with all 5 elements.

---

## TEST 3 — Menu lookup / ingredient question
**Goal:** getMenuInfo fires correctly, returns fast after first cache warm-up

> "Hello, what wraps do you have?"

Expected: brief pause (~600ms first time, ~50ms after), then lists wrap options with prices.

> "What's in the Cilantro Chicken Wrap?"

Expected: calls getMenuInfo, returns description with ingredients.

> "I'll take that on wheat tortilla"

> "And a Total Energy Plus smoothie"

> "Nothing else. Name is Diego"

Expected: spells "D-I-E-G-O", submits, full closing.

---

## TEST 4 — Arabic
**Goal:** language detection, full Arabic flow

> "مرحبا، أريد أن أطلب"

Expected: Bea switches fully to Arabic, asks for location in Arabic.

> "ديترويت"

Expected: lists Detroit locations in Arabic (still uses location data from Airtable).

> "New Center"

> "أريد Chicken Caesar Wrap"

Expected: asks about tortilla in Arabic.

> "خبز السبانخ"

> "وعصير Total Energy"

> "بس هيك، اسمي حسن"

Expected: spells name in Arabic, submits, full Arabic closing with address + total.

---

## TEST 5 — Delivery redirect
**Goal:** delivery question handled without tool call

> "Hi, I want to place a delivery order"

Expected: redirects to app/DoorDash immediately, no pause, offers pickup instead.

> "Ok, pickup then. Cleveland Uptown."

> "I'll have a Mango Tango smoothie"

> "That's it. Name is Sarah"

Expected: clean close — "S-A-R-A-H" spelling, total, address "11413 Euclid Ave", 15-20 min.

---

## TEST 6 — Human request
**Goal:** notifyCallback fires, call ends cleanly

> "Hi, can I speak to a real person?"

Expected: "Of course! Someone from our team will call you back shortly." Call ends.
Check Airtable Callback Requests table — should have a new record.

---

## WHAT TO LOG FOR EACH TEST

| # | Location pause? | Menu pause? | Total correct? | Address correct? | Spelling done? | Airtable logged? |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | — | — | — | — | — | |

**Red flags to watch:**
- Pause > 2s after customer speaks = tool call slower than expected
- Price read as "11.95" instead of words = prompt not applied
- Closing skips any of the 5 elements = check prompt
- Order not in Airtable Orders table = pushOrder workflow issue
- Callback not in Airtable Callback Requests = notifyCallback workflow issue
