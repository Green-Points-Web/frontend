
export function renderDashboard(data) {
    if (!data) {
        console.error("Dashboard data is missing.");
        return;
        renderLevelProgress(data);

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
export function renderLevelProgress(data) {
    if (!data) return;
    
    const statLevelSub = document.querySelector('#stat-level ~ .stat-sub');
    if (statLevelSub) {
        statLevelSub.textContent = data.points_to_next 
            ? `${data.points_to_next} pts para ${data.next_level}` 
            : '¡Has alcanzado el nivel máximo!';
    }

    const progressTitle = document.getElementById('progress-title');
    if (progressTitle && data.next_level) progressTitle.textContent = `Camino a ${data.next_level}`;

    const badgeLevelName = document.getElementById('badge-level-name');
    if (badgeLevelName) badgeLevelName.textContent = data.current_level;

    // Actualizar barra y números
    const progressBar = document.getElementById('level-progress-bar');
    if (progressBar) progressBar.value = data.progress_percent || 0;

    const minPts = document.getElementById('progress-min-pts');
    if (minPts) minPts.textContent = `${data.total_points || 0} pts`;

    const maxPts = document.getElementById('progress-max-pts');
    if (maxPts && data.next_level_min) maxPts.textContent = `${data.next_level_min} pts`;

    const currentName = document.getElementById('progress-current-name');
    if (currentName) currentName.textContent = data.current_level;

    const nextName = document.getElementById('progress-next-name');
    if (nextName) nextName.textContent = data.next_level || 'Máx';

    const alertText = document.getElementById('progress-alert-text');
    if (alertText && data.points_to_next) {
        alertText.textContent = `Te faltan ${data.points_to_next} puntos para alcanzar el nivel ${data.next_level}.`;
    } else if (alertText) {
        alertText.textContent = `¡Has alcanzado el nivel máximo!`;
    }
}