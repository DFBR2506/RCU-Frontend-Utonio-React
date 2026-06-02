# Utonio — Frontend RCU

Interfaz web para la plataforma de **Reservas de Consultorios Universitarios**. SPA construida con React 19 y Vite que consume la API REST del backend Spring Boot. El nombre "Utonio" combina Universidad + Antonio (referencia interna del equipo).

---

## Características principales

- **Dashboard** con estadísticas en tiempo real, calendario interactivo y accesos rápidos
- **CRUD completo** de pacientes, doctores y especialidades con formularios deslizantes (SlideOver)
- **Wizard de 6 pasos** guiado para crear citas médicas con validación en cada paso
- **Consulta de disponibilidad** de slots libres por doctor, consultorio y fecha
- **Transiciones de estado** de citas: Scheduled → Confirmed → Completed / Cancelled / No-Show
- **Editor de horarios** semanal por doctor con detección de conflictos en tiempo real
- **Reportes** de ocupación de consultorios, productividad por doctor y pacientes no-show (Recharts)
- **Sistema de temas** dark/light con 5 colores de acento y 3 escalas tipográficas
- **Persistencia de borradores** en `localStorage` para formularios críticos
- **Tour de bienvenida** de 5 pasos para usuarios nuevos
- **Atajos de teclado** globales: `N` nueva cita, `G→D/A/P/R` navegar, `?` ayuda
- **Animación scoreboard** en slots de tiempo (efecto "tablero iluminándose")
- **Dock de navegación** inferior estilo macOS con magnificación por framer-motion
- **48 tests** con Vitest: hooks, utilidades y servicios

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19 | Librería de UI — componentes funcionales + hooks |
| Vite | 8 | Empaquetador con HMR ultrarrápido |
| React Router | 7 | Enrutamiento SPA sin recarga de página |
| Axios | Latest | Cliente HTTP con interceptor JWT automático |
| Framer Motion | Latest | Animaciones declarativas (dock magnético, slide-overs) |
| Lucide React | Latest | Iconografía coherente y tree-shakeable |
| Recharts | Latest | Gráficas de reportes con colores temáticos |
| Vitest | Latest | Suite de tests unitarios |
| pnpm | Latest | Gestor de paquetes (más rápido que npm/yarn) |

---

## Cómo ejecutar

### Requisitos

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Backend RCU corriendo en `http://localhost:8080`

### Pasos

```bash
cd Utonio
pnpm install
pnpm dev
```

La app queda disponible en `http://localhost:5173`.

### Otros comandos

```bash
pnpm build       # Compilar para producción → dist/
pnpm preview     # Previsualizar el build de producción
pnpm test        # Ejecutar los 48 tests con Vitest
pnpm test:watch  # Tests en modo watch (re-ejecuta al cambiar archivos)
pnpm lint        # ESLint — 0 errores esperados
```

---

## Variables de entorno

El archivo `.env` en la raíz de `Utonio/`:

```env
VITE_API_URL=http://localhost:8080
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base del backend Spring Boot | `http://localhost:8080` |

> Vite solo expone variables con prefijo `VITE_` al código del cliente. Nunca pongas secretos aquí.

---

## Arquitectura

La app sigue una estructura por capas donde cada carpeta tiene una responsabilidad única.

