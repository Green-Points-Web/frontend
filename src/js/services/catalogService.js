import { createAction } from "./actionService.js";

const CATALOG_API = "http://127.0.0.1:8000";

async function initializeCatalog() {
    try {
        const catalogResponse = await axios.get(`${CATALOG_API}/catalog`);

        const catalogData = catalogResponse.data;

        renderCatalogGrid(catalogData);

    } catch (error) {
        console.error("Error al inicializar el catálogo:", error);
        showCatalogError();
    }
}

function showCatalogError() {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.getElementById("catalog-empty-state");

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
        return { background: "#fff9f4", color: "#ff8a2b", iconName: "directions_bike" };
    }
    if (/walk|pie|caminar|andando/.test(name)) {
        return { background: "#F4EEF8", color: "#8C52BE", iconName: "directions_walk" };
    }
    if (/carpool|coche|compartir/.test(name)) {
        return { background: "#E3F2FD", color: "#1565C0", iconName: "directions_car" };
    }
    if (/tren|bus|metro|publico|transporte/.test(name)) {
        return { background: "#fee7ee", color: "#b81466", iconName: "directions_bus" };
    }
    if (/voluntariado|ambiental|voluntario/.test(name)) {
        return { background: "#fce6e6", color: "#d30a0a", iconName: "volunteer_activism" };
    }
    if (/recycl|recicl/.test(name)) {
        return { background: "#dbf9fd", color: "#1b9da2", iconName: "recycling" };
    }
    if (/tree|arbol|árbol|plant|planta/.test(name)) {
        return { background: "#ecfbdb", color: "#85C541", iconName: "park" };
    }

    const iconsByCat = {
        Movilidad: { background: "#E8F4EE", color: "#2F6B50", iconName: "directions_bike" },
        Naturaleza: { background: "#E8F4EE", color: "#2F6B50", iconName: "park" },
        Reciclaje: { background: "#E8F4EE", color: "#2F6B50", iconName: "recycling" },
        Participación: { background: "#E8F4EE", color: "#2F6B50", iconName: "group" }
    };
    return iconsByCat[normCat] || { background: "#E8F4EE", color: "#2F6B50", iconName: "eco" };
}

function renderCatalogGrid(catalogData) {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.getElementById("catalog-empty-state");

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
            Movilidad: { background: "#E8F4EE", color: "#2F6B50" },
            Naturaleza: { background: "#E8F4EE", color: "#2F6B50" },
            Reciclaje: { background: "#E8F4EE", color: "#2F6B50" },
            Participación: { background: "#E8F4EE", color: "#2F6B50" }
        };
        const catColor = catColors[category] || icon;
        const co2Val = `${Number(item.co2_kg ?? item.co2_impact ?? 0)} kg CO₂`;
        const pointsVal = `+${Number(item.points ?? 0)} puntos`;

        const card = document.createElement("article");
        card.className = "action-card";
        card.style.borderColor = catColor.color;
        card.dataset.id = item.id;
        card.dataset.category = category;

        card.innerHTML = `
            <div class="card-top">
                <div class="card-icon" style="background-color: ${icon.background}; color: ${icon.color};">
                    <span class="material-symbols-outlined" aria-hidden="true">${icon.iconName}</span>
                </div>
                <span class="category-tag" style="background-color: ${catColor.background}; color: ${catColor.color};">${category}</span>
            </div>
            <h3>${actionName}</h3>
            <div class="card-meta">
                <span class="points"><span class="material-symbols-outlined" style="font-size: 13px; color: #f59e0b; font-variation-settings: 'FILL' 1;">star</span>${pointsVal}</span>
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
                await createAction({
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

export { initializeCatalog };
