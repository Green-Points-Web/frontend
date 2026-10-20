(function () {
  "use strict";

  function initCatalogComponent() {
    console.log("Action catalog component correctly initialized.");
  }

  if (typeof window !== "undefined") {
    window.initCatalogComponent = initCatalogComponent;
  }
})();