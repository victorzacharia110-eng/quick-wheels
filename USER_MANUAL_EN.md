# QuickWheels User Manual

**Version:** 1.0  
**Platform:** [https://quickwheels.online](https://quickwheels.online)  
**API:** [https://api.quickwheel.online](https://api.quickwheel.online)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Registration & Login](#2-registration--login)
3. [Owner Dashboard](#3-owner-dashboard)
4. [Managing Employees](#4-managing-employees)
5. [Managing Vehicles](#5-managing-vehicles)
6. [Managing Technicians](#6-managing-technicians)
6a. [Maintenance Reports (Owner View)](#6a-maintenance-reports-owner-view)
6b. [Owner Reports (Custom Inspection Reports)](#6b-owner-reports-custom-inspection-reports)
6c. [Public Business Pages](#6c-public-business-pages)
7. [Contracts](#7-contracts)
8. [Payments](#8-payments)
9. [GPS Tracking](#9-gps-tracking)
10. [AI Document Analysis](#10-ai-document-analysis)
11. [Employee Document Management](#11-employee-document-management)
12. [Site Content Management](#12-site-content-management)
13. [Messaging](#13-messaging)
14. [Employee Portal](#14-employee-portal)
15. [Technician Portal](#15-technician-portal)
16. [Customer Portal](#16-customer-portal)
17. [Settings](#17-settings)
17a. [Superadmin Panel](#17a-superadmin-panel)
18. [Language Support](#18-language-support)
19. [Troubleshooting](#19-troubleshooting)

---

## 1. Getting Started

QuickWheels is a fleet management and vehicle rental platform that connects business owners, employees (drivers), technicians, and customers. The platform supports:

- **Fleet management** — Track and manage your vehicles
- **Employee management** — Manage drivers and their documents
- **Contract management** — Create, sign, and track rental contracts
- **Payment processing** — Accept payments via mobile money and bank transfers
- **GPS tracking** — Real-time vehicle location tracking
- **AI-powered analysis** — Automatic contract and document analysis using Google Gemini AI
- **Maintenance tracking** — Schedule and monitor vehicle maintenance
- **Customer bookings** — Allow customers to book rides and make payments

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Mobile phone (for mobile money payments)

---

## 2. Registration & Login

### Creating an Account

1. Visit [https://quickwheels.online](https://quickwheels.online)
2. Click **"Register"** in the navigation bar
3. Fill in your details:
   - **Name** — Your full name
   - **Phone** — Your phone number (used for login)
   - **Email** — Your email address
   - **Password** — A secure password
4. Click **"Register"**

### Logging In

1. Click **"Login"** in the navigation bar
2. Enter your phone number and password
3. Click **"Login"**

### Supported Languages

QuickWheels supports 15 languages. You can switch languages from the language selector in the navigation bar:

English, Kiswahili, Français, Español, Português, العربية, 中文, हिन्दी, Русский, 日本語, Deutsch, Italiano, 한국어, Türkçe, Tiếng Việt

---

## 3. Owner Dashboard

The Owner Dashboard is your central control panel. After logging in as a business owner, you'll see:

### Dashboard Overview

- **Total Vehicles** — Number of vehicles in your fleet
- **Active Employees** — Number of active drivers
- **Total Revenue** — Revenue earned across all contracts
- **Recent Bookings** — Latest customer bookings
- **Revenue Chart** — Monthly revenue trend
- **Vehicle Performance** — Earnings per vehicle

### Navigation Menu

| Section | Description |
|---------|-------------|
| Dashboard | Overview and statistics |
| Vehicles | Manage your fleet |
| Employees | Manage drivers |
| Technicians | Manage mechanics |
| Contracts | Rental agreements |
| Payments | Payment tracking |
| GPS Tracking | Real-time vehicle locations |
| Site Content | Manage website content |
| Owner Reports | Custom inspection & audit reports |
| Messages | Internal messaging |
| Settings | Account settings |

---

## 4. Managing Employees

### Adding an Employee

1. Go to **Employees** from the sidebar
2. Click **"Add Employee"**
3. Fill in the required information:
   - **Name** — Employee's full name
   - **Phone** — Contact number
   - **Email** — Email address
   - **Password** — Login password (given to the employee)
   - **Department** — e.g., Operations, Logistics
   - **Position** — e.g., Driver, Manager
   - **Salary** — Monthly salary
   - **Shift** — Day or Night shift
4. Click **"Create"**

### Assigning a Vehicle

1. Click the **vehicle icon** on an employee card
2. Select an available vehicle from the dropdown
3. Click **"Assign"**

### Employee Status

- **Active** — Employee can log in and access their portal
- **Inactive** — Employee account is disabled

Toggle status by clicking the status button on the employee card.

### Managing Employee Documents

See [Section 11](#11-employee-document-management) for detailed document management.

---

## 5. Managing Vehicles

### Adding a Vehicle

1. Go to **Vehicles** from the sidebar
2. Click **"Add Vehicle"**
3. Fill in vehicle details:
   - **Make/Brand** — e.g., Toyota, Honda
   - **Model** — e.g., Corolla, Civic
   - **Year** — Manufacturing year
   - **License Plate** — Vehicle registration number
   - **Color** — Vehicle color
   - **Type** — Sedan, SUV, Truck, etc.
   - **Daily Rate** — Price per day for rental
   - **Status** — Available, Rented, Maintenance
4. Click **"Add"**

### Vehicle Statuses

| Status | Meaning |
|--------|---------|
| Available | Ready for rental |
| Rented | Currently under contract |
| Maintenance | Under repair/servicing |
| Inactive | Removed from fleet |

### Scheduling Maintenance

1. Click the **maintenance icon** on a vehicle card
2. Set the service date
3. Add notes about the required service
4. Click **"Schedule"**

---

## 6. Managing Technicians

### Adding a Technician

1. Go to **Technicians** from the sidebar
2. Click **"Add Technician"**
3. Fill in their details:
   - **Name** — Technician's full name
   - **Phone** — Contact number
   - **Email** — Email address
   - **Specialty** — Area of expertise (e.g., Engine, Brakes, Electrical)
   - **Can Drive** — Toggle if the technician can also drive vehicles
4. Click **"Create"**

### Technician Actions

- **View assigned maintenance reports**
- **Create maintenance reports** with itemized parts and labor costs
- **Submit reports** for owner review and approval
- **Track report status** through the workflow pipeline

### Default Passwords

When a technician is created, their default password is their **full name in uppercase with no spaces** (e.g., "KHAMISIALLY"). Share this password securely and advise them to change it after first login.

### Restoring & Deleting Technicians

- **Restore** — Restore a previously deleted technician and their account
- **Force Delete** — Permanently remove the technician record (user account preserved if they can also drive)

---

## 6a. Maintenance Reports (Owner View)

Owners can view and manage all maintenance reports submitted by technicians.

### Viewing Reports

1. Go to **Maintenance** from the sidebar
2. Browse the list of all reports with status badges
3. Use the **search bar** to filter by report number, vehicle, or technician
4. Use the **status filter** to view specific workflow stages
5. Click any row to view full details

### Report Details

The report detail page shows:
- **Workflow Progress Bar** — 6-step visual pipeline
- **Vehicle Information** — Name, type, color, chassis number
- **Technician Info** — Who submitted the report
- **Priority & Costs** — Priority level, estimated cost, actual cost, mileage
- **Description & Issues** — Detailed notes from the technician
- **Parts & Services** — Itemized list with costs
- **Technician Signature** — Digital signature from the submitting technician

### Approving Maintenance

1. **Review** the report details and items
2. Click **"Confirm Service"** to approve the maintenance
3. Click **"Verify & Sign"** to sign and finalize
4. Draw your signature on the canvas
5. Click **"Verify & Sign"** to submit
6. An animated sending indicator shows the report being sent back to the technician
7. The report auto-completes after 2 minutes

### Owner Signature

When you verify a report, your digital signature is recorded with a timestamp. The technician can see your signature on their report view, confirming your approval.

---

## 6b. Owner Reports (Custom Inspection Reports)

Owner Reports allow you to create custom inspection and audit reports with tailored questions. Unlike Maintenance Reports (which technicians submit), Owner Reports are created by you and can be filled by you or assigned to a technician.

### Creating an Owner Report

1. Go to **Owner Reports** from the sidebar
2. Click **"Create Report"**
3. Fill in report details:
   - **Title** — Brief description (e.g., "Weekly Vehicle Inspection")
   - **Vehicle** — Optionally link to a specific vehicle
   - **Technician** — Optionally assign a technician to fill answers
   - **Description** — Optional notes about the report
4. Add questions using the **"Add Question"** button
5. For each question, configure:
   - **Question Text** — The inspection question
   - **Answer Type** — Short Text, Long Text, Number, Dropdown, or Yes/No
   - **Options** — For dropdown questions, enter comma-separated options
   - **Required** — Toggle if the question must be answered
6. Click **"Create Report"**

### Answering Questions

**As Owner (Self-fill):**
1. Open the report detail page
2. Click **"Fill Answers Yourself"**
3. Fill in each question's answer
4. Click **"Save Answers"**

**As Technician (Assigned):**
1. Log in as the assigned technician
2. Open the report from the technician dashboard
3. Fill in answers and add notes
4. Sign with your digital signature
5. Click **"Submit Report"**

### Owner Report Workflow

Reports follow a structured approval pipeline:

```
Draft → Pending Technician → Submitted → Reviewed → Verified → Completed
```

| Step | Who | Description |
|------|-----|-------------|
| Draft | Owner | Report created with questions, not yet submitted |
| Pending Technician | System | Waiting for technician to fill answers |
| Submitted | Technician | Technician has answered and signed |
| Reviewed | Owner | Owner has reviewed all answers |
| Verified | Owner | Owner signs to verify the report |
| Completed | System | Auto-completed 2 minutes after verification |

### Exporting Reports

You can export any report in three formats:

1. Open the report detail page
2. Click the export button for your preferred format:
   - **PDF** — Professional document with styled header, metadata, Q&A table, and both signatures
   - **DOCX** — Word document with the same content structure
   - **XLSX** — Spreadsheet with two sheets: Report Info and Questions & Answers
3. The file downloads automatically

### Owner vs Technician Signatures

- **Technician Signature** — Recorded when the technician submits their answers
- **Owner Signature** — Recorded when the owner verifies the report
- Both signatures appear on exported documents

---

## 6c. Public Business Pages

QuickWheels provides public business pages for each verified owner, allowing potential customers to browse your fleet without logging in.

### How It Works

- Each verified owner gets a unique business page at `/business/{slug}`
- The slug is auto-generated from your business name (e.g., "Victor Zacharia's Business" becomes `victor-zacharia-s-business`)
- The homepage at [https://quickwheels.online](https://quickwheels.online) shows a directory of all verified businesses

### Business Page Features

- **Business Info** — Name, description, phone, email, address
- **Verification Badge** — Shows the business is verified by the platform
- **Vehicle Listings** — Browse all vehicles in the business's fleet
- **Contact Options** — Call or email the business directly

### For Business Owners

Your public business page is automatically created when your account is verified. The URL is based on your business name. Share this link with potential customers to showcase your fleet.

To view your business page:
1. Go to **Settings** from the sidebar
2. Your business slug is displayed in the business details section
3. Or visit [https://quickwheels.online](https://quickwheels.online) and click your business in the directory

---

## 7. Contracts

### Creating a Contract

1. Go to **Contracts** from the sidebar
2. Click **"Create Contract"**
3. Select a **template** (Rental Agreement, Hire Purchase, etc.)
4. Fill in contract details:
   - **Driver/Employee** — Select from your employees
   - **Vehicle** — Select the vehicle
   - **Start Date** — Contract start date
   - **End Date** — Contract end date
   - **Monthly Payment** — agreed payment amount
   - **Total Amount** — Total contract value
   - **Deposit** — Upfront payment
   - **Late Fee** — Penalty per day for late payment
5. Review and **Save**

### Contract Lifecycle

```
Draft → Sent → Signed → Active → Completed
                      ↘ Cancelled
```

1. **Draft** — Contract created but not sent
2. **Sent** — Contract sent to the driver for signing
3. **Signed** — Both parties have signed
4. **Active** — Contract is in effect
5. **Completed** — Contract term has ended
6. **Cancelled** — Contract terminated early

### Signing Contracts

- **Owner signs** — Click the sign button in the contract details
- **Driver signs** — Driver signs from their Employee Portal
- Digital signatures are captured with timestamps

### Contract Documents

You can attach documents to contracts:
1. Open a contract
2. Click **"Documents"**
3. Upload supporting files (contracts, receipts, etc.)
4. Documents are stored securely on S3

---

## 8. Payments

### Recording a Payment

1. Go to **Payments** from the sidebar
2. Click **"Record Payment"**
3. Select the contract
4. Enter payment details:
   - **Amount** — Payment amount
   - **Method** — M-Pesa, Airtel Money, Mixx by YAS, HaloPesa, NMB Bank, CRDB Bank, NBC Bank
   - **Reference** — Transaction reference number
5. Click **"Submit"**

### Payment Statuses

| Status | Meaning |
|--------|---------|
| Pending | Payment awaiting verification |
| Approved | Payment confirmed and recorded |
| Rejected | Payment verification failed |

### Viewing Payment Statistics

The Payments dashboard shows:
- Total payments received
- Payments by method (mobile money vs. bank)
- Monthly payment trends
- Outstanding balances

---

## 9. GPS Tracking

### Viewing Vehicle Locations

1. Go to **GPS Tracking** from the sidebar
2. The map shows all vehicle locations in real-time
3. Click a vehicle marker to see:
   - Vehicle name and plate number
   - Last updated timestamp
   - Current status

### Vehicle History

1. Click on a vehicle on the map
2. Click **"View History"**
3. See the route history with timestamps

### How GPS Updates Work

- Drivers update their location through their Employee Portal
- Location data includes latitude, longitude, speed, and timestamp
- History is stored for each vehicle

---

## 10. AI Document Analysis

QuickWheels uses **Google Gemini AI** to automatically analyze documents. This feature works with contracts and identification documents.

### How It Works

1. Upload a document (see [Section 11](#11-employee-document-management))
2. Click the **robot icon (AI Analyze)** on the document card
3. Wait for the AI to process the document
4. View the analysis results

### For Contracts

The AI extracts:
- **Contract Type** — Rental or hire purchase
- **Parties** — Owner and driver names
- **Vehicle Information** — Make, model, plate number
- **Contract Terms** — Dates, payments, duration
- **Conditions** — Key obligations
- **Restrictions** — Usage limitations
- **Insurance** — Coverage details

### For Identification Documents

The AI extracts:
- **Personal Information** — Full name, ID number, date of birth, gender, nationality
- **Document Information** — Issue date, expiry date, issuing authority
- **License Information** — License class, valid until, allowed vehicle types

### Supported File Types

- **Images** — JPG, PNG (sent directly to AI vision)
- **PDF** — Sent natively to Gemini for analysis
- **Word Documents** — .docx files with text extraction
- **Other** — Falls back to binary analysis

### Error Messages

| Message | Meaning |
|---------|---------|
| "AI analysis is temporarily unavailable due to high demand" | Gemini API quota exceeded. Try again later. |
| "Could not extract text from document" | Document may be scanned image with no readable text |
| "AI analysis supports PDF, image, and Word documents" | File type not supported |

---

## 11. Employee Document Management

### Uploading Documents

1. Go to **Employees** and click on an employee
2. Click the **documents icon** to open the document panel
3. Click **"Upload Document"** or drag a file into the upload zone
4. Fill in document details:
   - **Document Type** — Contract or Driver Identification
   - **Title** — e.g., "Driving License", "NIDA Copy"
   - **Expiry Date** — When the document expires (optional)
   - **Description** — Additional notes (optional)
5. Click **"Upload Document"**

### Document Types

| Type | Description |
|------|-------------|
| Contract | Rental agreements, hire purchase contracts |
| Driver Identification | Driving license, national ID, passport |

### Document Actions

| Action | Icon | Description |
|--------|------|-------------|
| AI Analyze | Robot | Analyze document with AI |
| Verify | Shield | Mark document as verified |
| View | Eye | Open document in new tab |
| Delete | Trash | Remove document |

### Document Expiry Tracking

- Documents with expiry dates show a countdown
- **Red warning** — Document expired
- **Yellow warning** — Expires within 30 days
- **Green badge** — Document verified

---

## 12. Site Content Management

### Editing Website Content

1. Go to **Site Content** from the sidebar
2. Browse content sections:
   - Hero Section — Homepage banner
   - About Section — Company description
   - Services Section — Services offered
   - Contact Section — Contact information
3. Click **"Edit"** on any section
4. Modify text, images, or settings
5. Click **"Save"**

### Content Sections

Each section supports:
- **Headings** — Section titles
- **Descriptions** — Body text
- **Images** — Upload images for the section
- **Visibility** — Show/hide sections
- **Order** — Drag to reorder sections

---

## 13. Messaging

### Sending Messages

1. Click **"Messages"** in the sidebar
2. Select a contact from the list
3. Type your message
4. Click **"Send"** or press Enter

### Features

- **Real-time messaging** between owners, employees, and technicians
- **Unread message badges** — See unread count on the icon
- **Message history** — All messages are saved
- **Contact list** — See all team members

---

## 14. Employee Portal

Employees (drivers) have their own portal with limited access.

### Employee Dashboard

- **My Contract** — View active contract details
- **My Payments** — Payment history and upcoming payments
- **My Rides** — Ride history and bookings
- **Profile** — Update personal information

### Employee Features

- View assigned vehicle details
- Update GPS location for tracking
- Submit maintenance reports
- View and sign contracts
- Communicate with owner via messages

---

## 15. Technician Portal

Technicians have a dedicated portal for maintenance management.

### Technician Dashboard

- **Assigned Reports** — Maintenance tasks assigned to you
- **Report History** — Past completed reports
- **Dashboard Stats** — Total reports, pending, completed counts

### Creating Maintenance Reports

1. Go to **Create Report**
2. Select the vehicle
3. Fill in report details:
   - **Title** — Brief description of the issue
   - **Priority** — Low, Medium, High, or Critical
   - **Description** — Detailed description of the maintenance issue
   - **Diagnosed Issues** — Problems identified during inspection
   - **Mileage** — Current vehicle mileage
   - **Estimated Cost** — Estimated repair cost
4. Add maintenance items (parts and services):
   - **Part Name** — What was repaired/replaced
   - **Category** — Engine, brake, tire, electrical, etc.
   - **Cost** — Part and labor cost
   - **Quantity** — Number of items
   - **Required** — Mark if essential for contract compliance
5. **Sign** the report with your digital signature
6. Submit the report

### Maintenance Workflow

Reports follow a structured approval pipeline:

```
Submitted → Viewed → Processing → Confirmed → Verified → Completed
```

| Step | Who | Description |
|------|-----|-------------|
| Submitted | Technician | Report submitted with technician's signature |
| Viewed | Owner | Owner has opened and reviewed the report |
| Processing | System | Auto-transitioned 1 minute after being viewed |
| Confirmed | Owner | Owner confirms the service is approved |
| Verified | Owner | Owner signs to verify work is satisfactory |
| Completed | System | Auto-transitioned 2 minutes after verification |

### What Technicians See

- **Workflow Progress Bar** — Visual indicator of report status
- **Owner Signature** — When the owner verifies, their signature appears on the report
- **Status Updates** — Real-time status as the owner reviews

---

## 16. Customer Portal

Customers can book rides and make payments.

### Customer Features

- **Browse Vehicles** — See available vehicles
- **Book a Ride** — Request a ride with date and destination
- **Nearby Drivers** — Find available drivers nearby
- **Make Payments** — Pay via mobile money or bank transfer
- **My Rides** — View ride history
- **Leave Reviews** — Rate vehicles and drivers

### Booking a Ride

1. Go to **Ride Booking**
2. Select a vehicle and driver
3. Enter pickup and destination
4. Choose date and time
5. Confirm booking

### Making a Payment

1. Go to **Payments**
2. Select a pending payment
3. Choose payment method:
   - **Mobile Money** — M-Pesa, Airtel Money, Mixx, HaloPesa
   - **Bank Transfer** — NMB, CRDB, NBC
4. Enter the amount and confirm
5. Payment status updates automatically

---

## 17. Settings

### Profile Settings

1. Go to **Settings** from the sidebar
2. Update your profile information:
   - Name
   - Phone number
   - Email
   - Profile photo
3. Click **"Save Changes"**

### Changing Password

1. Go to **Settings**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click **"Update"**

### Force Password Change

When an owner logs in for the first time or after a password reset, they will be prompted to change their password before accessing the dashboard.

---

## 17a. Superadmin Panel

Superadmins have full system access to manage all owners and monitor the platform.

### Dashboard

- **Total Owners** — Number of registered business owners
- **Total Users** — All users across all roles
- **Revenue Statistics** — Platform-wide earnings
- **Recent Activity** — Latest registrations and actions

### Managing Owners

1. Go to **Manage Owners** from the sidebar
2. View all registered owners with their business details
3. **Toggle Verification** — Verify or unverify an owner's account
4. **Toggle Status** — Activate or deactivate an owner
5. **Reset Password** — Reset an owner's password to their name in uppercase (e.g., "VICTORZACHARIA")
6. **Edit Owner** — Update owner name, email, phone, or business details
7. **Delete Owner** — Soft-delete an owner (can be restored)

### Cleanup Tool

The Cleanup tool helps manage soft-deleted records:

1. Go to **Cleanup** from the sidebar
2. View summary cards showing deleted owners, employees, and users
3. Browse per-type tables of deleted records
4. **Force Delete** — Permanently remove a single record
5. **Purge All** — Permanently remove all records of a type

> **Safety:** The system will not delete a user account if other active records (owners, employees) still reference it.

---

## 18. Language Support

QuickWheels is available in 15 languages:

| Language | Code |
|----------|------|
| English | en |
| Kiswahili | sw |
| Français | fr |
| Español | es |
| Português | pt |
| العربية | ar |
| 中文 | zh |
| हिन्दी | hi |
| Русский | ru |
| 日本語 | ja |
| Deutsch | de |
| Italiano | it |
| 한국어 | ko |
| Türkçe | tr |
| Tiếng Việt | vi |

To change language:
1. Click the language selector in the top navigation bar
2. Select your preferred language
3. The entire interface updates immediately

---

## 19. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't log in | Check phone number and password. Ensure caps lock is off. |
| Documents not uploading | Check file size (max 20MB). Use supported formats (PDF, JPG, PNG, DOC). |
| AI analysis not working | May be temporarily unavailable due to API limits. Try again later. |
| GPS not updating | Ensure location services are enabled on your device. |
| Payment not showing | Payments may need approval. Check with the owner. |
| Page not loading | Clear browser cache. Try a different browser. |
| Translation not working | Refresh the page. Select language again from the selector. |

### Getting Help

- **Contact Support** — Use the messaging system to contact the business owner
- **Report Issues** — Report technical issues through the contact page

---

## Quick Reference — Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Navigate to Dashboard | Click "Dashboard" in sidebar |
| Open Messages | Click "Messages" in sidebar |
| Switch Language | Use language selector in navbar |
| Close Modal | Click outside modal or press Escape |

---

*This manual is for QuickWheels v1.0. For updates, visit [https://quickwheels.online](https://quickwheels.online)*
