import { getDashboardSummary } from "../services/dashboardService.js";

const loadDashboard = async () => {
    try {
        const data = await getDashboardSummary();

        document.getElementById("stat-points").textContent =
            data.total_points;

        document.getElementById("stat-level").textContent =
            data.current_level;

        document.getElementById("stat-actions").textContent =
            data.total_actions;

        document.getElementById("stat-co2").textContent =
            `${data.total_co2_impact_kg} kg`;
    } catch (error) {
        console.error("Could not load dashboard:", error);
    }
};

loadDashboard();