```
Utonio/
├── .env                   ← Variables de entorno (VITE_API_URL)
├── vite.config.js         ← Config Vite + Vitest
├── eslint.config.js       ← Reglas ESLint (react-hooks, react-refresh)
└── src/
    ├── api/               ← Capa de comunicación con el backend (Axios)
    │   ├── AxiosConfig.js      Instancia Axios + interceptor JWT automático
    │   ├── patientsApi.js
    │   ├── doctorsApi.js
    │   ├── appointmentsApi.js
    │   ├── appointmentTypesApi.js
    │   ├── availabilityApi.js
    │   ├── doctorSchedulesApi.js
    │   ├── officesApi.js
    │   ├── reportsApi.js
    │   └── usersApi.js
    │
    ├── pages/             ← Componentes de página (una por ruta)
    │   ├── Dashboard.jsx       Resumen + calendario + acciones rápidas
    │   ├── Patients.jsx        CRUD con SlideOver + FloatingField + draft autosave
    │   ├── Doctors.jsx         CRUD de doctores + gestión de especialidades
    │   ├── DoctorProfile.jsx   Perfil individual: estadísticas, agenda, historial
    │   ├── Appointments.jsx    Lista + filtros + búsqueda rich + transiciones de estado
    │   ├── NewAppointment.jsx  Wizard de 6 pasos para crear citas
    │   ├── Availability.jsx    Consulta de slots disponibles por doctor + fecha
    │   ├── Reports.jsx         Gráficas de ocupación / productividad / no-shows
    │   ├── Settings.jsx        Preferencias + gestión de consultorios y tipos de cita
    │   └── Login.jsx           Formulario con WebGL shader de fondo
    │
    ├── components/
    │   ├── Dock/               Barra de navegación inferior (efecto magnético macOS)
    │   ├── Navbar/             Barra superior: usuario, tema, dropdown de perfil
    │   ├── ShaderBackground.jsx  WebGL plasma wave (login)
    │   ├── OnboardingTour.jsx  Tour de 5 pasos para usuarios nuevos
    │   ├── KeyboardShortcutsHelp.jsx  Modal con atajos (tecla ?)
    │   └── UI/                 Componentes reutilizables:
    │       ├── Table.jsx           Tabla paginada, ordenable, con búsqueda debounced
    │       ├── SlideOver.jsx       Panel lateral deslizable (formularios, detalles)
    │       ├── TimeSlotGrid.jsx    Grid de slots con animación scoreboard
    │       ├── ScheduleEditor.jsx  Editor semanal con detección de conflictos
    │       ├── Toast.jsx           Notificaciones temporales (success/error/info)
    │       ├── FloatingField.jsx   Input con label flotante estilo Material
    │       ├── StatusBadge.jsx     Badge de estado de cita (5 variantes)
    │       ├── EmptyState.jsx      Pantalla vacía con SVG por variante
    │       ├── ErrorBoundary.jsx   Captura errores de render (envuelve todas las páginas)
    │       ├── CustomToggle.jsx    Interruptor accesible (CSS puro)
    │       └── SkeletonPage.jsx    Fallback de Suspense (lazy loading)
    │
    ├── hooks/             ← Custom Hooks reutilizables (ver sección dedicada)
    │   ├── useTheme.js
    │   ├── useToast.js
    │   ├── useFormDraft.js
    │   ├── useDebounce.js
    │   └── useKeyboardShortcuts.js
    │
    ├── contexts/          ← Estado global con Context API
    │   ├── AuthContext.jsx         Usuario autenticado y token JWT
    │   ├── ThemeContext.jsx        Proveedor del sistema de temas
    │   └── themeContextObject.js   Objeto de contexto separado (react-refresh)
    │
    ├── data/
    │   └── constants.js   ← Constantes de dominio: SPECIALTIES, APPOINTMENT_TYPES, etc.
    │
    ├── utils/
    │   └── scheduleConflicts.js  ← Detección de conflictos en horarios de doctores
    │
    ├── test/              ← Suite Vitest (48 tests)
    │   ├── setup.js            Configuración global: jsdom, matchers, cleanup
    │   ├── StatusBadge.test.jsx
    │   ├── useTheme.test.jsx
    │   ├── scheduleConflicts.test.js
    │   ├── useDebounce.test.js
    │   └── useFormDraft.test.js
    │
    └── styles/
        └── global.css     ← Variables CSS del sistema de diseño (dark/light tokens)
```

---

## Capa de API

Todas las llamadas HTTP están centralizadas en `src/api/`. Los componentes nunca usan Axios directamente; solo importan funciones de los archivos de API.

### AxiosConfig.js — Instancia compartida con interceptor JWT

