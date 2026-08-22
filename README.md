# Dayflow — Human Resource Management System (HRMS)

Dayflow is a modern, enterprise-grade Human Resource Management System built on **Next.js 15 App Router**, **TypeScript**, **PostgreSQL**, and **Supabase**.

---

## 1. Unified Architecture & Developer Ownership

Dayflow is built as **ONE integrated backend and shared database**.

### Backend Person 1 (Foundation Owner)
- Overall backend architecture & database design
- Supabase configuration & PostgreSQL baseline
- Authentication & Supabase Auth SSR Bridge
- Users, Roles, Permissions (RBAC) & PostgreSQL Row Level Security (RLS)
- Organization Master (Departments, Job Profiles, Locations)
- Employee Directory & Manager Hierarchy
- Shared API Conventions, Zod validation & Error envelopes
- Immutable Audit Trail Engine

### Backend Person 2 (Operations & Intelligence)
- Attendance Tracking & Shift Scheduling
- Leave & Time-Off Management
- Approval Workflow Engine
- Payroll & Compensation Calculation
- Policy & Rule Engine
- Decision Traceability
- Workforce & Recruitment Intelligence

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Database**: PostgreSQL 15+ (Hosted on Supabase)
- **Security**: PostgreSQL Row Level Security (RLS) anchored on `auth.uid()`
- **Authentication**: Supabase Auth via `@supabase/ssr` (Cookie-based session management)
- **Data Access**: `@supabase/supabase-js` + Type-safe Database Interfaces
- **Validation**: Zod 3.x
- **Testing**: Vitest

---

## 3. Directory Structure

```
dayflow/
├── .github/
│   └── workflows/ci.yml               # Automated build & type check CI
├── supabase/
│   ├── config.toml                    # Supabase CLI local configuration
│   ├── migrations/                    # Pure SQL migrations
│   └── seed/                          # Deterministic test seed data
├── src/
│   ├── middleware.ts                  # Next.js Supabase session cookie refresher
│   ├── app/                           # Next.js App Router & REST Route Handlers
│   │   └── api/v1/                    # Shared REST API endpoints
│   ├── config/                        # Supabase clients & Zod-validated environment
│   │   ├── env.ts
│   │   ├── supabase-server.ts         # Server-side cookie client (obeys RLS)
│   │   ├── supabase-browser.ts        # Browser-safe client
│   │   └── supabase-admin.ts          # Server-only Admin service role client
│   ├── core/                          # Foundation Kernel (Person 1)
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── http/
│   │   ├── security/
│   │   └── audit/
│   ├── modules/                       # Domain Business Modules
│   └── types/                         # Shared TypeScript interfaces & Person 2 contracts
├── package.json
└── tsconfig.json
```

---

## 4. Security & Multi-Tenant Isolation

1. **Database-Level Isolation**: Cross-organization corruption is prevented at the schema level via Composite Foreign Keys `(organization_id, id)` on all master and transaction tables.
2. **Canonical Identity**: All database policies evaluate permissions using native `auth.uid()`, strictly isolated via `public.auth_org_id()`.
3. **No Secret Exposure**: The Supabase service role key is guarded and only accessible server-side via `src/config/supabase-admin.ts`.

---

## 5. Getting Started

### Prerequisites
- Node.js v20+ LTS
- Supabase CLI

### Setup
```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Start local Supabase instance
npx supabase start

# 4. Run development server
npm run dev
```
