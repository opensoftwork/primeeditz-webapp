# 3. Account Creation Flows

[← Back to Index](./README.md) | [← Previous: Roles](./02-roles.md) | [Next: Dashboards →](./04-dashboards.md)

---

## 3.1 Account Creation Summary

| Role         | How Account is Created                                     | Approval Needed? |
| ------------ | ---------------------------------------------------------- | :--------------: |
| **Admin**    | First admin: setup wizard. Others: Admin promotes Employee |        —         |
| **Employee** | Admin creates account                                      |        —         |
| **Client**   | Self-registration                                          |  ❌ (immediate)  |

---

## 3.2 Client Registration (Self-Service)

### Flow Diagram

```
Landing Page
    │
    ▼
"Sign Up" Button
    │
    ▼
┌─────────────────────────────────────────┐
│ Sign Up Form                            │
├─────────────────────────────────────────┤
│ Email: ________________                 │
│ Password: ______________                │
│ Confirm: _______________                │
│                                         │
│ [Sign Up] [or continue with Google]     │
└─────────────────────────────────────────┘
    │
    ▼
Email Verification (if email/password)
    │
    ▼
┌─────────────────────────────────────────┐
│ Complete Your Business Profile          │
├─────────────────────────────────────────┤
│                                         │
│ Business Name*: ABC Photos              │
│ Business Type: Photography Studio ▼     │
│ Contact Person: Ravi Kumar              │
│ Phone*: 9876543210                      │
│ GST Number: 29ABCDE1234F1Z5             │
│ Address: 123 MG Road, Bangalore         │
│                                         │
│ [Complete Profile]                      │
└─────────────────────────────────────────┘
    │
    ▼
✅ Account Active — Client Dashboard
```

### Form Fields

| Field          | Required | Notes                                  |
| -------------- | :------: | -------------------------------------- |
| Business Name  |    ✅    | Studio/agency name                     |
| Business Type  |    ❌    | Photography Studio, Video Agency, etc. |
| Contact Person |    ❌    | Primary contact name                   |
| Phone          |    ✅    | For communication                      |
| GST Number     |    ❌    | For invoicing                          |
| Address        |    ❌    | Business address                       |

### Important Notes

- No approval needed — client is immediately active
- Business profile is required before creating projects
- Can update profile later from settings

---

## 3.3 Employee Account Creation (Admin Only)

### Flow Diagram

```
Admin Dashboard
    │
    ▼
Settings → Team Management
    │
    ▼
[+ Add Employee] Button
    │
    ▼
┌─────────────────────────────────────────┐
│ Add New Employee                        │
├─────────────────────────────────────────┤
│                                         │
│ Full Name*: Rahul Sharma                │
│ Email*: rahul@studio.com                │
│ Phone: 9876543210                       │
│                                         │
│ Primary Skills:                         │
│ ☑️ Color Grading                        │
│ ☑️ Photo Editing                        │
│ ☐ Video Editing                         │
│ ☐ Album Design                          │
│ ☐ Motion Graphics                       │
│                                         │
│ [Create Account]                        │
└─────────────────────────────────────────┘
    │
    ▼
System generates temporary password
    │
    ▼
Email sent to employee with credentials
    │
    ▼
┌─────────────────────────────────────────┐
│ 📧 Email to Rahul                       │
├─────────────────────────────────────────┤
│ Welcome to PrimeEditz!                  │
│                                         │
│ Your account has been created.          │
│                                         │
│ Email: rahul@studio.com                 │
│ Temporary Password: ********            │
│                                         │
│ Please login and change your password.  │
│                                         │
│ [Login to PrimeEditz]                   │
└─────────────────────────────────────────┘
```

### Employee First Login

```
Employee clicks email link
    │
    ▼
Login with temporary password
    │
    ▼
┌─────────────────────────────────────────┐
│ Set Your Password                       │
├─────────────────────────────────────────┤
│                                         │
│ New Password: ______________            │
│ Confirm Password: __________            │
│                                         │
│ [Set Password]                          │
└─────────────────────────────────────────┘
    │
    ▼
✅ Account Ready — Employee Dashboard
```

### Key Points

- Employees CANNOT self-register
- Admin creates all employee accounts
- Temporary password must be changed on first login
- Skills can be updated later

---

## 3.4 First Admin Setup (Initial Setup)

### Flow Diagram

```
Fresh installation
    │
    ▼
Visit PrimeEditz URL
    │
    ▼
┌─────────────────────────────────────────┐
│ Welcome to PrimeEditz! 🎉               │
│ Let's set up your post-production house │
├─────────────────────────────────────────┤
│                                         │
│ Step 1 of 3: Your Account               │
│                                         │
│ Full Name*: Life-design                 │
│ Email*: admin@primeeditz.com            │
│ Password*: ______________               │
│ Confirm Password*: __________           │
│                                         │
│ [Continue →]                            │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 2 of 3: Business Details           │
├─────────────────────────────────────────┤
│                                         │
│ Business Name*: PrimeEditz Studio       │
│ Business Type: Post-Production House    │
│ Phone: 9876543210                       │
│ Address: Bangalore, India               │
│                                         │
│ [← Back] [Continue →]                   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 3 of 3: Quick Settings             │
├─────────────────────────────────────────┤
│                                         │
│ Default Currency: INR (₹) ▼             │
│ Default Tax Rate: 18 %                  │
│                                         │
│ Would you like to:                      │
│ ☑️ Load sample project types            │
│ ☑️ Load sample quotation templates      │
│ ☑️ Load sample storage tiers            │
│                                         │
│ [← Back] [Complete Setup ✓]             │
└─────────────────────────────────────────┘
    │
    ▼
✅ Setup Complete — Admin Dashboard
   (with sample data loaded if selected)
```

---

## 3.5 Promoting Employee to Admin

### Flow Diagram

```
Admin Dashboard
    │
    ▼
Settings → Team Management
    │
    ▼
Find employee (e.g., "Priya")
    │
    ▼
Click [•••] → Promote to Admin
    │
    ▼
┌─────────────────────────────────────────┐
│ ⚠️ Promote to Admin?                    │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to promote        │
│ "Priya" to Admin?                       │
│                                         │
│ This will give them:                    │
│ • Full access to all projects           │
│ • Ability to manage employees           │
│ • Ability to configure system           │
│ • Access to billing and quotations      │
│                                         │
│ [Cancel] [Promote to Admin]             │
└─────────────────────────────────────────┘
    │
    ▼
✅ Priya is now an Admin
```

### Key Points

- Only existing Admins can promote
- Promotion is immediate
- No approval workflow
- Cannot demote unless deactivating

---

## 3.6 Summary Table

| Scenario         | Who Creates    | Process                | First Login                 |
| ---------------- | -------------- | ---------------------- | --------------------------- |
| First Admin      | System         | Setup wizard           | N/A (creating during setup) |
| Additional Admin | Existing Admin | Promote Employee       | Already has login           |
| Employee         | Admin          | Create + temp password | Change password             |
| Client           | Self           | Sign up + profile      | N/A (immediate)             |

---

[Next: Dashboards →](./04-dashboards.md)
