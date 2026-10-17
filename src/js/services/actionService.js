const API_URL = 'http://127.0.0.1:8000';

// Exportamos la función para que otros archivos puedan usarla
export async function getActionTypes() {
    const response = await fetch(`${API_URL}/catalog`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

// Exportamos la función para que registrationModal.js pueda usarla
export async function createAction(actionData) {
    const response = await fetch(`${API_URL}/actions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.detail || `Error al guardar (${response.status})`
        );
    }

    return await response.json();
}

// --- Card Button's Code ---

document.querySelectorAll('.btn-register').forEach(btn => {
    btn.addEventListener('click', async () => {
        const card = btn.closest('.action-card');

        if (!card) {
            alert('No se encontró la tarjeta de la acción');
            return;
        }

        const name = card.querySelector('h3')?.textContent.trim();

        if (!name) {
            alert('No se encontró el nombre de la acción');
            return;
        }

        try {
            const catalog = await getActionTypes();
            const action = catalog.find(item => item.name === name);

            if (!action) {
                alert('Acción no encontrada en el backend');
                return;
            }

            const payload = {
                user_id: 1,
                action_type_id: action.id,
                action_date: new Date().toISOString().slice(0, 10),
                description: null
            };

            await createAction(payload); 
            alert(`¡Acción registrada! +${action.points} puntos`);

        } catch (error) {
            console.error(error);
            alert(error.message || 'No se pudo registrar la acción');
        }
    });
});