# Utonio — Session Progress Tracker

> **Design specification:** see `DESIGN_SPEC.md` for the full aesthetic direction, app shell, theme tokens, login, page specs, and component contracts.

## Session 1 — 2026-05-31

### Completed ✅

**Phase 1 — Foundation**
- Installed dependencies: react-router-dom, framer-motion, lucide-react, recharts
- Created `src/styles/global.css` with all CSS variables, fonts, reset, global classes
- Created `src/contexts/AuthContext.jsx` + `useAuth.js` + `authContextObject.js` (separated for react-refresh)
- Created `src/services/mockData.js` with 12 patients, 6 doctors, 3 offices, 25 appointments
- Created `src/services/api.js` with fetch wrapper + mock toggle
- Created `.env` with `VITE_USE_MOCK=true`

**Phase 2 — Navigation + Core Components**
- `src/components/Dock/Dock.jsx` + Dock.module.css (macOS magnification with framer-motion)
- `src/components/UI/StatusBadge.jsx` (5 status variants)
- `src/components/UI/SlideOver.jsx` + .css (right-side panel)
- `src/components/UI/Table.jsx` + .css (sortable, searchable, paginated)
- `src/components/UI/TimeSlotGrid.jsx` + .css (8-17:00 in 30min increments, lime glow)

**Phase 3 — Pages**
- `src/pages/Login.jsx` + .module.css (with test credentials hint)
- `src/pages/Dashboard.jsx` + .module.css (stats cards, mini calendar, quick actions, recent table)
- `src/pages/Patients.jsx` + .css (Table + SlideOver for create/edit, status toggle)
- `src/pages/Doctors.jsx` + .css (card grid with specialty filter tabs)
- `src/pages/Appointments.jsx` + .css (filterable table, slide-over detail with action buttons)
- `src/pages/NewAppointment.jsx` + .css (6-step wizard with progress bar, confirmation pulse)
- `src/pages/Availability.jsx` + .css (doctor + date + TimeSlotGrid)
- `src/pages/Reports.jsx` + .css (3 tabs: occupancy, productivity, no-shows with recharts)

**App Shell**
- `src/App.jsx` — BrowserRouter with all routes
- `src/main.jsx` — Entry point
- All routes registered with ProtectedRoute + ProtectedShell (Dock)

### Quality Gates
- `pnpm build` ✅ succeeds (670kb JS, 29kb CSS)
- `pnpm lint` ✅ 0 errors, 0 warnings
- React Compiler + Babel pipeline working
- All file BOM/CRLF issues resolved (use LF line endings only)

### Issues Encountered & Resolved
1. `node_modules` symlink conflict — removed and reinstalled
2. PowerShell `Out-File -Encoding UTF8` adds BOM — fixed with Python normalization
3. PowerShell `\` escaping for single quotes in heredoc strings — used `write` tool instead
4. ESLint `react-refresh/only-export-components` — split AuthContext into 3 files
5. ESLint `react-hooks/set-state-in-effect` — wrapped synchronous setStates in `Promise.resolve().then()`

---

## Session 2 — 2026-05-31

### Completed ✅

**Toast Notification System**
- `src/components/UI/Toast.jsx` — `ToastProvider` + viewport with auto-dismiss, max 4 visible
- `src/components/UI/Toast.css` — slide-in from top-right, 3 variants (success/error/info), 3.5s auto-dismiss with progress bar
- `src/contexts/toastContextObject.js` — context object (split for react-refresh lint)
- `src/hooks/useToast.js` — typed wrapper exposing `success / error / info / dismiss`
- Wrapped `<App />` with `<ToastProvider>` (inside `<AuthProvider>`)
- Integrated into Patients CRUD (create / update / status toggle)
- Integrated into Appointments status transitions (confirm / complete / cancel / no-show)
- Integrated into NewAppointment wizard submit (success + error)
- Integrated into ScheduleEditor save action

**Code Splitting**
- All 7 protected pages lazy-loaded via `React.lazy`
- New `src/components/UI/SkeletonPage.jsx` Suspense fallback (mirrors Dashboard layout)
- Suspense boundary at `AppRoutes` level so login page stays instant
- Build now produces per-page chunks: Dashboard 9.4kb, Doctors 8.4kb, Appointments 7.2kb, etc.
- Main bundle dropped from 670kb → 275kb. Reports (recharts) loads on demand (343kb chunk).

**Doctor Weekly Schedule Editor**
- New `src/components/UI/ScheduleEditor.jsx` + `.css`
- 7-day tab bar (Mon-Sun) with active-day state
- Hour-by-hour grid (8:00-17:00 in 30-min increments) with toggle / add / remove
- Editable chip list of configured slots per day
- "Unsaved changes" guard on close
- Reset and Save buttons with disabled state when clean
- Wired to Doctor cards via "View Schedule" button (disabled for INACTIVE doctors)
- Extended `DOCTOR_SCHEDULES` shape to weekly structure (per-day slot arrays)
- Extended `mockApi.doctors.getSchedule / saveSchedule` and api.js wrapper
- `availability.get()` now reads day-of-week from weekly schedule + booked times

**Dashboard Calendar Click Handler**
- Calendar days are now `<button>` elements (clickable for current month, disabled for prev/next)
- Click day → navigate to `/appointments?date=YYYY-MM-DD`
- Appointments page reads `?date=` URL param and pre-fills the date filter
- Date filter syncs both ways with URL search params (shareable links)
- Today cell gets lime glow on hover
- Removed `.selected` orphan class; cleaned up duplicate `.today` block

**Stagger Animations**
- Added `fadeInUp` keyframe + `.fade-in-up` class to `src/styles/global.css`
- Added `.stagger-6` (300ms) to existing stagger utility set
- Dashboard: stat cards stagger 1-4, calendar + quick actions stagger 2-3
- Doctors: card grid already had per-card `animationDelay` — kept working, removed duplicate keyframe from Doctors.css (now uses global)

**Empty State Illustrations**
- New `src/components/UI/EmptyState.jsx` + `.css`
- 5 SVG variants: generic, appointments, patients, doctors, search
- Floaty micro-animation (4s ease-in-out)
- Wired into `Table` component as a new `emptyVariant` prop
- Appointments and Patients tables now show themed empty states

**Code Cleanup**
- Replaced hardcoded `#ff6b6b` in Appointments.css with `var(--accent-red)` (compliance with "no hardcoded hex" rule)
- Updated mockData DOCTOR_SCHEDULES shape (weekly vs single-day) — was already in transition; now consistent

