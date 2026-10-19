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

        
const historyResponseData = await historyResponse.json();
const dashboardData = await dashboardResponse.json();

const catalogResponseData = catalogResponse.ok
    ? await catalogResponse.json()
    : [];

const historyData = Array.isArray(historyResponseData)
    ? historyResponseData
    : historyResponseData.value || [];

const catalogData = Array.isArray(catalogResponseData)
    ? catalogResponseData
    : catalogResponseData.value || [];

const actionNames = new Map(
    catalogData.map(action => [action.id, action.name])
);

renderHistoryTable(historyData, actionNames, catalogData);

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
    const name = (actionName || "").toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const normalizedCategory = normalizeCategory(category);

    if (/bike|bici|bicycle|bicicleta/.test(name)) {
        return {
            emoji: "🚲",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    if (/bus|autobus|transporte publico|metro|tren/.test(name)) {
        return {
            emoji: "🚌",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    if (/walk|caminar|andando|a pie/.test(name)) {
        return {
            emoji: "🚶",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    if (/carpool|compartir coche|coche compartido/.test(name)) {
        return {
            emoji: "🚗",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    if (/recycl|recicl/.test(name)
        || normalizedCategory === "Reciclaje") {
        return {
            emoji: "♻️",
            background: "#E2F4F2",
            color: "#2C8D85"
        };
    }

    if (/volunteer|voluntari|particip/.test(name)
        || normalizedCategory === "Participación") {
        return {
            emoji: "🤝",
            background: "#FAEDE5",
            color: "#D9773B"
        };
    }

    if (/tree|arbol|plant|planta|nature|naturaleza/.test(name)
        || normalizedCategory === "Naturaleza") {
        return {
            emoji: "🌳",
            background: "#E5F5E9",
            color: "#2C8A4C"
        };
    }

    if (normalizedCategory === "Movilidad") {
        return {
            emoji: "🚶",
            background: "#EFE8F8",
            color: "#7A4DB8"
        };
    }

    return {
        emoji: "🌱",
        background: "#E5F5E9",
        color: "#2C8A4C"
    };
}


function renderHistoryTable(
    historyData,
    actionNames = new Map(),
    catalogData = []
) {
    const tableBody = document.getElementById("history-table-body");

    if (!tableBody) {
        console.warn("History table body was not found.");
        return;
    }

    tableBody.replaceChildren();

    if (!Array.isArray(historyData) || historyData.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "history-empty";
        cell.textContent = "Todavía no hay acciones registradas.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    historyData.forEach(item => {
        const actionName =
            item.action_name ||
            actionNames.get(item.action_type_id) ||
            `Acción #${item.action_type_id}`;

        const category = normalizeCategory(item.category);
        const rawDescription = String(item.description ?? "").trim();

        const normalizedDescription = rawDescription.toLowerCase();

        const isGenericDescription =
         !normalizedDescription ||
          ["string", "null", "undefined", "none", "n/a"].includes(
           normalizedDescription
       ) ||
         normalizedDescription.startsWith("acción registrada:") ||
         normalizedDescription.startsWith("registro automático desde el catálogo:");

        const description = isGenericDescription
         ? "Añade una descripción de cómo realizaste esta acción."
         : rawDescription;

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
        iconBox.textContent = icon.emoji;

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

        const editCell = document.createElement("td");
        editCell.className = "td-general";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Editar";
        editButton.className = "btn-edit-action";

        editButton.addEventListener("click", () => {
         openEditModal(item, catalogData);
   });

        editCell.appendChild(editButton);

        row.append(
            actionCell,
            dateCell,
            categoryCell,
            impactCell,
            pointsCell,
            editCell
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


function openEditModal(item, catalogData) {
    document.getElementById("history-edit-modal")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "history-edit-modal";
    overlay.className = "history-modal-overlay";

    const modal = document.createElement("section");
    modal.className = "history-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "history-modal-title");

    const title = document.createElement("h2");
    title.id = "history-modal-title";
    title.textContent = "Editar acción";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "history-modal-close";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Cerrar ventana");

    const form = document.createElement("form");
    form.className = "history-modal-form";

    const actionLabel = document.createElement("label");
    actionLabel.textContent = "Tipo de acción";

    const actionSelect = document.createElement("select");
    actionSelect.name = "action_type_id";
    actionSelect.required = true;

    catalogData.forEach(action => {
        const option = document.createElement("option");
        option.value = String(action.id);
        option.textContent = action.name;
        option.selected = Number(action.id) === Number(item.action_type_id);
        actionSelect.appendChild(option);
    });

    actionLabel.appendChild(actionSelect);

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Fecha";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.name = "action_date";
    dateInput.required = true;
    dateInput.max = new Date().toLocaleDateString("en-CA");
    dateInput.value = String(item.action_date || "").slice(0, 10);

    dateLabel.appendChild(dateInput);

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Descripción";

    const descriptionInput = document.createElement("textarea");
    descriptionInput.name = "description";
    descriptionInput.maxLength = 500;
    descriptionInput.rows = 4;
    const currentDescription = String(item.description ?? "").trim();

const isGenericEditDescription =
    !currentDescription ||
    ["string", "null", "undefined", "none", "n/a"].includes(
        currentDescription.toLowerCase()
    ) ||
    currentDescription.toLowerCase().startsWith("acción registrada:") ||
    currentDescription.toLowerCase().startsWith(
        "registro automático desde el catálogo:"
    );

descriptionInput.value = isGenericEditDescription
    ? ""
    : currentDescription;
    descriptionInput.placeholder = "Describe cómo realizaste la acción";

    descriptionLabel.appendChild(descriptionInput);

    const errorMessage = document.createElement("p");
    errorMessage.className = "history-modal-error";
    errorMessage.setAttribute("role", "alert");
    errorMessage.hidden = true;

    const buttons = document.createElement("div");
    buttons.className = "history-modal-buttons";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "history-modal-cancel";
    cancelButton.textContent = "Cancelar";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "history-modal-save";
    saveButton.textContent = "Guardar cambios";

    buttons.append(cancelButton, saveButton);
    form.append(actionLabel, dateLabel, descriptionLabel, errorMessage, buttons);
    modal.append(closeButton, title, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();

    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeModal();
    });

    const handleEscape = event => {
        if (event.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", handleEscape);
        }
    };

    document.addEventListener("keydown", handleEscape);

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        if (dateInput.value > dateInput.max) {
            errorMessage.textContent = "La fecha no puede ser futura.";
            errorMessage.hidden = false;
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Guardando…";
        errorMessage.hidden = true;

        try {
            const response = await fetch(
                `${API_BASE_URL}/actions/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action_type_id: Number(actionSelect.value),
                        action_date: dateInput.value,
                        description: descriptionInput.value.trim() || null
                    })
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.detail || "No se pudieron guardar los cambios."
                );
            }

            document.removeEventListener("keydown", handleEscape);
            closeModal();
            await initializeHistory();
        } catch (error) {
            errorMessage.textContent =
                error.message || "Error al guardar los cambios.";
            errorMessage.hidden = false;
            saveButton.disabled = false;
            saveButton.textContent = "Guardar cambios";
        }
    });

    closeButton.focus();
}

window.filterHistory = filterHistory;
window.renderHistoryTable = renderHistoryTable;
window.updateKpiBar = updateKpiBar;