* * *

# 🍃 GreenPoints · Frontend

> Proyecto colaborativo para el desarrollo web de GreenPoints, una aplicación pensada para registrar acciones sostenibles que te permite cuantificar tu impacto ambiental positivo (mediante puntos obtenidos a través del cálculo de CO₂ ahorrado).

---

## ✨ Key Features

*   **📊 Dashboard de impacto:** resumen en tiempo de KPIs —puntos totales, CO₂ ahorrado y acciones registradas— con lista de las acciones más recientes.
*   **🗂️ Catálogo de acciones:** grid de acciones sostenibles con búsqueda y filtrado por categoría, cada tarjeta codificada por color (Movilidad, Naturaleza, Reciclaje, Participación).
*   **✅ Registro de acciones:** alta rápida desde el catálogo o mediante un modal dedicado; cada acción guarda fecha, categoría y puntos/CO₂ asociados.
*   **📜 Historial paginado:** tabla de acciones registradas con paginación (15 por página), iconografía por categoría y acciones de editar/eliminar.
*   **🌱 Cálculo de impacto:** los puntos se derivan del CO₂ ahorrado según el tipo de acción.
*   **⚡ SPA sin recargar:** Hash Router propio que inyecta vistas parciales y mantiene la experiencia fluida.
*   **🔔 Secciones sincronizadas:** un mismo registro se refleja en dashboard e historial en vivo mediante eventos (`action:created` / `action:deleted`), sin refrescar la página.
*   **🎨 UI ligera y sin dependencias:** Vanilla JS + CSS tradicional e iconografía Material Symbols; sin framework ni bundler.
*   **🔌 API REST:** consumo del backend con `fetch` nativo, con estados de carga/error y estados vacíos en cada vista.

---

## 📷 Vista Previa (Demo)

*   **Link a la aplicación en producción:** *Pendiente de despliegue*
*   *Opcional: añade un GIF animado o captura de la interfaz principal (dashboard, catálogo e historial) aquí.*

Puedes consultar el diseño preliminar del proyecto en Stitch:[Diseño en Stitch](https://stitch.withgoogle.com/projects/11054811943219877412)

---

## 🚀 Objetivo

Crear una aplicación funcional que permita a los usuarios:

* Registrar las acciones sostenibles que lleves a cabo en tu día a día.
* Consultar estas acciones sostenibles en un catálogo, o visualizar las ya registradas en un historial.
* Visualizar tu impacto ambiental (puntos obtenidos a través del cálculo de CO₂ ahorrado).

---

## ⚙️ Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Requisitos Previos

*   **Python 3** (para servir archivos estáticos) o cualquier servidor HTTP local.
*   **Node.js** (opcional, solo para `json-server` como mock).
*   Un **backend** escuchando en `http://127.0.0.1:8000` que exponga `/catalog`, `/history`, `/dashboard` y `/actions`. Sin él, las vistas muestran estados de error o vacíos.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Green-Points-Web/frontend.git
   cd frontend
   ```

2. (Opcional) Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura el backend:
   El proyecto **no usa archivo `.env`**: la URL de la API (`http://127.0.0.1:8000`) está definida en los servicios (`src/js/services/*.js`). Debe estar corriendo antes de abrir la web.

4. Inicia el servidor de desarrollo:
   ```bash
   python3 -m http.server 5500
   ```
   La aplicación debe estar corriendo en `http://localhost:5500/index.html`.

> **Importante:** no abras `index.html` con `file://`; el router hace `fetch()` de las vistas y fallará por CORS.

### Ejecución opcional con json-server (mock)

```bash
npx json-server --watch db.json --port 8000
```
> `db.json` contiene `actionTypes` de ejemplo, pero **no coincide con los endpoints** que consume el front (`/catalog`, `/history`, `/dashboard`); habría que adaptar su estructura.

---

## 📦 Scripts Disponibles

El proyecto no usa bundler, por lo que no hay scripts de build. En `package.json`:

*   `npm run test`: reservado.

Comandos recomendados (manuales):

*   `python3 -m http.server 5500`: sirve el frontend en local.
*   `npx json-server --watch db.json --port 8000`: mock del backend.

---

## 👥 Equipo

* **Scrum Master**: Alba (Desarrollador 1) -> [albavalentinn](https://github.com/albavalentinn)
* **Product Owner**: Naomi (Desarrollador 2) -> [naomitudic](https://github.com/naomitudic)
* **Colaboradores**:
    * Juliana (Desarrollador 3) -> [julibarguen98-ib](https://github.com/julibarguen98-ib),
    * Renata (Desarrollador 4) -> [natyybeky2017-netizen](https://github.com/natyybeky2017-netizen),
    * Ainara (Desarrollador 5) -> [ainaragrcgrc-coder](https://github.com/ainaragrcgrc-coder),

---

## 🗂️ Backlog y Gestión de Tareas

Utilizamos la pestaña de **Projects** en GitHub para gestionar el avance del proyecto. Las tareas estarán organizadas en columnas (modelo tipo Kanban, llamado GreenPoints):

1. **No Status**: Bocetos de tareas desarrollados en los daily's.
2. **To Do**: Tareas sin empezar pendientes.
3. **In Progress**: Tareas en desarrollo.
3. **In Review**: Pull Requests abiertos que deben revisarse y confirmarse por al menos dos personas del equipo.
4. **Done**: Tareas completadas.

---

## 📂 Estructura de ramas (en GitHub)

* **`main`**: Versión estable del código.
* **`develop`**: Comúnmente denominada como "dev", la rama principal de desarrollo.
* **Ramas de tareas**: Cada tarea/issue se desarrollará en su propia rama, siguiendo el formato: `feature/dev(x)-nombre-de-la-tarea`. En caso de tratarse de arreglos, se denominarán de la siguiente manera: `fix/dev(x)-nombre-de-la-tarea`.

---

## 🛠️ Tecnologías utilizadas

* **GitHub**: Plataforma para la colaboración y gestión del repositorio.
* **Lenguaje:** JavaScript (ES Modules) — sin framework ni bundler.
* **Interfaz:** HTML5 + CSS3 (cascada tradicional, sin preprocesadores).
* **Enrutado:** Hash Router propio (`src/js/main.js`).
* **Peticiones HTTP:** `fetch` nativo (API REST en `http://127.0.0.1:8000`).
* **Iconografía:** Material Symbols de Google Fonts.
* **Estado/Reactividad:** `CustomEvent` + `window` (actualizaciones sin recargar).
* **Dependencias:** `sortablejs` (runtime) y `json-server` (dev, mock opcional).
* **Servidor local:** `python3 -m http.server` (o cualquier servidor estático).

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-Sin_framework-informational)
![License](https://img.shields.io/badge/license-ISC-blue)

## 📂 Estructura de Carpetas

Una guía rápida de cómo está organizado el código fuente:

```text
frontend/
├── index.html                  # SPA: header, dashboard y scripts stylees
├── pages/                      # Vistas inyectadas por el router
│   ├── catalog-section.html    #   #acciones
│   └── history-section.html    #   #historial
├── src/
│   ├── css/                    # style.css (hoja única de estilos)
│   ├── img/                    # Logotipo y recursos estáticos
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
└── db.json                     # Mock de json-server (opcional)
```

---

¡Gracias por contribuir y formar parte de este proyecto! 💪 Si este proyecto te ha gustado o te ha sido útil, puedes darle una estrella en Github ⭐

* * *
