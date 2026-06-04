# Draft Message → Tiago
*(Review before sending — edit as needed)*

---

Hey Tiago 👋

Quick update on Zo's Good Burger AI ordering system:

**✅ Where we are:**
- Vapi assistant is live on +1 (313) 631-1176, handling EN/AR/ES calls with auto language detection
- Order push webhook (`toast_order_push_v1`) and callback webhook (`vapi_callback_receiver_v1`) are configured in n8n
- Airtable base set up ("ZosGoodBurger - AI Orders") with an Orders table and Callback Requests table ready to receive data from both workflows — just need to connect the Airtable nodes in n8n (quick config, all values are ready)

**📞 Test it now:**
Hassan (and you) can already test the Arabic/Spanish voice by calling **+1 (313) 631-1176** directly — no setup needed on your end.

---

**Two things I need from you to unblock call forwarding:**

1. **What type of phone system does Hassan currently use for the restaurant?**
   - A standard carrier line (AT&T, T-Mobile, Verizon, etc.)?
   - Or a VoIP/cloud phone system (RingCentral, Google Voice, OpenPhone, Grasshopper, etc.)?
   
   This determines how we route inbound calls to the Twilio number. If it's a standard carrier, we'll need a VoIP bridge (~$29/mo with Grasshopper or OpenPhone). If it's already VoIP, we can configure forwarding directly in the dashboard.

2. **POS integration — two options on the table:**

   | | **Deliverect** *(recommended)* | **Chowly** |
   |---|---|---|
   | Price | ~$75/mo | ~$79–$199/mo |
   | n8n integration | Native partnership (Dec 2025) — clean API | Manual webhook setup |
   | Setup time | Faster, well-documented | Slower, inquiry already submitted |
   | Coverage | 400+ POS systems | Strong on Toast, Olo |
   | Apply | developers.deliverect.com | Awaiting their response |

   My recommendation: move forward with **Deliverect** as primary. Chowly can stay as a backup if we hear back from them.
   
   What does Hassan want to do here?

---

Let me know on both and we'll keep moving 🚀

