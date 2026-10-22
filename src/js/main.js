document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.querySelector('.site-main');
    const dashboardSection = document.querySelector('#dashboard');


    let dynamicContent = document.querySelector('#dynamic-content');
    if (!dynamicContent && mainContainer) {
        dynamicContent = document.createElement('div');
        dynamicContent.id = 'dynamic-content';
        mainContainer.appendChild(dynamicContent);
    }

    const routes = {
        '#acciones': 'catalog-section',
        '#historial': 'history-section'
    };

    function setActiveNav(hash) {
        const current = hash || '#dashboard';
        document.querySelectorAll('.main-nav__link').forEach((link) => {
            const isActive = link.getAttribute('href') === current;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }


    async function loadPage(hash) {
        setActiveNav(hash);

        if (hash === '#dashboard' || hash === '') {
            if (dashboardSection) dashboardSection.hidden = false;
            if (dynamicContent) dynamicContent.innerHTML = '';
            return;
        }

        const fileName = routes[hash];
        if (!fileName) return;

        try {
            // Cambio a Axios para cargar el HTML de las vistas
            const response = await axios.get(`./pages/${fileName}.html`);
            const html = response.data;

            if (dashboardSection) dashboardSection.hidden = true;
            if (dynamicContent) {
                dynamicContent.hidden = false;
                dynamicContent.innerHTML = html;
            }

            if (hash === '#acciones') { 
                const loadCatalogScript = () => {
                    return new Promise((resolve, reject) => {
                        if (typeof window.initializeCatalog === "function") return resolve();
                        const script = document.createElement('script');
                        script.src = "./src/js/services/catalogService.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                };
                try {
                    await loadCatalogScript();
                    await window.initializeCatalog();
                    if (typeof window.setupCatalogEventListeners === "function") {
                        window.setupCatalogEventListeners();
                    }
                } catch (err) {
                    console.error("No se ha cargado el script del catálogo (catalogService.js) correctamente.", err);
                }
            }

            if (hash === '#historial') {
                if (typeof window.initializeHistory === "function") {
                    await window.initializeHistory();
                } else {
                    console.error("No se ha cargado historyService.js");
                }

                if (typeof window.setupHistoryEventListeners === "function") {
                    window.setupHistoryEventListeners();
                }

                if (typeof window.setupModalListeners === "function") {
                    window.setupModalListeners();
                } else {
                    console.error("No se ha cargado modalcontroller.js");
                }
            }

        } catch (error) {
            console.error("Error al cargar la vista:", error);
            if (dashboardSection) dashboardSection.hidden = true;
            if (dynamicContent) {
                dynamicContent.hidden = false;
                dynamicContent.innerHTML = '<p>Error al cargar la sección.</p>';
            }
        }
    }


    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        e.preventDefault();
        history.pushState(null, null, hash);
        loadPage(hash);
    });
    window.addEventListener('popstate', () => {
        const hash = window.location.hash || '#dashboard';
        loadPage(hash);
    });

    const initialHash = window.location.hash || '#dashboard';
    loadPage(initialHash);

    window.addEventListener('action:created', async () => {
        const hash = window.location.hash || '#dashboard';
        if (hash === '#historial' && typeof window.initializeHistory === 'function') {
            await window.initializeHistory();
        }
    });

});