```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

El token se adjunta automáticamente en cada petición. Los componentes no lo gestionan.

### Manejo de respuestas paginadas

El backend devuelve siempre objetos paginados `{ content: [...], totalElements, totalPages }`. Todos los archivos de API aplican el patrón defensivo:

```js
setPatients(data.content || data);
setOffices(data.content || (Array.isArray(data) ? data : []));
```

### Formato de fechas para la API

El backend espera `Instant` en formato ISO 8601 con zona UTC. Los reportes usan:

```js
function toInstant(dateStr) {
  return `${dateStr}T00:00:00Z`;  // "2026-06-01" → "2026-06-01T00:00:00Z"
}
```

---

## Custom Hooks

Los custom hooks encapsulan lógica stateful reutilizable. Se nombran con prefijo `use`.

### `useTheme` — Sistema de temas visual

Gestiona tema (dark/light), color de acento (5 presets) y escala tipográfica (3 tamaños). Persiste en `localStorage` y aplica `data-theme` a `<html>` para que las CSS variables respondan instantáneamente sin re-renderizar componentes.

```js
const { theme, setTheme, toggleTheme,
        accent, setAccent, accentPresets,
        fontScale, setFontScale, fontScales,
        isDark } = useTheme();

setTheme('light');          // aplica data-theme="light" en <html>
setAccent('violet');        // cambia --accent-lime → violeta en :root
setFontScale('large');      // modifica --font-scale
```

**Presets de acento:** `lime` / `violet` / `cyan` / `orange` / `rose`

### `useToast` — Notificaciones no bloqueantes

Cola de mensajes temporales (max 4 visibles) con auto-dismiss a los 3.5s y barra de progreso.

```js
const toast = useToast();

toast.success(`Paciente ${form.firstName} registrado`);
toast.error(err?.response?.data?.message || 'Error al guardar');
toast.info(`Borrador restaurado desde hace ${draftAge(savedAt)}`);
```

### `useFormDraft` — Auto-guardado de formularios

Persiste el estado de un formulario en `localStorage` mientras el usuario escribe. Si cierra la pestaña accidentalmente, al volver puede continuar donde lo dejó. Clave dinámica para distinguir crear vs editar.

```js
const { state: form, setState: setForm,
        hasDraft, savedAt, clear, reset } = useFormDraft(
  'patient-new',    // 'patient-new' | `patient-edit-${id}`
  EMPTY_FORM
);

// hasDraft → muestra banner de borrador restaurado
// clear()  → llamar al enviar exitosamente
// reset()  → llamar al descartar / cancelar
```

### `useDebounce` — Optimización de búsquedas

Retrasa la actualización de un valor hasta que el usuario deja de escribir. Evita filtrar/hacer peticiones en cada tecla.

```js
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 200); // 200ms delay

// El filtrado/fetch usa debouncedSearch, no searchInput directamente
useEffect(() => { filterResults(debouncedSearch); }, [debouncedSearch]);
```

### `useKeyboardShortcuts` — Atajos de teclado globales

Registra listeners de `keydown` en `window`. Los ignora cuando el foco está en `input`/`textarea`; `Escape` siempre se permite. Limpia listeners al desmontar.

```js
useKeyboardShortcuts([
  { key: 'n', action: () => navigate('/appointments/new') },
  { key: 'Escape', action: () => setSlideOpen(false) },
]);
```

**Atajos globales registrados en `App.jsx`:**

| Tecla | Acción |
|---|---|
| `N` | Ir a nueva cita |
| `G` → `D` | Ir a Dashboard |
| `G` → `A` | Ir a Appointments |
| `G` → `P` | Ir a Patients |
| `G` → `R` | Ir a Reports |
| `?` | Abrir modal de ayuda con todos los atajos |

### Resumen

| Hook | Propósito | Base |
|---|---|---|
| `useTheme` | Tema visual global (dark/light/accent) | `useContext`, `localStorage` |
| `useToast` | Cola de notificaciones temporales | `useContext`, `useState` |
| `useFormDraft` | Auto-guardado de formularios | `useState`, `localStorage` |
| `useDebounce` | Delay en inputs de búsqueda | `useState`, `useEffect` |
| `useKeyboardShortcuts` | Atajos de teclado globales | `useEffect`, `addEventListener` |

---

## Enrutamiento y rutas protegidas

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>   {/* verifica token en AuthContext */}
      <Route path="/"                  element={<Dashboard />} />
      <Route path="/patients"          element={<Patients />} />
      <Route path="/doctors"           element={<Doctors />} />
      <Route path="/doctors/:id"       element={<DoctorProfile />} />
      <Route path="/appointments"      element={<Appointments />} />
      <Route path="/appointments/new"  element={<NewAppointment />} />
      <Route path="/availability"      element={<Availability />} />
      <Route path="/reports"           element={<Reports />} />
      <Route path="/settings"          element={<Settings />} />
    </Route>
  </Routes>
</BrowserRouter>
```

