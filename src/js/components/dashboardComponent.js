
export function renderDashboard(data) {
    if (!data) {
        console.error("Dashboard data is missing.");
        return;
    }

    const pointsElement = document.getElementById("stat-points");
    const levelElement = document.getElementById("stat-level");
    const actionsElement = document.getElementById("stat-actions");
    const co2Element = document.getElementById("stat-co2");

    if (pointsElement) {
        pointsElement.textContent = data.total_points ?? 0;
    }

    if (levelElement) {
        levelElement.textContent = data.current_level ?? "Seed";
    }

    if (actionsElement) {
        actionsElement.textContent = data.total_actions ?? 0;
    }

    if (co2Element) {
        const co2 = Number(data.total_co2_impact_kg ?? 0);
        co2Element.textContent = `${co2.toFixed(2)} kg`;
    }
}
