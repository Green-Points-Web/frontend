
import { getDashboardSummary } from "./services/dashboardService.js";
import { renderDashboard, renderLevelProgress } from "./components/dashboardComponent.js";
import { initRegistrationModal } from "./components/registrationModal.js";

const loadDashboard = async () => {
    try {
        const data = await getDashboardSummary();
        renderDashboard(data);
        
        renderLevelProgress(data);
    } catch (error) {
        console.error("Could not load dashboard:", error);
    }
};

loadDashboard();
initRegistrationModal();

window.addEventListener("action:created", loadDashboard);
window.addEventListener("action:deleted", loadDashboard);