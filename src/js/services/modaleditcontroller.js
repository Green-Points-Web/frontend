const API_URL = "http://127.0.0.1:8000";

let currentEditingId = null;
const initializedModals = new WeakSet();

// CATÁLOGO DE ACCIONES
const ACTIONS_CATALOG_DETAILS = {
    1: { name: "Ir andando al trabajo", category: "Movilidad", co2: 2, points: 10 },
    2: { name: "Utilizar transporte público", category: "Movilidad", co2: 1, points: 10 },
    3: { name: "Ir en bicicleta", category: "Movilidad", co2: 2, points: 15 },
    4: { name: "Compartir coche", category: "Movilidad", co2: 1.5, points: 20 },
    5: { name: "Reciclar", category: "Reciclaje", co2: 1, points: 5 },
    6: { name: "Plantar un árbol", category: "Naturaleza", co2: 10, points: 50 },
    7: { name: "Participar en voluntariado ambiental", category: "Participación", co2: 15, points: 100 }
};

function setupModalListeners() {
    const modal = document.getElementById("modal");

    if (!modal || initializedModals.has(modal)) return;

    initializedModals.add(modal);

    const btnClose = document.getElementById("btn-close");
    const btnCancel = document.getElementById("btn-cancel");
    const btnDelete = document.getElementById("btn-delete"); // Botón Anular
    const form = document.getElementById("action-form");
    const selectActionType = document.getElementById("f-action-type");
    const inputDesc = document.getElementById("f-desc");
    const inputDate = document.getElementById("f-date");
    const selectCategory = document.getElementById("f-category");
    const inputKg = document.getElementById("f-kg");
    const inputPoints = document.getElementById("f-points");

    
    if (inputDesc) {
        inputDesc.setAttribute("maxlength", "250");
    }

    if (inputDate) {
        const todayStr = new Date().toISOString().split("T")[0];
        inputDate.setAttribute("max", todayStr);
    }

    if (selectActionType) {
        selectActionType.innerHTML = '<option value="">Selecciona una acción...</option>';
        Object.entries(ACTIONS_CATALOG_DETAILS).forEach(([id, info]) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = info.name;
            selectActionType.appendChild(option);
        });

        selectActionType.addEventListener("change", (e) => {
            const selectedId = e.target.value;
            if (ACTIONS_CATALOG_DETAILS[selectedId]) {
                const details = ACTIONS_CATALOG_DETAILS[selectedId];
                if (selectCategory) selectCategory.value = details.category;
                if (inputKg) inputKg.value = details.co2;
                if (inputPoints) inputPoints.value = details.points;
            } else {
                if (selectCategory) selectCategory.value = "Movilidad";
                if (inputKg) inputKg.value = 0;
                if (inputPoints) inputPoints.value = 0;
            }
        });
    }

    btnClose?.addEventListener("click", closeModal);
    btnCancel?.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    btnDelete?.addEventListener("click", async () => {
        if (currentEditingId === null) return;

        if (!confirm("¿Deseas anular esta acción?")) return;

        try {
            // Nasimsimple nga axios.delete, awanen ti response.ok check
            await axios.delete(`${API_URL}/history/${currentEditingId}`);

            showToast("Acción anulada correctamente");
            closeModal();

            window.dispatchEvent(new Event("action:deleted"));

            if (typeof window.initializeHistory === "function") {
                await window.initializeHistory();
            }
        } catch (error) {
            console.error("Error al anular la acción:", error);
            alert("No se pudo anular la acción.");
        }
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (currentEditingId === null) return;

        const actionTypeId = Number(selectActionType?.value);
        const catalogItem = ACTIONS_CATALOG_DETAILS[actionTypeId];

        if (!catalogItem) {
            alert("Por favor selecciona un tipo de acción válido.");
            return;
        }

        const updatedData = {
            action_type_id: actionTypeId,
            name: catalogItem.name,
            description: inputDesc.value.trim(),
            date: inputDate.value,
            category: catalogItem.category,
            co2_saved: Number(inputKg.value),
            points: Number(inputPoints.value)
        };

        if (
            !updatedData.date ||
            !Number.isFinite(updatedData.co2_saved) ||
            !Number.isFinite(updatedData.points)
        ) {
            alert("Revisa los campos obligatorios del formulario.");
            return;
        }

        try {
            // Nasimsimple nga axios.put
            await axios.put(`${API_URL}/history/${currentEditingId}`, updatedData);

            showToast("Cambios guardados correctamente");
            closeModal();

            if (typeof window.initializeHistory === "function") {
                await window.initializeHistory();
            }
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert("No se pudieron guardar los cambios en el servidor.");
        }
    });
}

function openEditModal(item) {
    const modal = document.getElementById("modal");

    if (!modal || !item) {
        console.error("No se encuentra el modal o la acción seleccionada.");
        return;
    }

    if (item.id === undefined || item.id === null) {
        console.error("La acción no tiene un ID de historial:", item);
        alert("No se puede editar esta acción porque falta su identificador.");
        return;
    }

    currentEditingId = item.id;

    let matchedId = item.action_type_id;
    if (!matchedId) {
        const itemName = (item.action_name || item.name || "").toLowerCase();
        const found = Object.entries(ACTIONS_CATALOG_DETAILS).find(
            ([_, info]) => info.name.toLowerCase() === itemName
        );
        matchedId = found ? found[0] : "1";
    }

    const selectActionType = document.getElementById("f-action-type");
    const inputDesc = document.getElementById("f-desc");
    const inputDate = document.getElementById("f-date");
    const selectCategory = document.getElementById("f-category");
    const inputKg = document.getElementById("f-kg");
    const inputPoints = document.getElementById("f-points");

    if (selectActionType) selectActionType.value = matchedId;
    if (inputDesc) inputDesc.value = item.description || item.note || item.details || "";
    if (inputDate) inputDate.value = (item.date || item.action_date || "").split("T")[0];

    const catalogInfo = ACTIONS_CATALOG_DETAILS[matchedId] || ACTIONS_CATALOG_DETAILS[1];
    if (selectCategory) selectCategory.value = catalogInfo.category;
    if (inputKg) inputKg.value = catalogInfo.co2;
    if (inputPoints) inputPoints.value = catalogInfo.points;

    modal.hidden = false;
    modal.removeAttribute("hidden");
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    modal.style.setProperty("display", "flex", "important");

    const modalContent = modal.querySelector(".modal");
    if (modalContent) {
        modalContent.style.setProperty("display", "flex", "important");
    }

    inputDesc?.focus();
}

function closeModal() {
    const modal = document.getElementById("modal");

    if (modal) {
        modal.classList.remove("is-active");
        modal.style.removeProperty("display");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");

        const modalContent = modal.querySelector(".modal");
        if (modalContent) {
            modalContent.style.removeProperty("display");
        }
    }

    currentEditingId = null;
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    setTimeout(() => {
        toast.hidden = true;
    }, 3000);
}

window.setupModalListeners = setupModalListeners;
window.openEditModal = openEditModal;