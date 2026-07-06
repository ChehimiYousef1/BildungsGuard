# All in One — Backend (AZAV LMS & QM)

NestJS + Prisma + PostgreSQL backend for the **All in One** platform: a bilingual (DE/EN),
AZAV-compliant LMS and quality-management SaaS for German training providers (Bildungsträger).

Built to the backend proposal: JWT/Passport auth with three roles, multi-tenant data isolation,
MinIO storage, pdf-lib PDF generation (certificates + Ergebnisbogen), Bull/Redis background jobs,
a secure Anthropic proxy for the **Aino** assistant, and Nodemailer email.

## Requirements
- Node.js 20+
- PostgreSQL 16 (native installer or Docker)
- Redis (only for background jobs) and MinIO (only for file storage) — optional until you use those features

## Setup
```bash
npm install
cp .env.example .env          # then edit DATABASE_URL, JWT secrets, ANTHROPIC_API_KEY, …
npx prisma generate           # generates the typed Prisma client
npx prisma migrate dev        # creates the database schema
npm run prisma:seed           # demo tenant + 3 logins (password: "password")
npm run start:dev             # http://localhost:3000/api/v1
```

Demo logins after seeding: `admin@omah.de`, `dozent@omah.de`, `teilnehmer@omah.de` (all password `password`).

## Optional local infrastructure
```bash
docker compose up -d postgres redis minio
```
(If PostgreSQL is installed natively on Windows, you can run only `redis` and `minio`.)

## API surface (prefix `/api/v1`)
- `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout`
- `GET /tenants/me` · `PATCH /tenants/:id`
- CRUD: `/users` `/participants` `/measures` `/trainers` `/documents` `/capa` `/alumni` `/campaigns` `/automations`
- `/courses` (+ `POST /courses/:id/copy`), `/courses/:courseId/sessions` (+ `PATCH …/reorder`)
- `POST /attendance/:sessionId` · `GET /attendance/:sessionId` · `GET /attendance/participant/:id`
- `GET /audit/readiness` · `POST /audit/sample` · `GET /audit/history` · `GET /audit/log`
- `POST /pdf/certificate/:participantId` · `POST /pdf/ergebnisbogen/:participantId`
- `POST /aino/chat`
- `GET /health` (public)

## Architecture notes
- **Multi-tenancy**: every business table carries `tenantId`; services scope every query by it.
  The authoritative `tenantId` comes from the JWT. For defence-in-depth, enable PostgreSQL
  Row-Level Security policies at the DB layer (add to a migration) so the database enforces
  isolation even if a query forgets the filter.
- **Auth**: global `JwtAuthGuard` (bypassed via `@Public()`) + `RolesGuard` (`@Roles(...)`).
- **Aino**: the Anthropic API key lives only on the server; the front end calls `POST /aino/chat`.
- **Responses** are wrapped in a `{ data }` envelope by a global interceptor.

## Status / scope
This is a complete, compiling project skeleton that implements the full structure and the core
flows (auth, multi-tenant CRUD, course ordering, attendance, audit sampling, PDF generation,
Aino proxy). Deeper proposal logic — e.g. the full Ergebnisbogen field mapping, job scheduling
triggers, and RLS policies — is scaffolded and marked for completion. The PDF, mail, storage and
jobs features require their respective services (MinIO, SMTP, Redis) to be configured at runtime.

> Compliance note: this software supports AZAV/QM workflows but is not legal advice. Involve your
> Datenschutzbeauftragte(r) and certifier for DSGVO and AZAV sign-off.
