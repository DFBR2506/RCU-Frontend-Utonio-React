# Utonio — Design Specification

> Source of truth for the look, feel, and information architecture of Utonio.
> Last updated: 2026-05-31

---

## 1. Aesthetic Direction

**Tone:** Elevated, modern, clinical-luxe. Think high-end health tech — surgical elegance, glass surfaces, precise spacing, confident typography.

**Theming:** The app supports dark mode (default) and light mode, toggled by a button in the top navbar. All colors are driven by CSS custom properties that swap when a `data-theme="light"` attribute is set on `<html>`. Both themes must look polished — light mode is not an afterthought.

### Dark Mode Tokens (default)

```css
[data-theme="dark"] {
  --bg-base: #0A0A0F;
  --bg-surface: #13131A;
  --bg-card: rgba(255,255,255,0.03);
  --accent-lime: #C8F55A;
  --accent-violet: #7B6EF6;
  --accent-red: #F25C5C;
  --accent-green: #3DD68C;
  --text-primary: #EEEEF0;
  --text-secondary: #7A7A8C;
  --border: rgba(255,255,255,0.08);
  --glass-blur: blur(12px);
  --dock-bg: rgba(20,20,30,0.55);
  --navbar-bg: rgba(10,10,15,0.8);
  --shadow: 0 8px 48px rgba(0,0,0,0.5);
}
```

### Light Mode Tokens

```css
[data-theme="light"] {
  --bg-base: #F0F0F5;
  --bg-surface: #FFFFFF;
  --bg-card: rgba(255,255,255,0.85);
  --accent-lime: #7CB800;
  --accent-violet: #5B4CE0;
  --accent-red: #D94040;
  --accent-green: #1A9E62;
  --text-primary: #0D0D14;
  --text-secondary: #6B6B80;
  --border: rgba(0,0,0,0.08);
  --glass-blur: blur(12px);
  --dock-bg: rgba(220,220,235,0.7);
  --navbar-bg: rgba(240,240,245,0.85);
  --shadow: 0 8px 48px rgba(0,0,0,0.12);
}
```

### Typography
- **Syne** (headings) + **Epilogue** (body), imported from Google Fonts
- Never Inter, Roboto, Arial

### Styling Architecture
- **No Tailwind.** All styles in vanilla CSS using class names.
- Zero CSS modules, zero styled-components.
- Inject Google Fonts `<link>` once.

---

## 2. App Shell Layout

Three zones: top navbar (fixed), main content (scrollable, padding-top 80px / padding-bottom 120px), bottom dock (fixed, centered).

```
┌─────────────────────────────────────────┐
│               TOP NAVBAR                │  ← fixed, full-width
├─────────────────────────────────────────┤
│           MAIN CONTENT AREA             │  ← scrollable
├─────────────────────────────────────────┤
│            BOTTOM DOCK                  │  ← fixed, centered
└─────────────────────────────────────────┘
```

### 2.1 Top Navbar
```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: var(--navbar-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 900;
}
```

**Left:** Utonio wordmark (Syne 700 20px, `--accent-lime`) + Plus icon (lime).

**Right (3 items, gap 16px, align center):**
1. **Theme Toggle** — icon-only pill. Sun icon in dark mode, Moon in light. On click, toggles `data-theme` on `<html>`. Smooth rotate(360deg) icon swap transition.
2. **Profile Button** — avatar (initials circle, 36px) + name (Epilogue). On click, dropdown with: "My Profile", "Change Password", "Preferences" — each row with a lucide icon.
3. **Logout Button** — LogOut icon + "Logout" label, ghost/outline pill style. Clears auth, returns to Login.

### 2.2 Main Content Area
- `padding-top: 80px` (clears the 60px navbar)
- `padding-bottom: 120px` (clears the floating dock)

### 2.3 Bottom Dock
Glassmorphic bar pinned bottom-center, replicates macOS dock magnification.

