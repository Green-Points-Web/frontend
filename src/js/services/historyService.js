const API_BASE_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    initializeHistory();
    setupEventListeners();
});

async function initializeHistory() {
    try {
        const [historyResponse, dashboardResponse, catalogResponse] =
            await Promise.all([
                fetch(`${API_BASE_URL}/history`),
                fetch(`${API_BASE_URL}/dashboard`),
                fetch(`${API_BASE_URL}/catalog`)
            ]);

        if (!historyResponse.ok || !dashboardResponse.ok) {
            throw new Error("No se pudieron cargar los datos del servidor.");
        }

        const historyData = await historyResponse.json();
        const dashboardData = await dashboardResponse.json();
        const catalogData = catalogResponse.ok ? await catalogResponse.json() : [];

        const actionNames = new Map(
            catalogData.map(action => [action.id, action.name])
        );

        renderHistoryTable(historyData, actionNames);
        updateKpiBar(dashboardData);

    } catch (error) {
        console.error("Error al inicializar el historial:", error);
        showHistoryError();
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
        return { background: "#F4EEF8", color: "#8C52BE", path: "M5 18h14M5 14h14M10 9l2-3 2 3M6 9h12" };
    }
    if (/recycl|recicl/.test(name)) {
        return { background: "#E2F4F2", color: "#2C8D85", path: "M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2" };
    }
    if (/tree|arbol|árbol|plant|planta/.test(name)) {
        return { background: "#EBF7EE", color: "#358850", path: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" };
    }
    if (/volunteer|voluntari|particip/.test(name)) {
        return { background: "#FDF2EE", color: "#E06D43", path: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" };
    }

    const iconsByCat = {
        Movilidad: { background: "#F4EEF8", color: "#8C52BE", path: "M5 18h14M5 14h14M10 9l2-3 2 3M6 9h12" },
        Naturaleza: { background: "#EBF7EE", color: "#358850", path: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
        Reciclaje: { background: "#E2F4F2", color: "#2C8D85", path: "M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2" },
        Participación: { background: "#FDF2EE", color: "#E06D43", path: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" }
    };

    return iconsByCat[normCat] || { background: "#E8F4EE", color: "#2F6B50", path: "M12 3v18m-9-9h18" };
}

function renderHistoryTable(historyData, actionNames = new Map()) {
    const tableBody = document.getElementById("table-body");
    const emptyState = document.getElementById("empty-state");

    if (!tableBody) return;

    tableBody.replaceChildren();

    if (!Array.isArray(historyData) || historyData.length === 0) {
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (emptyState) emptyState.hidden = true;

    historyData.forEach(item => {
        const actionName = actionNames.get(item.action_type_id) || item.name || `Acción #${item.action_type_id}`;
        const category = normalizeCategory(item.category || "Movilidad");
        const description = item.description || "Acción sostenible registrada";
        const icon = getActionIcon(actionName, category);
        const dateStr = formatDate(item.date || item.action_date);
        const co2Val = `${Number(item.co2_saved || item.impact || 0)} kg`;
        const pointsVal = `+${Number(item.points || item.points_earned || 0)} pts`;

        const row = document.createElement("tr");
        row.className = "history-row";
        row.dataset.id = item.id;
        row.dataset.searchable = `${actionName} ${description} ${dateStr} ${category} ${co2Val} ${pointsVal}`.toLowerCase();
        row.dataset.category = category;

        
        const tdAction = document.createElement("td");
        tdAction.className = "td-left";
        tdAction.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="row-icon-box" style="background-color: ${icon.background}; color: ${icon.color};">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="${icon.path}"/>
                    </svg>
                </div>
                <div>
                    <div class="row-main-title">${actionName}</div>
                    <div class="row-sub-desc">${description}</div>
                </div>
            </div>
        `;

        
        const tdDate = document.createElement("td");
        tdDate.className = "td-general";
        tdDate.textContent = dateStr;

        
        const tdCategory = document.createElement("td");
        tdCategory.className = "td-general";
        tdCategory.innerHTML = `<span class="category-tag-table">${category}</span>`;

        
        const tdImpact = document.createElement("td");
        tdImpact.className = "td-general";
        tdImpact.textContent = co2Val;

        
        const tdPoints = document.createElement("td");
        tdPoints.className = "td-right";
        tdPoints.textContent = pointsVal;

        
        const tdEdit = document.createElement("td");
        tdEdit.className = "td-general";
        tdEdit.innerHTML = `
            <button type="button" class="icon-btn btn-edit-item" aria-label="Editar acción" title="Editar">
                <span class="edit-icon icon-element" aria-hidden="true">✏️</span>
            </button>
        `;
        tdEdit.querySelector("button").addEventListener("click", () => {
            openEditModal(item);
        });

        row.append(tdAction, tdDate, tdCategory, tdImpact, tdPoints, tdEdit);
        tableBody.appendChild(row);
    });
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
        searchInput.addEventListener("input", filterHistoryTable);
    }
    if (filterSelect) {
        filterSelect.addEventListener("change", filterHistoryTable);
    }
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