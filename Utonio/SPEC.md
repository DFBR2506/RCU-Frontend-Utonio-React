# Utonio — University Medical Office Reservation Platform

> **Status:** ✅ Phase 1-3 Complete. Phase 4 (polish) mostly complete. Phase 5 (animations) — TimeSlotGrid scoreboard wave complete; other items pending.

---

## 1. Project Overview

Utonio is a university health center reservation platform connecting students, patients, receptionists, and health administrators. The platform manages the full appointment lifecycle (schedule → confirm → cancel → complete → no-show) with strict business rules around availability, overlaps, and doctor schedules.

**Aesthetic Direction:** Elevated, clinical-luxe. High-end health tech — surgical elegance with glass surfaces, precise spacing, and confident typography.

---

## 2. Stack & Architecture

| Layer | Choice | Version |
|---|---|---|
| Framework | React 19 + Vite 8 | 19.2.6 / 8.0.12 |
| Language | JavaScript (JSX), no TypeScript | — |
| Compiler | React Compiler via `@rolldown/plugin-babel` | 0.2.3 |
| Routing | React Router DOM v7 (BrowserRouter) | 7.16.0 |
| Animation | framer-motion (spring physics, dock magnification) | 12.40.0 |
| Icons | lucide-react | 1.17.0 |
| Charts | recharts | 3.8.1 |
| CSS | Vanilla CSS only — no Tailwind, no CSS modules (only per-component .css files imported as classes) | — |
| State | useState / useReducer + Context API (Auth) | — |

---

## 3. Design System

### Color Palette (CSS Variables in `src/styles/global.css`)

| Variable | Value | Use |
|---|---|---|
| `--bg-base` | #0A0A0F | Page background |
| `--bg-surface` | #13131A | Card surfaces |
| `--glass-bg` | rgba(255,255,255,0.03) | Card background |
| `--accent-lime` | #C8F55A | Primary CTA, active state |
| `--accent-violet` | #7B6EF6 | Info, scheduled |
| `--accent-red` | #F25C5C | Destructive, no-show |
| `--accent-green` | #3DD68C | Success, completed |
| `--accent-cyan` | #00BCD4 | Tertiary |
| `--text-primary` | #EEEEF0 | Body text |
| `--text-secondary` | #7A7A8C | Labels, captions |
| `--border` | rgba(255,255,255,0.08) | Card borders |

### Typography
- **Headings:** Syne (Google Fonts) — geometric, strong
- **Body:** Epilogue (Google Fonts) — humanist, readable
- **Never use:** Inter, Roboto, Arial, DM Sans

### Status Badges (5 states)

| Status | Color | Style |
|---|---|---|
| SCHEDULED | #7B6EF6 | Outline, Clock icon |
| CONFIRMED | #C8F55A | Solid lime bg, dark text |
| COMPLETED | #3DD68C | Solid emerald bg, dark text |
| CANCELLED | #7A7A8C | Grey, strikethrough text |
| NO_SHOW | #F25C5C | Solid red-coral |

---

## 4. File Structure

```
Utonio/
  .env                                # VITE_USE_MOCK=true, VITE_API_URL
  SPEC.md                             # This file
  PROGRESS.md                         # Session progress tracker
  TASK_QUEUE.md                       # Next session tasks
  src/
    main.jsx                          # Entry point
    App.jsx                           # Router + Shell
    App.module.css
    styles/
      global.css                      # All :root vars, reset, global classes
    contexts/
      AuthContext.jsx                 # AuthProvider (state)
      useAuth.js                      # useAuth hook
      authContextObject.js            # AuthContext (context object)
    components/
      Dock/
        Dock.jsx                      # macOS magnification dock
        Dock.module.css
      UI/
        StatusBadge.jsx
        SlideOver.jsx + .css
        Table.jsx + .css
        TimeSlotGrid.jsx + .css
    pages/
      Login.jsx + .module.css
      Dashboard.jsx + .module.css
      Patients.jsx + .css
      Doctors.jsx + .css
      Appointments.jsx + .css
      NewAppointment.jsx + .css
      Availability.jsx + .css
      Reports.jsx + .css
    services/
      api.js                          # fetch wrapper + mock toggle + re-exports
      mockData.js                     # 12 patients, 6 doctors, 3 offices, 25 appointments
```

---

## 5. Routes

| Path | Page | Protected |
|---|---|---|
| /login | Login | No |
| / | Dashboard | Yes |
| /patients | Patients | Yes |
| /doctors | Doctors | Yes |
| /appointments | Appointments | Yes |
| /appointments/new | NewAppointment (wizard) | Yes |
| /availability | Availability | Yes |
| /reports | Reports (3 tabs) | Yes |

---

## 6. Test Credentials

```
admin@utonio.edu / admin123
reception@utonio.edu / recep123
doctor@utonio.edu / doctor123
```

---

## 7. API Contract (Mock Implementation)

### Endpoints (mocked locally)
- `GET /patients` — list patients
- `POST /patients` — create patient
- `PUT /patients/:id` — update patient
- `GET /doctors` — list doctors
- `GET /doctors/:id/schedule` — get schedule
- `GET /appointments` — list appointments
- `POST /appointments` — create
- `PUT /appointments/:id` — update status
- `GET /availability?doctorId&date` — get slots
- `GET /offices` — list offices
- `GET /reports/occupancy` — occupancy data
- `GET /reports/productivity` — doctor productivity
- `GET /reports/no-shows` — no-show patients

### Real Backend
`https://github.com/DFBR2506/Sistema-de-reservas-de-consultorios-universitarios-RCU-` (Spring Boot, JWT auth)

Toggle to real API: set `VITE_USE_MOCK=false` in `.env`.

---

## 8. Status Transitions (Business Rules)

```
SCHEDULED → CONFIRMED → COMPLETED
SCHEDULED → CANCELLED
CONFIRMED → CANCELLED
CONFIRMED → NO_SHOW
```

Implemented in `Appointments.jsx` via action buttons that respect current status.

---

## 9. Known Limitations / Next Steps

- Dock magnification is simplified (uses distance from center, not real mouse position tracking)
- Bundle size warning (>500kb) — needs code splitting with `React.lazy`
- No toast notifications — to add in Phase 4 polish
- No real-time updates
- No form autosave

---

*Last updated: 2026-05-31 — Phase 1-3 complete, build passes, lint passes*