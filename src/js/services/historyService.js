const API_BASE_URL = "http://127.0.0.1:8000";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeHistory);
} else {
  initializeHistory();
}

async function initializeHistory() {
    try {
        const [historyResponse, dashboardResponse, catalogResponse] =
            await Promise.all([
                fetch(`${API_BASE_URL}/history`),
                fetch(`${API_BASE_URL}/dashboard`),
                fetch(`${API_BASE_URL}/catalog`)
            ]);

        if (!historyResponse.ok) {
            throw new Error("Could not load the action history.");
        }

        if (!dashboardResponse.ok) {
            throw new Error("Could not load dashboard statistics.");
        }

        const historyData = await historyResponse.json();
        const dashboardData = await dashboardResponse.json();

        const catalogData = catalogResponse.ok
            ? await catalogResponse.json()
            : [];

        const actionNames = new Map(
            catalogData.map(action => [action.id, action.name])
        );

        renderHistoryTable(historyData, actionNames);
        updateKpiBar(dashboardData);

        initializeHistoryFilters();

    } catch (error) {
        console.error("Error loading history:", error);
        showHistoryError();
    }
}

function normalizeCategory(category = "") {
    const normalized = category
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const categories = {
        mobility: "Movilidad",
        movilidad: "Movilidad",
        nature: "Naturaleza",
        naturaleza: "Naturaleza",
        recycling: "Reciclaje",
        reciclaje: "Reciclaje",
        participation: "Participación",
        participacion: "Participación"
    };

    return categories[normalized] || category;
}

function getActionIcon(actionName, category) {
    const name = (actionName || "").toLowerCase();

    if (/bike|bici|bicycle|bicicleta/.test(name)) {
        return {
            background: "#EFE8F8",
            color: "#7A4DB8",
            path: "M12 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 16l4-8h4l3 8m-7-8-2-3m6 3h3"
        };
    }

    if (/bus|transport|transporte|carpool|coche|car\b|walk|caminar/.test(name)) {
        return {
            background: "#EFE8F8",
            color: "#7A4DB8",
            path: "M5 16V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10M5 12h14M8 16v2m8-2v2M7 8h.01M17 8h.01M5 16h14"
        };
    }

    if (/recycl|recicl/.test(name)) {
        return {
            background: "#E2F4F2",
            color: "#2C8D85",
            path: "M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2M5 10l-2 2 2 2m14-4 2 2-2 2"
        };
    }

    if (/tree|arbol|árbol|plant|planta|nature|naturaleza/.test(name)) {
        return {
            background: "#E5F5E9",
            color: "#2C8A4C",
            path: "M12 21v-8m0 3c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"
        };
    }

    if (/volunteer|voluntari|particip/.test(name)) {
        return {
            background: "#FAEDE5",
            color: "#D9773B",
            path: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-7a4 4 0 0 1 0 8m2 3a4 4 0 0 1 2 3v2"
        };
    }

    const normalizedCategory = normalizeCategory(category);

    const categoryIcons = {
        Movilidad: {
            background: "#EFE8F8",
            color: "#7A4DB8",
            path: "M5 16V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10M5 12h14M8 16v2m8-2v2"
        },
        Naturaleza: {
            background: "#E5F5E9",
            color: "#2C8A4C",
            path: "M12 21v-8m0 3c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-5 3-8 8-8 0 5-3 8-8 8Z"
        },
        Reciclaje: {
            background: "#E2F4F2",
            color: "#2C8D85",
            path: "M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2"
        },
        Participación: {
            background: "#FAEDE5",
            color: "#D9773B",
            path: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        }
    };

    return categoryIcons[normalizedCategory] || {
        background: "#FAEDE5",
        color: "#D9773B",
        path: "M12 3v18m-9-9h18"
    };
}

