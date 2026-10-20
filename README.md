# GreenPoints · Frontend

Interfaz web de GreenPoints: registro de eco-acciones sostenibles, catálogo, historial y panel de resumen del impacto ambiental.

> Vanilla JS (ES Modules) + HTML + CSS. Sin framework ni bundler.

---

## 👥 Equipo de desarrolladoras

- Alba: Developer 1
- Naomi: Developer 2
- Juliana: Developer 3
- Renata: Developer 4
- Ainara: Developer 5

---

## 🚀 Inicio rápido

### Requisitos previos
- Un navegador moderno (Chrome / Edge / Firefox / Safari).
- El **backend en `http://127.0.0.1:8000`** debe estar en ejecución (proporciona el catálogo, historial y dashboard). Sin él, las vistas muestran estados de error o vacíos.

### Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone [https://github.com/Green-Points-Web/frontend.git](https://github.com/Green-Points-Web/frontend.git)
cd frontend

# 2. Servir el proyecto por HTTP (imprescindible para que el router ejecute los fetch de páginas)
python3 -m http.server 5500
```

Abrir: `http://localhost:5500/index.html`

---

## 📂 Estructura del Proyecto

```
frontend/
├── index.html                  # SPA: header, dashboard y scripts globales
├── pages/                      # Vistas inyectadas por el router
│   ├── catalog-section.html    #   #acciones
│   └── history-section.html    #   #historial
├── src/
│   ├── css/                    # base, layout, catalog, history, registration
│   └── js/
│       ├── main.js             # Router hash + carga de vistas
│       ├── dashboard.js        # Arranque del dashboard (incluye initRegistrationModal)
│       ├── services/           # Comunicación con el backend
│       │   ├── actionService.js       # GET /catalog, POST /actions
│       │   ├── catalogService.js      # Render del grid de catálogo
│       │   ├── historyService.js      # Render del historial (CRUD de acciones)
│       │   ├── dashboardService.js    # GET /dashboard
│       │   └── modaleditcontroller.js # Editar / eliminar acción del historial
│       └── components/         # UI
│           ├── registrationModal.js   # Modal de registro de acción
│           ├── dashboardComponent.js
│           ├── historyComponent.js
│           └── catalogComponent.js    # (stub)
└── db.json                     # Mock de json-server (opcional, no usado por defecto)
```

---

## 🧭 Rutas (hash router)

| Hash         | Vista                         |
|--------------|-------------------------------|
| `#dashboard` | Panel de resumen (por defecto)|
| `#acciones`  | Catálogo de eco-acciones      |
| `#historial` | Historial de acciones         |

El router (`src/js/main.js`) hace `fetch('./pages/<vista>.html')` y lo inyecta
en `#dynamic-content`.

---

## 🔌 API esperada (backend en `127.0.0.1:8000`)

| Método | Endpoint        | Uso                                 |
|--------|-----------------|-------------------------------------|
| GET    | `/catalog`      | Tipos de acción del catálogo        |
| GET    | `/history`      | Listado del historial               |
| GET    | `/dashboard`    | KPIs agregados (puntos, CO₂, nivel) |
| POST   | `/actions`      | Registrar una acción                |
| PUT    | `/history/:id`  | Editar una acción                   |
| DELETE | `/history/:id`  | Eliminar una acción                 |

Campos usados por el front (se aceptan varios alias): `name`/`action_name`,
`category`, `points`/`points_earned`, `co2_kg`/`co2_impact`/`co2_saved`,
`date`/`action_date`, `description`.

---

## 🛠️ Convenciones importantes (leer antes de tocar código)

1. **Iconos dinamicos** (getActionIcon): Material Symbols vía Google Fonts (`index.html`). Requieren
   internet; sin conexión se muestra el texto de la ligadura.

2. **Scripts de servicio clásicos vs módulos**: `catalogService.js`,
   `historyService.js`, `modaleditcontroller.js` y `actionService.js` se
   cargan como scripts clásicos y exponen funciones en `window.*`
   (`window.initializeCatalog`, `window.createAction`, etc.) para que el
   router los llame. **No renombres el `const API_URL`/`API_BASE_URL` a algo ya
   declarado en otro script**: al ser ámbito global compartido, dos `const` con
   el mismo nombre lanzan `SyntaxError`.

3. **Registro desde el catálogo**: el botón "Registrar acción" de cada tarjeta
   hace `POST /actions` directamente con `action_type_id` y la **fecha de hoy**
   (`new Date().toISOString().slice(0,10)`), sin abrir formulario.

4. **Fecha en el modal**: el `<input type="date">` está limitado con `max` a
   hoy (no admite fechas futuras) pero sí días pasados.

5. **Al registrarse una acción** se emite `window.dispatchEvent(new
   CustomEvent('action:created'))`; `main.js` lo escucha para refrescar el
   dashboard o el historial.

---

## 🔀 Ejecución con json-server (mock opcional)

`db.json` contiene unos `actionTypes` de ejemplo, pero **no coincide con los
endpoints que consume el front** (`/catalog`, `/history`, `/dashboard`). Si
quieres usarlo como mock hay que adaptar la estructura y añadir un script:

```bash
npx json-server --watch db.json --port 8000
```

---

## 📋 Estado / TODO conocido

- [ ] Sin backend, las vistas no muestran datos (no hay fixtures ni fallback).
- [ ] `dashboard.js` debe estar incluido en `index.html` para que funcione el
      modal de registro.
- [ ] `pages/catalog-section.html` no debe re-incluir `base.css`/`catalog.css`
      (duplica la cascada y cambia el estilo del botón del header).
- [ ] `actionService.js` (líneas 32-74) contiene listeners de `.btn-register`
      que se ejecutan antes de que existan las tarjetas (código muerto).
- [ ] `catalogComponent.js` es un stub.