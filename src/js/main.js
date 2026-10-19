import { initRegistrationModal } from './components/registrationModal.js';
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
        const response = await fetch('http://127.0.0.1:8000/dashboard');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const pointsEl = document.querySelector('#stat-points');
        const actionsEl = document.querySelector('#stat-actions');
        const co2El = document.querySelector('#stat-co2');

        if (pointsEl) {
            pointsEl.textContent = data.total_points ?? 0;
        }

        if (actionsEl) {
            actionsEl.textContent = data.total_actions ?? 0;
        }

        if (co2El) {
            co2El.textContent =
                Number(data.total_co2_impact_kg ?? 0).toFixed(2);
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
                  await import('./services/historyService.js');
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
             await import('./services/historyService.js');
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

    initRegistrationModal(updateDashboardStats);
    
    const initialHash = window.location.hash || '#dashboard';
    loadPage(initialHash);
    await updateDashboardStats();
});