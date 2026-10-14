
export const CatalogComponent = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Error: No se encontró el contenedor con ID '${containerId}'`);
            return;
        }

        container.innerHTML = '<p class="loading-text">Cargando opciones sostenibles...</p>';

        try {
            const response = await fetch('http://localhost:8000/catalog');
            
            if (!response.ok) {
                throw new Error('Error al conectar con el servidor');
            }

            const catalogData = await response.json();

            if (catalogData.length === 0) {
                container.innerHTML = '<p>No hay acciones disponibles en este momento.</p>';
                return;
            }

            const htmlContent = catalogData.map(action => `
                <div class="action-card" style="border: 1px solid #4CAF50; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #f9fdf9;">
                    <h3 style="margin-top: 0; color: #2E7D32;">${action.name}</h3>
                    <p style="margin: 5px 0;"><strong>Categoría:</strong> ${action.category}</p>
                    <p style="margin: 5px 0;">
                        <strong>Puntos:</strong> <span style="color: #F57C00; font-weight: bold;">+${action.points}</span> | 
                        <strong>Ahorro CO2:</strong> ${action.co2_impact} kg
                    </p>
                    <button class="select-action-btn" data-id="${action.id}" style="background-color: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        Seleccionar
                    </button>
                </div>
            `).join('');

            container.innerHTML = htmlContent;

        } catch (error) {
            console.error("Error renderizando el catálogo:", error);
            container.innerHTML = `<p style="color: red;">Ocurrió un problema al cargar el catálogo.</p>`;
        }
    }
};