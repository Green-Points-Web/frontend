const API_BASE_URL = "http://127.0.0.1:8000";
const PAGE_SIZE = 15;
let currentPage = 1;
let allRows = [];
async function initializeHistory() {
    try {
        const [historyResponse, dashboardResponse, catalogResponse] =
            await Promise.all([
                axios.get(`${API_BASE_URL}/history`),
                axios.get(`${API_BASE_URL}/dashboard`),
                axios.get(`${API_BASE_URL}/catalog`).catch(() => ({ data: [] }))
            ]);

        const historyData = historyResponse.data;
        const dashboardData = dashboardResponse.data;
        const catalogData = catalogResponse.data;

        const actionNames = new Map(
            catalogData.flatMap(action => [
                [action.id, action.name],
                [String(action.id), action.name],
                [Number(action.id), action.name]
            ])
        );

        renderHistoryTable(historyData, actionNames);
        updateKpiBar(dashboardData);

    } catch (error) {
        console.error("Error al inicializar el historial:", error);
        showHistoryError();
    }
}

function showHistoryError() {
    const tableBody = document.getElementById("table-body");
    const emptyState = document.getElementById("empty-state");

    if (tableBody) {
        tableBody.replaceChildren();
    }

    if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "No se pudo cargar el historial.";
    }
}

function normalizeCategory(category = "") {
    const normalized = category
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const categories = {
        movilidad: "Movilidad",
        nature: "Naturaleza",
        naturaleza: "Naturaleza",
        reciclaje: "Reciclaje",
        participacion: "Participación",
        participación: "Participación"
    };

    return categories[normalized] || category;
}

function getActionIcon(actionName, category) {
    const name = (actionName || "").toLowerCase();
    const normCat = normalizeCategory(category);

    if (/bike|bici|bicicleta/.test(name)) {
        return {
            background: "#fff9f4",
            color: "#ff8a2b",
            iconName: "directions_bike"
        };
    }
    if (/walk|pie|caminar|andando/.test(name)) {
        return {
            background: "#F4EEF8",
            color: "#8C52BE",
            iconName: "directions_walk"
        };
    }
    if (/carpool|coche|compartir/.test(name)) {
        return {
            background: "#E3F2FD",
            color: "#1565C0",
            iconName: "directions_car"
        };
    }
    if (/tren|bus|metro|publico|transporte/.test(name)) {
        return {
            background: "#fee7ee",
            color: "#b81466",
            iconName: "directions_bus"
        };
    }
    if (/voluntariado|ambiental|voluntario|volunteer|particip/.test(name)) {
        return {
            background: "#fce6e6",
            color: "#d30a0a",
            iconName: "volunteer_activism"
        };
    }
    if (/recycl|recicl/.test(name)) {
        return {
            background: "#dbf9fd",
            color: "#1b9da2",
            iconName: "recycling"
        };
    }
    if (/tree|arbol|árbol|plant|planta/.test(name)) {
        return {
            background: "#ecfbdb",
            color: "#85C541",
            iconName: "park"
        };
    }

    const iconsByCat = {
        Movilidad: {
            background: "#E8F4EE",
            color: "#2F6B50",
            iconName: "directions_bike"
        },
        Naturaleza: {
            background: "#E8F4EE",
            color: "#2F6B50",
            iconName: "park"
        },
        Reciclaje: {
            background: "#E8F4EE",
            color: "#2F6B50",
            iconName: "recycling"
        },
        Participación: {
            background: "#E8F4EE",
            color: "#2F6B50",
            iconName: "proup"
        }
    };
    return iconsByCat[normCat] || {
        background: "#E8F4EE",
        color: "#2F6B50",
        iconName: "eco"
    };
}

