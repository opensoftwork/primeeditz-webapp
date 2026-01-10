# Epic 4: Quotation System

**User Outcome:** Admins can generate quotations for sessions, and clients can view and approve/reject them.

**FRs covered:** FR6 (Quotation System)

**Scope:**

- Quotation creation attached to sessions
- Template-based pricing with line items
- GST calculation (18%)
- Quotation status workflow (draft → sent → approved/rejected)
- Client quotation view
- Approval/rejection with optional comments

**Standalone:** ✅ Complete quotation workflow from creation to approval.

---

## 📘 Epic 2 Learnings Applied

**IMPORTANT**: Based on Epic 2 retrospective (2026-01-09), apply these corrections:

### Framework Corrections

| Original Specification | Actual Implementation     |
| ---------------------- | ------------------------- |
| TanStack Start Router  | **Next.js 15 App Router** |
| TanStack Form          | **React Hook Form + Zod** |

### Reusable Patterns

1. **Route Structure**: Use parallel routes (`@client/`, `@admin/`)
2. **Form Handling**: React Hook Form with Zod validation
3. **Styling**: Premium studio aesthetic with motion/react animations
4. **Data Fetching**: Convex useQuery with authenticated wrappers

---

### Story 4.1: Create Quotation from Template

**As an** Admin,
**I want** to create a quotation for a project by selecting a template,
**So that** I can quickly generate professional quotations.

**Acceptance Criteria:**

- **Given** I am on a project detail page with status `pending_review`
- **When** I click "Create Quotation"
- **Then** I must select a Quotation Template from configured templates.
- **And** the template must auto-populate: Line Items, Subtotal, GST (18%), and Total.
- **And** I must select a Storage Tier from configured tiers.
- **And** saving must create a quotation record with status `draft`.
- **And** the "Send to Client" button must be disabled if quotation has zero line items.

### Story 4.2: Edit Quotation Line Items

**As an** Admin,
**I want** to customize the line items on a quotation,
**So that** I can adjust for project-specific requirements.

**Acceptance Criteria:**

- **Given** I am editing a draft quotation
- **When** I modify line items
- **Then** I can add, remove, or edit line items (description, quantity, unit price).
- **And** subtotal, GST, and total must auto-calculate on change.
- **And** changes must be saved to the quotation record.

### Story 4.3: Send Quotation to Client

**As an** Admin,
**I want** to send a completed quotation to the client,
**So that** they can review and approve it.

**Acceptance Criteria:**

- **Given** I am on a draft quotation
- **When** I click "Send to Client"
- **Then** the quotation status must change to `sent`.
- **And** the project status must change to `pending_quotation`.
- **And** the client must see the quotation on their project detail page.

### Story 4.4: Client View Quotation

**As a** Client,
**I want** to view a quotation sent by the studio,
**So that** I can review the pricing and terms.

**Acceptance Criteria:**

- **Given** I am on my project detail page with a quotation
- **When** I click "View Quotation"
- **Then** I must see: Line Items, Subtotal, GST, Total, Storage Tier, and Terms.
- **And** I must see "Approve" and "Request Changes" buttons.

### Story 4.5: Client Approve Quotation

**As a** Client,
**I want** to approve a quotation,
**So that** my project can proceed and I can upload assets.

**Acceptance Criteria:**

- **Given** I am viewing a quotation with status `sent`
- **When** I click "Approve Quotation"
- **Then** the quotation status must change to `approved`.
- **And** the project status must change to `active`.
- **And** the project's `storageAllocated` field must be set based on the selected tier (e.g., 100GB).
- **And** the upload section on my project must become unlocked.

**Note:** Storage is not pre-allocated in MinIO. The limit is checked at upload time (Story 5.5).

### Story 4.6: Client Request Quotation Changes

**As a** Client,
**I want** to request changes to a quotation,
**So that** I can negotiate terms before approving.

**Acceptance Criteria:**

- **Given** I am viewing a quotation with status `sent`
- **When** I click "Request Changes" and enter a message
- **Then** the quotation status must change to `revision_requested`.
- **And** the admin must be notified of the change request.
- **And** when admin revises and re-sends, the quotation `version` field must increment.

**MVP Note:** Quotation updates the existing record with incremented version. Phase 2 will create new records per version for full audit trail.
