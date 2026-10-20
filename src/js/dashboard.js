import { getDashboardSummary, getRecentHistory, getActionCatalog } from "./services/dashboardService.js";

const $ = selector => document.querySelector(selector);
const number = value => Number(value || 0);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function renderWeeklyEvolution(history) {
  const chart = $(".mock-chart");
  const labelsContainer = $(".chart-labels");
  if (!chart || !labelsContainer) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
  const totals = days.map(day => {
    const key = localDateKey(day);
    return history.reduce((sum, item) => {
      const date = item.action_date || item.date;
      return localDateKey(date) === key ? sum + number(item.points_earned ?? item.points_awarded ?? item.points) : sum;
    }, 0);
  });
  const max = Math.max(...totals, 1);
  chart.replaceChildren();
  days.forEach((day, index) => {
    const bar = document.createElement("div");
    bar.className = `bar${index === 6 ? " active" : ""}`;
    const percentage = totals[index] > 0
  ? (totals[index] / max) * 100
  : 0;


    const pointsLabel = document.createElement("span");
    pointsLabel.className = "bar-points";
    pointsLabel.textContent = String(totals[index]);

    bar.style.height = `${percentage}%`;
    bar.title = `${day.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}: ${totals[index]} puntos`;
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", bar.title);
    bar.appendChild(pointsLabel);
    chart.appendChild(bar);

  });
  labelsContainer.replaceChildren();
  days.forEach((day, index) => {
    const label = document.createElement("span");
    label.textContent = day.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "").slice(0, 1).toUpperCase();
    if (index === 6) label.className = "active";
    labelsContainer.appendChild(label);
  });
}

function localDateKey(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function categoryIcon(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("movil")) return "directions_bike";
  if (value.includes("natur")) return "park";
  if (value.includes("recicl")) return "recycling";
  if (value.includes("particip")) return "volunteer_activism";
  return "eco";
}

function renderRecentActions(history, catalog) {
  const list = $(".actions-list");
  if (!list) return;
  const names = new Map(catalog.map(item => [String(item.id), item.name]));
  const recent = [...history].sort((a, b) => {
    const dateA = new Date(a.action_date || a.date || 0).getTime();
    const dateB = new Date(b.action_date || b.date || 0).getTime();
    return dateB - dateA || number(b.id) - number(a.id);
  }).slice(0, 3);

  list.replaceChildren();
  if (!recent.length) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "Todavía no has registrado acciones. ¡Registra tu primera eco-acción!";
    list.appendChild(empty);
    return;
  }

  recent.forEach(item => {
    const name = names.get(String(item.action_type_id)) || item.action_name || item.name || `Acción #${item.action_type_id ?? item.id}`;
    const date = item.action_date || item.date;
    const row = document.createElement("button");
    row.type = "button";
    row.className = "action-item action-item--button";
    row.dataset.id = String(item.id);
    row.setAttribute("aria-label", `Editar ${name}`);
    row.innerHTML = `
      <span class="action-info">
        <span class="action-icon"><span class="material-symbols-outlined" aria-hidden="true">${categoryIcon(item.category)}</span></span>
        <span><strong>${escapeHTML(name)}</strong><span class="action-description">${escapeHTML(item.description || "Acción sostenible registrada")}</span></span>
      </span>
      <span class="action-meta">
        <span><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span> ${escapeHTML(formatDate(date))}</span>
        <span><span class="material-symbols-outlined" aria-hidden="true">eco</span> ${number(item.co2_saved ?? item.co2_awarded).toFixed(1)} kg CO₂</span>
        <span class="points">+${number(item.points_earned ?? item.points_awarded ?? item.points)} pts</span>
        <span class="material-symbols-outlined arrow" aria-hidden="true">chevron_right</span>
      </span>`;
    row.addEventListener("click", () => {
      sessionStorage.setItem("greenpoints-edit-action-id", String(item.id));
      if (window.location.hash !== "#historial") {
        history.pushState(null, "", "#historial");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else {
        window.initializeHistory?.().then(() => {
          document.querySelector(`.btn-edit-item[data-id="${CSS.escape(String(item.id))}"]`)?.click();
        });
      }
    });
    list.appendChild(row);
  });
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export async function refreshDashboard() {
  try {
    const [summary, history, catalog] = await Promise.all([
      getDashboardSummary(), getRecentHistory(200), getActionCatalog()
    ]);

    // Importamos dinámicamente el componente para pintar los datos y la barra de progreso
    import("./components/dashboardComponent.js").then(module => {
        module.renderDashboard(summary);
    });

    renderWeeklyEvolution(history);
    renderRecentActions(history, catalog);
    const error = $("#app-error");
    if (error) error.hidden = true;
  } catch (error) {
    console.error("No se pudo actualizar el dashboard:", error);
    const message = $("#app-error");
    if (message) {
      message.textContent = "No se han podido actualizar los datos. Comprueba que el backend esté iniciado.";
      message.hidden = false;
    }
  }
}

window.refreshDashboard = refreshDashboard;
document.addEventListener("DOMContentLoaded", refreshDashboard);