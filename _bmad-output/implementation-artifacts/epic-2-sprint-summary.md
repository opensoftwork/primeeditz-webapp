# Epic 2 Sprint Planning Summary

**Created**: 2026-01-06  
**Sprint**: Epic 2 - Client Portal — Project Request  
**Status**: Ready for Implementation

---

## 🎯 Sprint Overview

**Epic**: Epic 2 - Client Portal — Project Request  
**Total Stories**: 8 (2.0 → 2.7)  
**Status**: All stories created and ready-for-dev  
**Estimated Duration**: 6-8 days

---

## ✅ Stories Created

| Story   | Title                                     | Status        | Complexity | File       |
| ------- | ----------------------------------------- | ------------- | ---------- | ---------- |
| **2.0** | Wizard Infrastructure & Draft Project     | in-progress   | Medium     | ✅ Created |
| **2.1** | Client Dashboard with Project Listing     | ready-for-dev | Medium     | ✅ Created |
| **2.2** | Wizard Step 1 — Project Type & Basic Info | ready-for-dev | Low        | ✅ Created |
| **2.3** | Wizard Step 2 — Project-Specific Details  | ready-for-dev | High       | ✅ Created |
| **2.4** | Wizard Step 3 — Reference Files Upload    | ready-for-dev | High       | ✅ Created |
| **2.5** | Wizard Step 4 — Description & Notes       | ready-for-dev | Low        | ✅ Created |
| **2.6** | Wizard Step 5 — Review & Submit           | ready-for-dev | Medium     | ✅ Created |
| **2.7** | Client Project Detail View                | ready-for-dev | Medium     | ✅ Created |

---

## 📋 Story Execution Order

### Recommended Sequence:

1. **Story 2.0** (CURRENT) - Wizard Infrastructure

   - Sets up wizard container, step indicator, form state
   - Ports useFileUploader and ImageSlider
   - Creates draft project mutations
   - **Start here** ✅

2. **Story 2.1** - Client Dashboard

   - Client can see their submitted projects
   - "Request New Project" button
   - Can be done in parallel with wizard steps

3. **Story 2.2** - Wizard Step 1

   - Project type selection
   - Basic info form
   - Depends on 2.0

4. **Story 2.3** - Wizard Step 2

   - Dynamic form fields
   - Most complex wizard step
   - Depends on 2.2

5. **Story 2.4** - Wizard Step 3

   - Reference file upload
   - MinIO integration
   - Depends on 2.3

6. **Story 2.5** - Wizard Step 4

   - Description and notes
   - Simplest wizard step
   - Depends on 2.4

7. **Story 2.6** - Wizard Step 5

   - Review and submit
   - Final wizard step
   - Depends on 2.5

8. **Story 2.7** - Project Detail View
   - View submitted project
   - Can be done after 2.6 or in parallel with wizard

---

## 🔑 Key Features Delivered

After completing Epic 2, clients will be able to:

✅ View a dashboard with all their submitted projects  
✅ Request a new project via 5-step wizard  
✅ Select project type and enter basic information  
✅ Provide project-specific details (dynamic fields)  
✅ Upload reference files (mood boards, examples)  
✅ Add description and additional notes  
✅ Review all information before submission  
✅ Submit project request to studio  
✅ View full details of submitted projects  
✅ See real-time status updates

---

## 🛠️ Technical Highlights

### New Components Created:

- Wizard container with step indicator
- 5 wizard step components (Steps 1-5)
- Client dashboard with project listing
- Project card component
- Project detail view
- Dynamic form field renderer
- File upload with progress tracking

### New Convex Functions:

- `createDraft` - Create draft project
- `updateDraft` - Update draft project
- `submitProject` - Submit project for review
- `getMyProjects` - List client's projects
- `getProject` - Get single project details
- `generateReferenceUploadUrl` - Signed URL for file upload

### New Routes:

- `/client/dashboard` - Project listing
- `/client/projects/new` - Wizard (with ?step=1-5)
- `/client/projects/{projectId}` - Project detail

---

## 📊 Complexity Breakdown

| Complexity | Stories            | Notes                      |
| ---------- | ------------------ | -------------------------- |
| **Low**    | 2.2, 2.5           | Simple forms               |
| **Medium** | 2.0, 2.1, 2.6, 2.7 | Standard CRUD              |
| **High**   | 2.3, 2.4           | Dynamic forms, file upload |

**Total Complexity Score**: 38/70 (Medium sprint)

---

## 🚦 Parallel Sprint Coordination

### Sprint A (This Chat): Epic 2

- **Focus**: Client Portal
- **Routes**: `/client/*`
- **Components**: `components/modules/projects/wizard/*`
- **Functions**: `functions/projects/*`

### Sprint B (Parallel Chat): Epic 3

- **Focus**: Admin Portal
- **Routes**: `/admin/*`
- **Components**: `components/modules/admin/*`
- **Functions**: `functions/admin/*`, `functions/employees/*`

**Conflict Risk**: LOW ✅  
**Coordination**: See `parallel-sprint-strategy.md`

---

## 🎯 Next Steps

### To Start Implementation:

1. **Execute Story 2.0** using `/dev-story` workflow
2. **Test Story 2.0** thoroughly
3. **Move to Story 2.1** (can run in parallel with 2.2)
4. **Continue sequentially** through wizard steps (2.2 → 2.6)
5. **Complete with Story 2.7** (project detail view)

### To Start Parallel Sprint:

Open a new chat and use the command in `sprint-b-init-guide.md`

---

## 📝 Story Files Location

All story files are in:

```
_bmad-output/implementation-artifacts/stories/
├── 2-0-wizard-infrastructure-draft-project.md ✅
├── 2-1-client-dashboard-with-project-listing.md ✅
├── 2-2-wizard-step-1-project-type-basic-info.md ✅
├── 2-3-wizard-step-2-project-specific-details-dynamic.md ✅
├── 2-4-wizard-step-3-reference-files-upload.md ✅
├── 2-5-wizard-step-4-description-additional-notes.md ✅
├── 2-6-wizard-step-5-review-submit.md ✅
└── 2-7-client-project-detail-view.md ✅
```

---

## ✅ Definition of Done (Epic 2)

Epic 2 is complete when:

- [ ] All 8 stories marked `done` in sprint-status.yaml
- [ ] Client can complete full project request flow (wizard)
- [ ] Client can view dashboard with submitted projects
- [ ] Client can view project detail page
- [ ] All tests passing
- [ ] Code review complete
- [ ] No console errors
- [ ] Responsive on mobile and desktop
- [ ] Real-time updates working

---

## 🎉 Ready to Ship!

All story files are created with:

- ✅ Detailed acceptance criteria
- ✅ Comprehensive task breakdowns
- ✅ Implementation notes and patterns
- ✅ Testing checklists
- ✅ Dependencies clearly marked
- ✅ Definition of done

**You're ready to start implementing!** 🚀
