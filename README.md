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
git clone https://github.com/Green-Points-Web/frontend.git
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
│       ├── services/           # Comunicación con el backend y procesamiento de datos
│       │   ├── actionService.js       # GET /catalog, POST /actions
│       │   ├── catalogService.js      # Render del grid de catálogo
│       │   ├── historyService.js      # Render del historial (CRUD de acciones)
│       │   ├── dashboardService.js    # GET /dashboard
│       │   └── modaleditcontroller.js # Editar / eliminar acción del historial
│       └── components/         # UI y Modales
│           ├── registrationModal.js   # Modal de registro de acción
│           ├── dashboardComponent.js
│           ├── historyComponent.js
│           └── catalogComponent.js    # (stub)
└── db.json                     # Mock de json-server (opcional, no usado por defecto)
```

---

## 🧭 Rutas (Hash Router)

| Hash | Vista | Descripción |
| --- | --- | --- |
| `#dashboard` | Panel de resumen | KPIs globales de puntos, acciones y CO₂ |
| `#acciones` | Catálogo de eco-acciones | Grid dinámico con filtro y registro directo |
| `#historial` | Historial de acciones | Tabla interactiva de registros de usuario |

El router (`src/js/main.js`) realiza un `fetch('./pages/<vista>.html')` e inyecta el contenido dinámicamente en `#dynamic-content`.

---

## 🔌 API Esperada (Backend en `127.0.0.1:8000`)

| Método | Endpoint | Uso |
| --- | --- | --- |
| **GET** | `/catalog` | Tipos de acción del catálogo dinámico |
| **GET** | `/history` | Listado del historial del usuario |
| **GET** | `/dashboard` | KPIs agregados (puntos, CO₂, acciones) |
| **POST** | `/actions` | Registrar una nueva eco-acción |
| **PUT** | `/history/:id` | Editar un registro del historial |
| **DELETE** | `/history/:id` | Eliminar un registro del historial |

*Campos soportados por el frontend (acepta alias):* `name`/`action_name`, `category`, `points`/`points_earned`, `co2_kg`/`co2_impact`/`co2_saved`, `date`/`action_date`, `description`.

---

## 🛠️ Convenciones de Desarrollo

1. **Iconos dinámicos (`getActionIcon`)**: Se utiliza la librería Material Symbols de Google Fonts. La asignación de iconos y paletas cromáticas (color de fondo y de texto) se efectúa dinámicamente mediante la coincidencia semántica de la categoría o nombre (`Movilidad`, `Reciclaje`, `Naturaleza`, `Participación`). Requieren internet; sin conexión se muestra el texto de la ligadura.

2. **Scripts de servicio en ámbito global (`window.*`)**: Los scripts de servicio (`catalogService.js`, `historyService.js`, `modaleditcontroller.js` y `actionService.js`) se cargan como scripts clásicos y exponen sus métodos principales (`window.initializeCatalog`, `window.createAction`, etc.) para ser invocados por el router. **Importante:** Evitar redeclarar `const API_URL` / `API_BASE_URL` en scripts globales para no provocar un `SyntaxError`.

3. **Patrón Snapshot (Integridad de datos)**: Al registrar una eco-acción, el backend congela los valores de puntos e impacto de CO₂ en ese momento para garantizar la integridad histórica del usuario ante hipotéticas modificaciones futuras en el catálogo.

4. **Actualización Reactiva**: Tras registrar o editar una acción se emite un `window.dispatchEvent(new CustomEvent('action:created'))`. El router escucha este evento y recalcula las métricas sin refrescar la página.

5. **Registro desde el catálogo**: el botón "Registrar acción" de cada tarjeta hace `POST /actions` directamente con `action_type_id` y la **fecha de hoy** (`new Date().toISOString().slice(0,10)`), sin abrir formulario.

6. **Fecha en el modal**: el elemento `<input type="date">` restringe mediante la propiedad `max` la selección de fechas futuras, aceptando la fecha actual o pasadas.

---

## 🔀 Flujo de Trabajo en Git

1. Mantener actualizada la rama `dev`:
```bash
git checkout dev
git pull origin dev
```

2. Trabajar en una rama de característica o corrección:
```bash
git checkout -b fix/mi-rama
```

3. Sincronizar cambios de `dev` antes de enviar PR:
```bash
git pull origin dev --rebase
```

---

## 🔌 Ejecución con json-server (mock opcional)

`db.json` contiene unos `actionTypes` de ejemplo, pero **no coincide con los endpoints que consume el front** (`/catalog`, `/history`, `/dashboard`). Si quieres usarlo como mock hay que adaptar la estructura y añadir un script:

```bash
npx json-server --watch db.json --port 8000
```

---