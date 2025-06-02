document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector("form");
  const searchInput = document.getElementById("search-input");
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".listing-card");
  const container = document.getElementById("listing-container");
  const noMatchContainer = document.querySelector(".no-match-container");

  // Prevent form submission
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  let activeFilter = null;

  // Unified filter + search logic
  function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedFilter = activeFilter?.querySelector("p").innerText.trim().toLowerCase() || null;
    let anyVisible = false;

    cards.forEach(card => {
      const title = card.querySelector("b")?.textContent.toLowerCase() || "";
      const tags = JSON.parse(card.getAttribute("data-tags") || "[]").map(t => t.toLowerCase());

      const matchesSearch = title.includes(searchTerm);
      const matchesFilter = selectedFilter ? tags.includes(selectedFilter) : true;

      const shouldShow = matchesSearch && matchesFilter;
      card.parentElement.style.display = shouldShow ? "block" : "none";

      if (shouldShow) anyVisible = true;
    });

    if (noMatchContainer) {
      noMatchContainer.style.display = anyVisible ? "none" : "block";
    }
  }

  // Search logic
  searchInput.addEventListener("keyup", function () {
    applyFilters();
  });

  // Filter logic
  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      if (activeFilter === filter) {
        // Toggle off
        filter.classList.remove("active");
        activeFilter = null;
      } else {
        // Activate new filter
        filters.forEach(f => f.classList.remove("active"));
        activeFilter = filter;
        filter.classList.add("active");
      }

      applyFilters();
    });
  });
});
