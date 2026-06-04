# n8n → Airtable Integration Setup Guide
## Zo's Good Burger AI Ordering System

**Time to complete:** ~10 minutes  
**Who does this:** Whoever has access to `Hkaconnections@gmail.com` (to get the n8n magic link login)

---

## Airtable Credentials (already set up)

| Item | Value |
|------|-------|
| **Base Name** | ZosGoodBurger - AI Orders |
| **Base ID** | `appmBaUD39bNFM4QA` |
| **Orders Table ID** | `tblQkG1DeczNyWsyM` |
| **Callback Requests Table ID** | `tblWNa0KZhD8FbomB` |
| **Personal Access Token (PAT)** | `[REDACTED — store in n8n credentials, not in code]` |

> ⚠️ Note: The Airtable base is currently in Duda's workspace (dudasolve). Transfer to Hassan's HKA account later via: Airtable base → Share → Transfer ownership to `Hkaconnections@gmail.com`

---

## Step 1 — Add Airtable Credential in n8n

1. Log into `hkaconnectionsllc.app.n8n.cloud`
2. Go to **Settings → Credentials → New Credential**
3. Search for **"Airtable"** and select **"Airtable Personal Access Token API"**
4. **Name:** `ZosGoodBurger Airtable`
5. **Access Token:** `[REDACTED — use the token stored in your password manager]`
6. Click **Save**

---

## Step 2 — Update Workflow: `toast_order_push_v1` (ID: TTwJe4aQwFcORxgf)

This workflow receives orders from Vapi and should now log them to Airtable.

### Add an Airtable node after the existing logic:

1. Open the workflow `toast_order_push_v1`
2. Find the last node (likely a "Respond to Webhook" or placeholder POS node)
3. **Add a new node** → search **"Airtable"** → select **"Airtable"**
4. Configure the node as follows:

| Field | Value |
|-------|-------|
| **Credential** | ZosGoodBurger Airtable |
| **Operation** | Create a record |
| **Base ID** | `appmBaUD39bNFM4QA` |
| **Table ID** | `tblQkG1DeczNyWsyM` (Orders) |

5. **Fields to map** (click "Add Field" for each):

| Airtable Field | n8n Expression |
|----------------|----------------|
| `Caller Name` | `{{ $json.body.call.customer.name }}` or `{{ $json.body.customerName }}` |
| `Order Items` | `{{ $json.body.orderSummary }}` or `{{ $json.body.items }}` |
| `Language` | `{{ $json.body.language }}` |
| `Timestamp` | `{{ new Date().toISOString() }}` |
| `Raw Order JSON` | `{{ JSON.stringify($json.body) }}` |

> 💡 **Note:** The exact field path depends on the actual Vapi payload structure. Open a recent execution in n8n and inspect the incoming JSON to confirm the exact field names. The `Raw Order JSON` field will capture everything regardless.

6. Connect this node after the existing last node
7. **Save** the workflow

---

## Step 3 — Update Workflow: `vapi_callback_receiver_v1` (ID: 4gll0kRrJBIglN9z)

This workflow is triggered when a caller asks to speak with a human. It should:
1. Log the callback request to Airtable
2. Send a notification to Hassan so he calls back immediately

### Add Airtable node:

1. Open the workflow `vapi_callback_receiver_v1`
2. After the webhook trigger, **add an Airtable node**:

| Field | Value |
|-------|-------|
| **Credential** | ZosGoodBurger Airtable |
| **Operation** | Create a record |
| **Base ID** | `appmBaUD39bNFM4QA` |
| **Table ID** | `tblWNa0KZhD8FbomB` (Callback Requests) |

3. **Fields to map:**

| Airtable Field | n8n Expression |
|----------------|----------------|
| `Caller Name` | `{{ $json.body.callerName }}` |
| `Phone` | `{{ $json.body.call.customer.number }}` |
| `Notes / Reason` | `{{ $json.body.reason }}` |
| `Timestamp` | `{{ new Date().toISOString() }}` |

### Add Notification node (send alert to Hassan):

After the Airtable node, **add a notification node** — choose one based on Hassan's preference:

**Option A — WhatsApp (via Twilio):**
- Node: **Twilio**
- Operation: Send WhatsApp Message
- To: Hassan's WhatsApp number
- Message: `🔔 CALLBACK REQUEST\n\nCustomer: {{ $json.body.callerName }}\nPhone: {{ $json.body.call.customer.number }}\nReason: {{ $json.body.reason }}\n\nCall them back ASAP!`

**Option B — SMS (via Twilio):**
- Node: **Twilio**
- Operation: Send SMS
- Account SID: `[REDACTED — store in n8n credentials]`
- From: `+13136311176`
- To: Hassan's phone number
- Message: `CALLBACK: {{ $json.body.callerName }} called and wants a human. Call them at {{ $json.body.call.customer.number }}`

**Option C — Email (via Gmail/SMTP):**
- Node: **Gmail** or **Email**
- To: `Hkaconnections@gmail.com`
- Subject: `🔔 Callback Request from {{ $json.body.callerName }}`
- Body: Customer name, phone, reason, timestamp

> ❓ **Ask Hassan which notification method he prefers (WhatsApp, SMS, or email) before connecting this node.**

4. **Save and activate** the workflow

---

## Step 4 — Test End-to-End

1. Call `+1 (313) 631-1176`
2. Place a test order in Arabic or Spanish
3. Check the **Orders** table in Airtable — a new record should appear
4. Request to speak with a human
5. Check the **Callback Requests** table — a new record should appear
6. Verify the notification was sent to Hassan

---

## Quick Reference

```
n8n Webhook URLs:
  Orders:    https://hkaconnectionsllc.app.n8n.cloud/webhook/vapi-push-order
  Callbacks: https://hkaconnectionsllc.app.n8n.cloud/webhook/vapi-callback-request

Airtable Base: https://airtable.com/appmBaUD39bNFM4QA

Vapi Assistant ID: b9c95d99-575d-4202-90af-652a19509b8b
Twilio Number: +1 (313) 631-1176
```
