const searchInput = document.getElementById("search-input");
  const cards = document.querySelectorAll(".listing-card");

  searchInput.addEventListener("keyup", function () {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let anyVisible = false;

    cards.forEach(card => {
      const title = card.querySelector("b").textContent.toLowerCase();
      const matches = title.includes(searchTerm);

      card.parentElement.style.display = matches ? "block" : "none";

      if (matches) anyVisible = true;
    });

    const noMatch = document.querySelector(".no-match-container");
    if (noMatch) {
      noMatch.style.display = anyVisible ? "none" : "block";
    }
  });