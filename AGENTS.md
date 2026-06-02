# RCU-Frontend-Utonio (Frontend)

## Repo layout
- `.git` is at this root (`RCU-Frontend-Utonio/`), but all code lives in `Utonio/`.
- **Run all commands from `Utonio/`**, not from this root.

## Commands (run inside `Utonio/`)
| Action | Command |
|--------|---------|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Preview production build | `pnpm preview` |

Package manager is **pnpm** (not npm/yarn). Lockfile: `pnpm-lock.yaml`.

## Tech stack
- **Vite 8** + **React 19** + **JavaScript** (JSX, no TypeScript)
- React Compiler enabled via `@rolldown/plugin-babel`
- React Router DOM v7 (BrowserRouter)
- framer-motion (spring physics, dock magnification)
- lucide-react (icons), recharts (charts)
- ESLint 10 with flat config (`eslint.config.js`, not `.eslintrc.*`)
- Vanilla CSS only — NO Tailwind, NO CSS-in-JS, NO styled-components

## Intended architecture
```
Utonio/src/
  styles/        — global.css (all :root variables, reset, fonts, global classes)
  contexts/      — AuthContext, useAuth, etc.
  components/    — reusable UI components (Dock, UI primitives)
  pages/         — route-level components
  services/      — API client / data fetching / mock data
```

## Backend companion
API repo: `https://github.com/DFBR2506/Sistema-de-reservas-de-consultorios-universitarios-RCU-` (Spring Boot, JWT auth).
The frontend services layer authenticates via `POST /api/auth/login` and passes the JWT as a Bearer token.

## Session context (read these FIRST in every new session)
1. **`Utonio/SPEC.md`** — Full specification: stack, design system, file structure, API contract
2. **`Utonio/PROGRESS.md`** — What's done, what's blocked, key decisions
3. **`Utonio/TASK_QUEUE.md`** — Next 5-10 concrete tasks to pick up

**Always update PROGRESS.md at the end of each session.**

## Test credentials (mock mode)
```
admin@utonio.edu / admin123
reception@utonio.edu / recep123
doctor@utonio.edu / doctor123
```

## File creation gotchas (Windows)
- Use the `write` tool (NOT PowerShell `Out-File` which adds BOM)
- Files must use LF line endings (no CRLF)
- If you see "Missing semicolon" errors at column 1:58 in import lines, the file has BOM or wrong line endings
- Quick fix: `python -c "..."` to read raw bytes and strip BOM/CRLF

## Quality gates
- `pnpm build` must pass
- `pnpm lint` must pass (0 errors, 0 warnings)
- All colors must use CSS variables, never hardcoded hex
- All animations under 300ms, no `ease-in` for UI, no `scale(0)` entries
- All forms validate inline
- Tables scroll horizontally on overflow