function renderHistoryTable(historyData, actionNames = new Map()) {
    const tableBody = document.getElementById("history-table-body");

    if (!tableBody) {
        console.warn("History table body was not found.");
        return;
    }

    tableBody.replaceChildren();

    if (!Array.isArray(historyData) || historyData.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "history-empty";
        cell.textContent = "Todavía no hay acciones registradas.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    historyData.forEach(item => {
        const actionName =
            actionNames.get(item.action_type_id) ||
            `Acción #${item.action_type_id}`;

        const category = normalizeCategory(item.category);
        const description = item.description || "Acción sostenible";
        const icon = getActionIcon(actionName, category);

        const row = document.createElement("tr");
        row.className = "history-row";
        row.dataset.category = category;
        row.dataset.name = `${actionName} ${description}`.toLowerCase();

        const actionCell = document.createElement("td");
        actionCell.className = "td-left";

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "history-action-wrapper";

        const iconBox = document.createElement("div");
        iconBox.className = "row-icon-box";
        iconBox.style.backgroundColor = icon.background;
        iconBox.style.color = icon.color;

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("class", "icon-md");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "1.8");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");

        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        path.setAttribute("d", icon.path);
        svg.appendChild(path);
        iconBox.appendChild(svg);

        const textWrapper = document.createElement("div");

        const title = document.createElement("div");
        title.className = "row-main-title";
        title.textContent = actionName;

        const subtitle = document.createElement("div");
        subtitle.className = "row-sub-desc";
        subtitle.textContent = description;

        textWrapper.append(title, subtitle);
        actionWrapper.append(iconBox, textWrapper);
        actionCell.appendChild(actionWrapper);

        const dateCell = document.createElement("td");
        dateCell.className = "td-general";
        dateCell.textContent = formatDate(item.action_date);

        const categoryCell = document.createElement("td");
        categoryCell.className = "td-general";

        const categoryTag = document.createElement("span");
        categoryTag.className = "category-tag-table";
        categoryTag.textContent = category;
        categoryCell.appendChild(categoryTag);

        const impactCell = document.createElement("td");
        impactCell.className = "td-general";
        impactCell.textContent = `${Number(item.co2_saved || 0)} kg`;

        const pointsCell = document.createElement("td");
        pointsCell.className = "td-right";
        pointsCell.textContent = String(item.points_earned ?? 0);

        row.append(
            actionCell,
            dateCell,
            categoryCell,
            impactCell,
            pointsCell
        );

        tableBody.appendChild(row);
    });

    filterHistory();
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-ES");
}

function updateKpiBar(data) {
    const kpiBar = document.querySelector(".history-kpi-bar");

    if (!kpiBar || !data) return;

    const values = [
        [data.total_actions ?? 0, "acciones"],
        [data.total_points ?? 0, "puntos"],
        [`${data.total_co2_impact_kg ?? 0} kg`, "CO₂ evitados"]
    ];

    kpiBar.replaceChildren();

    values.forEach(([value, label], index) => {
        if (index > 0) {
            const divider = document.createElement("div");
            divider.className = "history-divider";
            kpiBar.appendChild(divider);
        }

        const stat = document.createElement("div");
        stat.className = "history-stat";

        const number = document.createElement("span");
        number.className = "bold";
        number.textContent = String(value);

        stat.append(number, document.createTextNode(` ${label}`));
        kpiBar.appendChild(stat);
    });
}

function initializeHistoryFilters() {
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");

    if (searchInput) {
        searchInput.addEventListener("input", filterHistory);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterHistory);
    }
}

function filterHistory() {
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");

    const searchTerm = (searchInput?.value || "").toLowerCase().trim();
    const selectedCategory = categoryFilter?.value || "all";

    document.querySelectorAll(".history-row").forEach(row => {
        const rowName = row.dataset.name || "";
        const rowCategory = row.dataset.category || "";

        const matchesSearch = rowName.includes(searchTerm);
        const matchesCategory =
            selectedCategory === "all" ||
            normalizeCategory(selectedCategory) === rowCategory;

        row.style.display =
            matchesSearch && matchesCategory ? "" : "none";
    });
}

function showHistoryError() {
    const tableBody = document.getElementById("history-table-body");

    if (!tableBody) return;

    tableBody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "history-empty";
    cell.textContent =
        "No se pudo cargar el historial. Comprueba que el backend está activo e inténtalo de nuevo.";

    row.appendChild(cell);
    tableBody.appendChild(row);
}

window.filterHistory = filterHistory;
window.renderHistoryTable = renderHistoryTable;
window.updateKpiBar = updateKpiBar;