# Next Session Task Queue

Pick these up in order. Each is self-contained.

> **See `DESIGN_SPEC.md` for the full aesthetic direction and per-page contracts.**

## Status of Design Spec (Session 3)

### Theming
- [x] Light + dark CSS token system
- [x] `ThemeProvider` with localStorage persistence + OS fallback
- [x] Accent color picker (5 presets, live `--accent-lime` swap)
- [x] Font scale (small/medium/large)
- [x] Smooth 300ms theme transition

### App Shell
- [x] Top Navbar — wordmark, theme toggle, profile dropdown, logout
- [x] Bottom Dock — 7 icons including Settings
- [x] macOS magnification via framer-motion `useTransform` per spec
- [x] `padding-top: 80px` + `padding-bottom: 120px` on main content

### Login
- [x] WebGL ShaderBackground (full plasma wave, code verbatim from spec)
- [x] Glassmorphic card with Eye/EyeOff password toggle
- [x] Test-credential auto-fill cards
- [x] Inline error banner + spinner in submit button
- [x] 500ms card entry animation

### Components
- [x] `ErrorBoundary` class component — wraps every page route
- [x] `CustomToggle` — CSS-only sliding pill, theme-aware
- [x] `EmptyState` — 5 SVG variants (generic, appointments, patients, doctors, search)
- [x] `Toast` — provider + hook + viewport (3 variants, auto-dismiss, progress bar)
- [x] `ScheduleEditor` — 7-day tabs, hour grid, slot chips, save/reset
- [x] `SkeletonPage` — Suspense fallback

### Settings Page
- [x] General (language, date format, timezone)
- [x] Appearance (theme cards, accent swatches, font pills)
- [x] Notifications (4 custom toggles)
- [x] Account (display name, email read-only, password change with validation)
- [x] Danger Zone (CONFIRM string to activate deactivation)

### Pages Hardening
- [x] Appointments — ErrorBoundary + null-safe filters + URL date param
- [x] Reports — ErrorBoundary + recharts with CSS var colors + empty states
- [x] Settings — ErrorBoundary + theme persistence
- [x] Dashboard — stat-card stagger + calendar click → appointments
- [x] Patients — toast on CRUD
- [x] NewAppointment — toast on submit
- [x] Doctors — `View Schedule` opens ScheduleEditor

---

## Remaining Work (Future Sessions)

### Nice to have
- [ ] **Animated SVG illustrations** for empty states (currently static SVGs with float micro-animation)
- [ ] **Patient profile page** — `/patients/:id` mirroring the doctor profile (bio, contact, history, recent appointments)
- [ ] **Per-page empty-state copy** — tailor the messages to the page context (e.g. Reports → "No occupancy data yet — schedule some appointments")
- [ ] **Toast positioning** — currently top-right; consider a setting for top-center / bottom-right
- [ ] **Locale strings (i18n)** — the Settings page exposes EN/ES/PT but no string catalog exists yet; wire up a minimal `t()` helper + per-locale JSONs
- [ ] **Date format** — same situation; Settings has MM/DD vs DD/MM but `mockData` still produces ISO strings
- [ ] **Timezone** — same; Settings stores the choice but it isn't applied anywhere

### Technical debt
- [ ] Move `mockApi` into `src/services/mockApi.js` once the real backend ships; `mockData.js` should only export the static fixtures
- [ ] Replace the `useNavigate`-based dashboard calendar `?date=` redirect with a hash route so the calendar can deep-link without a server
- [ ] Extract the duplicated `getPatientName` / `getDoctorName` helpers into a `useEntityMaps(appointments, patients, doctors)` hook
- [ ] Deduplicate the per-page status-pill map (`STATUSES`) — now sourced from `APPOINTMENT_STATUSES`, but the rendering loop still hardcodes "ALL" handling
- [ ] Consider switching `eslint.config.js` to use `eslint-plugin-vitest` so the test-file globals block can be replaced with a clean config

### Backend
- [ ] **Real API integration** — deprioritized. Toggle via `VITE_USE_MOCK=false` once backend is ready. The `api.*` wrapper already mirrors the real endpoint shape (`/api/...`).
- [ ] **JWT refresh** — `api.js` reads `localStorage.getItem('token')`; needs refresh-on-401 interceptor before production

### Completed (Session 6)
- [x] **Doctor profile page** — `/doctors/:id` with hero, stats, weekly schedule, upcoming list, recent activity
- [x] **Richer search in Appointments** — debounced, joins patient + doctor + status + notes + time, URL-synced via `?q=`
- [x] **Vitest setup** — 48 tests across 6 files (StatusBadge, useTheme, mockApi, scheduleConflicts, useDebounce, useFormDraft)
- [x] **data/constants.js** — extracted `SPECIALTIES`, `APPOINTMENT_TYPES`, `OFFICES`, plus new `APPOINTMENT_STATUSES`, `HOUR_BLOCKS`, `FULL_HOURS`, `TIME_SLOTS`
- [x] **Mobile responsive pass** — 480px global breakpoint + per-page rules (DoctorProfile, Appointments, Doctors, NewAppointment, Reports, Availability, TimeSlotGrid, Settings already had it) + Dock `useIsMobile` hook
- [x] **Onboarding tour** — 5-step first-visit modal with Restart Tour entry in Settings

### Completed (Session 5)
- [x] **Form autosave drafts** — `useFormDraft` hook with localStorage persistence, per-form keys, draft-restored banner; wired into Patients and NewAppointment
- [x] **Floating-label form fields** — `FloatingField` component, Patient registration slide-over uses it for all 6 fields
- [x] **Empty state for dashboard recent appointments** — `EmptyState` component with appointments variant + CTA
- [x] **Keyboard shortcuts** — `useKeyboardShortcuts` hook, global `N` + `G→{D,A,P,R}` + `?` help dialog
- [x] **Skeleton loaders on slide-overs** — SlideOver has `loading`/`skeleton` props with form/detail variants
- [x] **Doctor schedule validation** — `findScheduleConflicts` utility, live banner + day badges + save confirmation modal
- [x] **useDebounce** — wired into Table search
- [x] **CSS module cleanup** — `Dashboard`, `App`, `Dock` all converted to plain CSS; zero `.module.css` remain

### Completed (Session 4)
- [x] **Stagger animation on TimeSlotGrid** — true "scoreboard lighting up" wave with lime glow halo + ambient resting glow; `gridKey` prop forces replay on doctor/date change

### Backend
- [ ] **Real API integration** — deprioritized. Toggle via `VITE_USE_MOCK=false` once backend is ready.

---

### Completed (Session 8)
- [x] **Mock removal** — deleted `mockData.js`, rewrote `api.js` as pure fetch client, removed `VITE_USE_MOCK` toggle
- [x] **All pages migrated to real API** — NewAppointment, Availability, Reports, Appointments, DoctorProfile, ScheduleEditor, Doctors all use `api.*` exclusively
- [x] **Doctors CRUD** — create/update doctors, add/edit/delete specialties, color picker, live preview badge

### Completed (Session 9)
- [x] **Frontend README rewrite** — comprehensive reference with features, env vars, architecture, hooks, wizard steps, components, tests, keyboard shortcuts, tech decisions
- [x] **LaTeX WebCompleto.tex fix** — corrected package order (xcolor before hyperref), fixed tcolorbox `#1` double-use bug; PDF generated

*Update this file as tasks are completed or new ones identified.*

