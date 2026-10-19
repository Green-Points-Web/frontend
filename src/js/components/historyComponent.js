(function () {
  "use strict";

  function initHistoryComponent() {
    console.log("Componente de historial inicializado correctamente.");
  }

  if (typeof window !== "undefined") {
    window.initHistoryComponent = initHistoryComponent;
  }
})();