`ProtectedRoute` lee el `token` del `AuthContext`. Si no existe, redirige a `/login`. Todas las páginas están lazy-loaded con `React.lazy` para code-splitting automático.

---

## Sistema de temas

El theming usa **CSS custom properties**. Al cambiar `data-theme` en `<html>`, toda la paleta cambia sin re-renderizar componentes React.

```css
[data-theme="dark"]  {
  --bg-base:      #0A0A0F;
  --bg-surface:   #13131A;
  --accent-lime:  #C8F55A;
  --text-primary: #EEEEF0;
  --dock-bg:      rgba(20, 20, 30, 0.55);
}

[data-theme="light"] {
  --bg-base:      #F0F0F5;
  --bg-surface:   #FFFFFF;
  --accent-lime:  #7CB800;
  --text-primary: #0D0D14;
  --dock-bg:      rgba(220, 220, 235, 0.7);
}
```

La transición entre temas es suave gracias a `transition: background-color 300ms, color 300ms` en `body` y las superficies principales.

---

## Wizard de nueva cita

`NewAppointment.jsx` implementa un asistente de 6 pasos con barra de progreso, auto-guardado de borrador y validación por paso antes de avanzar:

| Paso | Qué selecciona | Validación para avanzar |
|---|---|---|
| 1 — Patient | Paciente de la lista | `patientId` no vacío |
| 2 — Doctor | Especialidad (filtro) + Doctor activo | `doctorId` no vacío |
| 3 — Office | Consultorio disponible | `officeId` no vacío |
| 4 — Date & Time | Fecha + slot de disponibilidad real | `date` y `time` no vacíos |
| 5 — Type | Tipo de cita con duración | `typeId` no vacío |
| 6 — Review | Resumen completo + confirmar | — |

> El consultorio se elige en el paso 3 (antes que la fecha) porque la consulta de disponibilidad requiere `doctorId` **y** `officeId` para calcular slots libres en el paso 4.

La disponibilidad se consulta automáticamente cuando cambian `doctorId`, `officeId` o `date`:

```js
useEffect(() => {
  if (!data.doctorId || !data.officeId || !data.date) return;
  getAvailableSlots(data.doctorId, data.officeId, data.date)
    .then(s => setSlots(parseSlots(s)));
}, [data.doctorId, data.officeId, data.date]);
```

---

## Editor de horarios de doctor

`ScheduleEditor.jsx` permite gestionar la disponibilidad semanal de cada doctor:

- **7 pestañas diarias** (Lun–Dom) con indicador de días con conflictos (punto rojo)
- **Grid horario** 8:00–17:00 en franjas de 30 min con toggle activar/desactivar
- **Detección de conflictos en tiempo real**: si el nuevo horario invalida citas futuras ya agendadas, muestra un banner rojo listando hasta 5 conflictos, y pide confirmación antes de guardar
- **Validación de rango**: la hora de inicio debe ser anterior a la de fin
- **Guard de cambios no guardados** al cerrar el editor

El backend espera un rango único por día (`startTime`/`endTime`), no slots individuales.

---

## Administración (Settings)

La página Settings incluye secciones exclusivas para `ROLE_ADMIN`:

- **Consultorios (Offices):** listar, crear (código + piso), activar/desactivar. Sin estos datos el wizard no puede completarse.
- **Tipos de cita (Appointment Types):** listar, crear (nombre + descripción + duración en minutos). La duración define el `endAt` de cada cita.

