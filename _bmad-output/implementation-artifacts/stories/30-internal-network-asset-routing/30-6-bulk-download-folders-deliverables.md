# Story 30.6: Bulk Download for Project Folders/Deliverables

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-03-02
**Priority**: HIGH — The hero feature unlocked by internal network routing
**Depends On**: Stories 30.2 and 30.3

---

## 📋 User Story

**As an** employee or studio manager,
**I want** to download all files in a project folder or deliverable set with a single click,
**So that** I can quickly get all assets onto my local machine for editing or review.

---

## ✅ Acceptance Criteria

### Download All

- [ ] **Given** a folder with multiple files
- [ ] **When** the user clicks "Download All"
- [ ] **Then** all files are downloaded to the user's machine
- [ ] **And** a progress indicator shows download progress

### Download Selected

- [ ] **Given** a folder with multiple files
- [ ] **When** the user selects specific files and clicks "Download Selected"
- [ ] **Then** only selected files are downloaded

### Network-Aware

- [ ] **Given** the user is on the internal network
- [ ] **Then** downloads use internal URLs (fast — LAN speed)
- [ ] **Given** the user is NOT on the internal network
- [ ] **Then** downloads use public URLs (slower but functional)
- [ ] **And** a warning is shown for large bulk downloads: "This may take a while on an external network"

---

## 📁 Files to Create/Update

| File                                                                   | Change                             |
| ---------------------------------------------------------------------- | ---------------------------------- |
| New: `src/components/shared/bulk-download-button.tsx`                  | Reusable bulk download component   |
| `src/components/modules/projects/detail/folder/folder-detail-view.tsx` | Add "Download All" button          |
| `src/components/modules/admin/projects/project-detail/deliverables/`   | Add "Download All" to deliverables |

---

## 🔧 Implementation Details

### Download Strategy

**Option A: Sequential Anchor Downloads (Simple PoC)**

```typescript
async function bulkDownload(files: { storageKey: string; filename: string }[]) {
  const useInternal = isOnInternalNetwork();

  for (const file of files) {
    const url = await getSignedFileUrlAction({
      storageKey: file.storageKey,
      useInternal,
    });

    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();

      // Small delay between downloads to avoid browser throttling
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}
```

**Option B: ZIP Stream (Future Enhancement)**

For larger batches, a server-side ZIP generation endpoint would be ideal. This can be added as a future enhancement. The PoC uses sequential downloads.

### Bulk Download Button Component

```tsx
interface BulkDownloadButtonProps {
  files: { storageKey: string; filename: string }[];
  selectedIds?: string[]; // For "Download Selected" mode
}
```

- "Download All" — downloads all files in the list
- "Download Selected" — downloads only checked files (requires checkbox selection UI)
- Shows progress: "Downloading 3 of 15..."
- Disables during active download

### Warning for External Network

If `!isOnInternalNetwork()` and `files.length > 10`:

```
⚠️ You're on an external network. Downloading 45 files (2.3 GB) may take 15-30 minutes.
Continue anyway? [Download] [Cancel]
```

---

## 🚀 Definition of Done

- [ ] "Download All" button on folder detail view
- [ ] "Download Selected" with file checkboxes
- [ ] Downloads use internal URLs when on LAN
- [ ] Progress indicator ("Downloading 3 of 15...")
- [ ] Warning for large downloads on external network
- [ ] Works on public network (slower but functional)
- [ ] Button disabled during active download
- [ ] `pnpm build` passes
- [ ] Story marked as `done`

---

**Previous Story**: 30-5 - Internal network indicator badge
**Next Story**: 30-7 - Full-res deliverable preview carousel
