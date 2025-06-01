document.addEventListener("DOMContentLoaded", () => {
    const filters = document.querySelectorAll(".filter");
    const cards = document.querySelectorAll(".listing-card");
    const container = document.getElementById("listing-container");

    const noMatchHTML = `
      <div class="no-match-container text-center w-100 mt-5">
        <img src="/images/no-results.svg" alt="No results found" class="no-match-img" style="max-width: 300px;">
        <h4 class="mt-3">No matches found</h4>
        <p>Try exploring other destinations or filters!</p>
      </div>
    `;

    let activeFilter = null;

    filters.forEach(filter => {
      filter.addEventListener("click", () => {
        const selected = filter.querySelector("p").innerText.trim().toLowerCase();

        // Toggle off if already active
        if (activeFilter === filter) {
          filter.classList.remove("active");
          activeFilter = null;
          showAllCards();
          return;
        }

        // Clear all states
        filters.forEach(f => f.classList.remove("active"));
        activeFilter = filter;
        filter.classList.add("active");

        let matchFound = false;

        cards.forEach(card => {
          const tags = JSON.parse(card.getAttribute("data-tags") || "[]").map(t => t.toLowerCase());
          if (tags.includes(selected)) {
            card.parentElement.style.display = "block";
            matchFound = true;
          } else {
            card.parentElement.style.display = "none";
          }
        });

        // Clean up previous no-match
        const existingNoMatch = container.querySelector(".no-match-container");
        if (existingNoMatch) existingNoMatch.remove();

        if (!matchFound) {
          container.insertAdjacentHTML("beforeend", noMatchHTML);
        }
      });
    });

    function showAllCards() {
      cards.forEach(card => {
        card.parentElement.style.display = "block";
      });

      // Remove "no match" message if visible
      const existingNoMatch = container.querySelector(".no-match-container");
      if (existingNoMatch) existingNoMatch.remove();
    }
  });