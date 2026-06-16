# ClinicOS — Multi-Tenant Clinic Management SaaS

ClinicOS is a production-oriented full-stack SaaS blueprint for clinics, doctors, reception teams, patients, and platform administrators. It is structured around strict tenant isolation, RBAC, subscription plans, appointment operations, queue management, EMR, prescriptions, billing, payments, notifications, analytics, support, and audit logging.

## Product surfaces

- **Patient Panel**: appointment booking, medical records, prescriptions, lab reports, invoices, family members, notifications, and support tickets.
- **Clinic Panel**: doctors, staff, patients, appointments, queue, calendar, billing, payments, prescriptions, medical records, reports, analytics, subscription, and support.
- **Super Admin Panel**: clinics, plans, subscriptions, platform revenue, payments, audit logs, users, support, system settings, and feature flags.

## Tech stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, TanStack Query, Redux Toolkit, Axios, Recharts
- **API**: Node.js, Express, JWT-ready middleware, Zod DTO validation
- **Database**: PostgreSQL with Prisma schema
- **Cache/queues**: Redis-ready service layer
- **Payments**: Razorpay-ready billing routes
- **Storage**: S3/R2-ready document architecture
- **Deployment**: Docker, Docker Compose, Nginx, GitHub Actions

## Quick start

```bash
npm install
npm run dev
```

Open the web app and navigate between:

- `/` — platform overview
- `/patient` — patient panel
- `/clinic` — clinic operations panel
- `/super-admin` — platform admin panel
- `/architecture` — RBAC, tenant isolation, and backend architecture

## API scaffold

```bash
node server/src/index.js
```

The API exposes:

- `GET /health`
- `GET /api/clinics/me`
- `GET|POST /api/patients`
- `GET|POST /api/appointments`
- `GET|POST /api/billing/invoices`
- `POST /api/billing/invoices/:invoiceId/razorpay-order`
- `GET /api/subscriptions/plans`
- `GET|POST /api/notifications`

Local demo requests may use `X-Clinic-Id`, `X-Demo-Role`, and `X-Plan` headers. Production deployments should provide JWT access tokens and rotate refresh tokens.

## Prisma

Validate the schema:

```bash
npx prisma validate --schema server/prisma/schema.prisma
```

The schema includes clinic, user, role, permission, doctor, staff, patient, family member, appointment, appointment slot, queue token, prescription, medical record, lab report, invoice, payment, subscription, notifications, audit logs, support tickets, refresh tokens, activity logs, follow-ups, and settings.

## Docker

```bash
docker compose up --build
```

Services:

- `web` — Vite build served by Nginx
- `api` — Express API
- `postgres` — PostgreSQL
- `redis` — Redis

## Tenant isolation model

- Every business entity carries `clinicId`.
- `resolveTenant` creates tenant context from JWT/header data.
- Repositories inject `clinicId` filters before data access.
- RBAC guards enforce role permission checks per route.
- Super admin workflows redact PHI by default and rely on audit trails.

## Validation

```bash
npm run lint
npm run build
npx prisma validate --schema server/prisma/schema.prisma
```
