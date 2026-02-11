# Story 16-6: PDF/Image Annotation Layer

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: backlog  
**Complexity**: Large (8 points)  
**Created**: 2026-02-11  
**Priority**: COULD — Future enhancement, low UX priority

---

## 📋 User Story

**As a** User (Admin or Studio),  
**I want** to draw rectangles and pin comments directly on deliverable previews,  
**So that** I can mark exact areas that need correction without leaving the app.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status     | Notes                                 |
| ------------------------------ | ---------- | ------------------------------------- |
| **16-1 - Schema & Backend**    | 📋 Backlog | `annotations` JSON field on revisions |
| **16-2 - Admin Revision Page** | 📋 Backlog | Canvas overlay added to revision page |

### Enables

| Story / Epic            | Notes                              |
| ----------------------- | ---------------------------------- |
| **Precision Feedback**  | Exact area marking on deliverables |
| **Visual Instructions** | No ambiguity in revision requests  |

### Proposed UX

```
┌────────────────────────────────────────────────────────────────────┐
│  ANNOTATE DELIVERABLE                                              │
│                                                                    │
│  ┌──────────────── TOOLBAR ────────────────────────────────┐      │
│  │ [□ Rectangle] [📌 Pin Comment] [✏️ Freeform] | [Undo]  │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                                                      │          │
│  │          DELIVERABLE IMAGE / PDF PAGE                │          │
│  │                                                      │          │
│  │      ┌──────────────────────┐                       │          │
│  │      │                      │  ← Red rectangle       │          │
│  │      │   Drawn selection    │    annotation          │          │
│  │      │                      │                       │          │
│  │      └──────────────────────┘                       │          │
│  │                                 📌                    │          │
│  │                              "Fix this"              │          │
│  │                              ← Pin comment           │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                    │
│  ANNOTATIONS (2):                                                  │
│  1. Rectangle at (120, 340) — "Color is too saturated"            │
│  2. Pin at (450, 200) — "Text is misaligned"                      │
│                                                                    │
│  [Save Annotations]                                                │
└────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Annotation Canvas Overlay

- [ ] **Given** I am on the admin revision page or studio revision dialog
- [ ] **When** I click "Annotate"
- [ ] **Then** a canvas overlay appears on top of the deliverable preview
- [ ] **And** annotation tools are available in a floating toolbar

### AC2: Rectangle Tool

- [ ] **Given** I select the Rectangle tool
- [ ] **When** I click and drag on the preview
- [ ] **Then** a colored rectangle is drawn on the canvas
- [ ] **And** a comment input appears for me to describe the issue
- [ ] **And** the rectangle has handles for resizing/repositioning

### AC3: Pin Comment Tool

- [ ] **Given** I select the Pin Comment tool
- [ ] **When** I click on a specific point on the preview
- [ ] **Then** a pin icon is placed at that location
- [ ] **And** a comment input appears for me to describe the issue

### AC4: Freeform Drawing Tool

- [ ] **Given** I select the Freeform tool
- [ ] **When** I draw on the preview
- [ ] **Then** my strokes are rendered on the canvas
- [ ] **And** a comment input appears for the drawn area

### AC5: Save Annotations as JSON

- [ ] **Given** I have created annotations on the preview
- [ ] **When** I save the revision request
- [ ] **Then** annotations are saved as a JSON blob in `revisionRequests.annotations`
- [ ] **And** the JSON structure follows:

```json
{
  "annotations": [
    {
      "id": "uuid",
      "type": "rectangle",
      "coordinates": { "x": 120, "y": 340, "width": 200, "height": 100 },
      "comment": "Color is too saturated in this area",
      "color": "#ef4444",
      "pageNumber": 1,
      "createdAt": 1707612345000
    },
    {
      "id": "uuid",
      "type": "pin",
      "coordinates": { "x": 450, "y": 200 },
      "comment": "Text is misaligned here",
      "color": "#f59e0b",
      "pageNumber": 1,
      "createdAt": 1707612346000
    },
    {
      "id": "uuid",
      "type": "freeform",
      "points": [{ "x": 100, "y": 100 }, { "x": 150, "y": 120 }, ...],
      "comment": "This entire section needs rework",
      "color": "#3b82f6",
      "pageNumber": 1,
      "createdAt": 1707612347000
    }
  ],
  "canvasWidth": 800,
  "canvasHeight": 1200,
  "deliverableOriginalWidth": 2400,
  "deliverableOriginalHeight": 3600
}
```

### AC6: View Annotations (Read-Only)

- [ ] **Given** a revision request with annotations
- [ ] **When** the employee opens the revision workspace
- [ ] **Then** the annotations are overlaid on the deliverable preview (read-only)
- [ ] **And** clicking on an annotation shows its comment
- [ ] **And** annotations are scaled correctly to the current viewport

### AC7: Undo/Redo

- [ ] **Given** I am annotating
- [ ] **When** I click "Undo"
- [ ] **Then** the last annotation is removed
- [ ] **And** "Redo" restores it

---

## 📘 Implementation Notes

### Library Options (Research Needed)

| Library                   | Pros                                     | Cons                          |
| ------------------------- | ---------------------------------------- | ----------------------------- |
| **Fabric.js**             | Mature, rich API, SVG support            | Large bundle                  |
| **Konva.js**              | React-friendly (react-konva), performant | Canvas-only, no SVG export    |
| **Rough.js + custom**     | Lightweight, sketch-style                | Requires more custom code     |
| **PDF.js annotations**    | Native PDF annotation support            | Complex, PDF-specific only    |
| **excalidraw (embedded)** | Feature-rich drawing, familiar           | Heavyweight for this use case |

**Recommended**: `react-konva` for canvas rendering + custom annotation layer.

### Key Technical Considerations

1. **Coordinate System**: Annotations must use relative coordinates (0-1 range) to be viewport-independent
2. **PDF Multi-Page**: For multi-page PDFs, annotations must specify `pageNumber`
3. **Image Scaling**: Canvas overlay must match the preview dimensions exactly
4. **Performance**: Debounce saves, lazy-render annotations for long documents
5. **Accessibility**: Annotations list must be keyboard-navigable

### Integration Points

- `revisionRequests.annotations` field (already defined as `v.optional(v.string())`)
- Admin revision page: Canvas overlay mode
- Studio revision dialog: Canvas overlay mode
- Employee workspace: Read-only annotation overlay
- Revision timeline: Annotation count display

---

## 🧪 Testing Checklist

### Drawing Tools

- [ ] Rectangle draws correctly on click-drag
- [ ] Pin places at click position
- [ ] Freeform captures stroke accurately
- [ ] Color picker works for annotations
- [ ] Undo/redo function correctly

### Save/Load

- [ ] Annotations save as valid JSON
- [ ] JSON loads correctly and renders annotations
- [ ] Coordinates scale correctly across different screen sizes

### Read-Only View

- [ ] Employee sees annotations overlaid on preview
- [ ] Clicking annotation shows its comment
- [ ] Cannot modify annotations in read-only mode

### Edge Cases

- [ ] Very large PDF (10+ pages) — performance acceptable
- [ ] Tiny annotations — still clickable/visible
- [ ] Window resize — annotations reposition correctly
- [ ] No annotations — clean preview, no overlay artifacts

---

## 🚀 Definition of Done

- [ ] Canvas overlay component with annotation tools
- [ ] Rectangle, Pin, and Freeform drawing tools
- [ ] Annotations save as JSON blob in `revisionRequests`
- [ ] Read-only annotation overlay on employee workspace
- [ ] Undo/redo support
- [ ] Coordinate scaling for different viewports
- [ ] Library integration (react-konva or chosen alternative)
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                                 |
| ---------- | ------- | ----------------------------------------------------- |
| 2026-02-11 | backlog | Story created — lower priority, future implementation |

---

**Previous Story**: 16-5 - Studio Per-Deliverable Review with Image Upload  
**Next Story**: N/A (Last story in Epic 16)
