// URL base del backend (FastAPI usa el 8000 por defecto)
const API_URL = 'http://127.0.0.1:8000';

/**
 * Obtiene el catálogo de acciones sostenibles desde el backend.
 * @returns {Promise<Array>} Lista de acciones sostenibles.
 */
export const fetchCatalog = async () => {
    try {
        const response = await fetch(`${API_URL}/catalog`);
        
        if (!response.ok) {
            throw new Error(`Error al cargar el catálogo: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error en catalogService:", error);
        throw error;
    }
};