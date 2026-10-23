const API_URL = 'http://127.0.0.1:8000';

export async function getActionTypes() {
    const response = await fetch(`${API_URL}/catalog`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

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

window.createAction = createAction;