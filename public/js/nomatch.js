document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".nb-search-bar");
  const searchInput = document.querySelector(".nb-search-input");
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".listing-card");
  const noMatchContainer = document.querySelector(".no-match-container");

  // Only run on the index page (where listing cards exist)
  if (!cards.length) return;

  // Prevent navbar search form from navigating
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  let activeTag = null; // stores the data-tag string e.g. "Amazing Pools"

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let anyVisible = false;

    cards.forEach(card => {
      const title  = card.querySelector("b")?.textContent.toLowerCase() || "";
      const tags   = JSON.parse(card.getAttribute("data-tags") || "[]");

      const matchesSearch = title.includes(searchTerm);
      // Compare data-tag value (e.g. "Amazing Pools") against the stored tags array
      const matchesFilter = activeTag
        ? tags.some(t => t.toLowerCase() === activeTag.toLowerCase())
        : true;

      const shouldShow = matchesSearch && matchesFilter;
      const cardLink = card.closest(".sz-card-link");
      if (cardLink) cardLink.style.display = shouldShow ? "block" : "none";
      if (shouldShow) anyVisible = true;
    });

    if (noMatchContainer) {
      noMatchContainer.style.display = anyVisible ? "none" : "block";
    }
  }

  // Real-time search
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // Category filter clicks — use data-tag, not the <p> text
  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      const tag = filter.dataset.tag; // e.g. "Amazing Pools"

      if (activeTag === tag) {
        // Clicking the same filter again deactivates it
        filter.classList.remove("active");
        activeTag = null;
      } else {
        filters.forEach(f => f.classList.remove("active"));
        filter.classList.add("active");
        activeTag = tag;
      }

      applyFilters();
    });
  });
});
