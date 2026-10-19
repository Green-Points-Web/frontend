document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.querySelector('.site-main');
    const dashboardSection = document.querySelector('#dashboard');
    const menuLinks = document.querySelectorAll('nav a');

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

                if (hash === '#acciones') {

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

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (hash && hash.startsWith('#')) {
                e.preventDefault();
                history.pushState(null, null, hash);
                loadPage(hash);
            }
        });
    });

    const initialHash = window.location.hash || '#dashboard';
    loadPage(initialHash);
    await updateDashboardStats();

});