# QuickWheels — Project Documentation

**Version:** 1.0  
**Last Updated:** July 2026  
**Author:** Victor Zacharia

---

## 1. Project Overview

QuickWheels is a full-stack fleet management and vehicle rental platform built with **Vue 3** (frontend) and **Laravel 11** (backend API). It connects business owners, employees (drivers), technicians, and customers in a unified platform for vehicle rental operations.

### Live URLs

| Service | URL |
|---------|-----|
| Frontend (SPA) | [https://quickwheels.online](https://quickwheels.online) |
| Backend API | [https://api.quickwheel.online](https://api.quickwheel.online) |
| Laravel Cloud | [https://quickwheels-production-r1axss.laravel.cloud](https://quickwheels-production-r1axss.laravel.cloud) |

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.5.x | UI framework |
| Vue Router | 5.x | Client-side routing |
| Pinia | 3.x | State management |
| Vue I18n | 11.x | Internationalization (15 languages) |
| Axios | 1.18.x | HTTP client |
| Vite | latest | Build tool |
| FontAwesome | 7.x | Icons |
| Pinia Plugin Persistedstate | 4.x | State persistence |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| PHP | 8.3+ | Runtime |
| Laravel | 13.x | Framework |
| Laravel PHPWord | 1.x | DOCX export |
| PhpSpreadsheet | 3.x | XLSX export |
| Laravel Sanctum | 4.x | API authentication |
| Laravel DomPDF | 3.x | PDF generation |
| Flysystem S3 | 3.x | S3 file storage |
| MySQL | latest | Database |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Laravel Cloud | Backend hosting |
| Cloudflare R2 | Object storage (S3-compatible) |
| Cloudflare | CDN & DNS proxy |
| Google Gemini AI | Document analysis (2.0 Flash) |
| ClickPesa | Mobile money & bank payments |
| PhpOffice DomPDF | PDF generation for owner reports |
| PhpOffice PHPWord | DOCX generation for owner reports |
| PhpOffice PhpSpreadsheet | XLSX generation for owner reports |
| Vercel / Cloudflare Pages | Frontend hosting |

---

## 3. Architecture

```
quickwheels.online (Frontend SPA)
        │
        │ API calls (axios)
        ▼
api.quickwheel.online (Cloudflare Proxy)
        │
        │ Reverse proxy
        ▼
quickwheels-production-r1axss.laravel.cloud (Laravel API)
        │
        ├── MySQL Database (Laravel Cloud)
        ├── Cloudflare R2 (File Storage)
        ├── Google Gemini AI (Document Analysis)
        └── ClickPesa API (Payment Processing)
```

### Deployment Flow

- **Frontend**: Auto-deploys from `main` branch via git push
- **Backend**: Manual deploy via `cloud deploy quickwheels production -n`

---

## 4. Directory Structure

### Frontend (`quick-wheels/`)

```
src/
├── assets/              # Static assets
├── composables/         # Vue composables
│   └── api.js           # Axios instance configuration
├── locales/             # i18n translation files (15 languages)
│   ├── en.json          # English
│   ├── sw.json          # Kiswahili
│   ├── fr.json          # French
│   ├── es.json          # Spanish
│   ├── pt.json          # Portuguese
│   ├── ar.json          # Arabic
│   ├── zh.json          # Chinese
│   ├── hi.json          # Hindi
│   ├── ru.json          # Russian
│   ├── ja.json          # Japanese
│   ├── de.json          # German
│   ├── it.json          # Italian
│   ├── ko.json          # Korean
│   ├── tr.json          # Turkish
│   └── vi.json          # Vietnamese
├── router/              # Vue Router configuration
│   └── index.js         # Route definitions
├── stores/              # Pinia stores
│   ├── auth.js          # Authentication state
│   ├── vehicles.js      # Vehicle management
│   ├── employees.js     # Employee management
│   ├── contracts.js     # Contract management
│   ├── payments.js      # Payment tracking
│   ├── messages.js      # Messaging
│   ├── maintenance.js   # Maintenance tracking
│   └── siteContent.js   # CMS content
├── views/               # Page components
│   ├── auth/            # Login, Register
│   ├── owner/           # Owner dashboard pages
│   ├── employee/        # Employee portal pages
│   ├── technician/      # Technician portal pages
│   ├── customer/        # Customer portal pages
│   └── superadmin/      # Super admin pages
├── App.vue              # Root component
└── main.js              # Entry point
```

### Backend (`QuickWheels/`)

```
app/
├── Http/
│   └── Controllers/
│       └── Api/
│           ├── Auth/              # Authentication
│           │   └── AuthController
│           ├── Owner/             # Owner-specific endpoints
│           │   ├── OwnerDashboardController
│           │   ├── VehicleController
│           │   ├── EmployeeDashboardController
│           │   ├── TechnicianController
│           │   ├── DocumentController
│           │   ├── OwnerReportController  # Owner inspection reports
│           │   ├── OwnerReportExport      # Excel export class
│           │   └── ContractAnalysisController
│           ├── Employee/          # Employee-specific endpoints
│           │   ├── EmployeeDashboardController
│           │   ├── BookingController
│           │   ├── VehicleController
│           │   ├── MaintenanceController
│           │   └── CustomerController
│           ├── Technician/        # Technician-specific endpoints
│           │   └── MaintenanceController
│           ├── Customer/          # Customer-specific endpoints
│           │   ├── BookingController
│           │   ├── PaymentController
│           │   ├── ReviewController
│           │   └── DashboardController
│           ├── Contracts/         # Contract management
│           │   ├── ContractController
│           │   └── ContractTemplateController
│           ├── Payments/          # Payment processing
│           │   └── PaymentController
│           ├── GpsController      # GPS tracking
│           ├── MessageController  # Messaging
│           ├── ContractPdfController  # PDF generation
│           ├── SiteContentController  # CMS
│           ├── Public/              # Public endpoints (no auth)
│           │   └── PublicController  # Business listing & detail
│           └── SuperAdminController   # Super admin
├── Models/               # Eloquent models (14 models)
├── Services/             # Business logic services
│   ├── GeminiService     # AI document analysis
│   └── ClickPesaService  # Payment integration
└── middleware/            # Request middleware
    └── EnsureOwner        # Owner role verification

routes/
└── api.php               # All API routes (325 lines)

database/
└── migrations/           # 18 migration files
```

---

## 5. Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts (all roles) | id, name, phone, email, password, role |
| `owners` | Business owner profiles | id, user_id, business_name, phone |
| `employees` | Driver/employee profiles | id, owner_id, user_id, vehicle_id, department, position, salary, shift |
| `vehicles` | Fleet vehicles | id, owner_id, make, model, year, plate_number, daily_rate, status |
| `contracts` | Rental agreements | id, owner_id, driver_id, vehicle_id, start_date, end_date, monthly_payment, status |
| `payments` | Payment records | id, contract_id, amount, method, reference, status |
| `bookings` | Customer ride bookings | id, customer_id, vehicle_id, driver_id, pickup, destination, status |
| `maintenances` | Maintenance records | id, vehicle_id, technician_id, type, status, service_date |
| `maintenance_items` | Individual repair items | id, maintenance_id, name, cost, notes |
| `employee_documents` | Employee file uploads | id, employee_id, document_type, file_path, ai_analysis, is_verified |
| `contract_documents` | Contract file uploads | id, contract_id, document_type, file_path, ai_analysis |
| `vehicle_locations` | GPS location history | id, vehicle_id, latitude, longitude, speed, timestamp |
| `messages` | Internal messages | id, sender_id, receiver_id, content, read_at |
| `site_contents` | CMS content | id, section, key, value, type |
| `owner_reports` | Owner inspection/audit reports | id, owner_id, vehicle_id, technician_id, title, description, questions (JSON), status, technician_signature, owner_signature, notes |

### Key Relationships

```
User ──1:1── Owner
User ──1:1── Employee
Owner ──1:N── Vehicle
Owner ──1:N── Employee
Owner ──1:N── Contract
Owner ──1:N── Technician
Owner ──1:N── OwnerReport
OwnerReport ──N:1── Vehicle
OwnerReport ──N:1── Technician
Employee ──N:1── Vehicle (assigned)
Contract ──N:1── Employee (driver)
Contract ──N:1── Vehicle
Contract ──1:N── Payment
Contract ──1:N── ContractDocument
Employee ──1:N── EmployeeDocument
Vehicle ──1:N── VehicleLocation
Vehicle ──1:N── Maintenance
Maintenance ──1:N── MaintenanceItem
Maintenance ──N:1── Technician
```

---

## 6. API Routes Summary

### Authentication (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new account |
| POST | `/login` | Login and get token |
| POST | `/logout` | Revoke token |
| GET | `/user` | Get authenticated user |
| PUT | `/profile` | Update profile |
| POST | `/change-password` | Change password |

### Owner Routes (`/api/owner/`)

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| Dashboard | GET `/dashboard`, `/stats`, `/revenue`, `/chart` | Analytics and stats |
| Vehicles | CRUD + `/status`, `/schedule-service` | Fleet management |
| Employees | CRUD + `/toggle-status`, `/assign-vehicle` | Driver management |
| Documents | CRUD + `/download`, `/verify` | Employee document management |
| AI Analysis | POST `/analyze`, `/analyze-text` | Gemini AI document analysis |
| Technicians | CRUD + `/toggle-status` | Mechanic management |
| Contracts | CRUD + `/sign-owner`, `/activate`, `/complete`, `/cancel` | Contract lifecycle |
| Payments | CRUD + `/approve`, `/reject` | Payment management |
| GPS | POST `/update`, GET `/latest`, `/history`, `/all-latest` | Location tracking |

### Owner Report Routes (`/api/owner/reports/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List reports (paginated, filterable) |
| POST | `/` | Create new report with questions |
| GET | `/{id}` | Get report detail with questions |
| PUT | `/{id}` | Update report (draft only) |
| DELETE | `/{id}` | Delete report (draft only) |
| POST | `/{id}/answer` | Answer a question |
| POST | `/{id}/technician/answer` | Technician answers a question |
| POST | `/{id}/technician/submit` | Technician submits report |
| POST | `/{id}/review` | Owner marks as reviewed |
| POST | `/{id}/verify` | Owner verifies & signs |
| POST | `/{id}/complete` | Mark report as completed |
| POST | `/{id}/cancel` | Cancel report |
| GET | `/stats` | Report statistics |
| GET | `/technicians` | List technicians for dropdown |
| GET | `/{id}/export/pdf` | Export report as PDF |
| GET | `/{id}/export/docx` | Export report as DOCX |
| GET | `/{id}/export/xlsx` | Export report as XLSX |

### Public Routes (`/api/public/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/businesses` | List all verified businesses |
| GET | `/business/{slug}` | Get business detail by slug |
| GET | `/business/{slug}/vehicles` | Get business vehicles |

### Employee Routes (`/api/employee/`)

| Endpoint | Description |
|----------|-------------|
| GET `/dashboard` | Employee dashboard |
| GET/PUT `/bookings` | View and manage bookings |
| GET `/vehicles` | View assigned vehicles |
| CRUD `/maintenance` | Submit maintenance reports |

### Technician Routes (`/api/technician/`)

| Endpoint | Description |
|----------|-------------|
| GET `/dashboard` | Technician dashboard |
| CRUD `/maintenance` | Manage maintenance reports |
| CRUD `/items` | Manage repair items |

### Customer Routes (`/api/customer/`)

| Endpoint | Description |
|----------|-------------|
| GET `/dashboard` | Customer dashboard |
| POST `/bookings` | Create ride booking |
| POST `/request-ride` | Quick ride request |
| GET `/payments` | Payment history |
| POST `/payments/clickpesa/init` | Initiate mobile payment |
| POST `/reviews` | Leave vehicle reviews |

---

## 7. Key Features

### 7.1 Multi-Role Authentication

Four user roles with role-based access control:
- **Owner** — Full access to all management features
- **Employee** — Access to assigned vehicle, bookings, maintenance
- **Technician** — Access to assigned maintenance reports
- **Customer** — Access to bookings, payments, ride history

### 7.2 AI-Powered Document Analysis

Uses **Google Gemini 2.0 Flash** for automatic document analysis:

- **Contract Analysis** — Extracts parties, vehicle info, terms, conditions, insurance
- **Identification Analysis** — Extracts personal info, ID numbers, license details
- **Supported formats** — Images (JPG/PNG), PDF, Word documents (.docx)
- **Process**: File → S3 → Gemini API → Structured JSON → Display

### 7.3 Payment Processing

Integrated with **ClickPesa** for mobile money and bank payments:
- **Mobile Money**: M-Pesa, Airtel Money, Mixx by YAS, HaloPesa
- **Bank Transfer**: NMB, CRDB, NBC
- **Webhook handling** for automatic payment confirmation
- **Manual payment recording** with owner approval

### 7.4 GPS Tracking

Real-time vehicle location tracking:
- Drivers update location via Employee Portal
- Owner views all vehicle locations on a map
- Location history stored per vehicle
- Speed and timestamp tracking

### 7.5 Internationalization (i18n)

Full translation support for 15 languages across the entire UI:
- All user-facing text is translated
- Language persists across sessions
- Instant language switching without page reload

### 7.6 Contract Management

Full contract lifecycle management:
- Template-based contract creation (Rental, Hire Purchase)
- Digital signatures with timestamps
- Payment tracking per contract
- PDF generation with DomPDF
- Contract status tracking (Draft → Sent → Signed → Active → Completed)

### 7.7 Site Content Management

Built-in CMS for managing the public website:
- Editable sections (Hero, About, Services, Contact)
- Image upload support
- Section visibility toggles
- Drag-and-drop reordering

### 7.8 Owner Reports (Custom Inspection Reports)

Owners can create inspection/audit reports with custom questions:

- **Custom Questions** — Text, textarea, number, dropdown, checkbox types
- **Vehicle Assignment** — Reports can be linked to specific vehicles
- **Technician Assignment** — Reports can be assigned to technicians for answers
- **Workflow Pipeline** — Draft → Pending Technician → Submitted → Reviewed → Verified → Completed
- **Digital Signatures** — Technician signs on submission, owner signs on verification
- **Export to PDF/DOCX/XLSX** — Professional documents with styled header, Q&A table, signatures
- **Auto-verification** — Reports auto-complete 2 minutes after owner verification

### 7.9 Multi-Owner Public Business Pages

Each verified owner gets a public business page:

- **Business Directory** — Homepage shows all verified businesses
- **Business Slug** — Each business has a unique URL: `/business/{slug}`
- **Vehicle Listings** — Public visitors can browse the business's fleet
- **Business Info** — Contact details, address, verification badge
- **No Auth Required** — Public pages are accessible without login

### 7.10 Report Export System

Owner reports can be exported in three formats:

- **PDF** — Styled document via DomPDF with header, report metadata, Q&A table, both signatures
- **DOCX** — Word document via PHPWord with same content structure
- **XLSX** — Spreadsheet via PhpSpreadsheet with two sheets: Report Info + Questions & Answers

---

## 8. External Services Configuration

### Google Gemini AI

- **Model**: `gemini-2.0-flash`
- **API Key**: Stored in `GEMINI_API_KEY` env variable
- **Use**: Document analysis (text extraction + structured data)
- **Rate Limits**: Free tier has daily quotas; billing recommended for production

### ClickPesa

- **Base URL**: Configured via `CLICKPESA_BASE_URL`
- **Client ID**: `CLICKPESA_CLIENT_ID`
- **API Key**: `CLICKPESA_API_KEY`
- **Webhook**: `/api/payments/clickpesa/webhook`
- **Supported Methods**: Mobile money + bank transfers

### Cloudflare R2 (S3 Storage)

- **Bucket**: `quickwheels-docs`
- **Disk**: `s3` (configured in Laravel filesystems)
- **Use**: Employee documents, contract documents
- **Public Access**: Yes (for direct URL access)
- **Auto-injected** via Laravel Cloud when bucket is attached to environment

---

## 9. Environment Variables

### Laravel Backend

| Variable | Description |
|----------|-------------|
| `APP_NAME` | Application name |
| `APP_ENV` | Environment (production) |
| `APP_KEY` | Encryption key |
| `APP_DEBUG` | Debug mode (false in production) |
| `APP_URL` | Application URL |
| `DB_CONNECTION` | Database driver (mysql) |
| `DB_DATABASE` | Database name |
| `FILESYSTEM_DISK` | Default disk (s3) |
| `AWS_ACCESS_KEY_ID` | R2 access key |
| `AWS_SECRET_ACCESS_KEY` | R2 secret key |
| `AWS_DEFAULT_REGION` | auto |
| `AWS_BUCKET` | quickwheels-docs |
| `AWS_USE_PATH_STYLE_ENDPOINT` | true |
| `GEMINI_API_KEY` | Google AI API key |
| `CLICKPESA_BASE_URL` | ClickPesa API URL |
| `CLICKPESA_API_KEY` | ClickPesa API key |
| `CLICKPESA_CLIENT_ID` | ClickPesa client ID |

### Vue Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `https://api.quickwheel.online/api`) |
| `VITE_APP_NAME` | Application name |

---

## 10. Development

### Prerequisites

- **PHP** 8.3+
- **Node.js** 18+
- **Composer**
- **MySQL** 8.0+

### Frontend Setup

```bash
cd quick-wheels
npm install
npm run dev       # Development server
npm run build     # Production build
npm run lint      # Lint code
```

### Backend Setup

```bash
cd QuickWheels
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve   # Development server
```

### Deployment

```bash
# Frontend (auto-deploys on git push to main)
git push origin main

# Backend (manual deploy)
cloud deploy quickwheels production -n
```

---

## 11. Security

- **Authentication**: Laravel Sanctum (token-based)
- **Authorization**: Role-based middleware (`ensure.owner`, `auth:sanctum`)
- **File Storage**: S3 with signed URLs
- **CORS**: Configured for `quickwheels.online` and `api.quickwheel.online`
- **Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: deny`
- **Password Hashing**: Bcrypt
- **API Rate Limiting**: Built-in Laravel rate limiting

---

## 12. Changelog

### v1.0 (July 2026)

- Initial release
- Multi-role authentication (Owner, Employee, Technician, Customer)
- Fleet management (CRUD vehicles, status tracking)
- Employee management with document upload
- Contract management with digital signatures
- Payment processing via ClickPesa (mobile money + bank)
- GPS real-time tracking
- AI document analysis via Google Gemini
- Maintenance tracking and reporting
- Internal messaging system
- Site content management (CMS)
- Internationalization (15 languages)
- PDF contract generation
- S3 file storage via Cloudflare R2

### v1.1 (July 2026)

- Owner Reports — Custom inspection/audit reports with questions and workflow
- Report Export — PDF, DOCX, XLSX export with professional formatting
- Public Business Pages — Multi-owner business directory with slug-based URLs
- Owner slug field — Auto-generated from business_name
- Missing locale keys — Added `common.back`, `common.title`, `common.description`, `common.priority`, `common.clear`, `common.deleting` to all 15 locales
- Dark theme UI — Owner report pages now use consistent dark glass-morphism theme
