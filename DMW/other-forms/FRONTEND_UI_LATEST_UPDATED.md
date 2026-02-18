# DMW Procurement System — Latest Frontend UI Spec (Updated Feb 11, 2026)

This document is the **current, authoritative UI specification** for the DMW Caraga Procurement System frontend.

It is based on the existing frontend requirements (vanilla HTML/CSS/JS SPA) and has been updated to include:
- **Director + Chief signing gate** before COA submission (PO packet with supporting docs).
- Updated **business statuses**: **On Process → Awaiting Delivery → For Payment → Paid (ADA)**.
- Document-driven RFQ/AOQ/BAC Resolution flows as reflected by the provided sample files.

---

## 1) Tech + structure

### Stack
- Single Page Application (SPA) using **vanilla HTML + CSS + JavaScript** (no frameworks).
- Hash/DOM routing via showing/hiding `<section class="page" id="...">` blocks.

### Files
- `index.html`: all pages + tables + modals.
- `app.js`: navigation, permissions, API calls, modal handlers, status transitions.
- `main.css`: design tokens + layout + badge styles.

---

## 2) Global navigation (pages)

### Planning
- Dashboard
- PPMP
- APP

### Transactions
- Purchase Requests (PR)
- RFQ (Request for Quotation)
- Abstract of Quotation (AOQ)
- Post-Qualification (optional)
- BAC Resolution
- Notice of Award (NOA)
- Purchase Orders (PO)

### Inspection
- IAR (Inspection and Acceptance Report)

### Signing + Submission (UPDATED)
- **PO Packet / Signing** (NEW)
- COA Submission

### Master data
- Items
- Suppliers
- Users
- Divisions

### Reports
- Reports

---

## 3) End-to-end flow (UPDATED)

### Lifecycle
1. PPMP → APP
2. APP Item → PR
3. PR Approved → RFQ
4. RFQ Posted/Sent → Quotes Received
5. AOQ Prepared → (optional Post-Qual)
6. BAC Resolution Approved
7. NOA Issued
8. PO Created/Approved
9. PO Accepted (supplier conforme) → Awaiting delivery
10. Delivery Delivered → For payment
11. Payment completed → Paid (ADA)
12. IAR Completed (inspection/acceptance)
13. **PO Packet compiled (PO + supporting documents)**
14. **Chief signs → Director signs**
15. Submit to COA

### Key rule (Signing gate)
COA submission must be **blocked** until both signatures are recorded:
- `chief_signed_at` AND `director_signed_at` must exist.

---

## 4) Status model (UPDATED)

The system displays two types of states:

### A) Document states (per module)
- PR status: `pending | approved | rejected | processed | cancelled`
- RFQ status: `draft | posted | closed | cancelled`
- AOQ status: `draft | submitted | approved | cancelled`
- BAC Resolution status: `draft | approved | rejected | cancelled`
- NOA status: `draft | issued | received | cancelled`
- PO status: `pending | approved | delivered | completed | cancelled`
- IAR status: `draft | completed | cancelled`
- COA submission: `draft | submitted | received | returned | completed | cancelled`

### B) Business/Case workflow status (the main UI status badges)
Use these as the primary **status badge** in tables and the **Dashboard pipeline** counts:

- `on_process` → **On Process**
  - Trigger (recommended): set after PR is approved and RFQ is created OR once RFQ is posted.

- `awaiting_delivery` → **Awaiting Delivery**
  - Trigger: PO is accepted (supplier conforme/acceptance recorded).

- `for_payment` → **For Payment**
  - Trigger: delivery is marked delivered OR IAR is completed (choose one policy; keep consistent).

- `paid_ada` → **Paid (ADA)**
  - Trigger: payment is recorded with ADA reference number + payment date.

Additional workflow statuses for the new gate:
- `for_signing` → **For Signing** (packet compiled, awaiting signatures)
- `signed` → **Signed** (both Chief + Director signed)
- `submitted_to_coa` → **COA Submitted** (after COA submission record created)

### Status badge mapping (app.js)
Add/extend:
```js
const WORKFLOW_STATUS_BADGES = {
  pending: { label: 'Pending', tone: 'muted' },
  on_process: { label: 'On Process', tone: 'info' },
  awaiting_delivery: { label: 'Awaiting Delivery', tone: 'warning' },
  for_payment: { label: 'For Payment', tone: 'warning' },
  paid_ada: { label: 'Paid (ADA)', tone: 'success' },
  for_signing: { label: 'For Signing', tone: 'info' },
  signed: { label: 'Signed', tone: 'success' },
  submitted_to_coa: { label: 'COA Submitted', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' }
};
```

---

## 5) Updated Dashboard pipeline (UPDATED)

Replace/extend the Transaction Pipeline stages to include the new statuses:

- Draft PR
- PR For Approval
- PR Approved
- RFQ Posted/Sent
- Quotes Received
- AOQ Prepared
- Post-Qual (if required)
- BAC Resolution Approved
- NOA Issued
- PO Approved
- **On Process** (case-level)
- **Awaiting Delivery**
- **For Payment**
- **Paid (ADA)**
- IAR Completed
- **For Signing**
- **Signed**
- COA Submitted

Dashboard endpoints must return counts grouped by these stage labels.

---

## 6) Module UI requirements

