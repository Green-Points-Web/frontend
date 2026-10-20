const API_BASE_URL = "http://127.0.0.1:8000";


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
            background: "#F4EEF8",
            color: "#8C52BE",
            iconName: "directions_bike"
        };
    }
    if (/walk|pie|caminar|andando/.test(name)) {
        return {
            background: "#ffffef",
            color: "#fcd900",
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
    if (/voluntariado|ambiental|voluntario/.test(name)) {
        return {
            background: "#ffddd4",
            color: "#ff4500",
            iconName: "volunteer_activism"
        };
    }
    if (/recycl|recicl/.test(name)) {
        return {
            background: "#E1F6F6",
            color: "#008080",
            iconName: "recycling"
        };
    }
    if (/tree|arbol|árbol|plant|planta/.test(name)) {
        return {
            background: "#EBF7EE",
            color: "#358850",
            iconName: "park"
        };
    }
/* IMPORTANTE: Aquí ocurre lo mismo que en cataalogService, voluntariado esta duplicado*/
    if (/volunteer|voluntari|particip/.test(name)) {
        return {
            background: "#FDF2EE",
            color: "#E06D43",
            iconName: "group"
        };
    }


    const iconsByCat = {
        Movilidad: {
            background: "#F4EEF8",
            color: "#8C52BE",
            iconName: "directions_bike"
        },

        Naturaleza: {
            background: "#EBF7EE",
            color: "#358850",
            iconName: "park"
        },

        Reciclaje: {
            background: "#e2eaf4",
            color: "#2c598d",
            iconName: "recycling"
        },

        Participación: {
            background: "#edffe5",
            color: "#8fe043",
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

    tableBody.replaceChildren();

    if (!Array.isArray(historyData) || historyData.length === 0) {
        if (emptyState) emptyState.hidden = false;
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
                    <span class="material-symbols-outlined" aria-hidden="true">${icon.iconName}</span>
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
        const styles = getActionIcon(item.name || item.actionName, item.category);
        tdCategory.innerHTML = `<span class="category-tag-table" style="background-color: ${styles.background}; color: ${styles.color}; padding: 4px 8px; border-radius: 4px; display: inline-block;">${item.category}</span>`;


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
                <span class="material-symbols outlined icon element" aria-hidden="true">edit</span>
            </button>
        `;

        const editBtn = tdEdit.querySelector(".btn-edit-item");
        editBtn.addEventListener("click", () => {
            console.log("Botón Editar pulsado");
            console.log("Datos de la acción:", item);

            if (typeof window.openEditModal !== "function") {
                console.error(
                    "No se ha cargado modaleditcontroller.js"
                );
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


        row.append(tdAction,
            tdDate,
            tdCategory,
            tdImpact,
            tdPoints,
            tdEdit
        );
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

window.initializeHistory = initializeHistory;
window.setupHistoryEventListeners = setupEventListeners;
