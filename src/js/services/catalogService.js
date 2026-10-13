const API_URL = 'http://127.0.0.1:8000';

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