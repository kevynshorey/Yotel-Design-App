/*
  Caro Basic App (client export)
  Simple JS logic for toolbar + layer search.
*/

(function () {
  let currentView = "3D";
  let currentStyle = "Real";

  const viewerText = document.getElementById("viewerText");
  const viewButtons = Array.from(document.querySelectorAll("[data-view]"));
  const styleButtons = Array.from(document.querySelectorAll("[data-style]"));
  const layerSearch = document.getElementById("layerSearch");
  const layerRows = Array.from(document.querySelectorAll(".layer-row"));

  function updateViewerLabel() {
    if (!viewerText) return;
    viewerText.textContent = `Caro Viewer - View: ${currentView} - Style: ${currentStyle}`;
  }

  function setActive(buttons, activeButton) {
    buttons.forEach((btn) => btn.classList.toggle("active", btn === activeButton));
  }

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view || currentView;
      setActive(viewButtons, btn);
      updateViewerLabel();
    });
  });

  styleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentStyle = btn.dataset.style || currentStyle;
      setActive(styleButtons, btn);
      updateViewerLabel();
    });
  });

  if (layerSearch) {
    layerSearch.addEventListener("input", () => {
      const query = (layerSearch.value || "").trim().toLowerCase();
      layerRows.forEach((row) => {
        const name = (row.dataset.name || "").toLowerCase();
        row.style.display = name.includes(query) ? "flex" : "none";
      });
    });
  }
})();
