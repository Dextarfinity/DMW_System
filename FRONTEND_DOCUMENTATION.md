# DMW Caraga Procurement System - Frontend Documentation

> **Version:** 2.0  
> **Last Updated:** February 11, 2026  
> **Compliance:** ISO 9001:2015 | Per Memo 14 Nov 2025

---

## Table of Contents

### For Users (Non-Developers)
1. [Getting Started](#getting-started)
2. [Login Screen](#login-screen)
3. [Main Interface Overview](#main-interface-overview)
4. [Navigation Guide](#navigation-guide)
5. [System Modules](#system-modules)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Common Tasks Guide](#common-tasks-guide)
8. [Status Badges Reference](#status-badges-reference)

### System Workflow & Status Model (UPDATED)
9. [End-to-End Procurement Flow](#end-to-end-procurement-flow)
10. [Document States vs Business Workflow Status](#document-states-vs-business-workflow-status)
11. [Signing Gate (Chief + Director)](#signing-gate-chief--director)

### For Developers
12. [Technical Architecture](#technical-architecture)
13. [File Structure](#file-structure)
14. [HTML Structure](#html-structure)
15. [CSS Theming](#css-theming)
16. [JavaScript Application Logic](#javascript-application-logic)
17. [Extending the System](#extending-the-system)

### Backend Integration Reference
18. [Authentication & Session Management](#18-authentication--session-management)
19. [Dashboard Elements](#19-dashboard-elements-requiring-backend-data)
20. [PPMP Module - Buttons & Forms](#20-ppmp-module---buttons--forms)
21. [APP Module - Buttons & Forms](#21-app-module---buttons--forms)
22. [Purchase Requests Module](#22-purchase-requests-module---buttons--forms)
23. [RFQ Module](#23-rfq-module---buttons--forms)
24. [Abstract of Quotations Module](#24-abstract-of-quotations-module---buttons--forms)
25. [Post-Qualification Module](#25-post-qualification-module---buttons--forms)
26. [BAC Resolution Module](#26-bac-resolution-module---buttons--forms)
27. [Notice of Award Module](#27-notice-of-award-noa-module---buttons--forms)
28. [Purchase Orders Module (UPDATED)](#28-purchase-orders-module---buttons--forms)
29. [IAR Module](#29-iar-module---buttons--forms)
30. [PO Packet / Signing Module (NEW)](#30-po-packet--signing-module-new)
31. [COA Submission Module (UPDATED)](#31-coa-submission-module-updated)
32. [Items Catalog Module](#32-items-catalog-module---buttons--forms)
33. [Suppliers Module](#33-suppliers-module---buttons--forms)
34. [User Management Module](#34-user-management-module---buttons--forms)
35. [Reports Module](#35-reports-module---buttons)
36. [Global Action Buttons](#36-global-action-buttons-table-actions)
37. [File Upload Integration](#37-file-upload-integration)
38. [Dropdown Data Sources](#38-dropdown-data-sources-require-backend-lookup)
39. [Utility Functions](#39-utility-functions-requiring-backend)
40. [New Modal Forms (Workflow Actions)](#new-modal-forms-workflow-actions)
41. [Backend API Summary](#41-backend-api-summary)

---

# FOR USERS (NON-DEVELOPERS)

## Getting Started

The DMW Caraga Procurement System is a web-based application designed to manage the complete procurement lifecycle for the Department of Migrant Workers (DMW) Caraga Region XIII office. The system follows the Small Value Procurement (SVP) process flow from planning through COA submission.

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Stable internet connection
- Screen resolution of 1280x720 or higher recommended

---

## Login Screen

When you first access the system, you will see the login screen.

### Login Fields:
| Field | Description |
|-------|-------------|
| **Username** | Your assigned username |
| **Password** | Your secure password |
| **Role** | Select your role in the organization (Demo Mode) |
| **Division** | Select your division (FAD, WRSD, MWPSD, MWPTD, or ORD) |

### Steps to Login:
1. Enter your **username**
2. Enter your **password**
3. Select your **role** from the dropdown
4. Select your **division** from the dropdown
5. Click **"Sign In"**

> **Note:** The system remembers your session. You will remain logged in until you click "Logout".

---

## Main Interface Overview

After logging in, you will see the main application interface with these key areas:

### 1. Sidebar (Left Panel)
- **Logo & Header**: DMW Caraga branding
- **Navigation Menu**: Links to all system modules
- **User Info**: Your name, role, and division
- **Logout Button**: Sign out of the system

### 2. Top Header Bar
- **Menu Toggle**: Collapse/expand the sidebar (hamburger icon)
- **Page Title**: Current page name
- **Notification Bell**: System notifications
- **Current Date**: Today's date in Philippine format

### 3. Main Content Area
The central area displays the current page content, including:
- Information banners with important guidelines
- Action buttons (Create, Export, Print, etc.)
- Search and filter controls
- Data tables with records

---

## Navigation Guide

The sidebar contains all navigation links organized by category:

### Planning Section
| Menu Item | Description |
|-----------|-------------|
| **Dashboard** | Overview of system status and KPIs |
| **PPMP** | Project Procurement Management Plan |
| **APP** | Annual Procurement Plan |

### Transactions Section
| Menu Item | Description |
|-----------|-------------|
| **Purchase Requests** | Create and manage PRs |
| **RFQ** | Request for Quotations |
| **Abstract** | Abstract of Quotations |
| **Post-Qualification** | Vendor eligibility verification (Optional) |
| **BAC Resolution** | BAC award recommendations |
| **Notice of Award** | NOA issuance to winning bidders |
| **Purchase Orders** | PO creation and tracking |

### Inspection Section
| Menu Item | Description |
|-----------|-------------|
| **IAR** | Inspection & Acceptance Report (Appendix 62) |

### Signing + Submission Section (UPDATED)
| Menu Item | Description |
|-----------|-------------|
| **PO Packet / Signing** | **(NEW)** Compile packet & Chief/Director signing gate |
| **COA Submission** | Commission on Audit document submission |

### Master Data Section
| Menu Item | Description |
|-----------|-------------|
| **Items** | Items catalog/master list |
| **Suppliers** | Supplier directory |
| **Divisions** | DMW Caraga divisions (5 end-users) |
| **Users** | User management |

### Reports Section
| Menu Item | Description |
|-----------|-------------|
| **Reports** | Various reports and KPIs |

---

## System Modules

### 1. Dashboard
The Dashboard provides an at-a-glance view of the procurement status:

**KPI Summary Cards:**
- PPMP Items count
- APP Projects count
- Active Cases count
- COA Submitted count

**Transaction Pipeline (UPDATED):**
Visual workflow showing counts at each stage:
```
Draft PR → PR For Approval → PR Approved → RFQ Posted/Sent → Quotes Received → AOQ Prepared → Post-Qual (if required) → BAC Resolution Approved → NOA Issued → PO Approved → On Process → Awaiting Delivery → For Payment → Paid (ADA) → IAR Completed → For Signing → Signed → COA Submitted
```

**Business Workflow Status Badges:**
| Status | Badge Label | Color Tone | Trigger |
|--------|-------------|------------|---------|
| `pending` | Pending | muted | Initial state |
| `on_process` | On Process | info | After PR approved and RFQ created/posted |
| `awaiting_delivery` | Awaiting Delivery | warning | PO accepted (supplier conforme recorded) |
| `for_payment` | For Payment | warning | Delivery marked as delivered OR IAR completed |
| `paid_ada` | Paid (ADA) | success | Payment recorded with ADA reference + date |
| `for_signing` | For Signing | info | Packet compiled, awaiting signatures |
| `signed` | Signed | success | Both Chief + Director signed |
| `submitted_to_coa` | COA Submitted | success | COA submission record created |
| `cancelled` | Cancelled | danger | Transaction cancelled |

**SLA Targets Banner:**
- PR Approval: 5 days
- RFQ: 3 days
- Abstract: 1 day
- NOA: 1 day
- PO Approval: 1 day
- Supplier Sign: 7 days
- COA: 5 days

**Active Cases Table:**
Shows current procurement cases with case number, project, division, mode (SVP/DC), status, and timeline compliance.

**PPMP Status by Division:**
Progress bars showing PPMP completion percentage for each division.

---

### 2. PPMP (Project Procurement Management Plan)

**Purpose:** Planning document listing all procurement needs per division.

**Key Fields:**
- PPMP Code
- Project Title
- Division
- Type (Services, Supplies, Equipment)
- Quantity/Size
- Procurement Mode
- Timeline
- Estimated Budget
- Fund Source
- Status

**Actions Available:**
- Create new PPMP entry
- View/Edit existing entries
- Submit to APP
- Filter by division, mode, or fiscal year

---

### 3. APP (Annual Procurement Plan)

**Purpose:** Consolidated procurement plan from all division PPMPs.

**APP Versions:**
- **Indicative APP**: Initial planning version
- **Final APP**: Approved version
- **Updated APP**: Amended versions (v1, v2, etc.)

**Key Features:**
- Total ABC summary
- Consolidate from PPMP function
- Export to Excel
- Print APP
- Create PR from APP item

---

### 4. Purchase Requests

**Purpose:** Request document to initiate procurement.

**Timeline Requirement:** PR must be submitted at least **15 calendar days** before the activity.

**Required Attachments:**
- Route Slip (Annex 1)
- Technical Specs/SOW/TOR
- Other conditional requirements

**Key Fields:**
- PR Number (auto-generated: PR-MON-YEAR-###)
- Date
- Project/Purpose
- Division
- APP Reference
- Amount
- Requested By
- Approved By
- Status
- Annex 1 attachment status

---

### 5. RFQ (Request for Quotations)

**PhilGEPS Requirement:** RFQs with ABC ≥ ₱200,000 must be posted on PhilGEPS for at least **3 calendar days**.

**Key Fields:**
- RFQ Number
- PR Reference
- Project
- ABC Amount
- PhilGEPS posting status
- Posted Date
- Deadline
- Number of quotes received
- Status

---

### 6. Abstract of Quotations

**Timeline:** Must be prepared within **1 calendar day** after the RFQ deadline.

**Key Fields:**
- Abstract Number
- RFQ Reference
- Project
- Number of Bidders
- Lowest Compliant Bidder
- Bid Amount
- Date Prepared
- Status

---

### 7. Post-Qualification (Optional)

**Purpose:** BAC/TWG validates bidder eligibility documents.

**Documents Verified:**
- ITR (Income Tax Return)
- Omnibus Sworn Statement
- PhilGEPS/Platinum Registration
- BIR COR (Certificate of Registration)
- Business Permits

---

### 8. BAC Resolution

**Purpose:** Official BAC recommendation for award to the Lowest Calculated Responsive Bid (LCRB).

**Key Fields:**
- Resolution Number
- Date
- Abstract Reference
- Project
- Recommended Awardee
- Amount
- Approval Status

---

### 9. Notice of Award (NOA)

**Timeline:** Issued by HoPE within **1 calendar day** from BAC Resolution.

**Key Fields:**
- NOA Number
- Date Issued
- BAC Resolution Reference
- Project
- Winning Bidder
- Contract Amount
- Bidder Receipt Date
- Status

---

### 10. Purchase Orders (UPDATED)

**Timeline Requirements:**
- PO approved within **1 calendar day** from NOA
- Supplier signs within **7 calendar days** from PO approval

**Key Fields:**
- PO Number
- Date
- NOA Reference
- Supplier
- Procurement Mode
- Delivery Term
- Payment Term
- Amount
- Status (document status)
- **Workflow Status** (business status - NEW)

**NEW Action Buttons (Workflow Transitions):**
| Action | Button Label | Workflow Status Change | Required Fields |
|--------|--------------|------------------------|-----------------|
| Accept PO | **Mark PO Accepted** | → `awaiting_delivery` | `accepted_at` (date), `supplier_conforme_attachment` (optional) |
| Mark Delivered | **Mark Delivered** | → `for_payment` | `delivered_at` (date), `delivery_date` |
| Record Payment | **Mark Paid (ADA)** | → `paid_ada` | `payment_date`, `ada_reference_no` |

**Document Statuses:**
- `pending` - PO created but not approved
- `approved` - PO approved by HoPE
- `delivered` - Goods/services delivered
- `completed` - Transaction fully completed
- `cancelled` - PO cancelled

---

### 11. IAR (Inspection & Acceptance Report)

**Reference:** Appendix 62 format

**Key Fields:**
- IAR Number
- PO Reference
- Supplier
- Invoice Number
- Requisitioning Office
- Inspection Status
- Acceptance Status

**Signatories:**
- Inspection Officer
- Property Custodian

---

### 12. COA Submission (UPDATED)

**Timeline:** PO with complete attachments must be submitted to COA on or before **5 calendar days** from date of approval.

**⚠️ SIGNING GATE REQUIREMENT (NEW):**
COA submission is **BLOCKED** until both signatures are recorded:
- `chief_signed_at` must exist
- `director_signed_at` must exist

The **Submit to COA** button is disabled until the PO Packet has status `signed`.

**Key Fields:**
- Submission Number
- PO Reference
- IAR Reference
- **PO Packet Reference** (NEW)
- Project
- Amount
- Attachments completeness
- Submitted Date
- COA Receipt Date
- Status

**Document Checklist (must be included in packet):**
- [ ] Purchase Request (PR)
- [ ] Route Slip / Annex 1
- [ ] Request for Quotation (RFQ)
- [ ] Abstract of Quotations
- [ ] BAC Resolution
- [ ] Notice of Award (NOA)
- [ ] Purchase Order (PO)
- [ ] Inspection & Acceptance Report (IAR)
- [ ] Delivery Receipt
- [ ] Sales Invoice
- [ ] PhilGEPS Posting (if ABC ≥ ₱200K)
- [ ] Supplier Conforme

---

### 12A. PO Packet / Signing (NEW MODULE)

**Purpose:** Manage the paper packet and required signatures (Chief + Director) before COA submission.

**Pages:**
1. **Packet List** - View all packets filtered by status (draft/for_signing/signed/submitted_to_coa)
2. **Packet Details** - View packet contents and signing status

**Packet Status Flow:**
```
[Draft] → [For Signing] → [Signed] → [Submitted to COA]
```

**Packet Checklist UI:**
Display all required documents attached to the case:
- PR with attachments
- RFQ
- AOQ (Abstract of Quotations)
- BAC Resolution
- NOA
- PO
- IAR
- DR/Invoice

**Action Buttons:**
| Action | Button Label | Status Change | Required Fields |
|--------|--------------|---------------|-----------------|
| Compile Packet | **Compile Packet** | → `for_signing` | `compiled_at`, `packet_attachment` (optional merged/scanned PDF) |
| Chief Sign | **Mark Chief Signed** | Records signature | `chief_signed_at` (required), `signed_page_attachment` (optional) |
| Director Sign | **Mark Director Signed** | → `signed` (when both signed) | `director_signed_at` (required), `signed_page_attachment` (optional) |
| Submit to COA | **Submit to COA** | → `submitted_to_coa` | Only enabled when packet status = `signed` |

**Permission Rules:**
- Only Supply Officer/BAC Secretariat can compile packet
- Only Chief (or assigned role) can mark Chief signed
- Only Director/HoPE (or assigned role) can mark Director signed
- Only authorized role can submit to COA

---

### 13. Items Catalog

**Purpose:** Master list of procurable items.

**Key Fields:**
- Item Code
- Description
- Category (Services, Supplies, Equipment)
- Unit of Measure
- Estimated Unit Price

---

### 14. Suppliers Directory

**Purpose:** Registry of approved suppliers/vendors.

**Key Fields:**
- Supplier ID
- Company Name
- Address
- Contact Information
- PhilGEPS Status (Platinum, Registered)
- TIN

---

### 15. Divisions

The 5 DMW Caraga End-User Divisions:

| Code | Division Name |
|------|---------------|
| **FAD** | Finance & Administrative Division |
| **WRSD** | Welfare Reintegration Services Division |
| **MWPSD** | Migrant Workers Protection Services Division |
| **MWPTD** | Migrant Workers Protection Training Division |
| **ORD** | Office of the Regional Director |

---

### 16. Users Management

**Available Roles:**
1. System Administrator
2. HoPE (Regional Director)
3. BAC Chairperson
4. BAC Secretariat
5. TWG Member
6. Division Head
7. End User
8. Supply/Procurement Officer
9. Inspection/Property Custodian

---

### 17. Reports

**Available Reports:**
| Report | Description |
|--------|-------------|
| PPMP Summary | Division-level PPMP consolidation |
| APP Report | Annual Procurement Plan versions |
| PR Status | Purchase Requests by status and timeline |
| SVP Lifecycle | Transaction status from PR to COA |
| Timeline KPI | Compliance with Memo timelines |
| PhilGEPS Compliance | ABC≥200K posting compliance |
| COA Submission | Packet completeness tracking |
| Audit Trail | System activity logs |

---

## User Roles & Permissions

### Permission Matrix

| Role | PPMP | APP | PR | RFQ | Abstract | BAC Res | NOA | PO | IAR | COA |
|------|------|-----|-----|-----|----------|---------|-----|-----|-----|-----|
| **Admin** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **HoPE** | Approve | Approve | View | View | View | Approve | Approve | Approve | Approve | View |
| **BAC Chair** | - | View | View | View | Approve | Approve | View | View | View | - |
| **BAC Sec** | View | Consolidate | View | Create | Create | Create | Create | Create | View | Submit |
| **TWG** | - | View | View | View | View | - | - | - | - | - |
| **Div Head** | Approve | View | Approve | - | - | - | - | - | - | - |
| **End User** | Create | - | Create | - | - | - | - | - | - | - |
| **Supply** | - | View | View | Create | Create | - | Create | Create | Create | Submit |
| **Inspector** | - | - | - | - | - | - | - | View | Create | View |

---

## Common Tasks Guide

### Creating a New Purchase Request
1. Navigate to **Purchase Requests**
2. Click **"New Purchase Request"**
3. Fill in the required fields:
   - Select APP Reference
   - Enter project/purpose
   - Enter amount
   - Attach Route Slip (Annex 1)
   - Attach Technical Specs
4. Click **Submit**

### Checking Procurement Status
1. Go to **Dashboard**
2. View the **Transaction Pipeline** for stage counts
3. Check **Active Cases** table for specific case status
4. Use the **Timeline** badge to see if cases are on track or at risk

### Generating Reports
1. Navigate to **Reports**
2. Select the desired report type
3. Click **"Generate"**
4. Export or print as needed

---

## Status Badges Reference

| Badge | Meaning |
|-------|---------|
| 🟢 **Draft** | Document is in draft, not submitted |
| 🟡 **For Approval** | Awaiting approval |
| 🟢 **Approved** | Document approved |
| 🔵 **In APP** | Item included in APP |
| 🟡 **RFQ Posted** | RFQ sent to suppliers |
| 🟢 **Quotations Received** | Supplier quotes received |
| 🔵 **Abstract Prepared** | Abstract completed |
| 🟢 **Post-Qual Passed** | Bidder passed verification |
| 🟢 **BAC Resolution Approved** | BAC approved the award |
| 🔵 **NOA Issued** | Notice of Award sent |
| 🟢 **PO Approved** | Purchase Order approved |
| 🟢 **PO Signed** | Supplier signed PO |
| 🟢 **IAR Completed** | Inspection complete |
| 🟢 **COA Submitted** | Documents sent to COA |
| 🔴 **At Risk** | Timeline may be missed |
| 🟢 **On Track** | Within timeline |

---

## End-to-End Procurement Flow

The complete procurement lifecycle follows this 15-step process:

```
┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────────┐   ┌─────┐
│PPMP │ → │ APP │ → │ PR  │ → │ RFQ │ → │ AOQ │ → │BAC Res. │ → │ NOA │
└─────┘   └─────┘   └─────┘   └─────┘   └─────┘   └─────────┘   └─────┘
                                                                    │
┌─────────────────────────────────────────────────────────────────────┘
│
▼
┌─────┐   ┌────────┐   ┌─────────┐   ┌──────────┐   ┌─────┐
│ PO  │ → │ Accept │ → │ Deliver │ → │  Pay ADA │ → │ IAR │
└─────┘   └────────┘   └─────────┘   └──────────┘   └─────┘
                                                        │
┌───────────────────────────────────────────────────────┘
│
▼
┌─────────────────┐   ┌────────────┐   ┌──────────────┐   ┌─────────────┐
│ Compile Packet  │ → │ Chief Sign │ → │Director Sign │ → │ COA Submit  │
└─────────────────┘   └────────────┘   └──────────────┘   └─────────────┘
```

### Phase 1: Planning & Budgeting
| Step | Module | Description |
|------|--------|-------------|
| 1 | **PPMP** | Create Project Procurement Management Plan |
| 2 | **APP** | Consolidate approved PPMPs into Annual Procurement Plan |

### Phase 2: Requirement & Sourcing
| Step | Module | Description |
|------|--------|-------------|
| 3 | **PR** | Create Purchase Request from APP items |
| 4 | **RFQ** | Post Request for Quotation (3 days if ABC ≥ ₱200,000) |
| 5 | **AOQ** | Receive and abstract supplier quotations |

### Phase 3: Award
| Step | Module | Description |
|------|--------|-------------|
| 6 | **BAC Resolution** | BAC evaluates and awards to Lowest Calculated Responsive Bid |
| 7 | **NOA** | Issue Notice of Award to winning supplier |

### Phase 4: Order Fulfillment
| Step | Module | Description |
|------|--------|-------------|
| 8 | **PO** | Generate Purchase Order from NOA |
| 9 | **Accept PO** | Supplier accepts and signs the PO → status: `on_process` |
| 10 | **Deliver** | Supplier delivers goods/services → status: `awaiting_delivery` |
| 11 | **Pay ADA** | Finance processes payment → status: `paid_ada` |
| 12 | **IAR** | Inspection and Acceptance Report completed |

### Phase 5: Signing & Submission
| Step | Module | Description |
|------|--------|-------------|
| 13 | **Compile Packet** | Assemble all procurement documents → status: `for_signing` |
| 14 | **Chief Sign** | Chief of Division signs packet |
| 15 | **Director Sign** | Regional Director signs packet → status: `signed` |
| 16 | **COA Submit** | Submit complete packet to COA → status: `submitted_to_coa` |

> ⚠️ **Signing Gate Rule:** COA submission must be blocked until BOTH `chief_signed_at` AND `director_signed_at` timestamps exist in the database.

---

## Document States vs Business Workflow Status

### Document States (Per Module)

Each document type has its own state machine:

| Module | States |
|--------|--------|
| **PPMP** | `draft` → `submitted` → `approved` / `rejected` |
| **APP** | `draft` → `submitted` → `approved` / `returned` |
| **PR** | `pending` → `for_approval` → `approved` / `rejected` |
| **RFQ** | `draft` → `posted` → `closed` (deadline passed) |
| **AOQ** | `draft` → `finalized` (all quotes entered) |
| **BAC Resolution** | `pending` → `approved` / `rejected` |
| **NOA** | `draft` → `issued` → `accepted` / `declined` |
| **PO** | `pending` → `approved` → `signed` |
| **IAR** | `pending` → `completed` |
| **COA** | `pending` → `submitted` |

### Business Workflow Status (Procurement-Level)

After the PO is approved, procurement items enter a **business workflow** tracked by the `business_status` field:

| Status | Meaning | Trigger |
|--------|---------|---------|
| `on_process` | PO accepted by supplier, order is being processed | Click **Mark PO Accepted** |
| `awaiting_delivery` | Goods/services in transit | Click **Mark Delivered** (then waits for IAR) |
| `for_payment` | Delivery received, payment pending | IAR completed |
| `paid_ada` | ADA/payment released | Click **Mark Paid (ADA)** |
| `for_signing` | Packet compiled, awaiting signatures | Click **Compile Packet** |
| `signed` | Both Chief and Director have signed | Both sign buttons clicked |
| `submitted_to_coa` | Complete packet sent to COA | Click **Submit to COA** |

### Status Badge Mapping

| Business Status | Badge Color | Display Text |
|-----------------|-------------|--------------|
| `on_process` | 🟡 Yellow | On Process |
| `awaiting_delivery` | 🔵 Blue | Awaiting Delivery |
| `for_payment` | 🟠 Orange | For Payment |
| `paid_ada` | 🟢 Green | Paid (ADA) |
| `for_signing` | 🟣 Purple | For Signing |
| `signed` | 🟢 Green | Signed |
| `submitted_to_coa` | ✅ Teal | Submitted to COA |

---

## New Modal Forms (Workflow Actions)

The following modals support the new workflow transitions:

### 1. AcceptPO_Modal
**Purpose:** Record supplier acceptance of Purchase Order  
**Triggered By:** "Mark PO Accepted" button in Purchase Orders  
**Fields:**
- `acceptance_date` - Date supplier accepted
- `supplier_remarks` - Optional notes from supplier
- `attachment` - Signed PO document upload

**Backend Action:** `PUT /api/purchase-orders/:id/accept`  
**Status Change:** `approved` → `on_process`

---

### 2. Delivered_Modal
**Purpose:** Record delivery of goods/services  
**Triggered By:** "Mark Delivered" button in Purchase Orders  
**Fields:**
- `delivery_date` - Date goods received
- `delivery_receipt_no` - DR/SI number
- `received_by` - Name of receiving officer
- `attachment` - Delivery receipt scan

**Backend Action:** `PUT /api/purchase-orders/:id/deliver`  
**Status Change:** `on_process` → `awaiting_delivery`

---

### 3. PaidADA_Modal
**Purpose:** Record payment release via ADA  
**Triggered By:** "Mark Paid (ADA)" button in Purchase Orders  
**Fields:**
- `payment_date` - Date of payment release
- `ada_number` - ADA reference number
- `amount_paid` - Actual amount released
- `disbursement_voucher` - DV number

**Backend Action:** `PUT /api/purchase-orders/:id/pay-ada`  
**Status Change:** `for_payment` → `paid_ada`

---

### 4. CompilePacket_Modal
**Purpose:** Compile all procurement documents into a packet for signing  
**Triggered By:** "Compile Packet" button in PO Packet / Signing  
**Fields:**
- `packet_checklist` - Checkboxes for required documents:
  - [ ] Purchase Request
  - [ ] Request for Quotation
  - [ ] Abstract of Quotations
  - [ ] BAC Resolution
  - [ ] Notice of Award
  - [ ] Purchase Order
  - [ ] Inspection & Acceptance Report
  - [ ] Delivery Receipt
  - [ ] Official Receipt
- `notes` - Additional remarks

**Backend Action:** `POST /api/po-packets/compile`  
**Status Change:** `paid_ada` → `for_signing`

---

### 5. ChiefSign_Modal
**Purpose:** Record Chief of Division signature  
**Triggered By:** "Chief Sign" button in PO Packet / Signing  
**Fields:**
- `signed_date` - Date of signature
- `signatory_name` - Auto-filled with Chief's name
- `designation` - Auto-filled "Chief, Finance and Administrative Division"
- `digital_signature` - Signature pad or upload

**Backend Action:** `POST /api/po-packets/:id/chief-sign`  
**Updates:** Sets `chief_signed_at` timestamp

---

### 6. DirectorSign_Modal
**Purpose:** Record Regional Director signature  
**Triggered By:** "Director Sign" button in PO Packet / Signing  
**Prerequisite:** `chief_signed_at` must exist  
**Fields:**
- `signed_date` - Date of signature
- `signatory_name` - Auto-filled with Director's name
- `designation` - Auto-filled "Regional Director"
- `digital_signature` - Signature pad or upload

**Backend Action:** `POST /api/po-packets/:id/director-sign`  
**Updates:** Sets `director_signed_at` timestamp, changes status to `signed`

---

### 7. SubmitCOA_Modal
**Purpose:** Submit complete packet to Commission on Audit  
**Triggered By:** "Submit to COA" button in COA Submission  
**Prerequisite:** BOTH `chief_signed_at` AND `director_signed_at` must exist  
**Fields:**
- `submission_date` - Date of submission
- `coa_receiving_officer` - Name of COA staff receiving
- `transmittal_number` - Transmittal reference
- `remarks` - Additional notes
- `final_packet_pdf` - Compiled PDF attachment

**Backend Action:** `POST /api/coa-submissions`  
**Status Change:** `signed` → `submitted_to_coa`

---

# FOR DEVELOPERS

## Technical Architecture

The DMW Caraga Procurement System frontend is built as a **Single Page Application (SPA)** using vanilla HTML, CSS, and JavaScript without external frameworks.

### Key Characteristics:
- **No Build Process Required**: Pure HTML/CSS/JS
- **Client-Side Routing**: Hash-based or DOM-based page switching
- **Session Management**: localStorage for user sessions
- **Responsive Design**: Flexbox/Grid-based layouts
- **Icon Library**: Font Awesome 6.5.1

---

## File Structure

```
renderer/
├── index.html          # Main application HTML (1812 lines)
├── scripts/
│   └── app.js          # Application JavaScript (1876 lines)
└── styles/
    └── main.css        # Application styles (1393 lines)
```

### File Descriptions:

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Complete UI structure, all pages, modals, login screen | 1812 |
| `app.js` | Application logic, navigation, role permissions, form handlers | 1876 |
| `main.css` | CSS variables, layout, components, responsive design | 1393 |

---

## HTML Structure

### Main Layout Architecture

```html
<body>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">...</div>
      <nav class="sidebar-nav">...</nav>
      <div class="sidebar-footer">...</div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-header">...</header>
      <div class="page-content">
        <!-- Individual Page Sections -->
        <section class="page" id="dashboard">...</section>
        <section class="page" id="ppmp">...</section>
        <!-- ... more pages ... -->
      </div>
    </main>
  </div>

  <!-- Modal Template -->
  <div class="modal-overlay" id="modalOverlay">...</div>

  <!-- Login Overlay -->
  <div class="login-overlay" id="loginOverlay">...</div>
</body>
```

### Page Section Pattern

Each page follows this structure:

```html
<section class="page" id="page-name">
  <!-- Info Banner (optional) -->
  <div class="info-banner">
    <i class="fas fa-info-circle"></i>
    <strong>Title:</strong> Description text
  </div>

  <!-- Page Actions Bar -->
  <div class="page-actions">
    <button class="btn btn-primary" data-action="create-xxx">
      <i class="fas fa-plus"></i> New Item
    </button>
    <div class="search-box">...</div>
    <div class="filter-group">...</div>
  </div>

  <!-- Data Card with Table -->
  <div class="data-card">
    <table class="data-table full-width">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</section>
```

### Navigation Item Pattern

```html
<li class="nav-item" data-page="page-id">
  <i class="fas fa-icon-name"></i>
  <span>Page Label</span>
</li>
```

---

## CSS Theming

### CSS Variables (Design Tokens)

```css
:root {
  /* Primary Colors */
  --primary-color: #1a365d;
  --primary-light: #2c5282;
  --primary-dark: #0f2744;

  /* Semantic Colors */
  --secondary-color: #718096;
  --success-color: #276749;
  --warning-color: #c05621;
  --danger-color: #c53030;
  --info-color: #2b6cb0;

  /* Background Colors */
  --bg-color: #f7fafc;
  --sidebar-bg: #1a365d;
  --sidebar-hover: #2c5282;
  --card-bg: #ffffff;

  /* Text Colors */
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --text-muted: #a0aec0;

  /* Border Colors */
  --border-color: #e2e8f0;
  --border-light: #edf2f7;

  /* Layout Variables */
  --sidebar-width: 240px;
  --header-height: 56px;
  --border-radius: 4px;

  /* Shadows */
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);
}
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.app-container` | Main flex container |
| `.sidebar` | Fixed left navigation panel |
| `.sidebar.collapsed` | Hidden sidebar state |
| `.main-content` | Main content area |
| `.main-content.expanded` | Full-width when sidebar collapsed |
| `.page` | Hidden page section |
| `.page.active` | Visible page section |
| `.data-table` | Styled table component |
| `.data-card` | Card wrapper for tables |
| `.btn` | Base button style |
| `.btn-primary` | Primary action button |
| `.btn-secondary` | Secondary action button |
| `.btn-icon` | Icon-only button |
| `.status-badge` | Status indicator pill |
| `.mode-badge` | Procurement mode indicator |
| `.info-banner` | Information banner |
| `.modal-overlay` | Modal background |

### Button Variants

```css
.btn-primary   /* Blue primary action */
.btn-secondary /* Gray secondary action */
.btn-sm        /* Small button size */
.btn-block     /* Full-width button */
.btn-icon      /* Icon-only button in tables */
.btn-icon.success /* Green icon button */
.btn-icon.danger  /* Red icon button */
```

### Status Badge Variants

```css
.status-badge.draft
.status-badge.pr-for-approval
.status-badge.pr-approved
.status-badge.rfq-posted
.status-badge.quotations-received
.status-badge.abstract-prepared
.status-badge.post-qual-passed
.status-badge.bac-resolution-approved
.status-badge.noa-issued
.status-badge.po-approved
.status-badge.po-signed
.status-badge.iar-completed
.status-badge.coa-submitted
.status-badge.pending
.status-badge.approved
.status-badge.in-app
.status-badge.on-track
.status-badge.at-risk
```

---

## JavaScript Application Logic

### Core Functions

```javascript
// Initialization
init()                    // App initialization
setCurrentDate()          // Set date in header
setupEventListeners()     // Bind all event listeners
checkSession()            // Check for saved session

// Authentication
handleLogin(e)            // Process login form
handleLogout()            // Clear session and show login
showApp()                 // Show main app after login

// Navigation
navigateTo(pageId)        // Switch to a page
toggleSidebar()           // Toggle sidebar visibility

// Permissions
getUserPermissions()      // Get current user's permissions
hasPermission(name)       // Check specific permission
applyRoleVisibility()     // Apply role-based UI visibility
applyActionPermissions()  // Apply action-level button visibility
hideEmptyActionColumns()  // Hide action columns if no actions

// Modal Management
openModal(title, html)    // Open modal with content
closeModal()              // Close active modal

// Utility
formatRole(role)          // Format role code to display name
validateAttachment()      // Validate file attachments
```

### Role Permission System

The system implements a granular permission system:

```javascript
const roleActionPermissions = {
  admin: {
    canCreatePPMP: true,
    canApprovePPMP: true,
    canViewPPMP: true,
    // ... all permissions
  },
  end_user: {
    canCreatePPMP: true,
    canApprovePPMP: false,
    canViewPPMP: true,
    canCreatePR: true,
    // ... limited permissions
  },
  // ... other roles
};
```

### Permission Button Mapping

```javascript
const permissionButtonMap = {
  canCreatePPMP: ['[data-action="create-ppmp"]', '.btn-create-ppmp'],
  canApprovePPMP: ['[data-action="approve-ppmp"]', '.btn-approve-ppmp'],
  // ... maps permissions to button selectors
};
```

### Page Titles Configuration

```javascript
const pageTitles = {
  dashboard: 'Dashboard',
  ppmp: 'Project Procurement Management Plan (PPMP)',
  app: 'Annual Procurement Plan (APP)',
  'purchase-requests': 'Purchase Requests',
  // ... all page titles
};
```

### Navigation Permission by Role

```javascript
const rolePermissions = {
  admin: ['dashboard', 'ppmp', 'app', 'purchase-requests', ...], // all pages
  end_user: ['dashboard', 'ppmp', 'purchase-requests', 'items'], // limited
  // ... other roles
};
```

---

## Extending the System

### Adding a New Page

1. **Add Navigation Item** in `index.html`:
```html
<li class="nav-item" data-page="new-page">
  <i class="fas fa-icon"></i>
  <span>New Page</span>
</li>
```

2. **Add Page Section** in `index.html`:
```html
<section class="page" id="new-page">
  <div class="info-banner">...</div>
  <div class="page-actions">...</div>
  <div class="data-card">...</div>
</section>
```

3. **Add Page Title** in `app.js`:
```javascript
const pageTitles = {
  // existing pages...
  'new-page': 'New Page Title',
};
```

4. **Add Role Permissions** in `app.js`:
```javascript
const rolePermissions = {
  admin: [..., 'new-page'],
  // add to other roles as needed
};
```

### Adding a New Status Badge

1. **Add HTML**:
```html
<span class="status-badge new-status">New Status</span>
```

2. **Add CSS** in `main.css`:
```css
.status-badge.new-status {
  background-color: #color;
  color: #text-color;
}
```

### Adding a New User Role

1. **Add to Login Dropdown** in `index.html`:
```html
<option value="new_role">New Role Name</option>
```

2. **Add Role Permissions** in `app.js`:
```javascript
new_role: {
  canCreatePPMP: false,
  canApprovePPMP: false,
  // ... define all permissions
}
```

3. **Add Navigation Permissions**:
```javascript
const rolePermissions = {
  // existing roles...
  new_role: ['dashboard', 'allowed-pages'],
};
```

4. **Add Role Label**:
```javascript
function formatRole(role) {
  const roleLabels = {
    // existing...
    new_role: 'New Role Display Name',
  };
}
```

### Adding Form Modal Functions

Create modal handler functions following this pattern:

```javascript
window.showNewItemModal = function() {
  const formHtml = `
    <form id="newItemForm" class="modal-form">
      <div class="form-group">
        <label>Field Label</label>
        <input type="text" id="fieldName" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  `;
  openModal('Create New Item', formHtml);
  
  document.getElementById('newItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form submission
    closeModal();
  });
};
```

---

## Backend Integration Reference

This section provides a comprehensive list of ALL buttons, forms, modals, and interactive elements that will require backend API integration when connecting the frontend to a database/server.

---

### 18. Authentication & Session Management

| Element | Current Behavior | Backend Integration Required |
|---------|------------------|------------------------------|
| **Login Form** (`#loginForm`) | Static demo login via localStorage | POST `/api/auth/login` - Validate credentials, return JWT token |
| **Username Input** (`#username`) | Accepts any input | Validate against users table |
| **Password Input** (`#password`) | Accepts any input | Hash comparison with stored password |
| **Role Select** (`#roleSelect`) | Manual dropdown selection | Auto-detect from user record or validate selection |
| **Division Select** (`#divisionSelect`) | Manual dropdown selection | Auto-populate from user record |
| **Logout Button** (`#logoutBtn`) | Clears localStorage | POST `/api/auth/logout` - Invalidate token, clear session |
| **Session Check** (`checkSession()`) | Reads localStorage | GET `/api/auth/verify` - Validate token validity |

---

### 19. Dashboard Elements Requiring Backend Data

| Element | Current State | Backend Endpoint Required |
|---------|---------------|---------------------------|
| **PPMP Items Count** (stat-card) | Static "24" | GET `/api/dashboard/ppmp-count` |
| **APP Projects Count** (stat-card) | Static "18" | GET `/api/dashboard/app-count` |
| **Active Cases Count** (stat-card) | Static "7" | GET `/api/dashboard/active-cases` |
| **COA Submitted Count** (stat-card) | Static "12" | GET `/api/dashboard/coa-submitted` |
| **Transaction Pipeline Stages** | Static counts | GET `/api/dashboard/pipeline-status` |
| **Active Cases Table** | Static demo data | GET `/api/dashboard/active-cases-list` |
| **PPMP Status by Division** | Static progress bars | GET `/api/dashboard/ppmp-by-division` |

---

### 20. PPMP Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **New PPMP Entry** | `data-action="create-ppmp"` / `showNewPPMPModal()` | Opens form → POST `/api/ppmp` |
| **View PPMP** | `.btn-icon[title="View"]` | GET `/api/ppmp/{id}` |
| **Edit PPMP** | `.btn-icon[title="Edit"]` | GET `/api/ppmp/{id}` then PUT `/api/ppmp/{id}` |
| **Submit to APP** | `.btn-icon.success[title="Submit to APP"]` | POST `/api/ppmp/{id}/submit-to-app` |
| **Search PPMP** | `.search-box input` | GET `/api/ppmp?search={query}` |
| **Division Filter** | `#ppmpDivisionFilter` | GET `/api/ppmp?division={division}` |
| **Mode Filter** | Form select | GET `/api/ppmp?mode={mode}` |
| **Fiscal Year Filter** | Form select | GET `/api/ppmp?year={year}` |

#### PPMP Modal Form Fields (`#ppmpForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Fiscal Year (select) | `fiscal_year` |
| Division (select) | `division_id` |
| Project Title (input) | `project_title` |
| Type (select) | `procurement_type` |
| Quantity/Size (input) | `quantity_size` |
| Description (textarea) | `description` |
| Recommended Mode (select) | `procurement_mode` |
| Estimated Budget (input) | `estimated_budget` |
| Source of Fund (select) | `fund_source` |
| Fund Code (input) | `fund_code` |
| Timeline Start (select) | `timeline_start` |
| Timeline End (select) | `timeline_end` |
| **Attachment Upload** (`#ppmpAttachment`) | POST `/api/attachments/upload` → `attachment_id` |
| **Save Button** | POST `/api/ppmp` (create) |

---

### 21. APP Module - Buttons & Forms

| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Consolidate from PPMP** | `data-action="consolidate-app"` / `consolidateAPP()` | POST `/api/app/consolidate?year={year}` |
| **View APP Item** | `.btn-icon[title="View"]` | GET `/api/app/{id}` |
| **Create PR from APP** | `.btn-icon[title="Create PR"]` | Opens PR form with APP ref pre-filled |
| **Export to Excel** | `.btn.btn-secondary` (Export) | GET `/api/app/export?format=excel&year={year}` |
| **Print APP** | `.btn.btn-secondary` (Print) | GET `/api/app/print?year={year}` |
| **Version Filter** | `#appVersionFilter` | GET `/api/app?version={indicative|final|updated}` |
| **Year Filter** | Form select | GET `/api/app?year={year}` |

#### APP Summary Cards (Dynamic Data)
| Card | Backend Endpoint |
|------|------------------|
| Total ABC | GET `/api/app/summary?year={year}` → `total_abc` |
| Total Projects | → `total_projects` |
| SVP Projects | → `svp_count` |
| DC/Shopping | → `other_modes_count` |

---

### 22. Purchase Requests Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **New Purchase Request** | `data-action="create-pr"` / `showNewPRModal()` | Opens form → POST `/api/purchase-requests` |
| **View PR** | `.btn-icon[title="View"]` | GET `/api/purchase-requests/{id}` |
| **Edit PR** | `.btn-icon[title="Edit"]` | PUT `/api/purchase-requests/{id}` |
| **Print PR** | `.btn-icon[title="Print"]` | GET `/api/purchase-requests/{id}/print` |
| **Approve PR** | `.btn-icon.success[title="Approve (HoPE)"]` | POST `/api/purchase-requests/{id}/approve` |
| **Return PR** | `.btn-icon.danger[title="Return"]` | POST `/api/purchase-requests/{id}/return` |
| **Attach Annex 1** | `.btn-icon[title="Attach Annex 1"]` | POST `/api/attachments/upload` |
| **Submit for Approval** | `.btn-icon.success[title="Submit for Approval"]` | POST `/api/purchase-requests/{id}/submit` |
| **Create RFQ** | `[title="Create RFQ"]` | Opens RFQ modal with PR pre-filled |

#### PR Modal Form Fields (`#prForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| PR Number (readonly) | `pr_number` (auto-generated by backend) |
| Date (date input) | `pr_date` |
| Requesting Division (select) | `division_id` |
| Requested By (input) | `requested_by` |
| Purpose/Justification (textarea) | `purpose` |
| Linked PPMP Entry (select) | `app_reference_id` |
| Procurement Mode (select) | `procurement_mode` |
| Estimated Amount (input) | `estimated_amount` |
| Scheduled Activity Date (date) | `activity_date` |
| **Route Slip Upload** (`#prRouteSlip`) | POST `/api/attachments/upload` (REQUIRED) |
| **Tech Specs Upload** (`#prTechSpecs`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Market Survey Upload** (`#prMarketSurvey`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Save as Draft** | POST `/api/purchase-requests` with `status: 'draft'` |
| **Submit for Approval** (`submitPRForApproval()`) | POST `/api/purchase-requests/{id}/submit` |

---

### 23. RFQ Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Issue RFQ** | `data-action="create-rfq"` / `showNewRFQModal()` | Opens form → POST `/api/rfq` |
| **View RFQ** | `.btn-icon[title="View"]` | GET `/api/rfq/{id}` |
| **Add Quotation** | `.btn-icon[title="Add Quotation"]` | POST `/api/rfq/{id}/quotations` |
| **Create Abstract** | `.btn-icon[title="Create Abstract"]` | Opens Abstract modal with RFQ pre-filled |

#### RFQ Modal Form Fields (`#rfqForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| RFQ Number (readonly) | `rfq_number` (auto-generated) |
| Date Prepared (date) | `date_prepared` |
| Linked PR (select) | `pr_id` |
| ABC Amount (input) | `abc_amount` |
| Deadline (date) | `submission_deadline` |
| Invited Suppliers (multi-select) | `supplier_ids[]` |
| Special Instructions (textarea) | `special_instructions` |
| **RFQ Document Upload** (`#rfqDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **Tech Specs Upload** (`#rfqTechSpecs`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Save Draft** | POST `/api/rfq` with `status: 'draft'` |
| **Send RFQ** (`sendRFQ()`) | POST `/api/rfq/{id}/send` |

#### PhilGEPS Logic
| Condition | Backend Action |
|-----------|---------------|
| ABC ≥ ₱200,000 | Auto-set `philgeps_required: true`, record posting date |
| `updatePhilGEPSIndicator(abc)` | Client-side check, backend validates |

---

### 24. Abstract of Quotations Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Create Abstract** | `data-action="create-abstract"` / `showNewAbstractModal()` | Opens form → POST `/api/abstract` |
| **View Abstract** | `.btn-icon[title="View"]` | GET `/api/abstract/{id}` |
| **Print Abstract** | `.btn-icon[title="Print"]` | GET `/api/abstract/{id}/print` |
| **Proceed to Post-Qual** | `.btn-icon[title="Proceed to Post-Qual"]` | Opens Post-Qual modal |

#### Abstract Modal Form Fields (`#abstractForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Abstract Number (readonly) | `abstract_number` (auto-generated) |
| Date Prepared (date) | `date_prepared` |
| Linked RFQ (select) | `rfq_id` |
| Quotation Table (dynamic) | `quotations[]` array with supplier_id, amount, compliant, rank |
| Post-Qual Required (select) | `requires_post_qual` |
| BAC Recommendation (textarea) | `bac_recommendation` |
| **Abstract Document Upload** (`#abstractDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **Supplier Quotations Upload** (`#supplierQuotations`) | POST `/api/attachments/upload` (REQUIRED, multiple) |
| **TWG Report Upload** (`#twgReport`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Submit Abstract** | POST `/api/abstract` |

---

### 25. Post-Qualification Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Start Post-Qualification** | `data-action="create-postqual"` / `showNewPostQualModal()` | Opens form → POST `/api/post-qual` |
| **View Documents** | `.btn-icon[title="View Documents"]` | GET `/api/post-qual/{id}/documents` |
| **Create BAC Resolution** | `.btn-icon[title="Create BAC Resolution"]` | Opens BAC Res modal |

#### Post-Qual Modal Form Fields (`#postQualForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Post-Qual Number (readonly) | `postqual_number` (auto-generated) |
| Date (date) | `date` |
| Linked Abstract (select) | `abstract_id` |
| Bidder to Validate (input) | `bidder_name` |
| Document Checklist (checkboxes) | `documents_verified` JSON object |
| TWG Findings (textarea) | `twg_findings` |
| **Post-Qual Report Upload** (`#postQualReport`) | POST `/api/attachments/upload` (REQUIRED) |
| **Bidder Documents Upload** (`#postQualBidderDocs`) | POST `/api/attachments/upload` (REQUIRED, multiple) |
| **Complete Post-Qual** | POST `/api/post-qual` |

---

### 26. BAC Resolution Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Create BAC Resolution** | `data-action="create-bacres"` / `showNewBACResolutionModal()` | Opens form → POST `/api/bac-resolution` |
| **View Resolution** | `.btn-icon[title="View"]` | GET `/api/bac-resolution/{id}` |
| **Print Resolution** | `.btn-icon[title="Print"]` | GET `/api/bac-resolution/{id}/print` |
| **Issue NOA** | `.btn-icon[title="Issue NOA"]` | Opens NOA modal |

#### BAC Resolution Modal Form Fields (`#bacResForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Resolution Number (readonly) | `resolution_number` (auto-generated) |
| Date (date) | `resolution_date` |
| Linked Abstract (select) | `abstract_id` |
| Recommended Awardee (input) | `recommended_awardee` |
| Bid Amount (input) | `bid_amount` |
| ABC (input) | `abc_amount` |
| BAC Recommendation (textarea) | `recommendation_text` |
| **BAC Res Document Upload** (`#bacResDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **Post-Qual Report Upload** (`#bacResPostQual`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Submit Resolution** | POST `/api/bac-resolution` |

---

### 27. Notice of Award (NOA) Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Issue NOA** | `data-action="create-noa"` / `showNewNOAModal()` | Opens form → POST `/api/noa` |
| **View NOA** | `.btn-icon[title="View"]` | GET `/api/noa/{id}` |
| **Print NOA** | `.btn-icon[title="Print"]` | GET `/api/noa/{id}/print` |
| **Create PO** | `.btn-icon[title="Create PO"]` | Opens PO modal |
| **Mark Received by Bidder** | `.btn-icon.success[title="Mark Received by Bidder"]` | PUT `/api/noa/{id}/received` |

#### NOA Modal Form Fields (`#noaForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| NOA Number (readonly) | `noa_number` (auto-generated) |
| Date Issued (date) | `date_issued` |
| Linked BAC Resolution (select) | `bac_resolution_id` |
| Awarded Supplier (select) | `supplier_id` |
| Contract Amount (input) | `contract_amount` |
| Delivery Period (input) | `delivery_period` |
| Approved By (readonly) | `approved_by` (HoPE) |
| **NOA Document Upload** (`#noaDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **BAC Resolution Upload** (`#noaBacResolution`) | POST `/api/attachments/upload` (REQUIRED) |
| **Issue NOA** | POST `/api/noa` |

---

### 28. Purchase Orders Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Create Purchase Order** | `data-action="create-po"` / `showNewPOModal()` | Opens form → POST `/api/purchase-orders` |
| **View PO** | `.btn-icon[title="View"]` | GET `/api/purchase-orders/{id}` |
| **Print PO** | `.btn-icon[title="Print"]` | GET `/api/purchase-orders/{id}/print` |
| **Create IAR** | `.btn-icon[title="Create IAR"]` | Opens IAR modal |
| **Mark Supplier Signed** | `.btn-icon.success[title="Mark Supplier Signed"]` | PUT `/api/purchase-orders/{id}/supplier-signed` |

#### PO Modal Form Fields (`#poForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| PO Number (readonly) | `po_number` (auto-generated) |
| Date Created (date) | `po_date` |
| Linked NOA (select) | `noa_id` |
| Supplier (readonly) | `supplier_id` (from NOA) |
| Total Amount (input) | `total_amount` |
| Expected Delivery Date (date) | `expected_delivery_date` |
| Delivery Address (textarea) | `delivery_address` |
| Payment Terms (select) | `payment_terms` |
| **PO Document Upload** (`#poDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **Supplier Conforme Upload** (`#poSupplierConforme`) | POST `/api/attachments/upload` (OPTIONAL - until signed) |
| **Save Draft** | POST `/api/purchase-orders` with `status: 'draft'` |
| **Approve PO** (`approvePO()`) | POST `/api/purchase-orders/{id}/approve` |

---

### 29. IAR Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **New IAR** | `data-action="create-iar"` / `showNewIARModal()` | Opens form → POST `/api/iar` |
| **View IAR** | `.btn-icon[title="View"]` | GET `/api/iar/{id}` |
| **Print Appendix 62** | `.btn-icon[title="Print Appendix 62"]` | GET `/api/iar/{id}/print` |
| **Submit to COA** | `.btn-icon[title="Submit to COA"]` | Opens COA modal |

#### IAR Modal Form Fields (`#iarForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| IAR Number (readonly) | `iar_number` (auto-generated) |
| Date of Inspection (date) | `inspection_date` |
| Linked PO (select) | `po_id` |
| Supplier (readonly) | `supplier_id` (from PO) |
| Invoice Number (input) | `invoice_number` |
| Delivery Receipt No. (input) | `delivery_receipt_number` |
| Date of Actual Delivery (date) | `delivery_date` |
| Inspection Result (select) | `inspection_result` |
| Findings/Remarks (textarea) | `inspection_remarks` |
| Inspected By (input) | `inspected_by` |
| Date Inspected (date) | `date_inspected` |
| Received By (input) | `received_by` |
| Date Received (date) | `date_received` |
| **IAR Document Upload** (`#iarDocument`) | POST `/api/attachments/upload` (REQUIRED) |
| **Supplier Invoice Upload** (`#iarInvoice`) | POST `/api/attachments/upload` (REQUIRED) |
| **Delivery Receipt Upload** (`#iarDeliveryReceipt`) | POST `/api/attachments/upload` (REQUIRED) |
| **Photos Upload** (`#iarPhotos`) | POST `/api/attachments/upload` (OPTIONAL, multiple) |
| **Complete IAR** | POST `/api/iar` |

---

### 30. PO Packet / Signing Module (NEW)

> **Purpose:** This module manages the compilation of procurement packets and obtains required signatures (Chief, Director) before COA submission.

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Compile Packet** | `data-action="compile-packet"` / `showCompilePacketModal()` | Opens form → POST `/api/po-packets` |
| **View Packet** | `.btn-icon[title="View Packet"]` | GET `/api/po-packets/{id}` |
| **Chief Sign** | `data-action="chief-sign"` / `showChiefSignModal()` | POST `/api/po-packets/{id}/chief-sign` |
| **Director Sign** | `data-action="director-sign"` / `showDirectorSignModal()` | POST `/api/po-packets/{id}/director-sign` |
| **Print Packet** | `.btn-icon[title="Print Packet"]` | GET `/api/po-packets/{id}/print` |
| **Submit to COA** | `.btn-submit-coa` | Blocked until both signatures exist |

#### Status Flow
```
┌─────────────┐    ┌────────────┐    ┌──────────────┐    ┌─────────────┐
│for_signing  │ →  │chief_signed│ →  │director_signed│ →  │ready_for_coa│
└─────────────┘    └────────────┘    └──────────────┘    └─────────────┘
```

#### Compile Packet Modal Fields (`#compilePacketForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| PO Reference (select) | `po_id` |
| Packet Number (readonly) | `packet_number` (auto-generated) |
| Compilation Date (date) | `compiled_at` |
| Document Checklist: | |
| - [ ] Purchase Request | `checklist.purchase_request` |
| - [ ] Request for Quotation | `checklist.rfq` |
| - [ ] Abstract of Quotations | `checklist.aoq` |
| - [ ] BAC Resolution | `checklist.bac_resolution` |
| - [ ] Notice of Award | `checklist.noa` |
| - [ ] Purchase Order (Signed) | `checklist.po_signed` |
| - [ ] Delivery Receipt | `checklist.delivery_receipt` |
| - [ ] Official Receipt | `checklist.official_receipt` |
| - [ ] IAR | `checklist.iar` |
| Notes (textarea) | `notes` |
| **Compile** | POST `/api/po-packets` |

#### Chief Sign Modal Fields (`#chiefSignForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Packet Reference (readonly) | `packet_id` |
| Signatory Name (readonly) | Auto-filled from system |
| Designation (readonly) | "Chief, Finance and Administrative Division" |
| Signed Date (date) | `chief_signed_at` |
| Digital Signature (upload/pad) | `chief_signature_file` |
| **Confirm Signature** | POST `/api/po-packets/{id}/chief-sign` |

#### Director Sign Modal Fields (`#directorSignForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Packet Reference (readonly) | `packet_id` |
| Signatory Name (readonly) | Auto-filled from system |
| Designation (readonly) | "Regional Director" |
| Signed Date (date) | `director_signed_at` |
| Digital Signature (upload/pad) | `director_signature_file` |
| **Prerequisite Check** | `chief_signed_at` must exist (button disabled otherwise) |
| **Confirm Signature** | POST `/api/po-packets/{id}/director-sign` |

#### Signing Gate Logic (Frontend)
```javascript
// Disable COA submit button until both signatures exist
const canSubmitToCOA = packet.chief_signed_at && packet.director_signed_at;
btnSubmitCOA.disabled = !canSubmitToCOA;
if (!canSubmitToCOA) {
    btnSubmitCOA.title = "Both Chief and Director signatures required";
}
```

---

### 31. COA Submission Module - Buttons & Forms (UPDATED)

> ⚠️ **Signing Gate Requirement:** COA submission is BLOCKED until both `chief_signed_at` AND `director_signed_at` timestamps exist for the packet.

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **New COA Submission** | `data-action="create-coa"` / `showNewCOASubmissionModal()` | Opens form → POST `/api/coa-submission` |
| **View Packet** | `.btn-icon[title="View Packet"]` | GET `/api/coa-submission/{id}` |
| **Print Checklist** | `.btn-icon[title="Print Checklist"]` | GET `/api/coa-submission/{id}/print-checklist` |
| **View Checklist** | `.btn-icon[title="View Checklist"]` | GET `/api/coa-submission/{id}/checklist` |

#### Prerequisite Check (Frontend)
```javascript
function openCOASubmissionModal(packetId) {
    const packet = await fetch(`/api/po-packets/${packetId}`);
    
    if (!packet.chief_signed_at || !packet.director_signed_at) {
        showAlert('error', 'COA submission requires both Chief and Director signatures.');
        return;
    }
    
    // Proceed to open modal
    document.getElementById('coaSubmissionModal').style.display = 'flex';
}
```

#### COA Modal Form Fields (`#coaForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Submission Number (readonly) | `submission_number` (auto-generated) |
| Submission Date (date) | `submission_date` |
| Linked Packet (select) | `packet_id` (must be `signed`) |
| COA Receiving Officer (input) | `receiving_officer` |
| Transmittal Number (input) | `transmittal_number` |
| Remarks (textarea) | `remarks` |
| **Final Packet PDF Upload** (`#coaPacketPdf`) | POST `/api/attachments/upload` |
| **Submit to COA** | POST `/api/coa-submission` |

---

### 32. Items Catalog Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Add New Item** | `data-action="create-item"` / `showNewItemModal()` | Opens form → POST `/api/items` |
| **Edit Item** | `.btn-icon[title="Edit"]` | GET `/api/items/{id}` then PUT `/api/items/{id}` |
| **Delete Item** | `.btn-icon.danger[title="Delete"]` | DELETE `/api/items/{id}` |
| **Search Items** | `.search-box input` | GET `/api/items?search={query}` |
| **Category Filter** | Form select | GET `/api/items?category={category}` |

#### Item Modal Form Fields (`#itemForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Item Code (readonly) | `item_code` (auto-generated) |
| Category (select) | `category` |
| Item Name (input) | `item_name` |
| Description (textarea) | `description` |
| Unit of Measure (select) | `unit` |
| Unit Price (input) | `unit_price` |
| **Save Item** | POST `/api/items` |

---

### 33. Suppliers Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Add Supplier** | `data-action="create-supplier"` / `showNewSupplierModal()` | Opens form → POST `/api/suppliers` |
| **View Profile** | `.btn-icon[title="View Profile"]` | GET `/api/suppliers/{id}` |
| **Edit Supplier** | `.btn-icon[title="Edit"]` | PUT `/api/suppliers/{id}` |
| **Search Suppliers** | `.search-box input` | GET `/api/suppliers?search={query}` |

#### Supplier Modal Form Fields (`#supplierForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| Company Name (input) | `company_name` |
| PhilGEPS Registration No. (input) | `philgeps_number` |
| TIN (input) | `tin` |
| Contact Person (input) | `contact_person` |
| Phone (input) | `phone` |
| Email (input) | `email` |
| Address (textarea) | `address` |
| Categories (multi-select) | `categories[]` |
| **PhilGEPS Certificate Upload** (`#supplierPhilgeps`) | POST `/api/attachments/upload` (REQUIRED) |
| **Business Permit Upload** (`#supplierBusinessPermit`) | POST `/api/attachments/upload` (REQUIRED) |
| **SEC/DTI Upload** (`#supplierSecDti`) | POST `/api/attachments/upload` (OPTIONAL) |
| **Save Supplier** | POST `/api/suppliers` |

---

### 34. User Management Module - Buttons & Forms

#### Page Buttons
| Button | Selector/Action | Backend Integration |
|--------|-----------------|---------------------|
| **Add User** | `data-action="create-user"` / `showNewUserModal()` | Opens form → POST `/api/users` |
| **Edit User** | `.btn-icon[title="Edit"]` | GET `/api/users/{id}` then PUT `/api/users/{id}` |
| **Search Users** | `.search-box input` | GET `/api/users?search={query}` |
| **Role Filter** | Form select | GET `/api/users?role={role}` |

#### User Modal Form Fields (`#userForm`)
| Field | Backend Field Mapping |
|-------|----------------------|
| First Name (input) | `first_name` |
| Last Name (input) | `last_name` |
| Email (input) | `email` |
| Username (input) | `username` |
| Division (select) | `division_id` |
| Role (select) | `role` |
| Temporary Password (password) | `password` (hashed by backend) |
| **Create User** | POST `/api/users` |

---

### 35. Reports Module - Buttons

| Report Button | Backend Endpoint |
|---------------|------------------|
| **PPMP Summary Report** | GET `/api/reports/ppmp-summary` |
| **APP Report** | GET `/api/reports/app?version={version}` |
| **PR Status Report** | GET `/api/reports/pr-status` |
| **SVP Lifecycle Report** | GET `/api/reports/svp-lifecycle` |
| **Timeline KPI Report** | GET `/api/reports/timeline-kpi` |
| **PhilGEPS Compliance** | GET `/api/reports/philgeps-compliance` |
| **COA Submission Report** | GET `/api/reports/coa-submission` |
| **Audit Trail** | GET `/api/reports/audit-trail` |

---

### 36. Global Action Buttons (Table Actions)

These icon buttons appear in data tables across all modules:

| Icon Button | Title | Backend Action |
|-------------|-------|----------------|
| 👁️ Eye icon | View | GET `/api/{module}/{id}` |
| ✏️ Edit icon | Edit | GET + PUT `/api/{module}/{id}` |
| 🗑️ Trash icon | Delete | DELETE `/api/{module}/{id}` |
| 🖨️ Print icon | Print | GET `/api/{module}/{id}/print` |
| ✓ Check icon | Approve | POST `/api/{module}/{id}/approve` |
| ↩️ Undo icon | Return/Reject | POST `/api/{module}/{id}/return` |
| 📤 Paper plane icon | Submit | POST `/api/{module}/{id}/submit` |
| ✍️ Signature icon | Mark Signed | PUT `/api/{module}/{id}/signed` |

---

### 37. File Upload Integration

All file upload inputs require backend storage integration:

| Upload Element ID | Purpose | Backend Endpoint |
|-------------------|---------|------------------|
| `#ppmpAttachment` | PPMP supporting document | POST `/api/attachments/upload` |
| `#prRouteSlip` | PR Route Slip / Annex 1 | POST `/api/attachments/upload` |
| `#prTechSpecs` | PR Technical Specifications | POST `/api/attachments/upload` |
| `#prMarketSurvey` | PR Market Survey | POST `/api/attachments/upload` |
| `#rfqDocument` | RFQ Document | POST `/api/attachments/upload` |
| `#rfqTechSpecs` | RFQ Tech Specs | POST `/api/attachments/upload` |
| `#abstractDocument` | Abstract Document | POST `/api/attachments/upload` |
| `#supplierQuotations` | Supplier Quotations (multiple) | POST `/api/attachments/upload` |
| `#twgReport` | TWG Evaluation Report | POST `/api/attachments/upload` |
| `#noaDocument` | NOA Document | POST `/api/attachments/upload` |
| `#noaBacResolution` | BAC Resolution | POST `/api/attachments/upload` |
| `#poDocument` | PO Document | POST `/api/attachments/upload` |
| `#poSupplierConforme` | Supplier Conforme | POST `/api/attachments/upload` |
| `#iarDocument` | IAR Document (Appendix 62) | POST `/api/attachments/upload` |
| `#iarInvoice` | Supplier Invoice | POST `/api/attachments/upload` |
| `#iarDeliveryReceipt` | Delivery Receipt | POST `/api/attachments/upload` |
| `#iarPhotos` | Item Photos (multiple) | POST `/api/attachments/upload` |
| `#bacResDocument` | BAC Resolution Document | POST `/api/attachments/upload` |
| `#bacResPostQual` | Post-Qual Report | POST `/api/attachments/upload` |
| `#postQualReport` | Post-Qual Report | POST `/api/attachments/upload` |
| `#postQualBidderDocs` | Bidder Documents (multiple) | POST `/api/attachments/upload` |
| `#coaPacket` | COA Packet (PDF) | POST `/api/attachments/upload` |
| `#supplierPhilgeps` | PhilGEPS Certificate | POST `/api/attachments/upload` |
| `#supplierBusinessPermit` | Business Permit | POST `/api/attachments/upload` |
| `#supplierSecDti` | SEC/DTI Registration | POST `/api/attachments/upload` |

---

### 38. Dropdown Data Sources (Require Backend Lookup)

| Dropdown Element | Backend Endpoint |
|------------------|------------------|
| Division select dropdowns | GET `/api/divisions` |
| PPMP/APP Entry select | GET `/api/app?status=approved` |
| Approved PR select | GET `/api/purchase-requests?status=approved` |
| RFQ with Quotations select | GET `/api/rfq?has_quotations=true` |
| BAC Resolution select | GET `/api/bac-resolution?status=approved` |
| NOA select | GET `/api/noa?status=issued` |
| PO select (for IAR) | GET `/api/purchase-orders?status=delivered` |
| Supplier multi-select | GET `/api/suppliers?status=active` |
| User Role select | GET `/api/roles` (or static) |
| Category select | GET `/api/categories` |

---

### 39. Utility Functions Requiring Backend

| Function | Current Behavior | Backend Integration |
|----------|------------------|---------------------|
| `formatCurrency(amount)` | Client-side PHP formatting | No change needed |
| `formatDate(dateString)` | Client-side date formatting | No change needed |
| `validateAttachment(inputId, fieldName)` | Client-side validation | Add server-side validation |
| `validateMultipleAttachments(ids, names)` | Client-side validation | Add server-side validation |
| `updateFileLabel(input, labelId, isMultiple)` | Client-side UI only | No change needed |
| `checkSession()` | Reads localStorage | GET `/api/auth/verify` |
| `getUserPermissions()` | Reads from static object | GET `/api/users/me/permissions` |
| `hasPermission(permissionName)` | Client-side check | Backend should also enforce |
| `applyRoleVisibility()` | Client-side UI | GET `/api/users/me/accessible-pages` |
| `consolidateAPP()` | Shows alert only | POST `/api/app/consolidate` |

---

### 41. Backend API Summary

#### Required API Endpoints by Module

| Module | CRUD Endpoints |
|--------|----------------|
| **Auth** | POST login, POST logout, GET verify |
| **Dashboard** | GET stats, GET pipeline, GET active-cases |
| **PPMP** | GET list, GET single, POST create, PUT update, POST submit-to-app |
| **APP** | GET list, GET single, POST consolidate, GET export, GET print |
| **Purchase Requests** | GET, POST, PUT, POST submit, POST approve, POST return |
| **RFQ** | GET, POST, PUT, POST send, POST add-quotation |
| **Abstract** | GET, POST, PUT, GET print |
| **Post-Qual** | GET, POST, PUT |
| **BAC Resolution** | GET, POST, PUT, GET print |
| **NOA** | GET, POST, PUT, PUT received, GET print |
| **Purchase Orders** | GET, POST, PUT, POST approve, PUT supplier-signed, GET print |
| **IAR** | GET, POST, PUT, GET print |
| **COA Submission** | GET, POST, GET checklist, GET print-checklist |
| **Items** | GET, POST, PUT, DELETE |
| **Suppliers** | GET, POST, PUT, DELETE |
| **Users** | GET, POST, PUT, DELETE, GET permissions |
| **Divisions** | GET list |
| **Attachments** | POST upload, GET download, DELETE |
| **Reports** | GET for each report type |

#### New Workflow API Endpoints (UPDATED)

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/purchase-orders/:id/accept` | PUT | Record PO supplier acceptance | `{ acceptance_date, supplier_remarks, attachment_id }` |
| `/api/purchase-orders/:id/deliver` | PUT | Record delivery of goods | `{ delivery_date, receipt_no, received_by, attachment_id }` |
| `/api/purchase-orders/:id/pay-ada` | PUT | Record ADA payment release | `{ payment_date, ada_number, amount_paid, dv_number }` |
| `/api/po-packets` | POST | Compile procurement packet | `{ po_id, checklist, notes }` |
| `/api/po-packets/:id/chief-sign` | POST | Record Chief signature | `{ signed_date, signatory_name, signature_file }` |
| `/api/po-packets/:id/director-sign` | POST | Record Director signature | `{ signed_date, signatory_name, signature_file }` |
| `/api/coa-submissions` | POST | Submit packet to COA | `{ packet_id, submission_date, receiving_officer, transmittal_no }` |

#### Business Status Transitions

```
approved → on_process (PO Accepted)
         → awaiting_delivery (Delivered)
         → for_payment (IAR Complete)
         → paid_ada (ADA Released)
         → for_signing (Packet Compiled)
         → signed (Both Signatures)
         → submitted_to_coa (COA Submit)
```

---

## Best Practices

### HTML
- Use semantic HTML elements
- Include `data-*` attributes for JavaScript hooks
- Keep page sections organized with clear IDs
- Use Font Awesome icons consistently

### CSS
- Use CSS variables for consistent theming
- Follow BEM-like naming conventions
- Keep responsive breakpoints consistent
- Use flexbox/grid for layouts

### JavaScript
- Use `const` and `let`, avoid `var`
- Attach functions to `window` for global access from HTML
- Use event delegation where possible
- Keep permission logic centralized

### Backend Integration
- Replace localStorage with JWT tokens stored in httpOnly cookies
- Implement proper error handling for all API calls
- Add loading states for async operations
- Cache dropdown data where appropriate
- Implement proper file type and size validation server-side
- Add audit logging for all create/update/delete operations

---

## Support & Contacts

For technical issues or feature requests, contact:
- **System Administrator**: [admin contact]
- **FAD Technical Support**: [FAD contact]

---

**Document Version:** 2.0  
**System Version:** DMW Caraga Procurement System - Updated Workflow Implementation  
**Compliance:** ISO 9001:2015 Clause 9.1.1 | Per Memo 14 Nov 2025  
**Last Updated:** February 2025  
**Key Changes:** Added signing gate, new workflow statuses, PO Packet module, 7 new modal forms
