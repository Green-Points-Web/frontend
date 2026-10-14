
import { getDashboardSummary } from "./services/dashboardService.js";
import { renderDashboard } from "./components/dashboardComponent.js";

const loadDashboard = async () => {
    try {
        const data = await getDashboardSummary();
        renderDashboard(data);
    } catch (error) {
        console.error("Could not load dashboard:", error);
    }
};

loadDashboard();
