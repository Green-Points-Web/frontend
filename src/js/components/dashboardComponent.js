export function renderDashboard(data) {
    if (!data) {
        console.error("Dashboard data is missing.");
        return;
    }

    const pointsElement = document.getElementById("stat-points");
    const levelElement = document.getElementById("stat-level");
    const actionsElement = document.getElementById("stat-actions");
    const co2Element = document.getElementById("stat-co2");

    if (pointsElement) pointsElement.textContent = data.total_points ?? 0;
    if (levelElement) levelElement.textContent = data.current_level ?? "Seed";
    if (actionsElement) actionsElement.textContent = data.total_actions ?? 0;
    if (co2Element) {
        const co2 = Number(data.total_co2_impact_kg ?? 0);
        co2Element.textContent = `${co2.toFixed(2)} kg`;
    }

    // Llamamos a la nueva función para pintar la barra de progreso
    renderLevelProgress(data);
}

export function renderLevelProgress(data) {
    if (data.points_to_next === undefined) return;

    const minPoints = document.getElementById('level-min-points');
    const maxPoints = document.getElementById('level-max-points');
    const progressBar = document.getElementById('level-progress-bar');
    const currentName = document.getElementById('current-level-name');
    const nextName = document.getElementById('next-level-name');
    const alertMessage = document.getElementById('level-alert-message');
    const progressTitle = document.getElementById('progress-title');
    const badgeLevel = document.getElementById('badge-level');

    if (minPoints) minPoints.textContent = `${data.level_min} pts`;
    if (maxPoints) maxPoints.textContent = data.next_level ? `${data.next_level_min} pts` : 'Max';
    
    if (progressBar) {
        progressBar.value = data.progress_percent;
        progressBar.max = 100;
    }
    
    if (currentName) currentName.textContent = data.current_level;
    if (nextName) nextName.textContent = data.next_level || 'Máximo';
    
    if (progressTitle) {
        progressTitle.textContent = data.next_level ? `Camino a ${data.next_level}` : '¡Nivel máximo alcanzado!';
    }

    if (badgeLevel) {
        badgeLevel.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">potted_plant</span> Nivel ${data.current_level}`;
    }

    if (alertMessage) {
        if (data.next_level) {
            alertMessage.innerHTML = `<strong><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>¡Lo estás haciendo genial!</strong> Te faltan ${data.points_to_next} puntos para alcanzar el nivel ${data.next_level}.`;
        } else {
            alertMessage.innerHTML = `<strong><span class="material-symbols-outlined" aria-hidden="true">workspace_premium</span>¡Felicidades!</strong> Has alcanzado el nivel máximo Planet Hero.`;
        }
    }
}