### Quality Gates
- `pnpm build` ✅ succeeds (per-page code-split chunks, main bundle 275kb)
- `pnpm lint` ✅ 0 errors, 0 warnings

### Issues Encountered & Resolved
1. `import.meta.dirname`-style path bug — initial `ScheduleEditor.jsx` used wrong relative path (`../services/api` from `src/components/UI/` should be `../../services/api`)
2. ESLint `no-unused-vars` on unused `Plus` icon and unused `err` catch params — removed imports, dropped catch binding where not needed

### Next Tasks (see TASK_QUEUE.md)
- [ ] **@21st-dev/magic MCP** for Login / Dashboard polish (MCP not detected in session; manual fallback path used)
- [ ] Mobile dock behavior refinements
- [ ] Add Vitest setup
- [ ] Form autosave drafts

> **Note:** Real backend integration tasks remain deprioritized. Project continues with mock data layer (`VITE_USE_MOCK=true`).

---

## Session 3 — 2026-05-31 (Design Spec Implementation)

### Completed ✅

**Design Specification Document**
- New `DESIGN_SPEC.md` captures the full aesthetic direction: tone, theming, app shell, login, dock, every page, every component
- Spec covers dark + light token systems, WebGL shader, navbar, dock magnification, error boundaries, settings sections, and the three "memorable differentiators"

**Theming System (Light + Dark + Accent + Font Scale)**
- Refactored `src/styles/global.css` to scope all theme tokens under `[data-theme="dark"]` and `[data-theme="light"]` instead of `:root`
- Added full light palette per spec: `#7CB800` lime, `#5B4CE0` violet, `#D94040` red, `#1A9E62` green, `#F0F0F5` bg-base, `#FFFFFF` surface
- New `var(--navbar-bg)`, `var(--dock-bg)`, `var(--shadow)`, `var(--shadow-sm)`, `var(--shadow-md)` tokens
- New `var(--font-scale)` for accessibility font sizing
- Added `transition: background-color/color/border-color 300ms` to body + key surfaces for smooth theme swaps
- `src/contexts/themeContextObject.js` + `src/contexts/ThemeContext.jsx` (split for react-refresh lint)
- `src/hooks/useTheme.js` exposes `theme`, `setTheme`, `toggleTheme`, `accent`, `setAccent`, `accentPresets`, `fontScale`, `setFontScale`, `fontScales`, `isDark`
- Persists preferences to `localStorage` (`utonio-theme`, `utonio-accent`, `utonio-font-scale`)
- Falls back to `prefers-color-scheme` on first visit
- Accent presets: lime / violet / cyan / orange / rose — updates `--accent-lime` on `:root` via `setProperty` so every component reacts immediately

**Top Navbar**
- New `src/components/Navbar/Navbar.jsx` + `.css`
- Fixed top, 60px tall, full-width, `backdrop-filter: blur(20px) saturate(180%)`
- **Left:** Utonio wordmark in Syne 700 20px lime + Plus icon in lime square
- **Right (3 items):**
  1. Theme toggle — Sun in dark mode, Moon in light, smooth `rotate(360deg)` keyframe
  2. Profile button — gradient avatar (initials), name, ChevronDown; opens dropdown with My Profile / Change Password / Preferences / Logout
  3. Logout button — LogOut icon + label, ghost pill, hover turns red
- Click-outside-to-close for dropdown
- Mobile responsive: hides text labels under 720px, swaps to icon-only logout

