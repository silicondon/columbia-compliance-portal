# Columbia Vendor Compliance Portal

A modern prototype for Columbia University's Construction & Facilities department, replacing a legacy ASP-based Vendor Management System (VMS) with a Next.js application that integrates with Brokermatic's certificate management platform.

## Background

Columbia's Construction & Facilities department manages ~2,500 vendors through a legacy VMS (vms.cuf.columbia.edu, copyright 2006). The biggest operational pain point is **manual certificate of insurance tracking** -- nearly a full-time employee chases vendors by phone for updated certificates, with 20-25 vendors suspended at any given time due to expired insurance.

This prototype automates certificate tracking by integrating with Brokermatic's Certificate Holder API, while also handling the other two VMS pillars: contracts and labor rates.

## Status

**Prototype / Proof of Concept** -- built February 2026.

- The Brokermatic API is **not yet built**. This prototype uses a mock client that implements the full `BrokermaticClient` interface with realistic fake data.
- The API specification that Brokermatic will build against is documented at [`docs/BROKERMATIC_CERTIFICATE_HOLDER_API.md`](../docs/BROKERMATIC_CERTIFICATE_HOLDER_API.md).
- When the API is ready, swap `MockBrokermaticClient` for `RealBrokermaticClient` via the `BROKERMATIC_API_KEY` environment variable.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL 16 via Prisma ORM (v6) |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth.js (placeholder, Columbia SSO-ready) |
| Runtime | Node.js |

## Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL) or an existing PostgreSQL instance

## Getting Started

### 1. Start PostgreSQL

```bash
docker run -d --name columbia-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=columbia_vendor_portal \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Install dependencies

```bash
cd columbia-vendor-portal
npm install
```

### 3. Set up environment

The `.env` file is pre-configured for local Docker PostgreSQL:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/columbia_vendor_portal?schema=public"
```

### 4. Run database migration and seed

```bash
npx prisma migrate deploy
npx prisma db seed
```

This seeds the database with:
- **50 vendors** (realistic NYC construction firms from the existing VMS)
- **~187 certificates** across 6 coverage types with varied compliance statuses
- **24 contracts** (task orders, term consultants, renewals)
- **40 vendor rate entries** across multiple trade categories
- **19 union rate sheet entries** for NYC construction trades

### 5. Start the dev server

```bash
npm run dev
```

Open **http://localhost:4973** in your browser.

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard -- compliance summary cards, alerts, quick stats |
| `/vendors` | Vendor list with search, filter by trade/union status/MWL/compliance |
| `/vendors/[id]` | Vendor profile -- general info, contact details, flags |
| `/vendors/[id]/insurance` | Insurance requirements and certificates table per vendor |
| `/vendors/[id]/contracts` | Contracts table per vendor |
| `/vendors/[id]/rates` | Labor rates with status filter (approved/pending/expired) |
| `/compliance` | Compliance dashboard -- summary cards, non-compliant/expiring table |
| `/compliance/expiring` | Expiring certificates with color-coded urgency and contact info |
| `/rates/union-rates` | Union rate sheet viewer with search |

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/vendors` | GET, POST | List vendors (with search/filter), create vendor |
| `/api/vendors/[id]` | GET, PUT, DELETE | Get, update, delete vendor |
| `/api/vendors/[id]/suspend` | POST, DELETE | Suspend vendor (with reason) / unsuspend |
| `/api/certificates` | POST | Create certificate with Brokermatic sync |
| `/api/certificates/parse` | POST | Upload and parse certificate PDF (mock) |
| `/api/webhooks` | POST | Receive Brokermatic webhook events |

## Project Structure

```
columbia-vendor-portal/
├── prisma/
│   ├── schema.prisma              # 6 models: Vendor, InsuranceRequirement,
│   │                              #   Certificate, Contract, VendorRate, UnionRateSheet
│   ├── migrations/                # PostgreSQL migrations
│   └── seed.ts                    # Seed data (50 vendors, certs, contracts, rates)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── layout.tsx             # Root layout with nav
│   │   ├── vendors/               # Vendor pages (list, profile, tabs)
│   │   ├── compliance/            # Compliance dashboard and expiring view
│   │   ├── rates/                 # Union rate sheets
│   │   └── api/                   # API routes (vendors, certificates, webhooks)
│   └── lib/
│       ├── db.ts                  # Prisma client singleton
│       └── brokermatic/
│           ├── client.ts          # BrokermaticClient interface + factory
│           ├── types.ts           # TypeScript types matching API spec
│           ├── mock-client.ts     # Mock implementation (used now)
│           └── real-client.ts     # Real API client (stub, for when API is ready)
├── .env                           # Local environment config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Brokermatic Integration Architecture

The integration is built around a `BrokermaticClient` TypeScript interface that abstracts all API operations. The factory function in `src/lib/brokermatic/client.ts` returns the appropriate implementation:

```
┌────────────────────────┐
│  Columbia Portal (UI)  │
│  Next.js Pages/API     │
└──────────┬─────────────┘
           │
    getBrokermaticClient()
           │
     ┌─────┴──────┐
     │             │
 MockClient    RealClient
 (now)         (when API ready)
     │             │
 Fake data    HTTP calls to
              api.brokermatic.ai
```

**Current state:** `MockBrokermaticClient` returns realistic fake data for all operations.

**To switch to real API:** Set `BROKERMATIC_API_KEY` in `.env` and uncomment the conditional in `getBrokermaticClient()`.

## Database Schema

6 models covering the three VMS pillars:

**Insurance/Certificates:**
- `Vendor` -- core vendor record with Columbia-specific fields (vmsId, Maximo/Unifier emails, trade, union/MWL status, suspension tracking, `brokermaticInsuredId` for API sync)
- `InsuranceRequirement` -- per-vendor required minimums for 6 coverage types (GL, Excess, Auto, Environmental, Professional, Workers Comp)
- `Certificate` -- individual certificate records linked to vendor and optionally to Brokermatic (`brokermaticCertId`), with local PDF copy fields

**Contracts:**
- `Contract` -- task orders, term consultants, renewals with date and value tracking

**Rates:**
- `VendorRate` -- per-vendor rate entries with category, hourly rates, and markup percentages
- `UnionRateSheet` -- union trade rate reference data

## Known Limitations (Prototype)

- **No authentication** -- all pages are publicly accessible (NextAuth.js is installed but not wired up)
- **No file upload** -- certificate PDF upload uses mock parser; no actual file handling
- **No email notifications** -- expiration reminders are logged but not sent
- **No edit forms** -- vendor/certificate data is view-only in the UI (API supports CRUD)
- **Mock Brokermatic** -- all API integration uses fake data until real API is available
- **No HMAC verification** -- webhook signature validation is a TODO

## Related Documents

- **[Brokermatic Certificate Holder API Spec](../docs/BROKERMATIC_CERTIFICATE_HOLDER_API.md)** -- the API specification for Brokermatic to build. Generic, not Columbia-specific.
- **Screenshots of current VMS** -- `../Screesnhots/` (8 screenshots from vms.cuf.columbia.edu showing vendor list, vendor detail tabs, resources, union rates)
