# 🍃 GreenPoints · Frontend

> Interfaz web para registrar acciones sostenibles, consultar el catálogo de acciones disponibles, revisar el historial y visualizar el impacto ambiental acumulado (puntos obtenidos a través del cálculo de CO₂ ahorrado).

<!-- Badges -->
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-Sin_framework-informational)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## 📷 Vista Previa (Demo)

*   **Link a la aplicación en producción:** *Pendiente de despliegue*
*   *Logo del proyecto: `src/img/Logo.png`.*
*   *Opcional: añade un GIF animado o captura de la interfaz principal (dashboard, catálogo e historial) aquí.*

---

## 🛠️ Tecnologías Utilizadas

*   **Lenguaje:** JavaScript (ES Modules) — sin framework ni bundler.
*   **Interfaz:** HTML5 + CSS3 (cascada tradicional, sin preprocesadores).
*   **Enrutado:** Hash Router propio (`src/js/main.js`).
*   **Peticiones HTTP:** `fetch` nativo (API REST en `http://127.0.0.1:8000`).
*   **Iconografía:** Material Symbols de Google Fonts.
*   **Estado/Reactividad:** `CustomEvent` + `window` (actualizaciones sin recargar).
*   **Dependencias:** `sortablejs` (runtime) y `json-server` (dev, mock opcional).
*   **Servidor local:** `python3 -m http.server` (o cualquier servidor estático).

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

## 📂 Estructura de Carpetas

Una guía rápida de cómo está organizado el código fuente:

```text
frontend/
├── index.html                  # SPA: header, dashboard y scripts globales
├── pages/                      # Vistas inyectadas por el router
│   ├── catalog-section.html    #   #acciones
│   └── history-section.html    #   #historial
├── src/
│   ├── css/                    # base, layout, catalog, history, registration
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

## 🤝 Contribuciones

1. Mantén actualizada la rama `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Crea una nueva rama para tu funcionalidad:
   ```bash
   git checkout -b feature/NuevaFuncionalidad
   ```
3. Haz un **Commit** con tus cambios siguiendo el estilo del repo:
   ```bash
   git commit -m 'Añade nueva funcionalidad'
   ```
4. Haz un **Push** a la rama:
   ```bash
   git push origin feature/NuevaFuncionalidad
   ```
5. Abre un **Pull Request**.

---