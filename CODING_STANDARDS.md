# Coding Standards

Conventions and standards for the Columbia Vendor Compliance Portal.

---

## Git

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Format:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
| Type | When to use |
|---|---|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace, missing semicolons (no logic change) |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling, CI |
| `perf` | Performance improvement |

**Scopes** (optional, use when helpful):
- `api` -- API route changes
- `ui` -- Page/component changes
- `db` -- Prisma schema, migrations, seed data
- `brokermatic` -- Brokermatic client layer
- `compliance` -- Compliance-related features
- `vendors` -- Vendor management features
- `rates` -- Rate/contract features
- `auth` -- Authentication/authorization

**Examples:**
```
feat(api): add vendor suspend/unsuspend endpoints
fix(compliance): correct expiration date calculation for UTC offset
docs: add project overview and next steps
refactor(brokermatic): extract shared pagination logic
chore(db): add index on certificate expiration date
```

**Guidelines:**
- Keep commit messages clean and concise
- Do NOT include promotional content, banners, or tool advertisements
- Do NOT add "Co-Authored-By" or similar attributions unless multiple humans collaborated
- Focus on what changed and why, not on how it was built

### Branching

- `main` -- stable, deployable code
- `feat/<name>` -- feature branches
- `fix/<name>` -- bug fix branches

---

## TypeScript

### General
- Strict mode enabled (`strict: true` in `tsconfig.json`)
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- Avoid `any` -- use `unknown` and narrow, or define proper types

### Naming
| Element | Convention | Example |
|---|---|---|
| Files (pages/components) | `kebab-case` or `PascalCase.tsx` | `page.tsx`, `vendor-list.tsx` |
| Files (lib/utils) | `kebab-case.ts` | `mock-client.ts` |
| Interfaces/Types | `PascalCase` | `BrokermaticClient`, `Certificate` |
| Functions | `camelCase` | `getBrokermaticClient()` |
| Constants | `UPPER_SNAKE_CASE` | `COVERAGE_TYPES`, `MAX_PAGE_SIZE` |
| Database models | `PascalCase` (Prisma) | `Vendor`, `InsuranceRequirement` |
| Database fields | `camelCase` (Prisma) | `vendorId`, `coverageType` |
| API query params | `snake_case` | `insured_id`, `coverage_type` |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `BROKERMATIC_API_KEY` |

### Imports
- Use path aliases (`@/lib/...`, `@/components/...`) instead of relative paths
- Group imports: external packages, then internal modules, then types
- Use `import type` for type-only imports

```typescript
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getBrokermaticClient } from "@/lib/brokermatic/client";

import type { Certificate } from "@/lib/brokermatic/types";
```

---

## Next.js

### App Router Conventions
- Pages are server components by default -- only add `"use client"` when client interactivity is needed
- Use `export const dynamic = "force-dynamic"` on pages that query the database
- Await `params` and `searchParams` in page components (Next.js 15 requirement):
  ```typescript
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- Use `notFound()` from `next/navigation` for missing resources

### API Routes
- Use `NextRequest`/`NextResponse` from `next/server`
- Return proper HTTP status codes (200, 201, 400, 404, 500)
- Parse request body with `await request.json()`
- URL search params via `request.nextUrl.searchParams`

---

## Database (Prisma)

### Schema
- Use `cuid()` for primary keys
- Add `createdAt` and `updatedAt` to all models
- Use `@db.Decimal(15, 2)` for currency amounts, `@db.Decimal(10, 2)` for rates
- Add database indexes (`@@index`) on fields used for filtering and sorting
- Use `onDelete: Cascade` for child records that should be removed with their parent

### Queries
- Use the singleton Prisma client from `@/lib/db` (never instantiate `new PrismaClient()` in route handlers)
- Handle Prisma `Decimal` values by converting with `Number()` before display
- Use `include` for related data, but be selective -- don't over-fetch

### Migrations
- Run `npx prisma migrate dev --name <descriptive_name>` for schema changes
- Never edit migration files after they've been applied
- Seed data: `npx prisma db seed` (runs `prisma/seed.ts`)

---

## Styling (Tailwind CSS)

- Use Tailwind utility classes directly in JSX
- Columbia brand color: `#1B3A5C` (dark blue) -- used for headers, links, active states
- Consistent spacing: `p-6` for card padding, `gap-6` for grid gaps, `mb-6` for section spacing
- Use `bg-gray-50` for page backgrounds, white cards with `shadow-sm rounded-lg`
- Responsive: use `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` patterns for card grids
- Status colors:
  | Status | Background | Text |
  |---|---|---|
  | Compliant/Active/Approved | `bg-green-100` | `text-green-800` |
  | Expiring/Warning/Pending | `bg-yellow-100` | `text-yellow-800` |
  | Expired/Non-compliant | `bg-red-100` | `text-red-800` |
  | Suspended | `bg-gray-100` | `text-gray-800` |

---

## Brokermatic Integration

### Client Interface
- All Brokermatic API interaction goes through the `BrokermaticClient` interface in `src/lib/brokermatic/client.ts`
- Never call Brokermatic APIs directly from pages or route handlers -- always use the client
- Types in `types.ts` must match the API specification in `docs/BROKERMATIC_CERTIFICATE_HOLDER_API.md`

### Coverage Types
- Coverage types are **strings**, not enums
- Standard types: `general_liability`, `auto_liability`, `excess_liability`, `workers_compensation`, `environmental_liability`, `professional_liability`
- Any additional type a holder defines is valid

### Error Handling
- Brokermatic API failures should **not** block local operations
- Pattern: save locally first, then sync to Brokermatic in a try/catch
  ```typescript
  const certificate = await prisma.certificate.create({ data: { ... } });
  try {
    const bmCert = await client.createCertificate({ ... });
    await prisma.certificate.update({ where: { id: certificate.id }, data: { brokermaticCertId: bmCert.id } });
  } catch {
    // Brokermatic sync failed -- certificate still saved locally
  }
  ```

---

## Project Organization

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── layout.tsx                  # Root layout (nav, styling)
│   ├── vendors/                    # Vendor UI pages
│   ├── compliance/                 # Compliance UI pages
│   ├── rates/                      # Rate UI pages
│   └── api/                        # API route handlers
│       ├── vendors/
│       ├── certificates/
│       └── webhooks/
└── lib/
    ├── db.ts                       # Prisma singleton
    └── brokermatic/                # Integration layer
        ├── client.ts               # Interface + factory
        ├── types.ts                # API types
        ├── mock-client.ts          # Mock implementation
        └── real-client.ts          # Real implementation (stub)
```

- **Pages** go in `src/app/` following Next.js App Router conventions
- **API routes** go in `src/app/api/`
- **Shared logic** goes in `src/lib/`
- **Brokermatic integration** is isolated in `src/lib/brokermatic/`
- **Components** (when needed) go in `src/components/` organized by feature area
