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

    let currentEditingId = null;


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

    
    function setupModalAndFilters() {
        const modal = document.getElementById("modal");
        const btnClose = document.getElementById("btn-close");
        const btnCancel = document.getElementById("btn-cancel");
        const btnDelete = document.getElementById("btn-delete");
        const form = document.getElementById("action-form");

        if (btnClose) btnClose.addEventListener("click", closeModal);
        if (btnCancel) btnCancel.addEventListener("click", closeModal);

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (btnDelete) {
            btnDelete.addEventListener("click", async () => {
                if (!currentEditingId) return;
                if (confirm("¿Estás seguro de que deseas eliminar esta acción?")) {
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/history/${currentEditingId}`, {
                            method: "DELETE"
                        });
                        if (response.ok) {
                            closeModal();
                            loadHistory();
                            updateDashboardStats();
                        } else {
                            alert("No se pudo eliminar la acción.");
                        }
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                    }
                }
            });
        }

        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!currentEditingId) return;

                const updatedData = {
                    name: document.getElementById("f-name").value,
                    description: document.getElementById("f-desc").value,
                    date: document.getElementById("f-date").value,
                    category: document.getElementById("f-category").value,
                    co2_saved: parseFloat(document.getElementById("f-kg").value) || 0,
                    points: parseInt(document.getElementById("f-points").value, 10) || 0
                };

                try {
                    const response = await fetch(`http://127.0.0.1:8000/history/${currentEditingId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedData)
                    });

                    if (response.ok) {
                        closeModal();
                        loadHistory();
                        updateDashboardStats();
                    } else {
                        alert("Error al actualizar la acción en el servidor.");
                    }
                } catch (error) {
                    console.error("Error al guardar cambios:", error);
                }
            });
        }

        
        const searchInput = document.getElementById("search-input");
        const filterSelect = document.getElementById("filter-select") || document.getElementById("filter-btn");

        if (searchInput) {
            searchInput.addEventListener("input", filterHistoryTable);
        }
        if (filterSelect) {
            filterSelect.addEventListener("change", filterHistoryTable);
        }
    }

    function openEditModal(item) {
        const modal = document.getElementById("modal");
        if (!modal) return;

        currentEditingId = item.id;

        const fName = document.getElementById("f-name");
        const fDesc = document.getElementById("f-desc");
        const fDate = document.getElementById("f-date");
        const fCategory = document.getElementById("f-category");
        const fKg = document.getElementById("f-kg");
        const fPoints = document.getElementById("f-points");

        if (fName) fName.value = item.description || item.name || "";
        if (fDesc) fDesc.value = item.description || "";
        if (fDate) fDate.value = (item.action_date || item.date || "").split("T")[0];
        if (fCategory) fCategory.value = item.category || "Movilidad";
        if (fKg) fKg.value = item.co2_saved || 0;
        if (fPoints) fPoints.value = item.points_earned || item.points || 0;

        modal.hidden = false;
    }

    function closeModal() {
        const modal = document.getElementById("modal");
        if (modal) modal.hidden = true;
        currentEditingId = null;
    }

    function filterHistoryTable() {
        const searchInput = document.getElementById("search-input");
        const filterSelect = document.getElementById("filter-select");
        const emptyState = document.getElementById("empty-state");

        const query = (searchInput?.value || "").toLowerCase().trim();
        const selectedCategory = filterSelect?.value || "Todas";

        const rows = document.querySelectorAll(".history-row");
        let visibleCount = 0;

        rows.forEach(row => {
            const searchText = row.dataset.searchable || "";
            const rowCategory = row.dataset.category || "";

            const matchesSearch = searchText.includes(query);
            const matchesCategory = selectedCategory === "Todas" || rowCategory.toLowerCase() === selectedCategory.toLowerCase();

            if (matchesSearch && matchesCategory) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount > 0;
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
                await loadHistory(); 
                setupModalAndFilters();
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
        try {
            const response = await fetch('http://127.0.0.1:8000/history');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const historyData = await response.json();
            const historyBody = document.querySelector('#table-body') || document.querySelector('#history-table-body');
            const emptyState = document.getElementById("empty-state");

            if (!historyBody) return;
            historyBody.replaceChildren();

            if (historyData && historyData.length > 0) {
                if (emptyState) emptyState.hidden = true;

                historyData.forEach(action => {
                    const actionName = action.description || `Acción #${action.action_type_id}`;
                    const category = action.category || 'Movilidad';
                    const dateStr = action.action_date || action.date || '—';
                    const co2Val = `${Number(action.co2_saved || 0)} kg`;
                    const pointsVal = `+${Number(action.points_earned || action.points || 0)} pts`;

                    const row = document.createElement('tr');
                    row.className = 'history-row';
                    row.dataset.category = category;
                    row.dataset.searchable = `${actionName} ${dateStr} ${category} ${co2Val} ${pointsVal}`.toLowerCase();

                    const tdAction = document.createElement('td');
                    tdAction.className = 'td-left';
                    tdAction.textContent = actionName;

                    const tdDate = document.createElement('td');
                    tdDate.className = 'td-general';
                    tdDate.textContent = dateStr;

                    const tdCategory = document.createElement('td');
                    tdCategory.className = 'td-general';
                    tdCategory.innerHTML = `<span class="category-tag-table">${category}</span>`;

                    const tdImpact = document.createElement('td');
                    tdImpact.className = 'td-general';
                    tdImpact.textContent = co2Val;

                    const tdPoints = document.createElement('td');
                    tdPoints.className = 'td-right';
                    tdPoints.textContent = pointsVal;

                    
                    const tdEdit = document.createElement('td');
                    tdEdit.className = 'td-general';
                    tdEdit.innerHTML = `
                        <button type="button" class="icon-btn btn-edit-item" aria-label="Editar acción" title="Editar">
                            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                        </button>
                    `;
                    tdEdit.querySelector("button").addEventListener("click", () => {
                        openEditModal(action);
                    });

                    row.append(tdAction, tdDate, tdCategory, tdImpact, tdPoints, tdEdit);
                    historyBody.appendChild(row);
                });
            } else {
                if (emptyState) emptyState.hidden = false;
            }
        } catch (error) {
            console.error('Error al cargar el historial:', error);
        }
    }
});