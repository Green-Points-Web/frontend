const API_BASE_URL = "http://127.0.0.1:8000";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeHistory);
} else {
  initializeHistory();
}

async function initializeHistory() {
    const tableBody = document.getElementById("history-table-body");

    if (!tableBody || historyLoading) return;

    historyLoading = true;

    try {
        const [historyResponse, dashboardResponse, catalogResponse] =
            await Promise.all([
                fetch(`${API_BASE_URL}/history`),
                fetch(`${API_BASE_URL}/dashboard`),
                fetch(`${API_BASE_URL}/catalog`)
            ]);

        if (!historyResponse.ok) {
            throw new Error("Could not load action history.");
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
            catalogData.map(action => [
                String(action.id),
                action.name
            ])
        );

        renderHistoryTable(historyData, actionNames);
        updateKpiBar(dashboardData);
        initializeHistoryFilters();

    } catch (error) {
        console.error("Error loading history:", error);
        showHistoryError();
    } finally {
        historyLoading = false;
    }
}

function normalizeCategory(category = "") {
    const normalized = String(category)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

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
    const name = String(actionName || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (/voluntariado|particip/.test(name)) {
        return {
            emoji: "🤝",
            background: "#FAEDE5",
            color: "#428062"
        };
    }

    if (/plantar.*arbol|arbol|tree/.test(name)) {
        return {
            emoji: "🌳",
            background: "#E5F5E9",
            color: "#2C8A4C"
        };
    }

    if (/compartir coche|coche compartido|carpool/.test(name)) {
        return {
            emoji: "🚗",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    if (/bicicleta|bici|bike|bicycle/.test(name)) {
        return {
            emoji: "🚲",
            background: "#FAEDE5",
            color: "#D9773B"
        };
    }

    if (/transporte publico|autobus|bus/.test(name)) {
        return {
            emoji: "🚌",
            background: "#E2F1F8",
            color: "#2C7EA6"
        };
    }

    if (/reciclar|reciclaje|recycl/.test(name)) {
        return {
            emoji: "♻️",
            background: "#E2F4F2",
            color: "#2C8D85"
        };
    }

    if (/andando|caminar|a pie|walking/.test(name)) {
        return {
            emoji: "🚶",
            background: "#E8F3E5",
            color: "#469136"
        };
    }

    const categoryIcons = {
        Movilidad: {
            emoji: "🚲",
            background: "#EFE8F8",
            color: "#7A4DB8"
        },
        Naturaleza: {
            emoji: "🌳",
            background: "#E5F5E9",
            color: "#2C8A4C"
        },
        Reciclaje: {
            emoji: "♻️",
            background: "#E2F4F2",
            color: "#2C8D85"
        },
        "Participación": {
            emoji: "🤝",
            background: "#FAEDE5",
            color: "#428062"
        }
    };

    return categoryIcons[normalizeCategory(category)] || {
        emoji: "🌱",
        background: "#E5F5E9",
        color: "#2C8A4C"
    };
}

function getDefaultDescription(actionId) {
    const descriptions = {
        "1": "Paseo hasta la oficina",
        "2": "Desplazamiento en autobús",
        "3": "Ida y vuelta a la oficina en bici",
        "4": "Trayecto compartido con dos compañeros",
        "5": "Separación de residuos de la oficina",
        "6": "Jornada de reforestación de GreenCorp",
        "7": "Limpieza del parque junto al equipo"
    };

    return descriptions[String(actionId)] || "";
}

function renderHistoryTable(historyData, actionNames = new Map()) {
    const tableBody = document.getElementById("history-table-body");

    if (!tableBody) return;

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
        const actionId = String(item.action_type_id);

        const actionName =
            actionNames.get(actionId) ||
            `Acción #${item.action_type_id}`;

        const category = normalizeCategory(item.category);
        const rawDescription = item.description;

        const description =
            typeof rawDescription === "string" &&
            rawDescription.trim() !== "" &&
            rawDescription.trim().toLowerCase() !== "string"
                ? rawDescription.trim()
                : getDefaultDescription(actionId);

        const icon = getActionIcon(actionName, category);

        const row = document.createElement("tr");
        row.className = "history-row";
        row.dataset.category = category;
        row.dataset.name =
            `${actionName} ${description}`.toLowerCase();

        const actionCell = document.createElement("td");
        actionCell.className = "td-left";

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "history-action-wrapper";

        const iconBox = document.createElement("div");
        iconBox.className = "row-icon-box";
        iconBox.style.backgroundColor = icon.background;
        iconBox.style.color = icon.color;
        iconBox.style.display = "flex";
        iconBox.style.alignItems = "center";
        iconBox.style.justifyContent = "center";
        iconBox.style.flexShrink = "0";
        iconBox.style.fontSize = "1.25rem";

        iconBox.textContent = icon.emoji;
        iconBox.setAttribute("aria-hidden", "true");

        const textWrapper = document.createElement("div");

        const title = document.createElement("div");
        title.className = "row-main-title";
        title.textContent = actionName;

        const subtitle = document.createElement("div");
        subtitle.className = "row-sub-desc";
        subtitle.textContent = description;
        subtitle.hidden = !description;

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

        const co2Saved = Number(item.co2_saved ?? 0);

        impactCell.textContent = `${co2Saved.toLocaleString("es-ES", {
            maximumFractionDigits: 2
        })} kg`;

        const pointsCell = document.createElement("td");
        pointsCell.className = "td-right";
        pointsCell.textContent = `+${item.points_earned ?? 0}`;

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
    if (!data) return;

    const actionElement =
        document.getElementById("history-total-actions");

    const pointsElement =
        document.getElementById("history-total-points");

    const co2Element =
        document.getElementById("history-total-co2");

    if (actionElement) {
        actionElement.textContent = String(data.total_actions ?? 0);
    }

    if (pointsElement) {
        pointsElement.textContent = String(data.total_points ?? 0);
    }

    if (co2Element) {
        const co2 = Number(data.total_co2_impact_kg ?? 0);

        co2Element.textContent = `${co2.toLocaleString("es-ES", {
            maximumFractionDigits: 2
        })} kg`;
    }
}

function initializeHistoryFilters() {
    const searchInput = document.getElementById("search-input");
    const categoryFilter =
        document.getElementById("category-filter");

    if (searchInput && !searchInput.dataset.historyListener) {
        searchInput.addEventListener("input", filterHistory);
        searchInput.dataset.historyListener = "true";
    }

    if (categoryFilter && !categoryFilter.dataset.historyListener) {
        categoryFilter.addEventListener("change", filterHistory);
        categoryFilter.dataset.historyListener = "true";
    }
}

function filterHistory() {
    const searchInput = document.getElementById("search-input");
    const categoryFilter =
        document.getElementById("category-filter");

    const searchTerm =
        (searchInput?.value || "").toLowerCase().trim();

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
window.initializeHistory = initializeHistory;