Otras secciones disponibles para todos los usuarios:
- **Apariencia:** tema, color de acento, tamaño de fuente
- **General:** idioma, formato de fecha, zona horaria
- **Notificaciones:** email, recordatorios, resumen diario, alertas de no-show
- **Cuenta:** nombre, cambio de contraseña con validación

---

## Componentes UI reutilizables

### `Table.jsx`

Tabla con paginación, ordenamiento por columna, búsqueda debounced (200ms) y soporte de variantes de estado vacío. Acepta prop `emptyVariant` para mostrar ilustraciones SVG temáticas.

### `SlideOver.jsx`

Panel lateral deslizable desde la derecha. Props: `isOpen`, `onClose`, `title`, `loading`, `skeleton` (para mostrar skeleton loader mientras carga datos).

### `TimeSlotGrid.jsx`

Grid de slots de 30 minutos con animación "scoreboard" al montar: cada slot se ilumina con un haló lima en oleada (35ms entre slots). Recibe `gridKey` para forzar replay al cambiar de doctor o fecha.

### `FloatingField.jsx`

Input con label flotante estilo Material Design. Funciona para `text`, `email`, `tel`, `date`. Incluye indicador de campo requerido, mensaje de error inline y ARIA completo.

### `Toast.jsx`

Notificaciones tipo toaster en esquina superior derecha. Máximo 4 visibles simultáneamente. Cada toast tiene auto-dismiss a 3.5s con barra de progreso animada.

### `StatusBadge.jsx`

Badge de estado de cita con 5 variantes: `SCHEDULED` (gris), `CONFIRMED` (azul), `COMPLETED` (verde), `CANCELLED` (rojo), `NO_SHOW` (naranja).

---

## Tests

Suite de 48 tests con Vitest + Testing Library + jsdom:

| Archivo | Tests | Qué cubre |
|---|---|---|
| `StatusBadge.test.jsx` | 7 | 5 variantes de estado + fallback para estado desconocido |
| `useTheme.test.jsx` | 10 | Toggle dark/light, persistencia, acento, escala de fuente, error fuera de Provider |
| `scheduleConflicts.test.js` | 8 | Sin conflicto, traslape parcial, día eliminado, citas pasadas/incorrectas ignoradas |
| `useDebounce.test.js` | 4 | Valor inicial, delay, coalescing de llamadas rápidas |
| `useFormDraft.test.js` | 10 | Estado inicial, restaurar borrador, `clear`, `reset`, formato de `draftAge` |

```bash
pnpm test           # ejecutar todos
pnpm test:watch     # modo watch
```

---

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Capa de API en `src/api/` | Componentes no conocen Axios; facilita cambiar URL base o cliente HTTP |
| Interceptor JWT en AxiosConfig | Token adjunto una sola vez; no hay código duplicado en cada llamada |
| CSS Variables para theming | Cambio de tema instantáneo sin re-render; compatible con transiciones CSS |
| `data.content \|\| data` en todas las llamadas | Backend devuelve `Page<T>`; el fallback evita crashes si la respuesta cambia |
| UUIDs como strings (sin `parseInt`) | IDs del backend son UUID strings; `parseInt()` produce `NaN` y rompe comparaciones |
| `useFormDraft` en formularios críticos | Usuario no pierde datos si cierra accidentalmente la pestaña |
| `useDebounce(200ms)` en búsquedas | Reduce carga al backend; usuario escribe sin latencia visible |
| Orden wizard: Office antes de Date | API de disponibilidad requiere `officeId` además de `doctorId` y `date` |
| ScheduleEditor con rango (startTime/endTime) | Backend espera un rango único por día (`DoctorSchedule`), no slots individuales |
| Code splitting con `React.lazy` | Carga bajo demanda; bundle principal 403kb, Reports (recharts 343kb) carga solo cuando se visita |
| ErrorBoundary en todas las páginas | Errores de render muestran UI de recuperación en lugar de pantalla en blanco |
| CSS plano (sin `.module.css`) | Consistencia del sistema de diseño; variables globales funcionan sin importar el scope |

---

## Autores

Daniel Berdugo-Jairo Blanco
Proyecto académico — Programación Web  
Universidad del Magdalena — 2026
