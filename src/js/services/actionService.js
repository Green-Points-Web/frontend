const API_URL = 'http://127.0.0.1:8000';

export async function getActionTypes() {
    // Axios usa .get por defecto y te ahorra el response.json()
    const response = await axios.get(`${API_URL}/catalog`);
    return response.data;
}

export async function createAction(actionData) {
    try {
        // En .post, el segundo parámetro es el body. Axios pone los headers automáticamente.
        const response = await axios.post(`${API_URL}/actions`, actionData);
        return response.data;
    } catch (error) {
        // Axios encapsula los errores HTTP en error.response
        const detail = error.response?.data?.detail || `Error al guardar (${error.response?.status || 'Desconocido'})`;
        throw new Error(detail);
    }
}