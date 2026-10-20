const CATALOG_API = "http://127.0.0.1:8000";

async function initializeCatalog() {
    try {
        const [catalogResponse, dashboardResponse] = await Promise.all([
            fetch(`${CATALOG_API}/catalog`),
            fetch(`${CATALOG_API}/dashboard`).catch(() => null)
        ]);

        if (!catalogResponse.ok) {
            throw new Error("No se pudo cargar el catálogo del servidor.");
        }

        const catalogData = await catalogResponse.json();
        const dashboardData = dashboardResponse && dashboardResponse.ok ? await dashboardResponse.json() : {};

        renderCatalogGrid(catalogData);
        updateKpiBar(dashboardData);
        setupEventListeners();

    } catch (error) {
        console.error("Error al inicializar el catálogo:", error);
        showCatalogError();
    }
}

function showCatalogError() {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.getElementById("empty-state");

    if (catalogGrid) {
        catalogGrid.replaceChildren();
    }

    if (emptyState) {
        emptyState.hidden = false;
        const textElement = emptyState.querySelector(".empty-text");
        if (textElement) {
            textElement.textContent = "No se pudo conectar con el servidor para cargar las acciones.";
        }
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
        return { background: "#F4EEF8", color: "#8C52BE", iconName: "directions_bike" };
    }
    if (/walk|pie|caminar|andando/.test(name)) {
        return { background: "#ffffef", color: "#fcd900", iconName: "directions_walk" };
    }
    if (/carpool|coche|compartir/.test(name)) {
        return { background: "#E3F2FD", color: "#1565C0", iconName: "directions_car" };
    }
    if (/tren|bus|metro|publico|transporte/.test(name)) {
        return { background: "#fee7ee", color: "#b81466", iconName: "directions_bus" };
    }
    if (/voluntariado|ambiental|voluntario/.test(name)) {
        return { background: "#ffddd4", color: "#ff4500", iconName: "volunteer_activism" };
    }
    if (/recycl|recicl/.test(name)) {
        return { background: "#E1F6F6", color: "#008080", iconName: "recycling" };
    }
    if (/tree|arbol|árbol|plant|planta/.test(name)) {
        return { background: "#EBF7EE", color: "#358850", iconName: "park" };
    }
    /* IMPORTANTE: Sólo hay siete acciones pero aquí aparecen ocho (esta es como la de voluntariado) */
    if (/volunteer|voluntari|particip/.test(name)) {
        return { background: "#FDF2EE", color: "#E06D43", iconName: "group" };
    }

    const iconsByCat = {
        Movilidad: { background: "#F4EEF8", color: "#8C52BE", iconName: "directions_bike" },
        Naturaleza: { background: "#EBF7EE", color: "#358850", iconName: "park" },
        Reciclaje: { background: "#e2eaf4", color: "#2c598d", iconName: "recycling" },
        Participación: { background: "#edffe5", color: "#8fe043", iconName: "group" }
    };
    return iconsByCat[normCat] || { background: "#E8F4EE", color: "#2F6B50", iconName: "eco" };
}

function renderCatalogGrid(catalogData) {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.getElementById("empty-state");

    if (!catalogGrid) return;

    catalogGrid.replaceChildren();

    if (!Array.isArray(catalogData) || catalogData.length === 0) {
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (emptyState) emptyState.hidden = true;

    catalogData.forEach(item => {
        const actionName = item.name || item.action_name || "Acción";
        const category = normalizeCategory(item.category || "Movilidad");
        const icon = getActionIcon(actionName, category);
        const catColors = {
            Movilidad: { background: "#F4EEF8", color: "#8C52BE" },
            Naturaleza: { background: "#EBF7EE", color: "#358850" },
            Reciclaje: { background: "#e2eaf4", color: "#2c598d" },
            Participación: { background: "#edffe5", color: "#8fe043" }
        };
        const catColor = catColors[category] || icon;
        const co2Val = `${Number(item.co2_kg ?? item.co2_impact ?? 0)} kg CO₂`;
        const pointsVal = `+${Number(item.points ?? 0)} puntos`;

        // Creamos la tarjeta (<article>) que requiere el CSS
        const card = document.createElement("article");
        card.className = "action-card";
        card.style.borderColor = catColor.color;
        card.dataset.id = item.id;
        card.dataset.category = category;
        card.dataset.searchable = `${actionName} ${category} ${pointsVal} ${co2Val}`.toLowerCase();

        card.innerHTML = `
            <div class="card-top">
                <div class="card-icon" style="background-color: ${icon.background}; color: ${icon.color};">
                    <span class="material-symbols-outlined" aria-hidden="true">${icon.iconName}</span>
                </div>
                <span class="category-tag" style="background-color: ${catColor.background}; color: ${catColor.color};">${category}</span>
            </div>
            <h3>${actionName}</h3>
            <div class="card-meta">
                <span class="points">★ ${pointsVal}</span>
                <span class="co2"><span class="material-symbols-outlined" aria-hidden="true">emoji_nature</span>${co2Val}</span>
            </div>
            <button type="button" class="btn-register" data-id="${item.id}" data-action="${actionName}">
                Registrar acción &rarr;
            </button>
        `;

        const registerBtn = card.querySelector(".btn-register");
        registerBtn.addEventListener("click", async () => {
            registerBtn.disabled = true;
            try {
                await window.createAction({
                    user_id: 1,
                    action_type_id: item.id,
                    action_date: new Date().toISOString().slice(0, 10),
                    description: null
                });
                registerBtn.textContent = "¡Registrada!";
                window.dispatchEvent(new CustomEvent("action:created"));
            } catch (error) {
                alert(error.message || "No se pudo registrar la acción");
                registerBtn.disabled = false;
            }
        });

        catalogGrid.appendChild(card);
    });
}

function updateKpiBar(data) {
    // Si tienes elementos para KPIs en el HTML, puedes enlazarlos aquí
}

function setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    const filterSelect = document.getElementById("filter-select");

    if (searchInput) {
        searchInput.addEventListener("input", filterCategoryGrid);
    }
    if (filterSelect) {
        filterSelect.addEventListener("change", filterCategoryGrid);
    }
}

function filterCategoryGrid() {
    const searchInput = document.getElementById("search-input");
    const filterSelect = document.getElementById("filter-select");
    const emptyState = document.getElementById("empty-state");

    const query = (searchInput?.value || "").toLowerCase().trim();
    const selectedCategory = filterSelect?.value || "Todas";

    const cards = document.querySelectorAll("#catalog-grid .action-card");
    let visibleCount = 0;

    cards.forEach(card => {
        const searchText = card.dataset.searchable || "";
        const cardCategory = card.dataset.category || "";

        const matchesSearch = searchText.includes(query);
        const matchesCategory = selectedCategory === "Todas" || cardCategory.toLowerCase() === selectedCategory.toLowerCase();

        if (matchesSearch && matchesCategory) {
            card.style.display = "";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (emptyState) {
        emptyState.hidden = visibleCount > 0;
    }
}

window.initializeCatalog = initializeCatalog;
window.setupCatalogEventListeners = setupEventListeners;
