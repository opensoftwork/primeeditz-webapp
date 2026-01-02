# 6. Gated Upload System

[← Back to Index](./README.md) | [← Previous: User Journeys](./05-user-journeys.md) | [Next: Permissions →](./07-permissions.md)

---

## 6.1 The Upload Gate Concept

The **Gated Upload System** prevents clients from uploading bulk assets before business terms are agreed upon.

### Why Gate Uploads?

| Problem                          | Impact                               | Gate Solution              |
| -------------------------------- | ------------------------------------ | -------------------------- |
| Clients upload before committing | Wasted storage, no payment guarantee | Require quotation approval |
| Unclear project scope            | Scope creep, disputes                | Define scope in quotation  |
| Storage abuse                    | Unlimited uploads, costs             | Storage tier in quotation  |

---

## 6.2 Two Types of Uploads

| Upload Type         | When Allowed                                 | Gate                           |
| ------------------- | -------------------------------------------- | ------------------------------ |
| **Reference Files** | Always (during project request)              | Count limit only (10-20 files) |
| **Bulk Assets**     | After quotation approved OR internal project | Quotation/Storage gate         |

### Reference Files

- Small files for context (mood boards, examples)
- Allowed during project request
- Limited count (10-20 files)
- Don't count against storage tier

### Bulk Assets

- The actual raw files to be edited
- Only allowed AFTER gate is passed
- Count against storage tier
- Uploaded to project folders

---

## 6.3 Gate Logic

### For Client-Initiated Projects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLIENT UPLOAD GATE                                        │
└─────────────────────────────────────────────────────────────────────────────┘

                    CLIENT WANTS TO UPLOAD ASSETS
                                │
                                ▼
                    ┌─────────────────────┐
                    │ Is quotation        │
                    │ approved?           │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                YES                          NO
                 │                           │
                 ▼                           ▼
         ┌───────────────┐          ┌───────────────────────┐
         │ Check storage │          │ ❌ BLOCKED            │
         │ limit         │          │ "Approve quotation    │
         └───────┬───────┘          │  first"               │
                 │                  └───────────────────────┘
         ┌───────┴───────┐
         │               │
       Within          Over
       Limit           Limit
         │               │
         ▼               ▼
    ✅ ALLOWED     ❌ BLOCKED
    Generate URL   "Storage limit
                    reached"
```

### For Admin-Initiated Projects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN UPLOAD GATE                                         │
└─────────────────────────────────────────────────────────────────────────────┘

                    ADMIN WANTS TO UPLOAD ASSETS
                                │
                                ▼
                    ┌─────────────────────┐
                    │ Is storage tier     │
                    │ selected?           │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                YES                          NO
                 │                           │
                 ▼                           ▼
         ┌───────────────┐          ┌───────────────────────┐
         │ Check storage │          │ ❌ BLOCKED            │
         │ limit         │          │ "Select storage tier  │
         └───────┬───────┘          │  first"               │
                 │                  └───────────────────────┘
         ┌───────┴───────┐
         │               │
       Within          Over
       Limit           Limit
         │               │
         ▼               ▼
    ✅ ALLOWED     ❌ BLOCKED
    Generate URL   "Storage limit
                    reached"
```

---

## 6.4 UI States

### State 1: Before Quotation (Client)