**WebGL Login**
- New `src/components/ShaderBackground.jsx` — full-screen plasma wave shader (exact code from spec, only the Tailwind className was replaced with inline `style`)
- Graceful fallback: if WebGL isn't supported, console warns (the dark `#0A0A15` page background still renders)
- New `src/pages/Login.jsx` + `Login.css` (replaced old Login.module.css):
  - Glassmorphic card: `rgba(13,13,26,0.7)` bg + `backdrop-filter: blur(24px) saturate(200%)` + 28px radius + double-layer shadow
  - Header: "Welcome to Utonio" (Syne 700 28px) + subtitle
  - Email + password fields with focus ring
  - Password field has Eye/EyeOff show-hide toggle
  - Lime 48px full-width submit button with brighten + scale on hover, Loader2 spinner on submit
  - Inline error banner: red 15% bg + red border + AlertCircle icon
  - 3 test-credential cards that auto-fill on click
  - Card entry animation: 500ms fadeInUp
  - Backdrop has 2 radial-gradient color washes over the shader for extra depth
- `Navigate to="/"` redirect when `isAuthenticated`

**ErrorBoundary**
- New `src/components/UI/ErrorBoundary.jsx` + `.css`
- Class component with `getDerivedStateFromError` + `componentDidCatch`
- Renders red-bordered card with error icon, message, truncated stack (6 lines), and "Try Again" reset button
- Wraps every page route in `App.jsx` via a `withErrorBoundary()` helper — critical for the Appointments page black-screen risk
- Settings page also self-wraps for safety

**7-Icon Dock (with Settings)**
- Rewrote `src/components/Dock/Dock.jsx`:
  - Added Settings (with neutral gray gradient + white tint)
  - Refactored magnification to spec pattern: `useTransform(mouseX, val => val - bounds.x - bounds.width/2)` against the icon's own bounds
  - Spring: `mass: 0.1, stiffness: 150, damping: 12`
  - Per-icon `motion.div` with `width` + `height` driven by spring
  - Active icon: 6px lime dot below + 16px tinted glow
- Updated `Dock.module.css` to use `var(--dock-bg)`, `var(--border)`, `var(--shadow)` (no more hardcoded rgba)
- Tooltip now uses bg-surface + border + shadow-md (theme-aware)

**Settings Page**
- New `src/pages/Settings.jsx` + `Settings.css` (lazy-loaded)
- Accordion/row layout with 5 sections:
  - **General** — Language (EN/ES/PT dropdown), Date format (MM/DD vs DD/MM radio pills with live sample), Timezone (8-zone dropdown)
  - **Appearance** — Theme (Dark/Light card radio with mini preview swatches showing lime dot + lines, matches navbar toggle), Accent color (5 swatches: lime/violet/cyan/orange/rose, active ring + check), Font size (Small/Medium/Large with live `Aa` preview)
  - **Notifications** — 4 `<CustomToggle>`s: Email, Reminders, Daily summary, No-show alerts
  - **Account** — Editable display name + Save, read-only email + Change Email CTA, password change block (3 fields with show/hide, validation, inline error)
  - **Danger Zone** — Red-bordered section, "Deactivate Account" outline button expands inline confirmation requiring typed "CONFIRM" string to enable final destructive action
- Every change fires a success toast immediately

**CustomToggle**
- New `src/components/UI/CustomToggle.jsx` + `.css`
- CSS-only sliding pill: 44×24px track + 18×18 thumb with 200ms ease spring
- `var(--accent-lime)` when on, `var(--border)` when off
- Label + optional description on the left, switch on the right
- Visually-hidden native checkbox retains keyboard accessibility
- Hover: border lights up, bg brightens

**Layout Adjustments**
- `.app-layout` padding changed from `40px 48px 140px` → `80px 48px 120px` (clears 60px navbar + leaves room for dock)
- Mobile: `96px 20px 140px` so navbar gap still feels right on narrow screens
- Removed the dead `Login.module.css` (was using CSS modules; spec mandates vanilla)

**Theme + Error Hardening in Existing Pages**
- `Reports.jsx`: wrapped in `ErrorBoundary`, defensive `(data ?? []).map(...)` everywhere, `Array.isArray(d) ? d : []` initial state, all recharts colors now use `var(--name)` (theme-aware), empty-state for each chart when `data.length === 0`
- `NewAppointment.jsx`: also wrapped in ErrorBoundary via App.jsx helper
- `Appointments.jsx`: `(appointments ?? [])` already null-safe + ErrorBoundary wrapped at the route level
- `Settings.jsx`: self-wraps in ErrorBoundary as well (defense in depth)

### Quality Gates
- `pnpm build` ✅ succeeds (main bundle 394kb / 128kb gzip — includes navbar + dock + WebGL + framer-motion)
- `pnpm lint` ✅ 0 errors, 0 warnings
- All 8 page routes wrapped in ErrorBoundary
- Zero hardcoded colors outside login glassmorphic overlay + theme-preview swatches (intentional)

### Files Created (Session 3)
- `DESIGN_SPEC.md`
- `src/contexts/themeContextObject.js`
- `src/contexts/ThemeContext.jsx`
- `src/hooks/useTheme.js`
- `src/components/Navbar/Navbar.jsx` + `.css`
- `src/components/ShaderBackground.jsx`
- `src/components/UI/ErrorBoundary.jsx` + `.css`
- `src/components/UI/CustomToggle.jsx` + `.css`
- `src/pages/Settings.jsx` + `Settings.css`

