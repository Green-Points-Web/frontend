// TOAST SYSTEM
let toastBackdrop = null;
let toastTimer = null;

function showToast(message) {
  const existing = document.getElementById('custom-toast-overlay');
  if (existing) existing.remove();
  clearTimeout(toastTimer);

  toastBackdrop = document.createElement('div');
  toastBackdrop.id = 'custom-toast-overlay';
  toastBackdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 200ms ease-in-out;
  `;

  const toastBox = document.createElement('div');
  toastBox.style.cssText = `
    background-color: #0F291E;
    color: #ffffff;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
    transform: scale(0.95);
    transition: transform 200ms ease-in-out;
  `;

  toastBox.innerHTML = `
    <span class="material-symbols-outlined" style="color: #4ade80; font-size: 20px;">check_circle</span>
    <span>${message}</span>
  `;

  toastBackdrop.appendChild(toastBox);
  document.body.appendChild(toastBackdrop);

  setTimeout(() => {
    toastBackdrop.style.opacity = '1';
    toastBox.style.transform = 'scale(1)';
  }, 10);

  const dismissToast = () => {
    if (!toastBackdrop) return;
    toastBackdrop.style.opacity = '0';
    toastBox.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (toastBackdrop && toastBackdrop.parentNode) {
        toastBackdrop.remove();
      }
      toastBackdrop = null;
    }, 200);
    document.removeEventListener('click', dismissToast);
  };

  setTimeout(() => {
    document.addEventListener('click', dismissToast);
  }, 50);

  toastTimer = setTimeout(() => {
    dismissToast();
  }, 4000);
}


// ACTIONS CATALOG
const ACTIONS_CATALOG = {
  1: "Ir andando al trabajo",
  2: "Utilizar transporte público",
  3: "Ir en bicicleta",
  4: "Compartir coche",
  5: "Reciclar",
  6: "Plantar un árbol",
  7: "Participar en voluntariado ambiental"
};


// ICONS AND STYLES
function getActionStyleAndIcon(name = '') {
  const lowerName = String(name).toLowerCase();

  if (/bike|bici|bicicleta/.test(lowerName)) {
    return {
      background: "#fff9f4",
      color: "#ff8a2b",
      iconName: "directions_bike"
    };
  }
  if (/walk|pie|caminar|andando/.test(lowerName)) {
    return {
      background: "#F4EEF8",
      color: "#8C52BE",
      iconName: "directions_walk"
    };
  }
  if (/carpool|coche|compartir/.test(lowerName)) {
    return {
      background: "#E3F2FD",
      color: "#1565C0",
      iconName: "directions_car"
    };
  }
  if (/tren|bus|metro|publico|transporte/.test(lowerName)) {
    return {
      background: "#fee7ee",
      color: "#b81466",
      iconName: "directions_bus"
    };
  }
  if (/voluntariado|ambiental|voluntario|volunteer|particip/.test(lowerName)) {
    return {
      background: "#fce6e6",
      color: "#d30a0a",
      iconName: "volunteer_activism"
    };
  }
  if (/recycl|recicl/.test(lowerName)) {
    return {
      background: "#dbf9fd",
      color: "#1b9da2",
      iconName: "recycling"
    };
  }
  if (/tree|arbol|árbol|plant|planta/.test(lowerName)) {
    return {
      background: "#ecfbdb",
      color: "#85C541",
      iconName: "park"
    };
  }
  return {
    background: "#E8F4EE",
    color: "#2F6B50",
    iconName: "eco"
  };
}


// LATEST 7 ACTIONS 
function renderRecentActionsList(historyData, actionNames) {
  const container = document.getElementById('recent-actions-list');
  if (!container) return;

  container.style.cssText = "width: 100%; display: flex; flex-direction: column; gap: 0.75rem;";
  container.innerHTML = '';

  if (!Array.isArray(historyData)) return;

  const latestRecords = [...historyData].sort((a, b) => new Date(b.date || b.action_date) - new Date(a.date || a.action_date)).slice(0, 7);

  latestRecords.forEach(item => {
    let actionName = '';

    if (item.action_type_id && ACTIONS_CATALOG[item.action_type_id]) {
      actionName = ACTIONS_CATALOG[item.action_type_id];
    } else if (actionNames && typeof actionNames.get === 'function' && item.action_type_id) {
      actionName = actionNames.get(item.action_type_id);
    }

    if (!actionName || actionName.startsWith('Acción #')) {
      const rawText = item.action_name || item.name || item.title || item.action_type || '';

      if (/^[0-9]+$/.test(rawText)) {
        actionName = ACTIONS_CATALOG[Number(rawText)] || 'Acción sostenible';
      } else {
        actionName = rawText || 'Acción sostenible';
      }
    }

    const styleInfo = getActionStyleAndIcon(actionName);

    const dateStr = typeof formatDate === 'function' ? formatDate(item.date || item.action_date) : (item.date || item.action_date || 'Reciente');
    const description = item.description || item.details || item.note || 'Acción sostenible registrada';
    const co2Val = Number(item.co2_saved || item.impact || 0);
    const pointsVal = Number(item.points || item.points_earned || 0);

    const card = document.createElement('div');
    card.style.cssText = `
      width: 100%;
      background-color: #ffffff;
      border-radius: 1rem;
      padding: 0.875rem 1.25rem;
      border: 1px solid #E7EFEA;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      box-sizing: border-box;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.875rem; min-width: 0;">
        <div style="width: 44px; height: 44px; border-radius: 0.875rem; background-color: ${styleInfo.background}; color: ${styleInfo.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span class="material-symbols-outlined" style="font-size: 22px;">${styleInfo.iconName}</span>
        </div>
        <div style="display: flex; flex-direction: column; overflow: hidden;">
          <h4 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 0.95rem; line-height: 1.25;">${actionName}</h4>
          <p style="margin: 0.15rem 0 0 0; font-size: 0.775rem; color: #6b7280; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${description}</p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.775rem; color: #6b7280;">
          <span class="material-symbols-outlined" style="font-size: 14px;">schedule</span>
          <span>${dateStr}</span>
        </div>

        <div style="background-color: #E8F5E9; color: #2E7D32; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 0.25rem;">
          <span class="material-symbols-outlined" style="font-size: 13px;">emoji_nature</span>
          <span>${co2Val} kg CO₂</span>
        </div>

        <div style="display: flex; align-items: center; gap: 0.2rem; font-size: 0.875rem; font-weight: 600; color: #111827;">
          <span><span class="material-symbols-outlined" style="font-size: 13px; color: #f59e0b; font-variation-settings: 'FILL' 1;">star</span>+${pointsVal}</span>
          <span style="font-size: 0.8rem; font-weight: 500; color: #374151;">pts</span>
        </div>

        <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #f9fafb; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
          <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      showToast(`Details: ${actionName} (+${pointsVal} pts, ${co2Val} kg CO₂)`);
    });

    container.appendChild(card);
  });
}

window.renderRecentActionsList = renderRecentActionsList;