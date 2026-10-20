
const API_URL = "http://127.0.0.1:8000";

let currentEditingId = null;
const initializedModals = new WeakSet();

function setupModalListeners() {
    const modal = document.getElementById("modal");

    if (!modal || initializedModals.has(modal)) return;

    initializedModals.add(modal);


    const btnClose = document.getElementById("btn-close");
    const btnCancel = document.getElementById("btn-cancel");
    const btnDelete = document.getElementById("btn-delete");
    const form = document.getElementById("action-form");

    btnClose?.addEventListener("click", closeModal);
    btnCancel?.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    btnDelete?.addEventListener("click", async () => {
        if (currentEditingId === null) return;

        if (!confirm("¿Deseas eliminar esta acción?")) return;

        try {
            const response = await fetch(
                `${API_URL}/history/${currentEditingId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error(
                    `Error al eliminar: ${response.status}`
                );
            }

            showToast("Acción eliminada correctamente");
            closeModal();

            

        window.dispatchEvent(new Event("action:deleted"));

            if (typeof window.initializeHistory === "function") {
                await window.initializeHistory();
            }
        } catch (error) {
            console.error("Error al eliminar la acción:", error);
            alert("No se pudo eliminar la acción.");
        }
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (currentEditingId === null) return;

        const updatedData = {
            name: document.getElementById("f-name").value.trim(),
            description: document.getElementById("f-desc").value.trim(),
            date: document.getElementById("f-date").value,
            category: document.getElementById("f-category").value,
            co2_saved: Number(document.getElementById("f-kg").value),
            points: Number(document.getElementById("f-points").value)
        };

        if (
            !updatedData.name ||
            !updatedData.description ||
            !updatedData.date ||
            !Number.isFinite(updatedData.co2_saved) ||
            !Number.isFinite(updatedData.points) ||
            updatedData.co2_saved < 0 ||
            updatedData.points < 0
        ) {
            alert("Revisa los campos del formulario.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/history/${currentEditingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Error ${response.status}: ${errorText}`
                );
            }

            showToast("Cambios guardados correctamente");
            closeModal();

            if (typeof window.initializeHistory === "function") {
                await window.initializeHistory();
            }
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert(
                "No se pudieron guardar los cambios. Comprueba los datos que acepta la API."
            );
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

    const fields = {
        "f-name": item.action_name || item.name || item.title || "",
        "f-desc": item.description || item.note || item.details || "",
        "f-date": (item.date || item.action_date || "").split("T")[0],
        "f-category": normalizeModalCategory(item.category),
        "f-kg": item.co2_saved ?? item.co2_awarded ?? item.impact ?? 0,
        "f-points": item.points ?? item.points_earned ?? item.points_awarded ?? 0
    };

    for (const [id, value] of Object.entries(fields)) {
        const field = document.getElementById(id);

        if (field) {
            field.value = value;
        }
    }

    modal.hidden = false;
    modal.removeAttribute("hidden");
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");

    modal.style.setProperty("display", "flex", "important");

    const modalContent = modal.querySelector(".modal");

    if (modalContent) {
        modalContent.style.setProperty("display", "flex", "important");
    }

    document.getElementById("f-name")?.focus();

}

function normalizeModalCategory(category) {
    const normalized = (category || "Movilidad")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const categories = {
        movilidad: "Movilidad",
        naturaleza: "Naturaleza",
        reciclaje: "Reciclaje",
        participacion: "Participación"
    };

    return categories[normalized] || "Movilidad";
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