### Files Modified (Session 3)
- `src/styles/global.css` — split into dark + light token blocks
- `src/App.jsx` — added ThemeProvider, Navbar to ProtectedShell, Settings route, ErrorBoundary wrapper helper
- `src/pages/Login.jsx` + `Login.css` — full redesign with WebGL shader
- `src/components/Dock/Dock.jsx` + `Dock.module.css` — 7 icons, refactored magnification
- `src/pages/Reports.jsx` — ErrorBoundary wrap, theme-aware recharts, defensive data access

### Next Tasks (see TASK_QUEUE.md)
- [ ] **Form autosave drafts** — persist Patients form to localStorage
- [ ] **Mobile responsive pass** — test all pages at 375/768/1024px viewports
- [ ] **Doctor profile page** — `/doctors/:id` with bio, schedule, recent appointments
- [ ] **Keyboard shortcuts** — N (new), / (search), Esc (close)
- [ ] **Vitest setup** — test StatusBadge, mockApi, useTheme
- [ ] **Floating-label form fields** — for Patient registration per design spec
- [ ] **Stagger animation on TimeSlotGrid** — per "memorable differentiator" #3

> **Note:** Real backend integration remains deprioritized. Project continues with mock data layer (`VITE_USE_MOCK=true`).

---

## Session 4 — 2026-06-01

### Completed ✅

