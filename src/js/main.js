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

    async function updateRecentActions() {
        try {
            const response = await fetch('http://127.0.0.1:8000/history');
            if (!response.ok) return;
            const historyData = await response.json();

            if (historyData && Array.isArray(historyData)) {
                
                const actionNames = window.styleActionNames || new Map(); 
                
                if (typeof window.renderRecentActionsList === 'function') {
                    window.renderRecentActionsList(historyData, actionNames);
                }
            }
        } catch (error) {
            console.error('Error al actualizar las últimas acciones recientes:', error);
        }
    }


    async function updateDashboardStats() {
        try {
            const response = await fetch('http://127.0.0.1:8000/history');
            if (!response.ok) return;
            const historyData = await response.json();

            if (historyData && Array.isArray(historyData)) {
                const totalActions = historyData.length;
                const totalPoints = historyData.reduce((acc, curr) => acc + (curr.points_earned || curr.points || 0), 0);
                const totalCo2 = historyData.reduce((acc, curr) => acc + (curr.co2_saved || 0), 0);

                const pointsEl = document.querySelector('#stat-points') || document.querySelector('#kpi-points');
                const actionsEl = document.querySelector('#stat-actions') || document.querySelector('#kpi-actions');
                const co2El = document.querySelector('#stat-co2') || document.querySelector('#kpi-co2');

                if (pointsEl) pointsEl.textContent = totalPoints;
                if (actionsEl) actionsEl.textContent = totalActions;
                if (co2El) co2El.textContent = `${totalCo2.toFixed(1)} kg`;
            }
        } catch (error) {
            console.error('Error al actualizar estadísticas:', error);
        }
    }


    async function loadPage(hash) {
        if (hash === '#dashboard' || hash === '') {
            if (dashboardSection) dashboardSection.hidden = false;
            if (dynamicContent) dynamicContent.innerHTML = '';
            await updateDashboardStats();
            await updateRecentActions();
            return;
        }

        const fileName = routes[hash];
        if (!fileName) return;

        try {
            const response = await fetch(`./pages/${fileName}.html`);
            if (!response.ok) throw new Error('Archivo no encontrado');

            const html = await response.text();

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
    await updateDashboardStats();
    await updateRecentActions();

    window.addEventListener('action:created', async () => {
        const hash = window.location.hash || '#dashboard';
        if (hash === '#historial' && typeof window.initializeHistory === 'function') {
            await window.initializeHistory();
        } else {
            await updateDashboardStats();
        }
    });

    window.addEventListener('action:created', async () => {
        const hash = window.location.hash || '#dashboard';
        if (hash === '#historial' && typeof window.initializeHistory === 'function') {
            await window.initializeHistory();
        } else {
            await updateDashboardStats();
            await updateRecentActions(); 
        }
    });

});