function renderHistoryTable(historyData, actionNames = new Map()) {
    const tableBody = document.getElementById("table-body");
    const emptyState = document.getElementById("empty-state");

    if (!tableBody) return;

    if (Array.isArray(historyData)) {
        historyData.sort((a, b) => new Date(b.date || b.action_date) - new Date(a.date || a.action_date));
    }

    tableBody.replaceChildren();
    allRows = [];
    currentPage = 1;

    if (!Array.isArray(historyData) || historyData.length === 0) {
        if (emptyState) emptyState.hidden = false;
        updatePagination(0);
        return;
    }

    if (emptyState) emptyState.hidden = true;

    historyData.forEach(item => {
        const actionName = actionNames.get(item.action_type_id) || item.action_name || item.name || item.title || `Acción #${item.action_type_id || 'general'}`;
        const category = normalizeCategory(item.category || "Movilidad");
        const description = item.description || item.note || item.details || "Acción sostenible registrada";
        const icon = getActionIcon(actionName, category);
        const dateStr = formatDate(item.date || item.action_date);
        const co2Val = `${Number(item.co2_saved || item.impact || 0)} kg`;
        const pointsVal = `+${Number(item.points || item.points_earned || 0)} pts`;
        const isCancelled = item.cancelled === true || item.status === "cancelled" || item.annulled === true;

        const row = document.createElement("tr");
        row.className = "history-row";
        row.dataset.id = item.id;
        row.dataset.searchable = `${actionName} ${description} ${dateStr} ${category} ${co2Val} ${pointsVal}`.toLowerCase();
        row.dataset.category = category;

        if (isCancelled) {
            row.style.opacity = "0.5";
            row.style.backgroundColor = "#f9fafb";
        }

        const tdAction = document.createElement("td");
        tdAction.className = "td-left";
        tdAction.dataset.label = "Acción";
        tdAction.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="row-icon-box" style="background-color: ${icon.background}; color: ${icon.color};">
                    <span class="material-symbols-outlined" aria-hidden="true">${icon.iconName}</span>
                </div>
                <div>
                    <div class="row-main-title">${actionName} ${isCancelled ? '<span style="font-size: 0.75rem; color: #dc2626; font-weight: 600; margin-left: 0.5rem;">(Anulada)</span>' : ''}</div>
                    <div class="row-sub-desc">${description}</div>
                </div>
            </div>
        `;

        const tdDate = document.createElement("td");
        tdDate.className = "td-general";
        tdDate.dataset.label = "Fecha";
        tdDate.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 0.3rem;">
                <span class="material-symbols-outlined" style="font-size: 14px; color: #6b7280;">schedule</span>
                <span>${dateStr}</span>
            </div>
        `;

        const tdCategory = document.createElement("td");
        tdCategory.className = "td-general";
        tdCategory.dataset.label = "Categoría";
        const styles = getActionIcon(item.name || item.actionName, item.category);

        tdCategory.innerHTML = `
            <span style="
                background-color: ${styles.background}; 
                color: ${styles.color}; 
                width: 110px; 
                max-width: 100%; 
                padding: 0.25rem 0.625rem; 
                border-radius: 9999px; 
                display: inline-flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 0.75rem; 
                font-weight: 500; 
                text-align: center; 
                box-sizing: border-box;
            ">${item.category}</span>
        `;

        const tdImpact = document.createElement("td");
        tdImpact.className = "td-general";
        tdImpact.dataset.label = "Impacto";
        tdImpact.innerHTML = `
            <div style="color: #1f2c1f; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.95rem; font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem; width: 100px; max-width: 100%; box-sizing: border-box; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 14px;">emoji_nature</span>
                <span>${co2Val}</span>
            </div>
        `;

        const tdPoints = document.createElement("td");
        tdPoints.className = "td-right";
        tdPoints.dataset.label = "Puntos";
        tdPoints.innerHTML = `
            <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 0.2rem; font-size: 0.95rem; font-weight: 600; color: #111827;">
                <span><span class="material-symbols-outlined" style="font-size: 13px; color: #f59e0b; font-variation-settings: 'FILL' 1;">star</span>${pointsVal}</span>
            </div>
        `;

        const tdEdit = document.createElement("td");
        tdEdit.className = "td-general";
        tdEdit.innerHTML = `
            <button type="button" class="icon-btn btn-edit-item" aria-label="Editar acción" title="Editar">
            <span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
            </button>
        `;

        const editBtn = tdEdit.querySelector(".btn-edit-item");

        if (isCancelled) {
            editBtn.disabled = true;
            editBtn.style.opacity = "0.3";
            editBtn.style.cursor = "not-allowed";
            editBtn.title = "Acción anulada (no se puede editar)";
        } else {
            editBtn.addEventListener("click", () => {
                if (typeof window.openEditModal !== "function") {
                    console.error("No se ha cargado modaleditcontroller.js");
                    return;
                }

                const actionToEdit = {
                    ...item,
                    action_name: actionName,
                    category: category,
                    description: description
                };

                window.openEditModal(actionToEdit);
            });
        }
        
        row.append(
            tdAction,
            tdDate,
            tdCategory,
            tdImpact,
            tdPoints,
            tdEdit
        );
        tableBody.appendChild(row);
        allRows.push(row);
    });

    renderPage();
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' });
}

