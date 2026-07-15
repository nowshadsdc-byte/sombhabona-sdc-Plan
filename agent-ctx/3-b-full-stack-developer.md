# Task 3-b — full-stack-developer (frontend views: donor, donors, admin)

## Scope
Built three React view files for the "One Donation, Change Two Lives" charity platform:
1. `src/components/site/views/donor-view.tsx` — `DonorView`
2. `src/components/site/views/donors-view.tsx` — `DonorsView`
3. `src/components/site/views/admin-view.tsx` — `AdminView`

No other files were modified.

## What I built

### DonorView
- **Auth (logged out)**: warm 2-column layout. Left side shows `/woman-training.png` with a teal gradient overlay + tagline ("One donation. Two lives changed.") + link to beneficiaries. Right side has shadcn `Tabs` with **Sign in** (email/password → `POST /api/auth/donor/login`) and **Create account** (name/email/password 6+/phone?/country?/city? → `POST /api/auth/donor/register`). Both call `refreshAuth()` + sonner toast. Demo donor hint banner.
- **Dashboard (logged in)**: greeting with ColorAvatar + sign out. Three impact StatCards (children sponsored, women trained, total donated USD — all derived from completed donations). Three tabs:
  - *Your sponsored lives* — fetches `/api/donor/donations`, renders rich SponsorshipCard per donation (child mini-card + woman mini-card side by side, each with avatar/status/progress + "View full profile" → `openBeneficiary`; expandable donor message + transaction ID). EmptyState CTA → `go('beneficiaries')`.
  - *Progress updates* — fetches `/api/donor/updates`, vertical timeline with milestone stars, time-ago, link to beneficiary.
  - *Profile* — two cards: profile editor (PUT `/api/donor/me` with name/phone/country/city/bio) + password change (PUT `/api/donor/password`).

### DonorsView
- SectionHeading (eyebrow "Our Community", title "The people making it possible").
- Stats strip from `/api/stats`: 4 StatCards (supporters, raised USD, children sponsored, women trained).
- Search input (filter by name/city/country) + sort Select (most recent / most donations).
- Grid of donor cards from `/api/donors` — large ColorAvatar, name, location, joined date, bio (line-clamp-3), donations count badge. Current donor highlighted with `ring-2 ring-primary shadow-glow` + "You" Badge.
- EmptyState when search yields nothing (with Clear search CTA).
- Bottom gradient CTA card → `go('donate')`.

### AdminView
- **Login (logged out)**: centered Card with Shield icon, posts to `/api/auth/admin/login`. Demo admin hint.
- **Dashboard (logged in)**: top bar (Admin Console + admin name + sign out), then 8 sections via desktop sidebar nav / mobile Select:
  1. **Overview** — 8 StatCards from `/api/admin/stats` + recharts BarChart of last-6-months donation count (computed client-side from `/api/admin/donations`).
  2. **Children** — Table + Add/Edit Dialog (name, age, gender, grade, school, location, background, dream, ColorPicker, status select, progressPercent slider) + AlertDialog delete. Full CRUD via `/api/admin/children[/:id]`.
  3. **Women** — same pattern, fields (name, age, location, familyInfo, background, goal, ColorPicker, status, progress). `/api/admin/women[/:id]`.
  4. **Donors** — Table + Edit Dialog (name, email, phone, country, city, bio, avatarColor, isPublic switch, optional new password) + AlertDialog delete. `/api/admin/donors[/:id]`.
  5. **Donations** — Table (donor, child, woman, amount, method, status, transactionId, date) + Edit Dialog (paymentStatus select + transactionId). `/api/admin/donations/:id` PUT.
  6. **Progress updates** — list view + Dialog (child-or-woman type selector, title, content, ColorPicker, milestone switch). Full CRUD. `/api/admin/progress[/:id]`.
  7. **Packages** — card grid + Dialog (name, description, priceUSD, priceBDT, childBenefit, womanBenefit, imageColor, active switch). `/api/admin/packages[/:id]`.
  8. **Site content** — grouped form cards (hero / orgs / joint / transparency / package pricing / footer) with per-key Save button → PUT `/api/admin/content {key,value}`. After save, calls `loadContent()` to refresh the public content cache site-wide.

- Shared helpers inside the file: `FormField`, `ColorPicker` (warm palette of 10 swatches — teal/amber/rose/orange/lime/plum, NO indigo/blue — plus a native color input for custom), `SectionHeader`, `TableCard` (wraps Table with `max-h-[70vh] overflow-auto custom-scrollbar`), `ConfirmDelete` (AlertDialog wrapper).

## Design system adherence
- Warm humanitarian theme: cream background, deep teal primary, amber/rose/teal accents. Never indigo or blue.
- Mobile-first responsive (`sm:`, `md:`, `lg:` breakpoints throughout).
- framer-motion for subtle fade/slide transitions (auth card, dashboard greeting, sponsorship cards, donor cards, update timeline entries).
- sonner toasts on every action (success + error).
- ColorAvatar used for beneficiaries and donors (no real faces).
- shadcn/ui components used exclusively: Button, Card, Input, Label, Textarea, Tabs, Select, Switch, Slider, Table, Dialog, AlertDialog, Badge.
- Lucide icons throughout.

## Lint status
`bun run lint` — **clean** (0 errors, 0 warnings) across all 3 files after one fix:
- Initial lint flagged `react/no-children-prop` in `ProgressDialog` because I named a prop `children` (a `Child[]` list) which collided with React's reserved children prop. Renamed to `childOptions` / `womanOptions` in both the call site and the component signature. Re-ran lint → clean.

## Dev server verification
Checked `dev.log` — `/api/auth/donor/login` returns 200, `/api/auth/me` returns 200, all 3 views compile cleanly (no server errors).

## Assumptions for backend agent (3-a)
- `PUT /api/donor/me` accepts `{name, phone, country, city, bio}` (nulls allowed for optional fields).
- `PUT /api/donor/password` accepts `{currentPassword, newPassword}`.
- `PUT /api/admin/donors/:id` accepts `{name, email, phone, country, city, bio, avatarColor, isPublic, password?}` (password optional, only sets when provided and ≥6 chars).
- `PUT /api/admin/donations/:id` accepts `{paymentStatus, transactionId}`.
- `GET /api/admin/donors` returns donors with a `donationsCount` field (used in the Donors table).
- `GET /api/admin/progress` returns updates with nested `child?: {id,name}` and `woman?: {id,name}`.
- `GET /api/admin/content` and `PUT /api/admin/content {key,value}` round-trip the same shape as public `/api/content`.
- Admin list endpoints return arrays directly (per the contract note).

## Files written
- `/home/z/my-project/src/components/site/views/donor-view.tsx`
- `/home/z/my-project/src/components/site/views/donors-view.tsx`
- `/home/z/my-project/src/components/site/views/admin-view.tsx`
