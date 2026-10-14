document.addEventListener("DOMContentLoaded", () => {
  inicializarHistorial();
});

const inicializarHistorial = async () => {
  try {
    const [historialRes, puntosRes] = await Promise.all([
      fetch('historial.json'),
      fetch('puntos.json')
    ]);

    if (!historialRes.ok) {
      throw new Error("No se pudo obtener el historial del backend.");
    }

    const historialData = await historialRes.json();
    renderHistoryTable(historialData);


    if (puntosRes.ok) {
      const puntosData = await puntosRes.json();
      actualizarBarraKpi(puntosData);
    }

  } catch (error) {
    console.error("Error al conectar con el backend:", error);
  }
};

const renderHistoryTable = (data) => {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = "";

  data.forEach(item => {
    let iconBg = "#FAEDE5";
    let iconColor = "#D9773B";
    let svgPath = '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" stroke-linecap="round" stroke-linejoin="round"></path>';

    if (item.categoria === 'Naturaleza') {
      iconBg = "#E5F5E9";
      iconColor = "#2C8A4C";
      svgPath = '<path d="M12 21v-5m0 0a6 6 0 0 1-6-6c0-2.5 1.5-4.5 3.5-5.5a5 5 0 0 1 8.5 2c1.5.5 2.5 2 2.5 3.5a6 6 0 0 1-6 6Z" stroke-linecap="round" stroke-linejoin="round"></path>';
    } else if (item.categoria === 'Movilidad') {
      iconBg = "#EFE8F8";
      iconColor = "#7A4DB8";
      svgPath = '<path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m-9 0H4.5A2.25 2.25 0 0 1 2.25 16.5v-3.75m16.5 6a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.5a2.25 2.25 0 0 0 2.25-2.25v-3.75m-18-2.25 1.83-4.271A2.25 2.25 0 0 1 6.155 5.25h11.69a2.25 2.25 0 0 1 2.075 1.379l1.83 4.271M3 10.5h18" stroke-linecap="round" stroke-linejoin="round"></path>';
    } else if (item.categoria === 'Reciclaje') {
      iconBg = "#E2F4F2";
      iconColor = "#2C8D85";
      svgPath = '<path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" stroke-linecap="round" stroke-linejoin="round"></path>';
    }

    const tr = document.createElement('tr');
    tr.className = "history-row";
    tr.setAttribute('data-category', item.categoria);
    tr.setAttribute('data-name', `${item.accion} ${item.descripcion}`.toLowerCase());

    tr.innerHTML = `
      <td class="td-left">
        <div style="display: flex; align-items: center; gap: 0.875rem;">
          <div class="row-icon-box" style="background-color: ${iconBg}; color: ${iconColor};">
            <svg class="icon-md" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">${svgPath}</svg>
          </div>
          <div>
            <div class="row-main-title">${item.accion}</div>
            <div class="row-sub-desc">${item.descripcion}</div>
          </div>
        </div>
      </td>
      <td class="td-general">${item.fecha}</td>
      <td class="td-general">
        <span class="category-tag-table">${item.categoria}</span>
      </td>
      <td class="td-general">
        <div style="display: flex; align-items: center; gap: 0.375rem;">
          <svg class="icon-sm text-green-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21V3m0 0c2.485 0 4.5 4.03 4.5 9S14.485 21 12 21m0-18C9.515 3 7.5 7.03 7.5 12s2.015 9 4.5 9" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span>${item.impacto}</span>
        </div>
      </td>
      <td class="td-right">${item.puntos}</td>
    `;
    tbody.appendChild(tr);
  });
};