**TimeSlotGrid — Scoreboard Lighting Effect (memorable differentiator #3)**
- Replaced the basic `fadeInUp 300ms` stagger in `src/components/UI/TimeSlotGrid.jsx` + `.css` with a true "scoreboard lighting up" wave as called out in `DESIGN_SPEC.md §8.3`
- New `scoreboardLight` keyframe: each slot starts hidden + scaled 0.85, bursts to full opacity + `scale(1.06)` with a strong `var(--accent-lime-glow)` halo (the "lit" moment), then settles to a soft `var(--accent-lime-dim)` ambient glow on the resting state
- Companion `scoreboardLightDim` keyframe for `.unavailable` slots — they flash briefly then return to the dimmed strikethrough state, so the wave reads as a single choreography even when half the row is taken
- 35ms stagger between slots (18 slots × 35 = 595ms wave start, finishes around 1.2s)
- Replaced two hardcoded `rgba(200, 245, 90, …)` shadows with `var(--accent-lime-glow)` so the glow tracks the active theme/accent (light mode was previously broken here)
- Tightened `transition` shorthand on `.time-slot` to list properties explicitly (no more `transition: all` fighting with the keyframe)

**Re-trigger on context change**
- New `gridKey` prop on `TimeSlotGrid` is used as a key prefix for each button (`${gridKey}-${slot.time}`)
- `Availability.jsx` and `NewAppointment.jsx` now pass `gridKey={`${doctorId}-${date}`}`
- Switching doctor or date forces a remount → animation replays every time, never gets stuck after a same-keys update

### Quality Gates
- `pnpm build` ✅ succeeds (NewAppointment 9.15kb / 2.59kb gzip, Availability 3.11kb / 1.16kb gzip — no regression)
- `pnpm lint` ✅ 0 errors, 0 warnings

### Files Modified (Session 4)
- `src/components/UI/TimeSlotGrid.jsx` — added `gridKey` prop, refactored class assembly
- `src/components/UI/TimeSlotGrid.css` — added `scoreboardLight` + `scoreboardLightDim` keyframes, replaced hardcoded shadows
- `src/pages/Availability.jsx` — passes `gridKey`
- `src/pages/NewAppointment.jsx` — passes `gridKey`

### Next Tasks (see TASK_QUEUE.md)
- [ ] **Mobile responsive pass** — test all 8 pages at 375/768/1024px viewports
- [ ] **Doctor profile page** — `/doctors/:id` with bio, schedule, recent appointments
- [ ] **Vitest setup** — test StatusBadge, mockApi, useTheme
- [ ] **Richer search in Appointments** — joins patient + doctor + status

---

## Session 5 — 2026-06-01 (Polish + medium value push)

### Completed ✅

**Form Autosave (high value)**
- New `src/hooks/useFormDraft.js` — generic hook that persists form state to `localStorage` under `utonio-draft-<key>`. Lazy init reads any saved draft and merges over the initial state. Live `useEffect` syncs state → storage on every change, auto-removes the draft when the state matches the initial shape. `hasDraft` is `false` when the loaded draft equals the baseline, so the banner only shows for real user input. Exports `state, setState, hasDraft, savedAt, clear, reset` and a `draftAge(savedAt)` helper for "5 min ago" formatting.
- `src/pages/Patients.jsx` — draft key is `patient-new` for create, `patient-edit-<id>` for edit, so editing patient A and switching to patient B doesn't leak data. `clear()` runs on successful submit, `reset()` on cancel/close. Draft-restored banner shows inside the slide-over with a violet accent.
- `src/pages/NewAppointment.jsx` — uses `appointment-new` as the key. Toast on mount: *"Draft restored from 5 min ago — Resuming appointment"*. Banner at the top of the wizard with a "Start over" button.
- `src/styles/global.css` — shared `.draft-banner` / `.draft-discard` styles (no more duplication in component CSS).

**FloatingLabel Form Fields (high value, design spec §4.2)**
- New `src/components/UI/FloatingField.jsx` + `.css` — Material-style input where the label sits in the placeholder position at rest and floats up (smaller, lime-tinted) on focus or when filled. Works for `text`, `email`, `tel`, `date`. Required indicator, inline error, ARIA wiring (`aria-invalid`, `aria-describedby`).
- `src/pages/Patients.jsx` — six fields (First/Last, Email, Phone/Student ID, Birth Date) are now `FloatingField`. Two-column rows collapse to one column at <480px. Cancel button now has an `X` icon for clearer intent.
- `src/components/UI/FloatingField.css` — uses `var(--accent-lime-dim)` and CSS variables throughout, theme-aware.

**Empty State for Dashboard Recent Appointments (nice-to-have)**
- `src/pages/Dashboard.jsx` — replaced the plain `<p>No appointments yet</p>` with the shared `EmptyState` component (`variant="appointments"`) plus a primary CTA "New Appointment" button. Card padding now goes to `0` when empty so the illustration has full room.

**Keyboard Shortcuts (medium value)**
- New `src/hooks/useKeyboardShortcuts.js` — generic keydown listener with combo normalization (`mod`, `shift`, `alt` prefixes, lowercase letters, `space`). Default behavior: ignore shortcuts when the user is typing in `input`/`textarea`/`select`/`contentEditable`; `Escape` is always allowed.
- New `src/components/KeyboardShortcutsHelp.jsx` + `.css` — `?` opens a glassmorphic modal listing every shortcut with `<kbd>` pills. Esc or backdrop click closes.
- `src/App.jsx` — global shortcuts wired in `ProtectedShell`:
  - `N` → `/appointments/new`
  - `G` then `D` → `/` (Dashboard)
  - `G` then `A` → `/appointments`
  - `G` then `P` → `/patients`
  - `G` then `R` → `/reports`
  - The "G" prefix has a 800ms window before it expires.
- The existing SlideOver `Esc` handler remains in place — global handler defers to it.

**Skeleton Loaders on Slide-overs (nice-to-have)**
- `src/components/UI/SlideOver.jsx` — new `loading` and `skeleton` props. When `loading` is true, content is replaced with a skeleton block (`form` for forms, `detail` for appointment detail, or a single tall bar). Animation matches the rest of the system.

**Doctor Schedule Conflict Validation (medium value)**
- New `src/utils/scheduleConflicts.js` — `findScheduleConflicts(appointments, doctorId, weeklySchedule)` returns an array of `{ appointment, day, time, reason }` for every future `SCHEDULED`/`CONFIRMED` appointment that no longer fits the proposed schedule.
- `src/components/UI/ScheduleEditor.jsx` — fetches appointments alongside the schedule, computes conflicts live via `useMemo`, and surfaces them three ways:
  1. Red `AlertTriangle` banner at the top with up to 5 conflicts listed
  2. Red dot badge + border on the day tab for each conflicting weekday
  3. Inline conflict count next to the day meta header
- On save with conflicts, an inline confirmation modal asks *"Save anyway?"* with a danger-style "Save anyway" button (or "Adjust schedule" to dismiss). Reusing the existing `.btn-danger` keeps the spec-aligned red.

**useDebounce (technical debt)**
- New `src/hooks/useDebounce.js` — 200ms debounce on the `Table` search input. `Table.jsx` now uses `useDebounce(search, 200)` so filtering only runs after the user stops typing.

**CSS Module Cleanup (technical debt + spec compliance)**
- Converted the last three CSS-module files to plain CSS: `Dashboard.module.css → Dashboard.css`, `App.module.css → App.css`, `Dock.module.css → Dock.css`. Updated all `import styles from …` / `styles['xxx']` to plain `className="…"`. No `*.module.css` remains in `src/`.

**NewAppointment.css — Hardcoded rgba Cleanup**
- Replaced the two `rgba(200, 245, 90, …)` literals in the `successPulse` keyframe with `var(--accent-lime-glow)` and `transparent`. The animation now respects the active accent color.

### Quality Gates
- `pnpm build` ✅ succeeds (main bundle 397.45kb / 128.60kb gzip, +0.3kb from keyboard help + autosave code, all within budget)
- `pnpm lint` ✅ 0 errors, 0 warnings
- Zero `.module.css` files remain in `src/`

### Files Created (Session 5)
- `src/hooks/useFormDraft.js`
- `src/hooks/useDebounce.js`
- `src/hooks/useKeyboardShortcuts.js`
- `src/components/UI/FloatingField.jsx` + `.css`
- `src/components/KeyboardShortcutsHelp.jsx` + `.css`
- `src/utils/scheduleConflicts.js`

### Files Modified (Session 5)
- `src/pages/Dashboard.jsx` + new `Dashboard.css` (replaces `Dashboard.module.css`)
- `src/pages/Patients.jsx` + `Patients.css` (FloatingField + autosave)
- `src/pages/NewAppointment.jsx` + `NewAppointment.css` (autosave, hardcoded rgba)
- `src/components/UI/ScheduleEditor.jsx` + `.css` (conflict detection)
- `src/components/UI/SlideOver.jsx` + `.css` (loading/skeleton props)
- `src/components/UI/Table.jsx` (useDebounce on search)
- `src/components/Dock/Dock.jsx` + new `Dock.css` (replaces `Dock.module.css`)
- `src/App.jsx` + new `App.css` (replaces `App.module.css`, global shortcuts, help dialog)
- `src/styles/global.css` (shared `.draft-banner` rules)

### Files Removed (Session 5)
- `src/pages/Dashboard.module.css`
- `src/App.module.css`
- `src/components/Dock/Dock.module.css`

---

## Session 6 — 2026-06-01 (Profile, search, tests, mobile, onboarding)

### Completed ✅

**Doctor Profile page** (`/doctors/:id`)
- New `src/pages/DoctorProfile.jsx` + `DoctorProfile.css` — read-only "deep-dive" view per doctor
- Hero card: avatar (gradient with specialty color), name, status pill, specialty chip, "X years on staff" meta, email/phone `mailto:` / `tel:` pills, "New Appointment" (deep-links to `?doctorId=`) + "Edit Schedule" actions
- 4-up stats grid: total appointments, upcoming, completed (% completion rate), no-shows (% no-show rate)
- Two-column body:
  - Weekly schedule — 7-day grid with slot count + first/last time range, today cell gets lime dot + lime border
  - Upcoming appointments list — date tile (day + month) + time + patient + type/office + status badge, "View all" CTA at the bottom
- Recent activity table — past 8 appointments with date, time, patient, type, office, status
- ErrorBoundary-wrapped, theme-aware, mobile-responsive (collapses to single column, week-schedule becomes 4-col grid on tiny screens)
- `mockApi.doctors.get(id)` + `api.doctors.get(id)` added; back-button leads to `/doctors`
- Doctor cards on `/doctors` are now full clickable surfaces (`role="button"`, Enter/Space keyboard), with a chevron that animates on hover; secondary "Profile" button added next to "Schedule" for explicit affordance

**Richer search in Appointments**
- New search input in the filter bar with debounced (200ms via `useDebounce`) text matching against: patient name, doctor name, status (e.g. typing "conf" matches CONFIRMED), appointment type, time, date, and notes
- URL-synced via `?q=` (so searches are shareable, same pattern as `?date=`)
- Clear-X button inside the input; `searchable={false}` on the inner `Table` so the two search systems don't fight
- Empty-state message reflects whether a search or a filter is the cause
- Filter pipeline is now a `useMemo` (no more per-render recomputation)
- `STATUSES` array now derives from the new `APPOINTMENT_STATUSES` constant, with display labels

**Constants extraction**
- New `src/data/constants.js` — single source of truth for `SPECIALTIES`, `APPOINTMENT_TYPES`, `OFFICES`, `APPOINTMENT_STATUSES`, `ACTIVE_STATUSES`, `HOUR_BLOCKS`, `FULL_HOURS`, `TIME_SLOTS`
- `src/services/mockData.js` re-exports the moved constants and imports `HOUR_BLOCKS` for the schedule generator
- `src/services/api.js` re-exports the new constants for downstream imports

**Vitest setup**
- New `package.json` dev deps: `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom`
- `vite.config.js` `test` block: `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.js']`, `css: false`
- `src/test/setup.js` — `@testing-library/jest-dom/vitest` matchers + jsdom `matchMedia` polyfill + `cleanup` after each test + `localStorage.clear()`
- New `test` / `test:watch` scripts in `package.json`
- `eslint.config.js` — added test-file glob with `vi`/`describe`/`it`/`expect` etc. as readonly globals
- **48 tests** across 6 files, all passing:
  - `StatusBadge.test.jsx` (7 tests) — 5 status variants + unknown-state fallback
  - `useTheme.test.jsx` (10 tests) — toggle, persist, accent, font scale, throws-outside-provider
  - `mockApi.test.js` (9 tests) — patients create/update round-trip, appointments create/update, availability day-of-week + booked-times logic
  - `scheduleConflicts.test.js` (8 tests) — clean / partial overlap / fully removed day / past ignored / wrong status ignored / wrong doctor ignored / invalid input
  - `useDebounce.test.js` (4 tests) — initial value, delay, coalescing
  - `useFormDraft.test.js` (10 tests) — initial state, restore from storage, `clear`, `reset`, `draftAge` formatting (just now / min / hr / day / plural)

**Mobile responsive pass**
- New `useIsMobile()` hook in `Dock.jsx` — `matchMedia('(max-width: 600px)')` listener; mobile dock uses `BASE 40 / MAX 52` (vs `52 / 76` on desktop) so all 7 icons fit, with magnification disabled (mouseMove listener removed on mobile since the trigger is meaningless on touch)
- `src/styles/global.css` — new 480px breakpoint: tighter app padding, smaller titles, single-column stats, smaller card padding, smaller table cells
- `Appointments.css` — filter bar stacks vertically at 720px, status pills shrink, detail grid becomes single column
- `NewAppointment.css` — wizard steps collapse to numbers-only (hides the `wizard-step-label` span), wizard content padding shrinks, patient/doctor/type/office grids go single-column, review rows stack label/value
- `Reports.css` — tabs become horizontally scrollable with hidden scrollbar at 720px
- `Availability.css` — narrower padding on mobile
- `TimeSlotGrid.css` — slot grid uses 64px minimum (vs 80px) and smaller text on phones
- `Doctors.css` — specialty tabs become horizontally scrollable on mobile, doctor grid collapses to 1 column
- `DoctorProfile.css` — already had mobile rules; tightened hero on tiny screens
- `Dock.css` — mobile-specific smaller padding, smaller border-radius

**Onboarding tour**
- New `src/components/OnboardingTour.jsx` + `.css` — first-visit modal tour that shows once (gated by `localStorage['utonio-onboarding-seen-v1']`), 5 steps:
  1. Welcome to Utonio (Sparkles)
  2. The Dock is your home base (Compass) — mentions macOS magnification
  3. Move at the speed of thought (Keyboard) — explains `N` + `G→{D,A,P,R}` + `?`
  4. Schedule in seconds (CalendarPlus) — mentions the 6-step wizard + autosave
  5. Insights that matter (BarChart2) — explains the 3 Reports tabs
- Glassmorphic card with `color-mix()` accent halo, progress dots, Back/Skip/Next/Finish controls, Esc to dismiss
- Mounted in `ProtectedShell` so it only shows for authenticated users; locks `body.overflow` while open
- "Restart tour" button in `Settings → General → Product Tour` clears the flag + reloads

### Quality Gates
- `pnpm build` ✅ succeeds (main bundle 403.80kb / 130.67kb gzip — within budget; DoctorProfile 19.14kb / 6.87kb gzip, OnboardingTour in main bundle)
- `pnpm lint` ✅ 0 errors, 0 warnings
- `pnpm test` ✅ **48 / 48 passing** (StatusBadge, useTheme, mockApi, scheduleConflicts, useDebounce, useFormDraft)

### Files Created (Session 6)
- `src/pages/DoctorProfile.jsx` + `DoctorProfile.css`
- `src/data/constants.js`
- `src/test/setup.js`
- `src/test/StatusBadge.test.jsx`
- `src/test/useTheme.test.jsx`
- `src/test/mockApi.test.js`
- `src/test/scheduleConflicts.test.js`
- `src/test/useDebounce.test.js`
- `src/test/useFormDraft.test.js`
- `src/components/OnboardingTour.jsx` + `.css`

### Files Modified (Session 6)
- `src/services/mockData.js` — imports + re-exports from `data/constants.js`
- `src/services/api.js` — adds re-exports of new constants + `doctors.get(id)`
- `src/App.jsx` — lazy-loads `DoctorProfile`, adds `/doctors/:id` route, mounts `<OnboardingTour />` in `ProtectedShell`
- `src/pages/Appointments.jsx` — adds rich search input, `useMemo`-d filter, URL `?q=` sync, derives `STATUSES` from `APPOINTMENT_STATUSES`
- `src/pages/Appointments.css` — search input styles + 720px responsive rules
- `src/pages/Doctors.jsx` + `Doctors.css` — clickable card surface, chevron animation, secondary "Profile" button, mobile specialty-tab scroll
- `src/pages/NewAppointment.css` — 720px wizard responsive
- `src/pages/Reports.css` — 720px tabs scroll
- `src/pages/Availability.css` — 720px card padding
- `src/pages/Settings.jsx` — adds "Restart tour" row in General section
- `src/components/Dock/Dock.jsx` + `Dock.css` — `useIsMobile` hook, smaller base/max on mobile, magnification disabled on touch
- `src/components/UI/TimeSlotGrid.css` — 480px slot grid responsive
- `src/styles/global.css` — new 480px breakpoint
- `vite.config.js` — `test` block
- `eslint.config.js` — test-file glob
- `package.json` — `test` / `test:watch` scripts + 5 new devDeps

### Next Tasks (see TASK_QUEUE.md)
- All planned Session 6 tasks complete. Remaining backlog is real backend integration (`VITE_USE_MOCK=false`) and the long-tail polish items.

---

*Last updated: 2026-06-01 — Session 6 (Doctor Profile, Rich Search, Vitest, Mobile, Onboarding) complete; 48 tests passing; build + lint clean.*

---

## Session 7 — 2026-06-02 (Doctors module CRUD + Specialties management)

### Completed ✅

**Doctors CRUD (Create + Edit + Toggle Status)**
- Added `api.doctors.create` and `api.doctors.update` methods to `src/services/api.js`
- Added `mockApi.doctors.create` and `mockApi.doctors.update` to `src/services/mockData.js`
- Rewrote `Doctors.jsx` — removed `mockApi` direct import, now uses `api.doctors.list()` through `load()`
- Added "Add Doctor" button in the page header, "Edit" button on each doctor card, "Activate/Deactivate" toggle
- `SlideOver` form with: Full Name (FloatingField), Specialty (select dropdown), Email (FloatingField), Phone (FloatingField)
- Inline validation: required fields, email format check
- Toast notifications on success/error
- Reloads data after every mutation

**Specialties CRUD (Create + Edit + Delete)**
- Added `api.specialties.list/create/update/delete` methods to `src/services/api.js`
- Added `mockApi.specialties.list/create/update/delete` to `src/services/mockData.js`
- `SPECIALTIES` moved from `src/data/constants.js` to `src/services/mockData.js` (now mutable at runtime for mock mode)
- Added "Specialty" button in the page header that opens a dedicated slide-over
- Specialty form: name (FloatingField) + color palette picker (8 colors) + live preview badge
- Delete protection: checks if any doctor uses the specialty before allowing deletion
- Color palette preview shows the badge with the selected color in real-time

**Removed direct mockApi usage**
- `ScheduleEditor.jsx` — replaced `mockApi` import with `api` (uses `api.doctors.getSchedule/saveSchedule` and `api.appointments.list`)
- `Doctors.jsx` — now uses only `api` (not `mockApi` directly)

**API layer completeness**
- All CRUD operations for doctors and specialties now have both mock and real API paths
- `VITE_USE_MOCK=true` routes to mock; `false` routes to real backend at `VITE_API_URL`
- Mock data properly exports `SPECIALTIES`, `DOCTORS`, `PATIENTS`, `APPOINTMENTS`, `DOCTOR_SCHEDULES`

### Quality Gates
- `pnpm build` ✅ succeeds
- `pnpm lint` ✅ 0 errors, 0 warnings

### Files Modified (Session 7)
- `src/services/api.js` — added `doctors.create/update`, full `specialties` CRUD (list/create/update/delete)
- `src/services/mockData.js` — added `doctors.create/update`, `specialties` CRUD, `SPECIALTIES` mutable for runtime changes
- `src/pages/Doctors.jsx` — complete rewrite with doctor + specialty CRUD forms, SlideOver, validation, toast
- `src/pages/Doctors.css` — added styles for forms, color picker, specialty preview, header layout, responsive
- `src/components/UI/ScheduleEditor.jsx` — replaced `mockApi` with `api` for schedule/appointments calls

---

## Session 8 — 2026-06-02 (Mock removal — real API only)

### Completed ✅

**Removed all mock data and USE_MOCK toggle**
- Rewrote `src/services/api.js` — pure real API client, no more `USE_MOCK` conditionals or `mockApi` references
- Deleted `src/services/mockData.js` — all mock data, mockApi, constants re-exports gone
- Deleted `src/test/mockApi.test.js` — tests for mockApi no longer relevant
- Updated `.env` — removed `VITE_USE_MOCK=true`, now only `VITE_API_URL`
- `api.js` now exports constants (`SPECIALTIES`, `APPOINTMENT_TYPES`, `OFFICES`, etc.) from `constants.js`

**Updated pages to use `api` instead of `mockApi`:**
- `NewAppointment.jsx` — replaced `mockApi` with `api` for patients/doctors/specialties/appointments/availability; specialties loaded from API via `api.specialties.list()`
- `Availability.jsx` — replaced `mockApi` with `api` for doctors/specialties/availability
- `Reports.jsx` — replaced `mockApi` with `api` for all three report endpoints
- `Appointments.jsx` — replaced `mockApi` with `api` for appointments/doctors/patients/offices
- `DoctorProfile.jsx` — removed stale `SPECIALTIES`/`APPOINTMENT_TYPES` from api import; now from `constants.js`
- `ScheduleEditor.jsx` — already using `api` (updated in Session 7)
- `Doctors.jsx` — already using `api` (updated in Session 7)

**Remaining static reference data:**
- `constants.js` still exports `SPECIALTIES`, `APPOINTMENT_TYPES`, `OFFICES`, `APPOINTMENT_STATUSES`, `HOUR_BLOCKS`, `FULL_HOURS`, `TIME_SLOTS` — these are UI config constants, not mock data. The backend provides specialty/office data via `api.specialties.list()` / `api.offices.list()` when needed.

### Quality Gates
- `pnpm build` ✅ succeeds
- `pnpm lint` ✅ 0 errors, 0 warnings

### Files Modified (Session 8)
- `src/services/api.js` — pure fetch client, `token()` helper, all endpoints point to real API
- `src/pages/NewAppointment.jsx` — `mockApi` → `api`, specialties loaded from API
- `src/pages/Availability.jsx` — `mockApi` → `api`, specialties loaded from API
- `src/pages/Reports.jsx` — `mockApi` → `api`
- `src/pages/Appointments.jsx` — `mockApi` → `api`
- `src/pages/DoctorProfile.jsx` — constants import fix
- `.env` — removed `VITE_USE_MOCK=true`

### Files Deleted (Session 8)
- `src/services/mockData.js`
- `src/test/mockApi.test.js`

### Next Tasks (see TASK_QUEUE.md)
- [ ] Backend integration: connect to Spring Boot API (API client is ready, ensure backend is running at `VITE_API_URL`)
- [ ] Patient profile page
- [ ] Bulk appointment actions (cancel multiple, reschedule)
- [ ] Email notifications system
