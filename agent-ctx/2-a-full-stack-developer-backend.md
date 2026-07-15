# Task 2-a — Backend API routes (full-stack-developer)

## Scope
Built ALL API route handlers under `src/app/api/**` for the "One Donation, Change Two Lives" platform.

## What I read first
- `/home/z/my-project/worklog.md` (Task 1 — schema, seed, auth lib, API contract)
- `/home/z/my-project/prisma/schema.prisma` (8 models: Admin, Donor, Child, Woman, Donation, ProgressUpdate, SiteContent, Package)
- `/home/z/my-project/src/lib/auth.ts` (hashPassword, verifyPassword, createDonorSession, createAdminSession, clearSessions, getCurrentDonor, getCurrentAdmin, SafeDonor/SafeAdmin types)
- `/home/z/my-project/src/lib/db.ts` (Prisma client `db`)
- `/home/z/my-project/eslint.config.mjs` (lenient — `no-explicit-any` and `no-unused-vars` are off)

## Files created (27 route files, 32 handlers)

### Auth
- `src/app/api/auth/donor/register/route.ts` — POST
- `src/app/api/auth/donor/login/route.ts` — POST
- `src/app/api/auth/admin/login/route.ts` — POST
- `src/app/api/auth/logout/route.ts` — POST
- `src/app/api/auth/me/route.ts` — GET

### Public read
- `src/app/api/content/route.ts` — GET `{key:value}`
- `src/app/api/stats/route.ts` — GET 7-field public dashboard
- `src/app/api/packages/route.ts` — GET active packages
- `src/app/api/children/route.ts` — GET (optional `?status=`)
- `src/app/api/children/[id]/route.ts` — GET with updates + donations
- `src/app/api/women/route.ts` — GET (optional `?status=`)
- `src/app/api/women/[id]/route.ts` — GET with updates + donations
- `src/app/api/donors/route.ts` — GET public donors + donationsCount
- `src/app/api/progress/route.ts` — GET (`?childId` or `?womanId`, also legacy `?beneficiaryType=&beneficiaryId=`)

### Donations
- `src/app/api/donations/route.ts` — POST (resolves donor from session / existing+password / register-new / guest)

### Donor portal (requires donor session)
- `src/app/api/donor/me/route.ts` — GET, PUT
- `src/app/api/donor/donations/route.ts` — GET
- `src/app/api/donor/password/route.ts` — PUT

### Admin (requires admin session)
- `src/app/api/admin/children/route.ts` — POST
- `src/app/api/admin/children/[id]/route.ts` — PUT, DELETE
- `src/app/api/admin/women/route.ts` — POST
- `src/app/api/admin/women/[id]/route.ts` — PUT, DELETE
- `src/app/api/admin/donors/route.ts` — GET (with computed counts/sums), POST
- `src/app/api/admin/donors/[id]/route.ts` — PUT (re-hashes password if given), DELETE
- `src/app/api/admin/donations/route.ts` — GET
- `src/app/api/admin/donations/[id]/route.ts` — PUT (promotes beneficiary on COMPLETED)
- `src/app/api/admin/progress/route.ts` — GET, POST (validates exactly one of childId/womanId)
- `src/app/api/admin/progress/[id]/route.ts` — PUT, DELETE
- `src/app/api/admin/content/route.ts` — GET, PUT (single upsert), POST (bulk upsert)
- `src/app/api/admin/packages/route.ts` — GET (all incl. inactive), POST
- `src/app/api/admin/packages/[id]/route.ts` — PUT, DELETE
- `src/app/api/admin/stats/route.ts` — GET (extended dashboard)

## Key implementation decisions
- **Dynamic params in Next 16**: every `[id]` handler uses `{ params }: { params: Promise<{ id: string }> }` and `await params`.
- **Donor resolution in POST /api/donations**: session > existing-by-email (verify password if given, also create session) > register-new (hash + create session) > guest donor (random unusable passwordHash, `isPublic:false`, generated `guest_<uuid>@guest.local` email).
- **Payment status**: `ONLINE` → `COMPLETED` immediately (demo), `OFFLINE` → `PENDING` (admin confirms). On COMPLETED, `updateMany({ where: { id, status: 'AVAILABLE' }, data: { status: 'SUPPORTED' } })` is used so GRADUATED/EMPLOYED are never downgraded.
- **passwordHash**: stripped from every donor/admin response via object destructuring.
- **Body parsing**: every POST/PUT wraps `req.json()` in try/catch → 400 on bad JSON.
- **Guest donors**: marked `isPublic:false` so they never appear on the public donor wall (only registered donors who opt in do).

## Lint
`bun run lint` — clean, zero errors/warnings.

## Testing
Tested 12+ endpoints with curl against the running dev server:
- GET /api/content, /api/stats, /api/packages, /api/children, /api/women, /api/donors, /api/progress?childId=, /api/children/:id
- POST /api/auth/admin/login (admin@odctl.org/admin123) → session cookie set
- GET /api/auth/me → returns admin object
- GET /api/admin/stats → full dashboard object; without auth → 401
- POST /api/auth/donor/login (donor@odctl.org/donor123) → donor session
- GET /api/donor/me, /api/donor/donations
- POST /api/donations with new donor credentials → donor auto-registered, donation COMPLETED, child+woman flipped AVAILABLE→SUPPORTED (verified)
- POST /api/admin/children (create), DELETE /api/admin/children/:id (cleanup)
- PUT /api/admin/content (upsert)
- POST /api/admin/progress without childId/womanId → 400 (validation working)
- POST /api/auth/logout → `{ok:true}`

## Dev log check
`dev.log` shows no API errors. The only `⨯` / `ReferenceError: initials is not defined` entries are frontend-only issues (layout.tsx / theme-provider / component views) and are out of scope for Task 2-a.

## Contract deviations
None that break the contract. Minor contract-compatible extras documented in worklog.md:
1. child/woman detail donations include `id` and `donorMessage` alongside the contract's `{createdAt, amountUSD, anonymous, donor:{name}}`.
2. Admin `/api/admin/donors` GET returns `donationsCount` + `completedDonations` + `totalDonatedUSD`.
3. `POST /api/donations` creates a session when an existing donor verifies a password (not required, natural UX).
4. Guest donors created with `isPublic:false`.
