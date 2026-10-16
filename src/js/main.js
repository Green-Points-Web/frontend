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

    // Function to update Summary statistics by querying the backend
    async function updateDashboardStats() {
        try {
            const response = await fetch('http://127.0.0.1:8000/history');
            if (!response.ok) return;
            const historyData = await response.json();

            if (historyData && Array.isArray(historyData)) {
                const totalActions = historyData.length;
                const totalPoints = historyData.reduce((acc, curr) => acc + (curr.points_earned || 0), 0);
                const totalCo2 = historyData.reduce((acc, curr) => acc + (curr.co2_saved || 0), 0);

                const pointsEl = document.querySelector('#stat-points');
                const actionsEl = document.querySelector('#stat-actions');
                const co2El = document.querySelector('#stat-co2');

                if (pointsEl) pointsEl.textContent = totalPoints;
                if (actionsEl) actionsEl.textContent = totalActions;
                if (co2El) co2El.textContent = totalCo2.toFixed(2);
            }
        } catch (error) {
            console.error('Error al actualizar estadísticas:', error);
        }
    }

    // Monitor the manual form submission (top button)
    const modalForm = document.querySelector('#modal-action-form');
    if (modalForm) {
        modalForm.addEventListener('submit', () => {
            setTimeout(async () => {
                await updateDashboardStats();
                if (window.location.hash === '#historial') {
                 await loadHistory();
              }
            }, 500);
        });
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

                // --- Direct registration from the catalog ---
                if (hash === '#acciones') {
                    const registerButtons = dynamicContent.querySelectorAll('.btn-register');
                    const actionSelect = document.querySelector('#modal-action-type-select');
                    const dateInput = document.querySelector('#modal-action-date');
                    const descInput = document.querySelector('#modal-action-description');
                    const submitBtn = document.querySelector('#submit-btn'); 
                    
                    registerButtons.forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const card = e.target.closest('.action-card');
                            const actionName = card ? card.querySelector('h3').textContent.trim() : 'Acción';

                            if (actionSelect && actionSelect.options.length > 1) {
                                const optionToSelect = Array.from(actionSelect.options).find(opt => 
                                    opt.text.toLowerCase().includes(actionName.toLowerCase().split(' ')[0])
                                );
                                actionSelect.value = optionToSelect ? optionToSelect.value : actionSelect.options[1].value;
                                actionSelect.dispatchEvent(new Event('change'));
                            }

                            if (dateInput) {
                                dateInput.value = new Date().toISOString().split('T')[0];
                            }
                            
                            if (descInput) {
                                descInput.value = "Registro automático desde el catálogo: " + actionName;
                            }

                            if (submitBtn) {
                                submitBtn.click();
                                
                                const originalText = button.innerHTML;
                                button.innerHTML = "¡Registrado! ✅";
                                button.style.backgroundColor = "#1b362d";
                                button.style.color = "white";
                                
                                setTimeout(async () => {
                                    button.innerHTML = originalText;
                                    button.style.backgroundColor = "";
                                    button.style.color = "";
                                    await updateDashboardStats();
                                }, 1500);
                            }
                        });
                    });
                }
            }

            if (hash === '#historial') {
              await loadHistory();
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

async function loadHistory() {
    if (typeof window.initializeHistory !== "function") {
        console.error("El servicio del historial no está cargado.");
        return;
    }

    await window.initializeHistory();
}

});