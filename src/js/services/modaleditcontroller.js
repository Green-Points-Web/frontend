const API_URL = "http://127.0.0.1:8000";

let currentEditingId = null;

document.addEventListener("DOMContentLoaded", () => {
    setupModalListeners();
});

function setupModalListeners() {
    const modal = document.getElementById("modal");
    const btnClose = document.getElementById("btn-close");
    const btnCancel = document.getElementById("btn-cancel");
    const btnDelete = document.getElementById("btn-delete");
    const form = document.getElementById("action-form");

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (btnDelete) {
        btnDelete.addEventListener("click", async () => {
            if (!currentEditingId) return;
            if (confirm("¿Estás seguro de que deseas eliminar esta acción?")) {
                try {
                    const response = await fetch(`${API_URL}/history/${currentEditingId}`, {
                        method: "DELETE"
                    });
                    if (response.ok) {
                        showToast("Acción eliminada correctamente");
                        closeModal();
                        location.reload(); 
                    } else {
                        alert("No se pudo eliminar la acción.");
                    }
                } catch (error) {
                    console.error("Error al eliminar:", error);
                }
            }
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentEditingId) return;

            const updatedData = {
                name: document.getElementById("f-name").value,
                description: document.getElementById("f-desc").value,
                date: document.getElementById("f-date").value,
                category: document.getElementById("f-category").value,
                co2_saved: parseFloat(document.getElementById("f-kg").value) || 0,
                points: parseInt(document.getElementById("f-points").value, 10) || 0
            };

            try {
                const response = await fetch(`${API_URL}/history/${currentEditingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    showToast("¡Cambios guardados con éxito!");
                    closeModal();
                    location.reload(); 
                } else {
                    alert("Error al actualizar la acción en el servidor.");
                }
            } catch (error) {
                console.error("Error al guardar cambios:", error);
            }
        });
    }
}

function openEditModal(item) {
    const modal = document.getElementById("modal");
    if (!modal) return;

    currentEditingId = item.id;

    document.getElementById("f-name").value = item.name || "";
    document.getElementById("f-desc").value = item.description || "";
    document.getElementById("f-date").value = (item.date || item.action_date || "").split("T")[0];
    document.getElementById("f-category").value = item.category || "Movilidad";
    document.getElementById("f-kg").value = item.co2_saved || item.impact || 0;
    document.getElementById("f-points").value = item.points || item.points_earned || 0;

    modal.hidden = false;
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.hidden = true;
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