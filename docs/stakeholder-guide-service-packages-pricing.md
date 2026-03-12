# PrimeEditz — Stakeholder Guide: Service Packages & Pricing Setup

> **Audience:** Product stakeholders, business owners, and anyone facilitating pricing conversations with the PrimeEditz AI agent.
>
> **Last Updated:** 2026-02-21

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts & Terminology](#2-key-concepts--terminology)
3. [Entity Relationship Map](#3-entity-relationship-map)
4. [Step-by-Step: Adding a Project Category](#4-step-by-step-adding-a-project-category)
5. [Step-by-Step: Adding a Project Type](#5-step-by-step-adding-a-project-type)
6. [Step-by-Step: Adding a Folder Template](#6-step-by-step-adding-a-folder-template)
7. [Step-by-Step: Adding a Storage Tier](#7-step-by-step-adding-a-storage-tier)
8. [Step-by-Step: Adding Quotation Sections](#8-step-by-step-adding-quotation-sections)
9. [Step-by-Step: Creating a Service Package](#9-step-by-step-creating-a-service-package)
10. [Real-World Example: "Premium Wedding Photography" Package](#10-real-world-example-premium-wedding-photography-package)
11. [Pricing Discussion Prompts](#11-pricing-discussion-prompts)
12. [Schema Reference (Quick Lookup)](#12-schema-reference-quick-lookup)
13. [FAQ](#13-faq)
14. [Systematic Data Seeding Guide](#14-systematic-data-seeding-guide)

---

## 1. Overview

PrimeEditz is a project management platform for photo/video editing studios. Before a studio can request work, the **admin** must set up:

| What                   | Why                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Project Categories** | Top-level grouping (e.g., "Wedding", "Photography", "Corporate")                                               |
| **Project Types**      | Specific work types within a category (e.g., "Wedding Photography", "Wedding Videography")                     |
| **Folder Templates**   | Pre-defined folder structures for organizing raw files studios will upload                                     |
| **Storage Tiers**      | Storage allocation options (e.g., 10 GB Bronze, 50 GB Silver)                                                  |
| **Quotation Sections** | Visual grouping for line items on quotation PDFs (e.g., "Photography", "Editing", "Albums")                    |
| **Service Packages**   | The **main product** — bundles project types, folder templates, storage, and pricing into a selectable package |

### How it all flows:

```
Studio selects a SERVICE PACKAGE
  → Package has PROJECT CONFIGS (linking Project Type + Folder Template + Storage)
  → Package has LINE ITEMS (the pricing breakdown)
  → On quotation approval → Projects are auto-spawned per project config
  → Each project gets the pre-defined folder structure from the template
```

---

## 2. Key Concepts & Terminology

### 2.1 Project Category

A broad classification for grouping project types together.

| Field          | Type    | Required | Description                             |
| -------------- | ------- | -------- | --------------------------------------- |
| `name`         | string  | ✅       | Category display name (e.g., "Wedding") |
| `isActive`     | boolean | ✅       | Whether this category is visible        |
| `displayOrder` | number  | ❌       | For sorting in the UI                   |

**Currently in the system:**
| Name | Active |
|---|---|
| Wedding | ✅ |
| Photography | ✅ |

---

### 2.2 Project Type

A specific type of work that a studio can request. Each project type belongs to a category.

| Field                     | Type      | Required | Description                                          |
| ------------------------- | --------- | -------- | ---------------------------------------------------- |
| `name`                    | string    | ✅       | Name (e.g., "Wedding Photography")                   |
| `description`             | string    | ❌       | What this type involves                              |
| `icon`                    | string    | ❌       | Icon identifier for the UI (e.g., "Camera", "Video") |
| `categoryId`              | reference | ✅       | Links to a `projectCategories` record                |
| `isActive`                | boolean   | ✅       | Whether studios can select this type                 |
| `displayOrder`            | number    | ❌       | Sort order                                           |
| `defaultFolderTemplateId` | reference | ❌       | Default folder template for this type                |
| `deliveryConfig`          | object    | ❌       | Customizes the delivery phase (physical vs digital)  |

**Delivery Config Options:**

| Sub-field               | Type    | Description                   |
| ----------------------- | ------- | ----------------------------- |
| `hasPhysicalDelivery`   | boolean | Album, prints, USB, etc.      |
| `physicalDeliveryLabel` | string  | e.g., "Album Production"      |
| `hasDigitalDelivery`    | boolean | Download links                |
| `digitalDeliveryLabel`  | string  | e.g., "Video Rendering"       |
| `requiresSignoff`       | boolean | Client must sign for delivery |

**Currently in the system:**
| Name | Category | Icon | Active |
|---|---|---|---|
| Wedding Photography | Wedding | Camera | ✅ |
| Wedding Videography | Wedding | Video | ✅ |

---

### 2.3 Folder Template

Defines the folder structure that gets created when a project starts. Studios upload raw files into these folders.

| Field           | Type      | Required | Description                                          |
| --------------- | --------- | -------- | ---------------------------------------------------- |
| `name`          | string    | ✅       | Template name                                        |
| `description`   | string    | ❌       | What this template is for                            |
| `projectTypeId` | reference | ✅       | Links to a project type                              |
| `variant`       | string    | ❌       | e.g., "South Indian", "Christian" — cultural variant |
| `folders`       | array     | ✅       | Hierarchical folder definition (up to 3 levels deep) |
| `isDefault`     | boolean   | ❌       | Default template for this project type               |
| `isActive`      | boolean   | ✅       | Availability toggle                                  |

**Folder Structure (up to 3 levels):**

```
Level 1 (Root Folder)
  └── Level 2 (Subfolder)
       └── Level 3 (Leaf Folder)
```

Each folder level has:
| Field | Type | Description |
|---|---|---|
| `name` | string | Display name (e.g., "01 Ceremony") |
| `path` | string | URL-safe path segment (e.g., "ceremony") |
| `description` | string | What goes in this folder |
| `isRequired` | boolean | Whether studio MUST upload to this folder |

**Currently in the system:**
| Template Name | Project Type | Folders |
|---|---|---|
| Standard Wedding Template | Wedding Photography | 01 Ceremony ✅, 02 Reception ✅, 03 Candid, 04 Couple Portraits |
| New Template | Wedding Videography | New Root Folder |

---

### 2.4 Storage Tier

Defines how much cloud storage is allocated to a project.

| Field       | Type    | Required | Description                           |
| ----------- | ------- | -------- | ------------------------------------- |
| `name`      | string  | ✅       | Tier name (e.g., "Bronze")            |
| `sizeGB`    | number  | ✅       | Storage in gigabytes                  |
| `isActive`  | boolean | ✅       | Availability toggle                   |
| `isDefault` | boolean | ❌       | Whether this is the default selection |

**Currently in the system:**
| Name | Size (GB) | Active |
|---|---|---|
| Premium | 5 | ✅ |
| Bronze | 10 | ✅ |
| Gold | 15 | ✅ |
| Platinum | 30 | ✅ |
| Silver | 50 | ✅ |
| Pro | 100 | ✅ |

---

### 2.5 Quotation Section

Used to visually group line items on the quotation PDF/UI. Think of these as column headers or section dividers.

| Field          | Type    | Required | Description                                 |
| -------------- | ------- | -------- | ------------------------------------------- |
| `name`         | string  | ✅       | Section name (e.g., "Photography Services") |
| `icon`         | string  | ❌       | Icon for visual identification              |
| `color`        | string  | ❌       | Color for the section header                |
| `displayOrder` | number  | ❌       | Sort order on the quotation                 |
| `isActive`     | boolean | ✅       | Availability toggle                         |

> **Note:** No quotation sections have been created yet. You'll want to set these up before creating service packages with grouped line items.

---

### 2.6 Service Package ⭐ (The Main Entity)

This is the **product** that studios browse and select. It bundles everything together.

| Field            | Type      | Required | Description                                 |
| ---------------- | --------- | -------- | ------------------------------------------- |
| `name`           | string    | ✅       | Package display name                        |
| `description`    | string    | ❌       | Marketing description                       |
| `categoryId`     | reference | ❌       | Links to a project category                 |
| `projectConfigs` | array     | ❌       | **Multi-project configuration** (see below) |
| `lineItems`      | array     | ✅       | **Pricing line items** (see below)          |
| `terms`          | string    | ❌       | Terms and conditions text                   |
| `applyGST`       | boolean   | ❌       | Whether to apply GST tax                    |
| `gstPercentage`  | number    | ❌       | GST percentage (e.g., 18)                   |
| `isActive`       | boolean   | ✅       | Whether studios can see/select this         |

#### Project Config (within a Service Package)

Each service package can spawn **multiple projects** when approved. Each project config defines what project to create:

| Field                  | Type      | Required | Description                                   |
| ---------------------- | --------- | -------- | --------------------------------------------- |
| `id`                   | string    | ✅       | Unique ID within the package (auto-generated) |
| `label`                | string    | ❌       | Human-readable label (e.g., "Photo Editing")  |
| `categoryId`           | reference | ❌       | Which category this config falls under        |
| `projectTypeId`        | reference | ✅       | Which project type to create                  |
| `folderTemplateId`     | reference | ✅       | Which folder structure to use                 |
| `defaultStorageTierId` | reference | ❌       | Default storage allocation                    |

#### Line Item (Pricing)

Each line item represents a billable service on the quotation:

| Field             | Type      | Required | Description                                                        |
| ----------------- | --------- | -------- | ------------------------------------------------------------------ |
| `id`              | string    | ✅       | Unique ID within the package                                       |
| `sectionId`       | reference | ❌       | Links to a quotation section for grouping                          |
| `description`     | string    | ✅       | What is being charged for                                          |
| `unit`            | string    | ✅       | Unit of measurement (e.g., "per project", "per hour", "per album") |
| `rate`            | number    | ✅       | Price per unit (in ₹)                                              |
| `quantity`        | number    | ✅       | Quantity                                                           |
| `projectConfigId` | string    | ❌       | Links to a project config within the package                       |
| `subItems`        | array     | ❌       | Breakdown items (description + optional amount)                    |

**Line Item Total Formula:** `rate × quantity`
**Package Subtotal:** Sum of all `rate × quantity`
**Tax Amount:** `subtotal × (gstPercentage / 100)` (if `applyGST` is true)
**Grand Total:** `subtotal + taxAmount`

---

## 3. Entity Relationship Map

```
┌─────────────────┐
│  Project         │
│  Categories      │ (e.g., "Wedding", "Corporate")
└───────┬─────────┘
        │ 1:N
        ▼
┌─────────────────┐       ┌──────────────────┐
│  Project Types   │──────▶│  Folder Templates │
│                  │ 1:N   │                  │
│  (e.g., Wedding  │       │  (folder tree     │
│   Photography)   │       │   structure)      │
└───────┬─────────┘       └──────────────────┘
        │                          ▲
        │                          │
        ▼                          │
┌─────────────────────────────────────────────────┐
│                SERVICE PACKAGE                   │
│                                                  │
│  ┌────────────┐   ┌────────────┐                │
│  │ Project     │   │ Line Items │                │
│  │ Configs     │   │ (Pricing)  │                │
│  │             │   │            │                │
│  │ • Type ─────┤   │ • Desc     │                │
│  │ • Template ─┘   │ • Rate     │                │
│  │ • Storage       │ • Quantity │                │
│  └────────────┘   │ • Unit     │                │
│                    └────────────┘                │
│                                                  │
│  + Terms & Conditions                            │
│  + GST Configuration                             │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   QUOTATION      │ (Studio selects packages →
              │                  │  Quotation auto-generated)
              │  • Line items    │
              │  • Totals/Tax    │
              │  • Terms         │
              └───────┬─────────┘
                      │ On Approval
                      ▼
              ┌─────────────────┐
              │    PROJECTS      │ (Auto-spawned per
              │    (1 per        │  project config)
              │     config)      │
              └─────────────────┘


┌─────────────────┐
│  Storage Tiers   │ (referenced by project configs)
│                  │
│  "Bronze" = 10GB │
│  "Silver" = 50GB │
└─────────────────┘

┌──────────────────┐
│ Quotation Sections│ (visual grouping for line items)
│                   │
│  "Photography"    │
│  "Albums"         │
│  "Videography"    │
└──────────────────┘
```

---

## 4. Step-by-Step: Adding a Project Category

Before adding project types, ensure the category exists.

### What you need to decide:

- **Name:** A broad grouping (e.g., "Wedding", "Corporate Events", "YouTube Content")
- **Active?** Should it be available immediately?
- **Display Order:** Position in the UI list

### Prompt the agent with:

```
Create a new project category with:
- Name: "<category name>"
- Active: yes/no
- Display Order: <number>
```

### Example:

```
Create a new project category with:
- Name: "Corporate Events"
- Active: yes
- Display Order: 3
```

---

## 5. Step-by-Step: Adding a Project Type

A project type represents a specific kind of work (e.g., "Wedding Photography").

### What you need to decide:

1. **Name:** Descriptive name for this type of work
2. **Category:** Which category does it belong to?
3. **Icon:** Visual icon (options: "Camera", "Video", "Edit", "Album", etc.)
4. **Active?** Should studios be able to request this immediately?
5. **Delivery configuration** (optional):
   - Does it involve physical delivery? (albums, USB, prints)
   - Does it involve digital delivery? (download links)
   - Does the client need to sign off on delivery?

### Prompt the agent with:

```
Create a new project type with:
- Name: "<type name>"
- Category: "<existing category name>"
- Icon: "<icon name>"
- Active: yes/no
- Description: "<what this type involves>"
- Delivery config:
  - Physical delivery: yes/no (label: "<e.g., Album Production>")
  - Digital delivery: yes/no (label: "<e.g., Photo Delivery>")
  - Requires client signoff: yes/no
```

### Example:

```
Create a new project type with:
- Name: "Pre-Wedding Shoot"
- Category: "Wedding"
- Icon: "Camera"
- Active: yes
- Description: "Pre-wedding couple photoshoot and editing"
- Delivery config:
  - Physical delivery: no
  - Digital delivery: yes (label: "Edited Photos Delivery")
  - Requires client signoff: yes
```

---

## 6. Step-by-Step: Adding a Folder Template

Folder templates define the structure studios will upload raw files into.

### What you need to decide:

1. **Template Name:** e.g., "Standard Wedding Photography Template"
2. **Project Type:** Which project type this template is for
3. **Variant** (optional): e.g., "South Indian", "Christian", "Muslim"
4. **Default?** Should this be the auto-selected template?
5. **Folder Structure:** Define the tree hierarchy

### Folder Structure Planning Worksheet:

```
📁 Root Folder 1 (name | path | required?)
   📁 Subfolder 1.1 (name | path | required?)
      📁 Leaf 1.1.1 (name | path | required?)
      📁 Leaf 1.1.2 (name | path | required?)
   📁 Subfolder 1.2 (name | path | required?)
📁 Root Folder 2 (name | path | required?)
```

### Prompt the agent with:

```
Create a folder template for the "<project type>" project type with:
- Template name: "<name>"
- Variant: "<variant or leave blank>"
- Is default: yes/no
- Folder structure:
  📁 <Folder 1 Name> (path: <path>, required: yes/no)
     📁 <Subfolder 1.1 Name> (path: <path>, required: yes/no)
  📁 <Folder 2 Name> (path: <path>, required: yes/no)
```

### Example:

```
Create a folder template for the "Wedding Photography" project type with:
- Template name: "South Indian Wedding Template"
- Variant: "South Indian"
- Is default: no
- Folder structure:
  📁 01 Muhurtham (path: muhurtham, required: yes)
     📁 Thali Tying (path: thali-tying, required: yes)
     📁 Garland Exchange (path: garland-exchange, required: yes)
  📁 02 Reception (path: reception, required: yes)
     📁 Stage Photos (path: stage-photos, required: no)
     📁 Candid (path: candid, required: no)
  📁 03 Family Portraits (path: family-portraits, required: no)
  📁 04 Couple Portraits (path: couple-portraits, required: yes)
```

---

## 7. Step-by-Step: Adding a Storage Tier

### What you need to decide:

- **Name:** Descriptive tier name
- **Size (GB):** How much storage to allocate
- **Active?** Available for selection
- **Default?** Should this be pre-selected

### Prompt the agent with:

```
Create a new storage tier:
- Name: "<tier name>"
- Size: <number> GB
- Active: yes/no
- Default: yes/no
```

### Example:

```
Create a new storage tier:
- Name: "Enterprise"
- Size: 200 GB
- Active: yes
- Default: no
```

---

## 8. Step-by-Step: Adding Quotation Sections

Quotation sections visually group line items on the quotation document.

### What you need to decide:

- **Name:** Section heading (e.g., "Photography Services", "Album Costs", "Videography")
- **Icon** (optional): Visual icon
- **Color** (optional): Section header color
- **Display Order:** Position on the quotation

### Prompt the agent with:

```
Create a quotation section:
- Name: "<section name>"
- Icon: "<icon>" (optional)
- Color: "<hex color>" (optional)
- Display Order: <number>
- Active: yes
```

### Example:

```
Create the following quotation sections:
1. Name: "Photography Services", Display Order: 1
2. Name: "Videography Services", Display Order: 2
3. Name: "Album & Prints", Display Order: 3
4. Name: "Additional Services", Display Order: 4
```

---

## 9. Step-by-Step: Creating a Service Package

This is the **main product configuration**. A service package brings everything together.

### ⚡ Prerequisites Checklist

Before creating a service package, ensure all of these exist:

- [ ] **Project Category** created (e.g., "Wedding")
- [ ] **Project Type(s)** created (e.g., "Wedding Photography", "Wedding Videography")
- [ ] **Folder Template(s)** created for each project type
- [ ] **Storage Tier(s)** created
- [ ] **Quotation Sections** (optional but recommended for organized pricing)

### What you need to decide:

#### A. Package Identity

| Decision     | Example                                          |
| ------------ | ------------------------------------------------ |
| Package Name | "Premium Wedding Photography"                    |
| Description  | "Complete wedding coverage with album and video" |
| Category     | "Wedding"                                        |
| Active?      | yes                                              |

#### B. Project Configurations (what projects to create)

**Each config = one project that gets spawned on quotation approval.**

| Decision        | Example Config 1          | Example Config 2    |
| --------------- | ------------------------- | ------------------- |
| Label           | "Photo Editing"           | "Video Editing"     |
| Project Type    | Wedding Photography       | Wedding Videography |
| Folder Template | Standard Wedding Template | Video Template      |
| Storage Tier    | Bronze (10 GB)            | Silver (50 GB)      |

#### C. Line Items (Pricing)

Each line item = one billable service.

| Decision                  | Example                                  |
| ------------------------- | ---------------------------------------- |
| Description               | "Wedding Day Photo Editing"              |
| Unit                      | "per project" / "per hour" / "per album" |
| Rate                      | ₹15,000                                  |
| Quantity                  | 1                                        |
| Linked to Project Config? | Photo Editing (optional)                 |
| Section                   | Photography Services (optional)          |

#### D. Terms & Tax

| Decision       | Example                                     |
| -------------- | ------------------------------------------- |
| Terms text     | Payment terms, version policy, cancellation |
| Apply GST?     | yes                                         |
| GST Percentage | 18%                                         |

### Prompt the agent with:

```
Create a service package with:

IDENTITY:
- Name: "<package name>"
- Description: "<description>"
- Category: "<category name>"
- Active: yes/no

PROJECT CONFIGS:
1. Label: "<label>"
   - Project Type: "<type name>"
   - Folder Template: "<template name>"
   - Storage Tier: "<tier name>"
2. Label: "<label>"
   - Project Type: "<type name>"
   - Folder Template: "<template name>"
   - Storage Tier: "<tier name>"

LINE ITEMS:
1. Description: "<what is being charged>"
   - Unit: "<per project | per hour | per album | per piece>"
   - Rate: ₹<amount>
   - Quantity: <number>
   - Links to project config: "<label>" (optional)
   - Section: "<section name>" (optional)
2. ...

TERMS & TAX:
- Apply GST: yes/no
- GST Percentage: <number>%
- Terms:
  "<paste full terms text>"
```

---

## 10. Real-World Example: "Premium Wedding Photography" Package

Here's the actual package in the system right now, deconstructed for reference:

### 📦 Package: "Premium Wedding VideoGraphy"

**Category:** Wedding
**GST:** 18%
**Active:** ✅

#### Project Configs:

| #   | Label                    | Project Type        | Folder Template           | Storage        |
| --- | ------------------------ | ------------------- | ------------------------- | -------------- |
| 1   | Photo Project Album      | Wedding Photography | Standard Wedding Template | Bronze (10 GB) |
| 2   | Video Project Movie Edit | Wedding Videography | New Template              | Silver (50 GB) |

#### Line Items:

| #   | Description                                | Unit        | Rate (₹) | Qty | Linked Config            |
| --- | ------------------------------------------ | ----------- | -------- | --- | ------------------------ |
| 1   | Album 12×12 (Grand Suitcase)               | per project | 5,000    | 1   | Photo Project Album      |
| 2   | Drone Shot (2 hrs labour)                  | per project | 20,000   | 1   | Video Project Movie Edit |
| 3   | Movie Edit (Color Grading and manual Edit) | per project | 7,000    | 1   | Video Project Movie Edit |

**Subtotal:** ₹32,000
**GST (18%):** ₹5,760
**Grand Total:** ₹37,760

#### Terms:

```
1. PAYMENT TERMS
   • 50% advance payment before project commencement
   • 50% upon delivery of final files
   • Payment via bank transfer or UPI

2. VERSIONS
   • Up to 2 rounds of versions included
   • Additional versions charged at ₹2,000 per round

3. DELIVERY
   • Delivery timeline as per project scope
   • Delays due to client feedback not included

4. CANCELLATION
   • Advance amount non-refundable after work begins
   • 50% cancellation fee if cancelled midway

5. RIGHTS & OWNERSHIP
   • Full rights transferred upon complete payment
   • Raw files available at additional cost
```

---

## 11. Pricing Discussion Prompts

Use these templates to facilitate pricing conversations with the AI agent. Simply copy, fill in, and prompt.

---

### 🟢 Prompt 1: Brainstorm a New Package from Scratch

```
I want to create a new service package for PrimeEditz. Let's discuss pricing.

Business context:
- Service type: <e.g., Wedding Photography, YouTube Video Editing, Corporate Event>
- Target market: <e.g., premium, budget, mid-range>
- Target price range: ₹<min> to ₹<max>
- Location/region: <e.g., South India, Metro cities>

What I offer:
- <Service 1>: <brief description>
- <Service 2>: <brief description>
- <Service 3>: <brief description>

What costs I have:
- <Cost 1>: ₹<amount> (e.g., album printing)
- <Cost 2>: ₹<amount> (e.g., drone rental)
- <Cost 3>: ₹<amount> (e.g., editor salary per project)

Please help me:
1. Structure these into line items with competitive pricing
2. Suggest the right project types and folder templates needed
3. Recommend storage allocation
4. Draft terms and conditions
5. Generate the final service package specification I can use to create it in PrimeEditz
```

---

### 🟡 Prompt 2: Review & Adjust Existing Package Pricing

```
I want to review and adjust pricing for the existing service package "<package name>".

Current issues:
- <e.g., "The rate for album printing is too low, our costs have increased">
- <e.g., "We want to add a new line item for drone photography">
- <e.g., "We need to change the storage tier from Bronze to Silver">

Market context:
- Competitors charge approximately ₹<amount> for similar services
- Our target margin is <X>%

Please suggest:
1. Updated line item pricing
2. Any new line items to add
3. Any line items to remove or merge
4. Updated terms if needed
```

---

### 🔵 Prompt 3: Create Category-Specific Packages

```
I want to set up a complete pricing catalog for the "<category>" category.

We need packages at these tiers:
1. Basic Package: ₹<target price>
   - Includes: <list of services>
2. Standard Package: ₹<target price>
   - Includes: <list of services>
3. Premium Package: ₹<target price>
   - Includes: <list of services>

For each tier, please:
1. Define the project types needed (create new ones if they don't exist)
2. Define folder templates appropriate for each
3. Structure line items with pricing
4. Set appropriate storage tiers
5. Write tier-specific terms
6. Output the complete specification for each package
```

---

### 🟣 Prompt 4: Pricing for a Specific Client Scenario

```
A studio has asked for a custom quotation. Here are the details:

Client/Event info:
- Event: <e.g., "3-day South Indian Wedding">
- End Client: "<name>"
- Venue: "<location>"
- Event Date: <date>

Requirements:
- <Requirement 1> (e.g., "Full day photo coverage for 3 days")
- <Requirement 2> (e.g., "Cinematic highlights video")
- <Requirement 3> (e.g., "2 albums — 12x12 and 10x10")
- <Requirement 4> (e.g., "Drone footage for 1 day")

Which existing service packages would work? If none fit perfectly, can you suggest:
1. Which packages to combine/modify?
2. Custom line items to add?
3. The total estimated price?
4. What project types and configs are needed?
```

---

### 🔴 Prompt 5: Bulk Setup — New Category, Types, and Packages

```
I want to add a completely new service offering to PrimeEditz.

New category: "<category name>"

Project types needed:
1. "<Type 1>": <description>
   - Folder structure: <list folders>
2. "<Type 2>": <description>
   - Folder structure: <list folders>

Storage requirements:
- <Type 1> typically needs <X> GB
- <Type 2> typically needs <X> GB

Pricing:
- <Type 1> market rate: ₹<range>
- <Type 2> market rate: ₹<range>

Please create the complete setup:
1. Project category
2. All project types with folder templates
3. Appropriate storage tier (or use existing ones)
4. Service packages with full pricing
5. Quotation sections for organized display
6. Standard terms and conditions
```

---

### ⚪ Prompt 6: Quick Price Calculation

```
Calculate the pricing for a service package with:
- Line items:
  1. <Description>: ₹<rate> × <qty> <unit>
  2. <Description>: ₹<rate> × <qty> <unit>
  3. <Description>: ₹<rate> × <qty> <unit>
- GST: <percentage>%
- Discount: ₹<amount> (optional)

Show me subtotal, tax, discount, and grand total.
```

---

## 12. Schema Reference (Quick Lookup)

### Tables & Their Purpose

| Table               | Purpose                              | Key Fields                                 |
| ------------------- | ------------------------------------ | ------------------------------------------ |
| `projectCategories` | Broad grouping                       | name, isActive                             |
| `projectTypes`      | Specific work types                  | name, categoryId, icon, deliveryConfig     |
| `folderTemplates`   | Folder structures for uploads        | name, projectTypeId, folders[]             |
| `storageTiers`      | Storage allocation options           | name, sizeGB                               |
| `quotationSections` | Line item grouping on quotation      | name, displayOrder                         |
| `servicePackages`   | **The product** — bundles everything | name, projectConfigs[], lineItems[], terms |
| `quotations`        | Generated from package + client info | status, lineItems[], totals                |
| `projects`          | Created on quotation approval        | phase, actionState, projectTypeId          |

### Pricing Formula Reference

| Calculation     | Formula                            |
| --------------- | ---------------------------------- |
| Line Item Total | `rate × quantity`                  |
| Subtotal        | `SUM(all line item totals)`        |
| GST Amount      | `subtotal × (gstPercentage / 100)` |
| Discount        | Flat amount or percentage          |
| **Grand Total** | `subtotal + GST - discount`        |

### Status Flows

**Quotation Status:** `draft` → `initiated` → `sent` → `viewed` → `approved` / `rejected` / `changes_requested`

**Project Phase:** `setup` → `onboarding` → `production` → `review` → `delivery` → `completed`

---

## 13. FAQ

### Q: Can a service package spawn multiple projects?

**A:** Yes! Each entry in `projectConfigs` creates a separate project on quotation approval. For example, a "Wedding Complete" package can spawn both a Photography project and a Videography project.

### Q: Can I link a line item to a specific project config?

**A:** Yes, use the `projectConfigId` field. This is useful for tracking which costs belong to which project.

### Q: What happens when a studio selects a package?

**A:** The package's line items are copied into a quotation draft. The admin can customize pricing before sending. On approval, projects are auto-created from the project configs.

### Q: Can I have multiple folder templates per project type?

**A:** Yes! For example, "Wedding Photography" can have "South Indian", "Christian", and "North Indian" templates. The service package config specifies which template variant to use.

### Q: What's the difference between `projectTypeId` and `projectConfigs` on a service package?

**A:** `projectTypeId` is the **deprecated legacy** field. `projectConfigs` is the **new approach** that supports multi-project packages. Always use `projectConfigs`.

### Q: Do quotation sections affect pricing?

**A:** No, they're purely visual. They group line items on the quotation PDF/UI for better readability.

### Q: Can I duplicate and modify an existing package?

**A:** Yes! Use the duplicate feature and then adjust pricing, project configs, or terms as needed.

### Q: What units can I use for line items?

**A:** Any string works. Common values: "per project", "per hour", "per day", "per album", "per piece", "per reel", "per session".

---

> **💡 Tip:** When prompting the agent, always provide the **business context** (pricing tier, target market, margins) alongside the technical details (project types, storage). This helps the agent make better pricing recommendations.

---

## 14. Systematic Data Seeding Guide

When you want the AI agent to create a **seed function** that populates the PrimeEditz database with initial/test data, you **must** provide all the information below in the correct order. This ensures the agent generates a seed function that works on the first try — no missing references, no broken foreign keys.

### 14.1 What Is Data Seeding?

Data seeding is the process of **pre-populating the database** with initial configuration and test records. It's used for:

- 🟢 **Development:** Setting up a local environment with realistic data for testing
- 🟡 **Demo/Staging:** Populating a staging environment to demo to clients
- 🔵 **Production Bootstrap:** Setting up the initial categories, types, tiers, and packages for a fresh production deployment
- 🟣 **Reset & Re-seed:** Wiping test data and re-creating a clean state

### 14.2 Seeding Architecture — How It Works in PrimeEditz

The seed function must be an `internalMutation` in Convex (so it can't be called from the browser — only from the CLI or dashboard):

```
📁 convex/functions/admin/seed.ts     ← The seed function lives here
📁 convex/admin.ts                     ← Re-exported via: export * from "./functions/admin/seed"
```

**Technical Details:**

- Seed functions use `internalMutation` (not `adminMutation`) because there's no authenticated user during seeding
- The function must create records **in dependency order** (categories before types, types before templates, etc.)
- IDs returned from `ctx.db.insert()` are used as references for downstream inserts
- For profiles: use `userId: "seed_<role>_<timestamp>"` as placeholder (real auth users link later)

### 14.3 ⚠️ The Golden Rule: Insertion Order

The agent **MUST** insert data in this exact order. Each layer depends on the previous one.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0: Independent Tables (no foreign keys)                 │
│  ──────────────────────────────────────────────────────────     │
│  • profiles           (admin, studio, employee accounts)       │
│  • storageTiers        (5GB, 10GB, 50GB, etc.)                 │
│  • projectCategories   (Wedding, Corporate, etc.)              │
│  • quotationSections   (Photography Services, Albums, etc.)    │
│  • company             (business info, bank details)           │
│  • appSettings         (quotation defaults, tax defaults)      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ IDs flow down
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: Depends on Layer 0                                   │
│  ──────────────────────────────────────────────────────────     │
│  • projectTypes        (needs categoryId from projectCategories)│
└─────────────────────────────┬───────────────────────────────────┘
                              │ IDs flow down
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: Depends on Layer 1                                   │
│  ──────────────────────────────────────────────────────────     │
│  • folderTemplates     (needs projectTypeId from projectTypes)  │
│  • quotationLibraryItems (needs sectionId + optional typeHint)  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ IDs flow down
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Depends on Layers 0–2                                │
│  ──────────────────────────────────────────────────────────     │
│  • servicePackages     (needs categoryId, projectTypeId,       │
│                          folderTemplateId, storageTierId,       │
│                          optional sectionId)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 14.4 The Three Roles — What the Stakeholder Must Provide

PrimeEditz has **three user roles**. Seeding profiles is critical for testing all workflows.

| Role         | Purpose                                                           | What to Provide for Seeding                 |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------- |
| **admin**    | Platform administrator — manages everything                       | Name, email                                 |
| **studio**   | Client studios who request work and receive deliverables          | Name, email, company name, phone (optional) |
| **employee** | Editors/workers who are assigned projects and upload deliverables | Name, email, designation (optional)         |

#### Profile Seeding Template:

```
ROLES TO SEED:

Admins:
1. Name: "<name>", Email: "<email>"

Studios:
1. Name: "<name>", Email: "<email>", Company: "<company>", Phone: "<phone>"
2. Name: "<name>", Email: "<email>", Company: "<company>", Phone: "<phone>"

Employees:
1. Name: "<name>", Email: "<email>", Designation: "<e.g., Photo Editor>"
2. Name: "<name>", Email: "<email>", Designation: "<e.g., Video Editor>"
3. Name: "<name>", Email: "<email>", Designation: "<e.g., Colorist>"
```

> **Important:** Seeded profiles use placeholder `userId` values (e.g., `seed_admin_1`). When a real user signs in with a matching email, the system can link them via the `claimDraftProfile` flow. For dev/testing, the placeholder is sufficient.

### 14.5 Company & App Settings — What the Stakeholder Must Provide

These are singleton records (only one per deployment).

#### Company Profile:

```
COMPANY DETAILS:
- Company Name: "<name>"
- Tagline: "<optional tagline>"
- Address: "<full address>"
- Phone: "<phone number>"
- Email: "<business email>"
- Website: "<URL>"
- GST Number: "<GST number>" (optional)
- PAN Number: "<PAN number>" (optional)
- Bank Details:
  - Bank Name: "<name>"
  - Account Holder: "<name>"
  - Account Number: "<number>"
  - IFSC Code: "<code>"
  - Branch: "<branch name>"
- Logo URL: "<URL to logo>" (optional)
```

#### App Settings:

```
APP SETTINGS:
- Default Tax Rate: <number> (e.g., 18 for 18%)
- Default Quotation Validity: <days> (e.g., 30)
- Default Terms: "<default quotation terms text>"
- Quotation Code Prefix: "<e.g., PE or QTN>"
- Starting Quotation Number: <number> (e.g., 1001)
- Admin Notification Emails: ["<email1>", "<email2>"]
- Enable Email Notifications: yes/no
```

### 14.6 Complete Pricing & Services Intake Worksheet

This is the **master worksheet** the stakeholder should fill out. It captures everything needed for the agent to generate a complete seed function.

---

#### SECTION A: Storage Tiers

```
STORAGE TIERS:
| Tier Name   | Size (GB) | Active | Default |
|-------------|-----------|--------|---------|
| <name>      | <number>  | yes/no | yes/no  |
| <name>      | <number>  | yes/no | yes/no  |
| <name>      | <number>  | yes/no | yes/no  |
```

#### SECTION B: Project Categories

```
PROJECT CATEGORIES:
| Category Name | Active | Display Order |
|---------------|--------|---------------|
| <name>        | yes/no | <number>      |
| <name>        | yes/no | <number>      |
```

#### SECTION C: Quotation Sections

```
QUOTATION SECTIONS:
| Section Name  | Icon (optional) | Color (optional) | Display Order | Active |
|---------------|-----------------|------------------|---------------|--------|
| <name>        | <icon>          | <#hex>           | <number>      | yes/no |
| <name>        | <icon>          | <#hex>           | <number>      | yes/no |
```

#### SECTION D: Project Types & Folder Templates

For **each** project type, provide the type details AND its folder template:

```
PROJECT TYPE 1:
- Name: "<type name>"
- Category: "<category from Section B>"
- Icon: "<Camera | Video | Edit | Album | Film | Music>"
- Description: "<what this type involves>"
- Active: yes/no
- Delivery Config:
  - Physical Delivery: yes/no (label: "<label>")
  - Digital Delivery: yes/no (label: "<label>")
  - Requires Signoff: yes/no

  FOLDER TEMPLATE for this type:
  - Template Name: "<name>"
  - Variant: "<optional variant>"
  - Is Default: yes/no
  - Folders:
    📁 <Folder 1> (path: <path>, required: yes/no)
       📁 <Subfolder 1.1> (path: <path>, required: yes/no)
    📁 <Folder 2> (path: <path>, required: yes/no)

---

PROJECT TYPE 2:
- Name: "<type name>"
- Category: "<category from Section B>"
... (repeat pattern)
```

#### SECTION E: Service Packages (with Pricing)

For **each** service package:

```
SERVICE PACKAGE 1:
- Name: "<package name>"
- Description: "<marketing description>"
- Category: "<category from Section B>"
- Active: yes/no
- GST: yes/no, Percentage: <number>%

  PROJECT CONFIGS:
  | # | Label          | Project Type (from D) | Folder Template (from D) | Storage Tier (from A) |
  |---|----------------|-----------------------|--------------------------|-----------------------|
  | 1 | "<label>"      | "<type name>"         | "<template name>"        | "<tier name>"         |
  | 2 | "<label>"      | "<type name>"         | "<template name>"        | "<tier name>"         |

  LINE ITEMS:
  | # | Description       | Unit          | Rate (₹) | Qty | Linked Config # | Section (from C) |
  |---|-------------------|---------------|----------|-----|-----------------|------------------|
  | 1 | "<description>"   | "<unit>"      | <amount> | <n> | <1 or 2 or ->   | "<section>"      |
  | 2 | "<description>"   | "<unit>"      | <amount> | <n> | <1 or 2 or ->   | "<section>"      |

  TERMS:
  "<paste full terms text here>"

---

SERVICE PACKAGE 2:
... (repeat pattern)
```

### 14.7 Agent Seeding Prompts

Use these prompts to instruct the agent to generate the seed function.

---

#### 🟠 Prompt A: Generate a Complete Seed Function

```
Create a Convex seed function at `convex/functions/admin/seed.ts` that populates
the PrimeEditz database with the following data. The function should:

1. Be an `internalMutation` (imported from "../../_generated/server")
2. Accept no arguments
3. Insert data in dependency order (see seeding guide Section 14.3)
4. Use the IDs returned from each insert as references for downstream inserts
5. Log progress with emoji prefixes (e.g., "✅ Created 3 project categories")
6. Return a summary object with counts per table
7. Be idempotent — check if data already exists before inserting (by checking table count)

Also make sure to uncomment or add the re-export in `convex/admin.ts`:
  export * from "./functions/admin/seed";

Here is the data to seed:

<PASTE YOUR COMPLETED WORKSHEET FROM SECTION 14.6 HERE>
```

---

#### 🟤 Prompt B: Seed Only Roles (Profiles)

```
Create a Convex seed function that creates test user profiles with the following roles:

<PASTE YOUR ROLES FROM SECTION 14.4 HERE>

Rules:
- Use `internalMutation` (no auth required)
- Set `userId` to "seed_<role>_<index>" (e.g., "seed_admin_1", "seed_studio_1")
- Set `onboardingComplete: true` for all profiles
- Set `updatedAt: Date.now()`
- Check if a profile with the same email already exists before inserting
- Log each created profile
```

---

#### 🔶 Prompt C: Seed Pricing & Packages Only

```
Create a Convex seed function that populates ONLY the pricing/service catalog.
Assume that the following already exist in the database (do NOT create them):
- Profiles (admin profile needed for `createdBy`)
- Project categories
- Project types
- Folder templates
- Storage tiers

The function should:
1. Query existing records to get their IDs by name
2. Create quotation sections
3. Create service packages with project configs and line items
4. Be idempotent

Here is the pricing data:

<PASTE SECTIONS C AND E FROM YOUR WORKSHEET>
```

---

#### ⬛ Prompt D: Full Reset + Re-Seed

```
Create a Convex function that:
1. Wipes all data from these tables (in order):
   - servicePackageDrafts, quotationRequestDrafts
   - quotations, servicePackages, quotationLibraryItems, quotationSections
   - studioApprovals, versionRequests, deliverableVersions, deliverables
   - assets, folders, statusHistory, handoffLogs, projectSquads, projects
   - folderTemplates, projectTypeFields, projectTypes, projectCategories
   - storageTiers, company, appSettings
   (DO NOT wipe: profiles, contacts, feedbacks, surveys)
2. Then seeds fresh data using the worksheet below
3. Returns wipe stats + seed stats

<PASTE YOUR COMPLETED WORKSHEET>
```

### 14.8 Example: Fully Completed Worksheet (for Reference)

Here's a realistic, fully filled-out example a stakeholder might provide:

---

```
============================================================
             PRIMEEDITZ SEED DATA WORKSHEET
             Prepared by: [Stakeholder Name]
             Date: [Date]
============================================================

ROLES TO SEED:

Admins:
1. Name: "Rajesh Kumar", Email: "rajesh@primeeditz.com"

Studios:
1. Name: "Anusha Reddy", Email: "anusha@studio.com", Company: "Anusha Studios", Phone: "+91 9876543210"
2. Name: "Vikram Singh", Email: "vikram@weddings.com", Company: "Vikram Weddings", Phone: "+91 9876543211"
3. Name: "Priya Mahesh", Email: "priya@priyafilms.com", Company: "Priya Films", Phone: "+91 9876543212"

Employees:
1. Name: "John Paul", Email: "john@primeeditz.com", Designation: "Senior Photo Editor"
2. Name: "Peter James", Email: "peter@primeeditz.com", Designation: "Video Editor"
3. Name: "Sarah Khan", Email: "sarah@primeeditz.com", Designation: "Colorist"

------------------------------------------------------------

COMPANY DETAILS:
- Company Name: "PrimeEditz Studios Pvt Ltd"
- Tagline: "Premium Photo & Video Editing"
- Address: "42, Anna Salai, T. Nagar, Chennai - 600017"
- Phone: "+91 44 2834 5678"
- Email: "hello@primeeditz.com"
- Website: "https://primeeditz.com"
- GST Number: "33AADCP1234F1ZN"
- Bank Details:
  - Bank Name: "HDFC Bank"
  - Account Holder: "PrimeEditz Studios Pvt Ltd"
  - Account Number: "50100123456789"
  - IFSC Code: "HDFC0001234"
  - Branch: "T. Nagar, Chennai"

------------------------------------------------------------

APP SETTINGS:
- Default Tax Rate: 18
- Default Quotation Validity: 30 days
- Default Terms: "Standard terms apply. 50% advance required."
- Quotation Code Prefix: "PE"
- Starting Quotation Number: 1001
- Admin Notification Emails: ["rajesh@primeeditz.com"]
- Enable Email Notifications: yes

------------------------------------------------------------

STORAGE TIERS:
| Tier Name | Size (GB) | Active | Default |
|-----------|-----------|--------|---------|
| Starter   | 5         | yes    | no      |
| Bronze    | 10        | yes    | yes     |
| Silver    | 25        | yes    | no      |
| Gold      | 50        | yes    | no      |
| Platinum  | 100       | yes    | no      |

------------------------------------------------------------

PROJECT CATEGORIES:
| Category Name      | Active | Display Order |
|--------------------|--------|---------------|
| Wedding            | yes    | 1             |
| Pre-Wedding        | yes    | 2             |
| Corporate Events   | yes    | 3             |

------------------------------------------------------------

QUOTATION SECTIONS:
| Section Name           | Display Order | Active |
|------------------------|---------------|--------|
| Photography Services   | 1             | yes    |
| Videography Services   | 2             | yes    |
| Album & Prints         | 3             | yes    |
| Additional Services    | 4             | yes    |

------------------------------------------------------------

PROJECT TYPE 1:
- Name: "Wedding Photography"
- Category: "Wedding"
- Icon: "Camera"
- Description: "Full wedding day photo coverage and editing"
- Active: yes
- Delivery Config:
  - Physical: yes (label: "Album Production")
  - Digital: yes (label: "Photo Delivery")
  - Signoff: yes

  FOLDER TEMPLATE:
  - Template Name: "Standard Wedding Photo Template"
  - Is Default: yes
  - Folders:
    📁 01 Ceremony (path: ceremony, required: yes)
       📁 Thali (path: thali, required: yes)
       📁 Garlands (path: garlands, required: no)
    📁 02 Reception (path: reception, required: yes)
       📁 Stage (path: stage, required: no)
       📁 Candid (path: candid, required: no)
    📁 03 Couple Portraits (path: couple-portraits, required: yes)
    📁 04 Family Portraits (path: family-portraits, required: no)

PROJECT TYPE 2:
- Name: "Wedding Videography"
- Category: "Wedding"
- Icon: "Video"
- Description: "Cinematic wedding video and highlights reel"
- Active: yes
- Delivery Config:
  - Physical: no
  - Digital: yes (label: "Video Rendering")
  - Signoff: yes

  FOLDER TEMPLATE:
  - Template Name: "Standard Wedding Video Template"
  - Is Default: yes
  - Folders:
    📁 01 Ceremony Footage (path: ceremony-footage, required: yes)
    📁 02 Reception Footage (path: reception-footage, required: yes)
    📁 03 Drone Footage (path: drone-footage, required: no)
    📁 04 Audio Files (path: audio, required: no)

PROJECT TYPE 3:
- Name: "Pre-Wedding Shoot"
- Category: "Pre-Wedding"
- Icon: "Camera"
- Description: "Pre-wedding couple photoshoot"
- Active: yes
- Delivery Config:
  - Physical: no
  - Digital: yes (label: "Edited Photos")
  - Signoff: yes

  FOLDER TEMPLATE:
  - Template Name: "Pre-Wedding Template"
  - Is Default: yes
  - Folders:
    📁 01 Outdoor Shots (path: outdoor, required: yes)
    📁 02 Indoor Shots (path: indoor, required: no)
    📁 03 Props & Details (path: props, required: no)

------------------------------------------------------------

SERVICE PACKAGE 1:
- Name: "Basic Wedding Photography"
- Description: "Essential wedding photo coverage for budget-conscious clients"
- Category: "Wedding"
- Active: yes
- GST: yes, Percentage: 18%

  PROJECT CONFIGS:
  | # | Label           | Project Type          | Folder Template               | Storage Tier |
  |---|----------------|-----------------------|-------------------------------|--------------|
  | 1 | "Photo Editing" | "Wedding Photography" | "Standard Wedding Photo Template" | "Bronze"  |

  LINE ITEMS:
  | # | Description                  | Unit        | Rate (₹) | Qty | Config # | Section                |
  |---|------------------------------|-------------|----------|-----|----------|------------------------|
  | 1 | "Wedding Day Photo Editing"  | "per project"| 8,000   | 1   | 1        | "Photography Services" |
  | 2 | "Basic Retouching (50 photos)"| "per set"   | 3,000   | 1   | 1        | "Photography Services" |

  TERMS:
  "1. 50% advance required
   2. Delivery within 15 business days
   3. 1 round of revisions included
   4. RAW files not included"

---

SERVICE PACKAGE 2:
- Name: "Premium Wedding Complete"
- Description: "Full wedding coverage — photography, videography, and albums"
- Category: "Wedding"
- Active: yes
- GST: yes, Percentage: 18%

  PROJECT CONFIGS:
  | # | Label              | Project Type          | Folder Template                   | Storage Tier |
  |---|-------------------|-----------------------|-----------------------------------|--------------|
  | 1 | "Photo Editing"    | "Wedding Photography" | "Standard Wedding Photo Template" | "Gold"       |
  | 2 | "Video Editing"    | "Wedding Videography" | "Standard Wedding Video Template" | "Gold"       |

  LINE ITEMS:
  | # | Description                          | Unit        | Rate (₹) | Qty | Config # | Section                |
  |---|--------------------------------------|-------------|----------|-----|----------|------------------------|
  | 1 | "Wedding Day Photo Editing"          | "per project"| 15,000  | 1   | 1        | "Photography Services" |
  | 2 | "Premium Retouching (200 photos)"    | "per set"   | 8,000   | 1   | 1        | "Photography Services" |
  | 3 | "Cinematic Highlights Video"         | "per project"| 20,000  | 1   | 2        | "Videography Services" |
  | 4 | "Full Wedding Film"                  | "per project"| 12,000  | 1   | 2        | "Videography Services" |
  | 5 | "Drone Coverage (1 day)"             | "per day"   | 15,000  | 1   | 2        | "Additional Services"  |
  | 6 | "Album 12×12 Grand Suitcase"         | "per album" | 5,000   | 1   | 1        | "Album & Prints"       |
  | 7 | "Album 10×10 Standard"               | "per album" | 3,500   | 1   | 1        | "Album & Prints"       |

  TERMS:
  "1. PAYMENT: 50% advance, 50% on delivery. UPI or bank transfer.
   2. VERSIONS: 2 rounds included. Additional: ₹2,000/round.
   3. DELIVERY: 30 business days. Client delays excluded.
   4. CANCELLATION: Advance non-refundable. 50% fee if mid-project.
   5. RIGHTS: Full rights on complete payment. RAW at extra cost."

============================================================
```

### 14.9 What the Agent Will Generate

When provided with a complete worksheet, the agent will create:

| File                             | Purpose                              |
| -------------------------------- | ------------------------------------ |
| `convex/functions/admin/seed.ts` | The `internalMutation` seed function |
| Updated `convex/admin.ts`        | Uncommented/added re-export line     |

The seed function will:

1. **Check idempotency** — skip if data already exists
2. **Insert Layer 0** — profiles, storageTiers, projectCategories, quotationSections, company, appSettings
3. **Insert Layer 1** — projectTypes (referencing category IDs)
4. **Insert Layer 2** — folderTemplates (referencing projectType IDs), link `defaultFolderTemplateId` back to projectTypes
5. **Insert Layer 3** — servicePackages (referencing all upstream IDs in projectConfigs and lineItems)
6. **Log summary** — total records inserted per table
7. **Return stats** — `{ profiles: 7, storageTiers: 5, ... }`

### 14.10 Running the Seed Function

Once the agent creates the seed function, it can be run via:

```bash
# Run on the development deployment
npx convex run admin:seed

# Or on a specific deployment
npx convex run admin:seed --deployment <deployment-name>
```

To **wipe and re-seed** (if a reset function was created):

```bash
# First wipe
npx convex run admin:wipeAllData '{"confirm": true}'

# Then seed
npx convex run admin:seed
```

> **⚠️ Warning:** The wipe function deletes ALL data irreversibly. Only use in development or staging environments!

### 14.11 Checklist Before Prompting the Agent

Use this checklist to verify your worksheet is complete before handing it to the agent:

- [ ] **Roles:** All admin, studio, and employee profiles listed with name + email
- [ ] **Company:** Company name, address, bank details provided
- [ ] **App Settings:** Tax rate, quotation prefix, validity days provided
- [ ] **Storage Tiers:** All tiers listed with name + size + active/default flags
- [ ] **Categories:** All project categories listed with display order
- [ ] **Quotation Sections:** Section names and display order provided
- [ ] **Project Types:** Each type has name, category, icon, and delivery config
- [ ] **Folder Templates:** Each project type has at least one template with folder tree
- [ ] **Service Packages:** Each package has:
  - [ ] Name, description, category, active flag
  - [ ] At least one project config (linking type + template + storage)
  - [ ] At least one line item (description + unit + rate + quantity)
  - [ ] Terms and GST config
- [ ] **Cross-references are consistent:** Category names used in project types match Section B, tier names in packages match Section A, etc.

---

> **💡 Pro Tip:** The more complete and specific your worksheet, the better the seed function. Don't leave fields as "TBD" — the agent needs actual values. If you're unsure about pricing, provide your best estimate and note "approximate" — you can always adjust later.
