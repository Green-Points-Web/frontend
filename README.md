***

# 🍃 GreenPoints · Frontend

> Proyecto colaborativo para el desarrollo web de GreenPoints, una aplicación pensada para registrar acciones sostenibles que te permite cuantificar tu impacto ambiental positivo (mediante puntos obtenidos a través del cálculo de CO₂ ahorrado).

---

## 📑 Índice

1. [Descripción](#-descripción)
2. [Características principales](#-características-principales)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Estructura del proyecto](#-estructura-del-proyecto)
5. [Vista previa (demo)](#-vista-previa-demo)
6. [Objetivo](#-objetivo)
7. [Requisitos previos](#-requisitos-previos)
8. [Instalación](#-instalación)
9. [Configuración](#-configuración)
10. [Ejecución](#-ejecución)
11. [Scripts disponibles](#-scripts-disponibles)
12. [Integración con la API](#-integración-con-la-api)
13. [Tests y QA](#-tests-y-qa)
14. [Accesibilidad y responsive](#-accesibilidad-y-responsive)
15. [Despliegue](#-despliegue)
16. [Equipo y roles](#-equipo-y-roles)
17. [Reparto de trabajo](#-reparto-de-trabajo)
18. [Estado del proyecto](#-estado-del-proyecto)
19. [Backlog y gestión de tareas](#-backlog-y-gestión-de-tareas)
20. [Ramas y flujo de trabajo con Git](#-ramas-y-flujo-de-trabajo-con-git)
21. [Convención de commits](#-convención-de-commits)
22. [Uso de herramientas de IA](#-uso-de-herramientas-de-ia)
23. [Limitaciones conocidas](#-limitaciones-conocidas)
24. [Licencia](#-licencia)

---

## 📖 Descripción

GreenPoints es una **SPA** desarrollada con JavaScript vanilla, HTML5 y CSS3 que permite registrar acciones sostenibles, consultar un catálogo de acciones y visualizar el impacto ambiental acumulado.

El frontend consume una API REST propia y no utiliza framework, bundler ni sistema de build: el navegador carga directamente los módulos ES.

---

## ✨ Características principales

* **📊 Dashboard de impacto:** resumen en tiempo real de KPIs —puntos totales, CO₂ ahorrado y acciones registradas— con lista de las acciones más recientes.
* **🗂️ Catálogo de acciones:** grid de acciones sostenibles con búsqueda y filtrado por categoría, cada tarjeta codificada por color (Movilidad, Naturaleza, Reciclaje, Participación).
* **✅ Registro de acciones:** alta rápida desde el catálogo o mediante un modal dedicado; cada acción guarda fecha, categoría y puntos/CO₂ asociados.
* **📜 Historial paginado:** tabla de acciones registradas con paginación (15 por página), iconografía por categoría y acciones de editar/eliminar.
* **🌱 Cálculo de impacto:** los puntos se derivan del CO₂ ahorrado según el tipo de acción.
* **⚡ SPA sin recargar:** Hash Router propio que inyecta vistas parciales y mantiene la experiencia fluida.
* **🔔 Secciones sincronizadas:** un mismo registro se refleja en dashboard e historial en vivo mediante eventos (`action:created` / `action:updated` / `action:deleted`), sin refrescar la página.
* **🎨 UI ligera:** Vanilla JS + CSS tradicional e iconografía Material Symbols; sin framework ni bundler.
* **🔌 API REST:** consumo del backend con Axios, con estados de carga/error y estados vacíos en cada vista.

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Lenguaje | JavaScript (ES Modules) |
| Estructura | HTML5 |
| Estilos | CSS3 tradicional, variables CSS, Flexbox, Grid y media queries |
| Enrutado | Hash Router propio (`src/js/main.js`) |
| Peticiones HTTP | Axios cargado vía CDN (`index.html`) |
| Iconografía | Material Symbols Outlined de Google Fonts |
| Reactividad | `CustomEvent` + `window` |
| Dependencia runtime declarada | `sortablejs` (actualmente sin uso en el código) |
| Dependencia de desarrollo | `json-server` (mock opcional) |
| Servidor local | `python3 -m http.server` o cualquier servidor estático |

> El proyecto **no usa bundler ni transpilador**. Los módulos se cargan directamente en el navegador.

---

## 📂 Estructura del proyecto

```text
frontend/
├── index.html                        # SPA: header, dashboard y scripts
├── pages/                            # Vistas inyectadas por el router
│   ├── catalog-section.html          #   #acciones
│   └── history-section.html          #   #historial
├── src/
│   ├── css/
│   │   └── style.css                 # Hoja única de estilos
│   ├── img/
│   │   └── Logo.png                  # Logotipo
│   └── js/
│       ├── main.js                   # Router hash + carga de vistas
│       ├── dashboard.js              # Arranque del dashboard
│       ├── components/
│       │   ├── dashboardComponent.js # Render de KPIs y progreso de nivel
│       │   └── registrationModal.js  # Modal de registro de acción
│       └── services/
│           ├── actionService.js      # GET /catalog, POST /actions
│           ├── catalogService.js     # Render del grid de catálogo
│           ├── dashboardService.js   # GET /dashboard y /history recientes
│           ├── historyService.js     # Render del historial y paginación
│           └── modaleditcontroller.js# Editar / anular acción del historial
├── .gitignore
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
└── README.md
```

> No existe un archivo `db.json` en el repositorio. La sección de `json-server` se conserva únicamente como referencia histórica.

---

## 📷 Vista previa (demo)

* **Aplicación en producción:** *Pendiente de despliegue.*
* **Diseño preliminar:** [Stitch](https://stitch.withgoogle.com/projects/11054811943219877412)

**Capturas pendientes:** añadir aquí imágenes del dashboard, del catálogo y del historial.

---

## 🚀 Objetivo

Crear una aplicación funcional que permita a las personas usuarias:

* Registrar las acciones sostenibles que llevan a cabo en su día a día.
* Consultar estas acciones en un catálogo o visualizar las ya registradas en un historial.
* Visualizar su impacto ambiental (puntos obtenidos a través del cálculo de CO₂ ahorrado).

---

## 📋 Requisitos previos

* **Python 3** (para servir archivos estáticos) o cualquier servidor HTTP local.
* **Node.js** (opcional, solo para `npm install` y el mock con `json-server`).
* Un **backend** escuchando en `http://127.0.0.1:8000` que exponga `/catalog`, `/history`, `/dashboard` y `/actions`.
* Conexión a internet para cargar Axios y Material Symbols desde CDN.

> Sin backend, las vistas muestran sus estados de error o vacíos.

---

## ⚙️ Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Green-Points-Web/frontend.git
   cd frontend
   ```

2. (Opcional) Instala las dependencias:

   ```bash
   npm install
   ```

3. Arranca el backend en `http://127.0.0.1:8000`. Puedes consultar las instrucciones en el repositorio del backend.

4. Inicia el servidor de desarrollo:

   ```bash
   python3 -m http.server 5500
   ```

5. Abre `http://localhost:5500/index.html` en el navegador.

> **Importante:** no abras `index.html` con `file://`; el router carga las vistas con peticiones HTTP y fallará por CORS.

---

## 🔧 Configuración

El proyecto **no usa archivo `.env`**. La URL de la API está definida directamente en los servicios:

* `src/js/services/actionService.js`
* `src/js/services/catalogService.js`
* `src/js/services/dashboardService.js`
* `src/js/services/historyService.js`
* `src/js/services/modaleditcontroller.js`

Valor actual:

```js
const API_URL = "http://127.0.0.1:8000";
```

Para localizar todas las apariciones:

```bash
grep -rn "127.0.0.1:8000" src/js
```

Si cambias la URL del backend, actualiza **todas** las referencias y asegúrate de que el backend permite el origen desde el que sirves el frontend (**CORS**).

Axios se carga desde CDN en `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

---

## ▶️ Ejecución

### Backend

El frontend espera la API en `http://127.0.0.1:8000`. Arranca el backend antes de abrir la aplicación.

### Frontend

```bash
python3 -m http.server 5500
```

Abre `http://localhost:5500/index.html`.

### Mock con json-server (opcional, no recomendado)

`json-server` está declarado como dependencia de desarrollo, pero **no existe `db.json`** y sus endpoints por defecto no coinciden con los que consume el frontend (`/catalog`, `/history`, `/dashboard`, `/actions`). Para usarlo habría que crear el archivo y adaptar las rutas y la estructura de datos.

---

## 📦 Scripts disponibles

El proyecto no usa bundler, por lo que no hay scripts de build.

En `package.json`:

* `npm run test`: reservado; actualmente termina con error porque no hay tests configurados.

Comandos recomendados (manuales):

* `python3 -m http.server 5500`: sirve el frontend en local.
* `npx json-server --watch db.json --port 8000`: mock opcional (requiere crear `db.json` y adaptar los endpoints).

---

## 🔌 Integración con la API

### Endpoints consumidos

| Método | Ruta | Uso en el frontend |
| --- | --- | --- |
| `GET` | `/catalog` | Catálogo, nombres de acciones y datos de impacto |
| `GET` | `/dashboard` | KPIs del dashboard y barra de resumen del historial |
| `GET` | `/history` | Historial y acciones recientes del dashboard |
| `POST` | `/actions` | Registro de una nueva acción |
| `PUT` | `/history/{action_id}` | Edición de una acción del historial |
| `DELETE` | `/history/{action_id}` | Anulación de una acción del historial |

### Payload de `POST /actions`

```json
{
  "user_id": 1,
  "action_type_id": 3,
  "action_date": "2026-10-22",
  "description": "Texto opcional o null"
}
```

### Payload de `PUT /history/{action_id}`

```json
{
  "action_type_id": 3,
  "name": "Ir en bicicleta",
  "description": "Texto opcional",
  "date": "2026-10-22",
  "category": "Movilidad",
  "co2_saved": 2,
  "points": 15
}
```

### Campos esperados en las respuestas

**`GET /catalog`**

```json
[
  {
    "id": 3,
    "name": "Ir en bicicleta",
    "category": "Movilidad",
    "points": 15,
    "co2_kg": 2,
    "active": true
  }
]
```

**`GET /dashboard`**

Campos utilizados: `total_points`, `current_level`, `total_actions`, `total_co2_impact_kg`, `points_to_next`, `next_level`, `progress_percent`, `next_level_min`.

**`GET /history`**

Campos utilizados: `id`, `action_type_id`, `action_date`/`date`, `description`, `category`, `points_earned`/`points_awarded`/`points`, `co2_saved`/`co2_awarded`, `cancelled`.

### Eventos internos

| Evento | Se dispara cuando |
| --- | --- |
| `action:created` | Se registra una acción desde el catálogo o el modal |
| `action:updated` | Se guardan cambios en una acción del historial |
| `action:deleted` | Se anula una acción del historial |

El dashboard escucha los tres eventos y se recarga automáticamente.

---

## 🧪 Tests y QA

Actualmente **no hay tests automatizados**. `npm run test` es un placeholder.

### Checklist de pruebas manuales

- [ ] El dashboard carga KPIs y acciones recientes.
- [ ] El catálogo carga las tarjetas y el filtrado por categoría.
- [ ] La búsqueda del catálogo filtra correctamente.
- [ ] El registro desde una tarjeta del catálogo actualiza dashboard e historial.
- [ ] El modal de registro valida que la fecha no sea futura.
- [ ] El modal de edición carga los datos de la acción seleccionada.
- [ ] Guardar una edición actualiza el historial y el dashboard.
- [ ] Anular una acción la retira del historial y actualiza los KPIs.
- [ ] La paginación del historial muestra 15 registros por página.
- [ ] Los estados vacíos y de error se muestran si la API falla.
- [ ] La navegación por hash (`#dashboard`, `#acciones`, `#historial`) funciona sin recargar.
- [ ] La interfaz es usable en móvil, tablet y escritorio.

---

## ♿ Accesibilidad y responsive

* Navegación principal con `aria-label` y enlace activo marcado con `aria-current="page"`.
* Iconos decorativos con `aria-hidden="true"`.
* Modales con `role="dialog"`, `aria-modal="true"` y `aria-labelledby`.
* Cierre de modales con `Escape` y trampa de foco mientras están abiertos.
* Mensajes de error con `role="alert"` y notificaciones con `role="status"`.
* Breakpoints definidos en `src/css/style.css`: `1280px`, `1024px`, `768px` (mínimo), `767px`, `600px`, `480px` y `400px`.
* Uso de `clamp()` para tipografía y espaciados fluidos.

---

## 🚀 Despliegue

El frontend es completamente estático y puede publicarse en GitHub Pages, Netlify, Vercel o cualquier hosting de archivos estáticos.

1. Sirve el proyecto desde la raíz del repositorio (deben ser accesibles `index.html`, `pages/` y `src/`).
2. Actualiza la URL de la API en los servicios para apuntar al backend de producción.
3. Configura CORS en el backend para permitir el dominio del frontend.
4. No se necesitan rewrites del servidor: el enrutado usa hash (`#acciones`, `#historial`).

> El sitio debe servirse por HTTP/HTTPS; abrirlo con `file://` no funciona.

---

## 👥 Equipo y roles

* **Scrum Master**: Alba (Desarrollador 1) → [albavalentinn](https://github.com/albavalentinn)
* **Product Owner**: Naomi (Desarrollador 2) → [naomitudic](https://github.com/naomitudic)
* **Colaboradores**:
  * Juliana (Desarrollador 3) → [julibarguen98-ib](https://github.com/julibarguen98-ib)
  * Renata (Desarrollador 4) → [natyybeky2017-netizen](https://github.com/natyybeky2017-netizen)
  * Ainara (Desarrollador 5) → [ainaragrcgrc-coder](https://github.com/ainaragrcgrc-coder)

---

## 🗂️ Reparto de trabajo

| Dev | Área principal | Ramas representativas |
| --- | --- | --- |
| Dev 1 | Base CSS, HTML y catálogo | `feature/dev1-frontend-css-base`, `feature/dev1-frontend-html`, `feature/dev1-js-catalog-service`, `feature/dev1-ui-catalog-component` |
| Dev 2 | Catálogo, formulario de registro y `actionService` | `feature/dev2-catalog-*`, `feature/dev2-frontend-registration-html`, `feature/dev2-frontend-form-css`, `feature/dev2-js-action-service`, `feature/dev2-readme-edition` |
| Dev 3 | Historial y tabla | `feature/dev3-frontend-history-html`, `feature/dev3-frontend-table-css`, `feature/dev3-js-history-service`, `feature/dev3-ui-history-component` |
| Dev 4 | Responsive, refactor y modales | `feature/dev4-init-responsive-page`, `feature/dev4-refactor-html`, `feature/dev4-review-js`, `feature/dev4-update-logo-and-favicon` |
| Dev 5 | Layout y conexión de componentes | `feature/dev5-frontend-layout-html`, `feature/dev5-frontend-layout-css`, `feature/dev5-js-components-wiring`, `feature/dev5-json-server-setup` |

**Trabajo transversal:** dashboard, gráfico semanal, progreso de nivel y sincronización de vistas (`feature/dashboard-bar-chart`, `feature/dashboard-level-progress`, `feature/frontend-dashboard-sync`).

---

## 📌 Estado del proyecto

| Área | Estado |
| --- | --- |
| Dashboard e indicadores | ✅ Completado |
| Catálogo y filtros | ✅ Completado |
| Registro de acciones | ✅ Completado |
| Historial, edición y anulación | ✅ Completado |
| Responsive y accesibilidad básica | ✅ Completado |

---

## 🗂️ Backlog y gestión de tareas

Utilizamos la pestaña de **Projects** en GitHub para gestionar el avance del proyecto. Las tareas están organizadas en columnas (modelo tipo Kanban, llamado GreenPoints):

1. **No Status**: bocetos de tareas desarrollados en los dailies.
2. **To Do**: tareas pendientes sin empezar.
3. **In Progress**: tareas en desarrollo.
4. **In Review**: Pull Requests abiertos que deben revisarse y confirmarse por al menos dos personas del equipo.
5. **Done**: tareas completadas.

---

## 🌿 Ramas y flujo de trabajo con Git

### Ramas

* **`main`**: versión estable del código.
* **`dev`**: rama principal de desarrollo e integración.
* **Ramas de tareas**: `feature/devN-nombre-de-la-tarea` para funcionalidades y `fix/devN-nombre-del-arreglo` para correcciones.

### Convención de nombres

| Prefijo | Uso | Ejemplo |
| --- | --- | --- |
| `main` | Versión estable | `main` |
| `dev` | Integración | `dev` |
| `feature/devN-...` | Nueva funcionalidad | `feature/dev2-catalog-js` |
| `fix/...` | Corrección de errores | `fix/dev2-registration-modal` |
| `refactor/...` | Refactor sin cambio funcional | `refactor/axios-migration` |
| `revert/...` | Reversión de cambios | `revert-72-dev` |

### Flujo de trabajo

1. Actualiza la rama de integración:

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. Crea una rama para tu tarea:

   ```bash
   git checkout -b feature/devN-mi-funcionalidad
   ```

3. Desarrolla y prueba los cambios en local.

4. Haz commits siguiendo la convención:

   ```bash
   git add .
   git commit -m "feat: descripción breve del cambio"
   ```

5. Sube la rama:

   ```bash
   git push -u origin feature/devN-mi-funcionalidad
   ```

6. Abre un **Pull Request** hacia `dev`, solicita revisión y resuelve los comentarios.

7. Tras el merge, elimina la rama.

### Reglas

* No se hace push directo a `main` ni a `dev`.
* Todo cambio entra por Pull Request revisado por al menos otro miembro.
* Un PR debe probarse antes de fusionarse.

---