### Purchase Requests (PR)
- Create/Edit PR with required attachments (Route Slip Annex 1, etc.).
- Actions: Save draft, Submit for approval, Approve/Return.

### RFQ (Request for Quotation)
Document-driven RFQ screen must support:
- RFQ number + date prepared + PR reference + ABC amount.
- Supplier invitation list (at least 3 suppliers typical for SVP).
- Deadline + PhilGEPS indicator (required if ABC ≥ 200,000; store posting date range).
- Print RFQ in the same structure as the provided RFQ templates (do not hardcode sample text; keep template fields).

### Abstract of Quotation (AOQ)
Document-driven AOQ screen must support:
- AOQ number + date + RFQ link.
- Multi-bidder comparison table with:
  - supplier name, amounts, compliance flag, rank, remarks (e.g., “Above ABC”, “Disqualified—missing docs”).
- Recommendation output: lowest responsive bidder + certification blocks.

### BAC Resolution
Must support:
- Resolution number + date.
- Procurement mode SVP and threshold behavior:
  - If ABC ≥ 200,000: store PhilGEPS posting dates.
  - If ABC < 200,000: mark posting not mandatory.
- Bidder table (name, total bid amount, remarks).
- Signatories block (BAC members) and approval block (HoPE).

### Purchase Orders (PO)
PO page must support these actions (NEW):
- `Mark PO Accepted` → set workflow_status = `awaiting_delivery` (capture acceptance date, optional upload supplier conforme).
- `Mark Delivered` → set workflow_status = `for_payment` (capture delivery date).
- `Mark Paid (ADA)` → set workflow_status = `paid_ada` (capture payment date + ADA reference no.).

### IAR
IAR screen must support:
- Link to PO, delivery receipt no., invoice no.
- Inspection result + signatories.
- Upload required documents.

### PO Packet / Signing (NEW)
Purpose: manage the **paper packet** and signatures before COA.

Pages:
- Packet List (filter by status: draft/for_signing/signed/submitted_to_coa)
- Packet Details

Packet checklist UI:
- Show required docs attached to the case: PR, RFQ, AOQ, BAC Resolution, NOA, PO, IAR, DR/Invoice, etc.

Actions:
- `Compile Packet` (creates packet record, optional upload merged/scanned PDF) → sets packet status `for_signing`.
- `Mark Chief Signed` (requires date/time; optional upload signed page).
- `Mark Director Signed` (requires date/time; optional upload signed page).
- When both signed: packet status becomes `signed` and UI enables `Submit to COA`.

### COA Submission
- Create submission record only if packet is signed.
- Upload COA packet (optional if already uploaded in PO packet).
- Record COA receipt details.

---

## 7) Permissions (roles)

Roles used by UI:
- admin
- hope (Regional Director / HoPE)
- bac_chair
- bac_secretariat
- twg_member
- division_head
- end_user
- supply_officer
- inspector
- auditor

Enforce at UI level:
- Only Supply/BAC Sec can compile packet.
- Only Chief + Director (or assigned roles) can sign.
- Only authorized role can submit to COA.

---

## 8) Required modals (NEW)

Implement these modal forms:

1. `AcceptPO_Modal`
- Fields: `accepted_at` (required), `supplier_conforme_attachment` (optional).

2. `Delivered_Modal`
- Fields: `delivered_at` (required), `delivery_date` (required).

3. `PaidADA_Modal`
- Fields: `payment_date` (required), `ada_reference_no` (required).

4. `CompilePacket_Modal`
- Fields: `compiled_at`, `packet_attachment` (optional merged/scanned PDF), checklist confirmations.

5. `ChiefSign_Modal`
- Fields: `chief_signed_at` (required), `signed_page_attachment` (optional).

6. `DirectorSign_Modal`
- Fields: `director_signed_at` (required), `signed_page_attachment` (optional).

7. `SubmitCOA_Modal`
- Fields: `submission_date`, `received_by_coa` (optional), `coa_packet_attachment` (optional), checklist.

---

## 9) API endpoints expected by frontend (summary)

Add/extend backend endpoints to support the new module + workflow:

- PO workflow:
  - `PUT /api/purchase-orders/:id/accept`
  - `PUT /api/purchase-orders/:id/deliver`
  - `PUT /api/purchase-orders/:id/pay-ada`

- PO Packet + signing:
  - `POST /api/po-packets/compile` (or `/api/po-packet/:po_id/compile`)
  - `POST /api/po-packets/:id/chief-sign`
  - `POST /api/po-packets/:id/director-sign`

- COA:
  - `POST /api/coa-submissions`
  - Backend must validate: packet exists and both signatures are completed.

---

## 10) Data model alignment

The updated database schema must include entities for RFQ, AOQ, BAC Resolution, NOA, PO, IAR, PO Packet, COA Submission and attachments.

Use the updated schema file:
- `schema_updated_v1_1.sql`

---

# Copilot build instruction (paste to Copilot Chat)

Generate/modify the existing vanilla HTML/CSS/JS SPA to match this spec.

Priority order:
1) Add **PO Packet / Signing** page, tables, and modals.
2) Update **Purchase Orders** page with new action buttons and status transitions.
3) Update **Dashboard pipeline** stages and counts.
4) Update status badge mappings and filters everywhere.
5) Ensure RFQ/AOQ/BAC Resolution forms remain document-driven and printable.
