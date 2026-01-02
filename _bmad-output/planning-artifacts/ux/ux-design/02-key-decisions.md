# 02 — Key UX Decisions

**Party Mode Consensus — PrimeEditz**

---

## Decision 1: Upload Gate Reframe

**Decision:** Transform quotation from GATE to UPGRADE

- Clients get 5GB free tier on project creation (configurable by admin)
- Bulk upload unlocks immediately for new projects
- Quotation approval = storage expansion, not access permission
- Admin can override/adjust limits per-client or globally

**Rationale:** This transforms the quotation from a frustrating gate into a value upgrade. Clients see immediate value, and the quotation becomes about getting MORE, not getting ACCESS.

---

## Decision 2: Unified Create + Upload Flow

**Decision:** Merge project creation and file upload into single experience

```
Create Project → Drop Files → Submit → Uploads Begin
```

No return trips to dashboard. No hunting for upload buttons.

**Rationale:** The current flow has 7+ discrete touchpoints between "I want to submit a project" and "my files are uploading." This is unacceptable for time-constrained clients.

---

## Decision 3: Inline Onboarding with First Project

**Decision:** 5-step onboarding that ends with project in progress

1. Welcome & Auth
2. Quick Profile
3. First Project Type Selection
4. File Upload (optional)
5. Success — uploads already in progress

**Rationale:** By the time clients see the dashboard, their first project is already in progress. They're invested. They'll come back. Expected conversion: 75%+ vs typical 40%.

---

## Decision 4: Dual Theme Support from Day 1

**Decision:** Both light and dark mode supported

- System preference detection (auto-match OS)
- Manual toggle (persistent preference)
- CSS variables architecture — no retrofitting
- Visual regression testing for both themes in CI

### Design Tokens

| Token              | Dark Mode              | Light Mode       |
| ------------------ | ---------------------- | ---------------- |
| `--bg-primary`     | #0D0D0D                | #FAFAFA          |
| `--bg-secondary`   | #1A1A1A                | #FFFFFF          |
| `--text-primary`   | #FAFAFA                | #171717          |
| `--text-secondary` | #A3A3A3                | #737373          |
| `--accent`         | #6366F1                | #4F46E5          |
| `--border`         | rgba(255,255,255,0.08) | rgba(0,0,0,0.06) |

**Rationale:** Build ONCE, theme-aware from day one. No retrofitting later. Every component uses tokens, zero exceptions.

---

## Decision 5: Configurable Business Rules

**Decision:** Admin panel controls for upload limits and quotation requirements

| Setting                | Description                      | Default  |
| ---------------------- | -------------------------------- | -------- |
| Guest Upload Limit     | Max upload before quotation      | 5GB      |
| Require Quotation      | Toggle upload gate on/off        | ON       |
| Auto-Approve Threshold | Auto-approve quotes below amount | Disabled |

**Rationale:** Let the business EVOLVE. Day 1, you're cautious. Month 6, you trust your clients more and loosen restrictions. The UX should never feel "locked."

---

## Decision 6: Dashboard as Status Board

**Decision:** Glanceable, action-focused dashboard design

- Active projects with progress bars
- "Needs Your Attention" section for pending actions
- Quick actions inline (Approve Quote, Download, etc.)
- Search/command palette for power users

**Rationale:** Everything is GLANCEABLE. Status, action, done. No hunting for information.

---

_Decisions were made through collaborative Party Mode discussion with the full BMAD team._
