# Task 3-a — Frontend Views (home, beneficiaries, donate)

**Agent**: full-stack-developer
**Scope**: Three view files only — `home-view.tsx`, `beneficiaries-view.tsx`, `donate-view.tsx`

## Files written
- `src/components/site/views/home-view.tsx` — `HomeView`
- `src/components/site/views/beneficiaries-view.tsx` — `BeneficiariesView`
- `src/components/site/views/donate-view.tsx` — `DonateView`

## Lint
`bun run lint` → 0 errors, 0 warnings across the whole project (including these three files).

## Summary
### HomeView (9 sections)
1. Hero — full-bleed `hero-main.png` with teal gradient overlay, hero badge/title/subtitle, 2 CTAs, floating "1,650+ students · 32,000+ beneficiaries since 2011" chip. Framer-motion entrance.
2. Live impact stats bar — fetches `/api/stats`, 4 StatCards (childrenCount, womenCount, donorsCount, totalRaisedUSD via formatUSD).
3. Two Organizations — side-by-side OrgCards with `sombhabona_logo.webp` / `sdc-logo.png`, content from `aboutOrg1*` / `aboutOrg2*`.
4. Joint Initiative — feature split with `joint-initiative.png`, "USD 250 → 2 lives" framed prominently.
5. How it works — 4 numbered cards (Browse → Choose → Donate → Track).
6. The Package — fetches `/api/packages`, side-by-side `child-edu.png` + `woman-training.png` visuals, BenefitTiles for child + woman benefit, CTA.
7. Complete Transparency — 6-feature grid (public lists, donor-selectable, secure account, progress, public donor community, admin accountability).
8. Beneficiaries preview — first 3 available children + first 3 available women, clickable ColorAvatar cards → `openBeneficiary`. "View all" → `go('beneficiaries')`.
9. Final CTA band — teal gradient over `impact-community.png` with the tagline and a donate button.

### BeneficiariesView
- SectionHeading header with quick counts (available children / women pills).
- Sticky controls bar (below navbar): Tabs (Children/Women) with counts, search Input (name/location/grade for children; name/location/goal for women), status Select (All / Available / Supported / Graduated|Employed).
- Responsive grid (sm:2, lg:3, xl:4) of `BeneficiaryCard`: colored gradient banner with centered 64px ColorAvatar + "Ready to sponsor" pill for AVAILABLE, body with name/age+location/StatusBadge/snippet/ProgressBlock/footer button.
- AVAILABLE cards get `ring-2 ring-primary/40` glow.
- Client-side filtering via useMemo; skeleton loading state; EmptyState when no matches.
- All cards open the global `BeneficiaryDialog` via `openBeneficiary('CHILD'|'WOMAN', id)`.

### DonateView (3-step flow)
- Fetches `/api/children?status=AVAILABLE`, `/api/women?status=AVAILABLE`, `/api/packages` in parallel on mount.
- Reads `donateSelection` from store and pre-selects child/woman if valid.
- Visual Stepper (1. Choose child → 2. Choose woman → 3. Your details).
- Step 1: single-select child grid (compact ColorAvatar + name + age/location + grade + dream).
- Step 2: single-select woman grid (family info + goal).
- Step 3: donor info (auto-filled when `donor` is in store — credential fields hidden behind "Donating as" banner), payment RadioGroup (Online / Offline) with online note + optional transaction ref OR offline bank-instructions box + required transaction ID, optional message Textarea, anonymous Checkbox.
- Sticky summary sidebar (lg) showing selected child + woman ColorAvatars + package + payment + total USD 250 / BDT 30,000 + submit button "Donate USD 250 & Change Two Lives".
- Submit posts to `POST /api/donations`; on success → full-screen success step with animated spring checkmark, dual ImpactCards (child's dream, woman's goal), and two buttons: "Go to my donor portal" (`refreshAuth()` + `go('donor')`) and "Back to home".
- Calls `setDonateSelection({})` after success to clear the pre-selection.
- AnimatePresence for step transitions; validation disables step nav (can't pass step 1 without a child, step 2 without a woman) and toasts on submit errors.
- Edge cases: NoAvailabilityView when no available children or women; offline requires transactionId; password optional but if entered must be 6+.

## Decisions / Assumptions
- Privacy-first: beneficiaries shown as ColorAvatar (initials in chosen color), never real child/woman faces.
- `useAppStore` selectors used exactly as specified (`go`, `donateSelection`, `setDonateSelection`, `openBeneficiary`, `donor`, `refreshAuth`, `content`).
- Backend contract assumed: list endpoints return arrays, `/api/donations` returns `{donation, donor?}`.
- No backend, store, primitives, shell, or other view files were touched.
- Donor-account-optional pattern: visitor without session can supply name/email + optional password; the backend either registers+logs in (password provided) or attaches to an existing session (logged in).
EOF
