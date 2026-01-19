# Epic 9: Advanced Dynamic Field Behaviors

## Epic Overview

- **ID**: 09-dynamic-field-behaviors
- **Status**: backlog
- **Priority**: low
- **Estimated Points**: 13
- **Depends On**: Epic 8 (Admin Settings & Configuration)

## Business Value

Enable sophisticated form field behaviors that adapt based on user input, reducing form complexity and improving data collection quality. This allows admins to create intelligent forms where fields appear conditionally, arrays are generated dynamically, and dependencies between fields are honored.

---

## Background & Context

Building on Epic 8's basic field management, this epic introduces advanced behaviors:

- **Array-from-count**: When user enters a number (e.g., "3 albums"), system generates that many input fields for detailed configuration
- **Repeaters**: Users can add/remove items freely (e.g., multiple contact numbers)
- **Conditionals**: Fields show/hide based on other field values
- **Field dependencies**: Select options that change based on other selections

---

## Functional Requirements

### FR-5.1: Array-from-Count Behavior

- Configure a number field to trigger array inputs
- Specify which field controls the array size
- Define the array item field properties
- Store as JSON array in typeSpecificDetails

### FR-5.2: Repeater Fields

- User can add/remove items dynamically
- Set min/max item counts
- Smooth animation for add/remove
- Validation per item and for entire array

### FR-5.3: Conditional Field Display

- Show/hide fields based on conditions
- Conditions based on other field values
- Multiple condition operators (equals, not-equals, contains)
- AND/OR condition grouping

### FR-5.4: Field Dependencies

- Dynamic select options based on parent selection
- Cascading dropdowns (e.g., Category → Subcategory)
- Reset child values when parent changes

---

## Scope

### In Scope

- Database schema for behavior configuration
- Admin UI to configure behaviors
- Runtime engine to evaluate conditions
- Client-side rendering of dynamic fields
- Validation engine for complex rules

### Out of Scope

- AI-powered field suggestions
- Form versioning
- Multi-step conditional logic

---

## Acceptance Criteria

### AC-5.1: Array-from-Count

- [ ] Admin can mark a number field as "controls array"
- [ ] Admin can define the array item template
- [ ] Wizard generates N inputs when user enters count
- [ ] Smooth animation for input appearance/removal
- [ ] Data stores correctly as JSON array
- [ ] Validation works for individual items and total

### AC-5.2: Repeaters

- [ ] Admin can create repeater field type
- [ ] User sees "Add Item" button
- [ ] User can remove individual items
- [ ] Min/max item validation enforced
- [ ] Smooth UX with animations

### AC-5.3: Conditionals

- [ ] Admin can add conditions to any field
- [ ] UI for building condition expressions
- [ ] Fields hide/show smoothly based on conditions
- [ ] Hidden fields excluded from submission

### AC-5.4: Dependencies

- [ ] Admin can link select fields
- [ ] Child options filter based on parent value
- [ ] Cascading resets work correctly

---

## Stories

| Story ID | Title                           | Points | Status  |
| -------- | ------------------------------- | ------ | ------- |
| 9-1      | Array-from-Count Field Behavior | 5      | backlog |
| 9-2      | Repeater Field Implementation   | 3      | backlog |
| 9-3      | Conditional Field Display       | 3      | backlog |
| 9-4      | Cascading Field Dependencies    | 2      | backlog |

---

## Dependencies

| Dependency             | Status   | Notes      |
| ---------------------- | -------- | ---------- |
| Epic 8: Admin Settings | Required | Field CRUD |

---

## Technical Architecture

### Behavior Schema Extension

```typescript
// Add to projectTypeFields table
behavior: v.optional(v.union(
  v.literal('simple'),           // Default - single value
  v.literal('array-from-count'), // Creates array based on another field
  v.literal('repeater'),         // User adds/removes items
  v.literal('conditional')       // Visibility depends on condition
)),
dependsOn: v.optional(v.string()),     // Field name that controls this
itemTemplate: v.optional(v.string()),  // JSON template for array items
conditions: v.optional(v.string()),    // JSON condition expression
```

### Condition Expression Format

```json
{
  "operator": "AND",
  "rules": [
    { "field": "albumCount", "op": "gt", "value": 0 },
    { "field": "coverType", "op": "eq", "value": "leather" }
  ]
}
```

### Runtime Engine

- `evaluateCondition(conditions, formValues)` → boolean
- `generateArrayFields(template, count)` → FieldDefinition[]
- `filterOptions(options, parentValue, mapping)` → Option[]

---

## UX Design Notes

- Use visual condition builder (not raw JSON)
- Real-time preview of condition effects
- Clear indication when fields are conditionally hidden
- Undo support for accidental changes
- Test mode to simulate form behavior

---

## Risk Mitigation

- **Complexity creep**: Start with array-from-count only, add others incrementally
- **Performance**: Lazy evaluate conditions, memoize results
- **Data migration**: Existing forms continue to work without behaviors

---

## Note: No Status Workflow Changes

Epic 9 focuses on form field behaviors and does not directly interact with the project status workflow from Epic 5A. However, the dynamic fields configured here may include fields that are relevant during different project phases.
