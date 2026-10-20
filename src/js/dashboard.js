
import { getDashboardSummary } from "./services/dashboardService.js";
import { renderDashboard, renderLevelProgress } from "./components/dashboardComponent.js";
import { initRegistrationModal } from "./components/registrationModal.js";

const loadDashboard = async () => {
    try {
        const data = await getDashboardSummary();
        renderDashboard(data);
        
        // Ejecutamos tu función para actualizar la barra de progreso
        renderLevelProgress(data);
    } catch (error) {
        console.error("Could not load dashboard:", error);
    }
};

loadDashboard();
initRegistrationModal();

// "Chivato": Escucha cuándo se guarda una acción para recargar los datos en tiempo real
window.addEventListener("action:created", loadDashboard);