```
┌─────────────────────────────────────────┐
│ 📦 Priya's Wedding Photos               │
│ Status: Pending Quotation               │
├─────────────────────────────────────────┤
│                                         │
│ 📁 Assets                               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔒 Upload Locked                    │ │
│ │                                     │ │
│ │ Bulk asset upload will be enabled   │ │
│ │ once you approve the quotation.     │ │
│ │                                     │ │
│ │ [View Quotation]                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### State 2: After Quotation Approved (Client)

```
┌─────────────────────────────────────────┐
│ 📦 Priya's Wedding Photos               │
│ Status: Ready for Upload                │
├─────────────────────────────────────────┤
│                                         │
│ 📁 Assets                    0 / 100 GB │
│                                         │
│  [+ Upload Files]  [+ Create Folder]    │
│                                         │
│  📂 Ceremony (0 files)                  │
│  📂 Reception (0 files)                 │
│  📂 Candid (0 files)                    │
│                                         │
│  [Mark Upload Complete]                 │
│                                         │
└─────────────────────────────────────────┘
```

### State 3: Storage Limit Reached

```
┌─────────────────────────────────────────┐
│ 📦 Priya's Wedding Photos               │
│ Status: In Progress                     │
├─────────────────────────────────────────┤
│                                         │
│ 📁 Assets               98.5 / 100 GB   │
│ ████████████████████████████████░░ 98%  │
│                                         │
│ ⚠️ Storage almost full!                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ You have 1.5 GB remaining.         │ │
│ │ Contact admin to upgrade storage.  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  📂 Ceremony (450 files)  ✅            │
│  📂 Reception (320 files) ✅            │
│  📂 Candid (180 files)    ✅            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 6.5 Complete Upload Decision Tree

```
                           UPLOAD REQUEST
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            Reference File?               Asset File?
                    │                         │
                    ▼                         ▼
         Count < maxReferenceFiles?    ┌──────────────────┐
                    │                  │ Check project    │
              ┌─────┴─────┐           │ source           │
              │           │           └────────┬─────────┘
           Yes           No                    │
              │           │           ┌────────┴─────────┐
              ▼           ▼           │                  │
          ✅ Allow    ❌ Reject   Client-init      Admin-init
          Generate   "Max files   │                  │
          URL        reached"     ▼                  ▼
                              Quotation         Storage tier
                              approved?         selected?
                                  │                  │
                            ┌─────┴─────┐      ┌─────┴─────┐
                            │           │      │           │
                           Yes          No    Yes          No
                            │           │      │           │
                            ▼           ▼      ▼           ▼
                       Within      ❌ Reject  Within    ❌ Reject
                       storage?    "Approve  storage?   "Select
                            │       quote"       │       tier"
                      ┌─────┴─────┐        ┌─────┴─────┐
                      │           │        │           │
                     Yes          No      Yes          No
                      │           │        │           │
                      ▼           ▼        ▼           ▼
                  ✅ Allow    ❌ Reject  ✅ Allow   ❌ Reject
                  URL         "Limit"    URL        "Limit"
```

---

## 6.6 Backend Enforcement

### Upload URL Generation

```typescript
// Simplified logic
async function generateUploadUrl(projectId, fileInfo) {
  const project = await getProject(projectId);

  // Check gate based on source
  if (project.source === "client_request") {
    if (!project.quotationApproved) {
      throw new Error("Quotation must be approved first");
    }
  } else {
    if (!project.storageTierId) {
      throw new Error("Storage tier must be selected");
    }
  }

  // Check storage limit
  const newTotal = project.storageUsedBytes + fileInfo.size;
  if (newTotal > project.storageAllocatedBytes) {
    throw new Error("Storage limit exceeded");
  }

  // Generate signed URL
  return generateSignedUrl(project, fileInfo);
}
```

### Key Points

1. **Gate check on every upload** — Not just UI, server enforces
2. **Storage tracking** — Updated after each successful upload
3. **Atomic operations** — Check and update in transaction

---

## 6.7 Storage Tiers

| Tier       | Capacity | Price (Example) |
| ---------- | -------- | --------------- |
| Basic      | 50 GB    | ₹2,500          |
| Standard   | 100 GB   | ₹5,000          |
| Premium    | 250 GB   | ₹10,000         |
| Enterprise | 500 GB   | ₹18,000         |

**Note:** Tiers are admin-configurable in v3.0.

---

## 6.8 Summary

| Gate                | Applies To      | Condition                                    |
| ------------------- | --------------- | -------------------------------------------- |
| **Quotation Gate**  | Client projects | Quotation must be approved                   |
| **Storage Gate**    | All projects    | Storage tier must be selected + within limit |
| **Reference Limit** | Reference files | Max file count (e.g., 10-20)                 |

---

[Next: Permission Matrix →](./07-permissions.md)