function updateKpiBar(data) {
    const kpiActions = document.getElementById("kpi-actions");
    const kpiPoints = document.getElementById("kpi-points");
    const kpiCo2 = document.getElementById("kpi-co2");

    if (kpiActions) kpiActions.textContent = data.total_actions ?? 0;
    if (kpiPoints) kpiPoints.textContent = data.total_points ?? 0;
    if (kpiCo2) kpiCo2.textContent = `${data.total_co2_impact_kg ?? 0} kg`;
}

function setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    const filterSelect = document.getElementById("filter-select");

    if (searchInput) {
        searchInput.addEventListener("input", () => { currentPage = 1; filterHistoryTable(); });
    }
    if (filterSelect) {
        filterSelect.addEventListener("change", () => { currentPage = 1; filterHistoryTable(); });
    }

    document.getElementById("page-prev")?.addEventListener("click", () => goToPage(-1));
    document.getElementById("page-next")?.addEventListener("click", () => goToPage(1));
}

function filterHistoryTable() {
    const searchInput = document.getElementById("search-input");
    const filterSelect = document.getElementById("filter-select");
    const emptyState = document.getElementById("empty-state");

    const query = (searchInput?.value || "").toLowerCase().trim();
    const selectedCategory = filterSelect?.value || "Todas";

    let visibleCount = 0;

    allRows.forEach(row => {
        const searchText = row.dataset.searchable || "";
        const rowCategory = row.dataset.category || "";

        const matchesSearch = searchText.includes(query);
        const matchesCategory = selectedCategory === "Todas" || rowCategory.toLowerCase() === selectedCategory.toLowerCase();

        row.dataset.visible = (matchesSearch && matchesCategory) ? "1" : "0";
        if (matchesSearch && matchesCategory) visibleCount++;
    });

    const visibleRows = allRows.filter(r => r.dataset.visible === "1");
    const totalPages = Math.max(1, Math.ceil(visibleCount / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    allRows.forEach(row => {
        const pos = visibleRows.indexOf(row);
        row.style.display = (pos >= start && pos < start + PAGE_SIZE) ? "" : "none";
    });

    if (emptyState) {
        emptyState.hidden = visibleCount > 0;
    }

    updatePagination(visibleCount);
}

function renderPage() {
    const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    allRows.forEach((row, index) => {
        row.style.display = (index >= start && index < end) ? "" : "none";
    });

    updatePagination(allRows.length);
}

function updatePagination(total) {
    const info = document.getElementById("pagination-info");
    const prevBtn = document.getElementById("page-prev");
    const nextBtn = document.getElementById("page-next");
    const nav = document.getElementById("pagination");

    if (nav) nav.hidden = total === 0;

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (info) info.textContent = `Página ${currentPage} de ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function goToPage(delta) {
    currentPage += delta;
    renderPage();
}

window.initializeHistory = initializeHistory;
window.setupHistoryEventListeners = setupEventListeners;