```css
.dock {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 10px 16px 12px;
  background: var(--dock-bg);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,0.06);
  z-index: 1000;
}
```

| Module | Icon (lucide) | Background |
|---|---|---|
| Dashboard | LayoutDashboard | linear-gradient(135deg,#1A1A2E,#2D1F6E) |
| Patients | Users | linear-gradient(135deg,#1A2E1A,#1A5C3A) |
| Doctors | Stethoscope | linear-gradient(135deg,#1A2428,#0E4A5C) |
| Appointments | CalendarCheck | linear-gradient(135deg,#2E1A1A,#6E1F1F) |
| Availability | Clock | linear-gradient(135deg,#2E2A1A,#5C4E0E) |
| Reports | BarChart2 | linear-gradient(135deg,#1A1A2E,#3A1A5C) |
| Settings | Settings | linear-gradient(135deg,#1E1E1E,#3A3A3A) |

**Magnification (framer-motion):**
```js
const distance = useTransform(mouseX, (val) => {
  const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
  return val - bounds.x - bounds.width / 2
})
const widthSync = useTransform(distance, [-150, 0, 150], [52, 76, 52])
const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })
```
Active icon shows a 6px lime dot below it.

---

## 3. Login Screen (Full-Page, Pre-Auth)

Renders before the app shell. No navbar, no dock. After successful login, transition into the app shell.

### 3.1 Background — WebGL Shader
`<ShaderBackground />` renders full-screen animated plasma wave on a WebGL canvas. Do **not** modify the shader math. The only allowed change: replace Tailwind `className="fixed top-0 left-0 w-full h-full -z-10"` with the inline style:
```jsx
style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
```

### 3.2 Login Card (glassmorphism, centered over shader)
```css
.login-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 48px 40px;
  background: rgba(13,13,26,0.7);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
}
```

### 3.3 Form Fields
- **Header:** "Welcome to Utonio" (Syne 700 28px, white). Sub-label: "Sign in to continue" (Epilogue 14px, `--text-secondary`).
- **Email:** full-width, focus ring `--accent-lime`.
- **Password:** full-width + show/hide toggle (Eye/EyeOff lucide icon).
- **Login button:** full width, `--accent-lime` bg, `#0A0A0F` text, font-weight 700, border-radius 999px, height 48px. Hover: brighten + scale 1.02.
- **Error banner:** `rgba(242,92,92,0.15)` bg + `1px solid var(--accent-red)`, AlertCircle icon + message.
- **Loading state:** spinner inside button replaces label.

### 3.4 Auth State
`useState` at root: `const [user, setUser] = useState(null)`. If null → `<LoginScreen onLogin={setUser} />`. If set → full app shell. Mock auth: any non-empty email+password succeeds.

---

## 4. Pages

### 4.1 Dashboard (Home)
Glassmorphic summary cards: today, available slots, confirmed/pending/cancelled counts. Mini calendar with density dots. Quick-action pills: "New Appointment", "Check Availability", "View Reports". Recent appointments table (last 5).

### 4.2 Patients
Searchable, paginated table: ID, Full Name, Email, Phone, Status. "Register Patient" → SlideOver. Inline row editing. Status toggle with confirm.

### 4.3 Doctors
Card grid: gradient avatar (initials), name, specialty badge, status. Filter by specialty (pill tabs). "View Schedule" → weekly 7-column grid editor.

### 4.4 Appointments
**Critical bug fix:** previously rendered black screen. Guards required:
1. Every `.map()` on appointment data must have fallback: `(appointments ?? []).map(...)`.
2. If using recharts here, never pass empty array — render chart only when `data.length > 0` or provide default entry.
3. Wrap entire page in `<ErrorBoundary>` rendering visible error card.
4. Validate all filter logic; never assume fields exist.
5. Wrap all `new Date()` in try/catch or null-checks.

Full-featured filterable table: by status, doctor, date range, patient. Status badges per state. Detail SlideOver with action buttons respecting business rules. Empty state illustration if list empty. Skeleton loader if loading. Always render page frame (header, filter bar) even when empty or errored.

### 4.5 New Appointment Flow
6-step wizard: Select Patient → Specialty & Doctor → Date & Slot → Appointment Type → Office → Review & Confirm. Lime progress bar.

### 4.6 Availability Checker
Doctor selector + date picker → lime-glow time grid.

### 4.7 Reports
Three tabs: Office Occupancy (bar chart), Doctor Productivity (horizontal bar), No-Show Patients (table).

### 4.8 Settings (NEW)
Dedicated page from dock's Settings icon. Accordion/tab layout with sections:

**General**
- Language: English, Spanish, Portuguese (dropdown)
- Date format: MM/DD/YYYY or DD/MM/YYYY (radio)
- Timezone (dropdown, common options)

**Appearance**
- Theme: Dark / Light (large card-style radio with preview swatches, synced with navbar toggle)
- Accent color: 5 presets (lime/violet/cyan/orange/rose) — updates `--accent-lime` on `:root` dynamically
- Font size: Small / Medium / Large (affects `--font-scale`, default `1rem`)

**Notifications** (custom CSS toggle, not browser checkbox)
- Email notifications
- Appointment reminders (1hr before)
- Daily summary report
- No-show alerts

**Account**
- Display name (editable inline)
- Email (read-only, "Change Email" CTA)
- Password change: current + new + confirm
- "Save Changes" lime pill at bottom of each section

**Danger Zone**
- "Deactivate Account" red outlined button. Clicking shows inline confirmation with text field requiring "CONFIRM" before button activates.

---

## 5. Components

### 5.1 StatusBadge
Pill + lucide icon:
- SCHEDULED → violet outline
- CONFIRMED → lime fill
- COMPLETED → emerald fill
- CANCELLED → grey strikethrough
- NO_SHOW → red fill

### 5.2 SlideOver
Right-side panel, `translateX` transition, `backdrop-filter: blur(20px)`, dark overlay behind. Used for: patient reg, doctor edit, appointment detail.

### 5.3 TimeSlotGrid
08:00–17:00 in 30-min increments. Lime glow on hover. Solid lime when selected. `opacity: 0.3; cursor: not-allowed` when unavailable.

### 5.4 AppointmentWizard
Multi-step `useState` form. Lime progress bar. Step validates before Next. Back preserves state.

### 5.5 ErrorBoundary
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 40, color: 'var(--accent-red)', fontFamily: 'var(--font-body)' }}>
        <h2>Something went wrong in this module.</h2>
        <pre style={{ fontSize: 12, opacity: 0.6 }}>{this.state.error?.message}</pre>
        <button onClick={() => this.setState({ hasError: false })}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}
```
Wrap every page-level component.

### 5.6 CustomToggle
```jsx
<CustomToggle checked={value} onChange={setValue} label="Email notifications" />
```
CSS-only sliding pill. `var(--accent-lime)` when checked, `var(--border)` when off.

---

## 6. State Management

- `useState` at root for `user` and active page
- React state for forms, modals, toasts
- No browser storage (per spec) — but localStorage is used in the existing app for token; consider deprecating if mock-only

---

## 7. Quality Expectations

- Every state (loading, empty, error) has a visible UI — never blank screen.
- Appointments page wrapped in ErrorBoundary, all data access null-safe.
- Form validation with inline errors (red underline + helper text).
- Tables responsive — horizontal scroll on overflow.
- Dock never obscures content — `padding-bottom: 120px`, `padding-top: 80px`.
- Both dark and light themes look polished and complete.
- Settings changes (theme, accent color) take effect immediately without page reload.

---

## 8. Memorable Differentiator

Three things users remember:
1. **The login** — a live WebGL plasma animation behind a glass card. Feels like no medical app they've ever used.
2. **The dock** — macOS-style spring magnification makes navigation tactile and alive.
3. **The appointment slot grid** — time blocks glow lime one by one in a staggered animation, like a scoreboard lighting up.
