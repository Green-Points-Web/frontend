// Navegación SPA sencilla y sincronización de datos del dashboard.
document.addEventListener("DOMContentLoaded", () => {
  const dashboard = document.querySelector("#dashboard");
  const main = document.querySelector(".site-main");
  let dynamicContent = document.querySelector("#dynamic-content");

  if (!dynamicContent && main) {
    dynamicContent = document.createElement("div");
    dynamicContent.id = "dynamic-content";
    dynamicContent.hidden = true;
    main.appendChild(dynamicContent);
  }

  const routes = {
    "#acciones": "catalog-section",
    "#historial": "history-section",
  };

  let navigationSequence = 0;

  async function loadPage(hash = window.location.hash || "#dashboard") {
    const sequence = ++navigationSequence;

    if (hash === "" || hash === "#dashboard") {
      if (dashboard) dashboard.hidden = false;
      if (dynamicContent) {
        dynamicContent.hidden = true;
        dynamicContent.replaceChildren();
      }
      await window.refreshDashboard?.();
      return;
    }

    const pageName = routes[hash];
    if (!pageName || !dynamicContent) return;

    try {
      const response = await fetch(`./pages/${pageName}.html`);
      if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${pageName}.html`);
      const html = await response.text();
      if (sequence !== navigationSequence) return;

      if (dashboard) dashboard.hidden = true;
      dynamicContent.hidden = false;
      dynamicContent.innerHTML = html;

      if (hash === "#historial") {
        window.setupModalListeners?.();
        window.setupHistoryEventListeners?.();
        await window.initializeHistory?.();

        // Si se llegó desde una acción reciente, abrir esa acción en el editor.
        const requestedId = sessionStorage.getItem("greenpoints-edit-action-id");
        if (requestedId) {
          sessionStorage.removeItem("greenpoints-edit-action-id");
          const editButton = [...dynamicContent.querySelectorAll(".btn-edit-item")]
            .find(button => button.dataset.id === String(requestedId));
          editButton?.click();
        }
      } else if (hash === "#acciones") {
        window.initializeCatalog?.();
      }
    } catch (error) {
      console.error("Error al cargar la vista:", error);
      if (sequence !== navigationSequence) return;
      if (dashboard) dashboard.hidden = true;
      dynamicContent.hidden = false;
      dynamicContent.textContent = "No se pudo cargar esta sección. Comprueba que el archivo HTML existe.";
    }
  }

  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!["#dashboard", "#acciones", "#historial"].includes(hash)) return;
    event.preventDefault();
    if (window.location.hash !== hash) history.pushState(null, "", hash);
    loadPage(hash);
  });

  window.addEventListener("popstate", () => loadPage(window.location.hash || "#dashboard"));

  // Cualquier módulo que guarde/edite/elimine una acción debe emitir este evento.
  window.addEventListener("greenpoints:data-changed", async () => {
    await window.refreshDashboard?.();
    if (window.location.hash === "#historial") await window.initializeHistory?.();
  });

  loadPage(window.location.hash || "#dashboard");
});