// const searchForm = document.querySelector("form"); // or use a specific ID if you have many forms
// const searchInput = document.getElementById("search-input");
// const cards = document.querySelectorAll(".listing-card");
// const noMatchContainer = document.querySelector(".no-match-container");

// // Prevent form from submitting
// searchForm.addEventListener("submit", function (e) {
//   e.preventDefault(); // Stop the page from reloading
// });

// searchInput.addEventListener("keyup", function () {
//   const searchTerm = searchInput.value.trim().toLowerCase();
//   let anyVisible = false;

//   cards.forEach(card => {
//     const title = card.querySelector("b")?.textContent.toLowerCase() || "";
//     const matches = title.includes(searchTerm);

//     card.parentElement.style.display = matches ? "block" : "none";

//     if (matches) anyVisible = true;
//   });

//   if (noMatchContainer) {
//     noMatchContainer.style.display = anyVisible ? "none" : "block";
//   }
// });
