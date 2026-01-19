┌─────────────────────────────────────────────────────────────────────┐
│ PROJECT LIFECYCLE │
├─────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────┐ │
│ │ SETUP │ draft → awaiting_quotation → quotation_sent │
│ └────┬────┘ ↓ │
│ │ quotation_approved → storage_allocated │
│ ▼ │
│ ┌─────────────┐ │
│ │ ONBOARDING │ awaiting_uploads → uploads_complete │
│ └─────┬───────┘ ↓ │
│ │ awaiting_assignment → assigned │
│ ▼ │
│ ┌─────────────┐ │
│ │ PRODUCTION │ work_in_progress → deliverables_ready │
│ └─────┬───────┘ │
│ ▼ │
│ ┌─────────────┐ ┌───────────────┐ │
│ │ REVIEW │ ←───→ │ REVISIONS │ (loop as needed) │
│ └─────┬───────┘ └───────────────┘ │
│ │ review_approved │
│ ▼ │
│ ┌─────────────┐ │
│ │ FULFILLMENT │ album_production → ready_for_delivery │
│ └─────┬───────┘ │
│ ▼ │
│ ┌─────────────┐ │
│ │ COMPLETED │ │
│ └─────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────┘

Actor Responsibility:
🔵 Admin 🟢 Client 🟠 Employee

awaiting_quotation → 🔵 Create quotation
quotation_sent → 🟢 Review & approve
quotation_approved → 🔵 Allocate storage
storage_allocated → 🔵 Enable uploads
awaiting_uploads → 🟢 Upload files
uploads_complete → 🔵 Assign employee
assigned → 🟠 Start work
work_in_progress → 🟠 Complete deliverables
deliverables_ready → 🔵 QC review
awaiting_review → 🟢 Review deliverables
revisions_requested → 🟠 Make corrections
review_approved → 🔵 Start album production
album_production → 🔵 Production work
ready_for_delivery → 🔵 Mark delivered
completed → ✅ Done
