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
  let unavailableIds = new Set(); // listing IDs unavailable for selected dates

  // ── DATE RANGE AVAILABILITY FILTER ──
  const checkinInput = document.getElementById("avail-checkin");
  const checkoutInput = document.getElementById("avail-checkout");
  const clearBtn = document.getElementById("avail-clear");

  if (checkinInput && typeof flatpickr !== "undefined") {
    const fp = flatpickr(checkinInput, {
      mode: "range",
      minDate: "today",
      showMonths: window.innerWidth > 768 ? 2 : 1,
      altInput: true,
      altFormat: "M j, Y",
      dateFormat: "Y-m-d",
      onValueUpdate: function(selectedDates, dateStr, instance) {
        if (selectedDates.length >= 1) {
          // Show only check-in date in the first input
          setTimeout(() => {
            if (instance.altInput) {
              instance.altInput.value = instance.formatDate(selectedDates[0], "M j, Y");
            }
          }, 0);
        }

        if (selectedDates.length === 2) {
          checkoutInput.value = instance.formatDate(selectedDates[1], "M j, Y");
          clearBtn.style.display = "flex";
          fetchAvailability(
            instance.formatDate(selectedDates[0], "Y-m-d"),
            instance.formatDate(selectedDates[1], "Y-m-d")
          );
        } else {
          checkoutInput.value = "";
          // Don't clear unavailableIds yet — wait for full range
        }
      },
      onClose: function(selectedDates, dateStr, instance) {
        if (selectedDates.length === 1) {
          if (instance.altInput) {
            instance.altInput.value = instance.formatDate(selectedDates[0], "M j, Y");
          }
        }
      }
    });

    // Clicking the checkout input opens the range picker
    if (checkoutInput) {
      checkoutInput.addEventListener("click", () => fp.open());
      checkoutInput.readOnly = true;
    }

    // Clear button resets dates
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fp.clear();
        checkoutInput.value = "";
        clearBtn.style.display = "none";
        unavailableIds = new Set();
        applyFilters();
      });
    }
  }

  async function fetchAvailability(checkIn, checkOut) {
    try {
      const res = await fetch(`/api/listings/available?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      unavailableIds = new Set(data.unavailableIds || []);
    } catch (err) {
      console.error("Availability check failed:", err);
      unavailableIds = new Set();
    }
    applyFilters();
  }

  // ── UNIFIED FILTER LOGIC ──
  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let anyVisible = false;
    let cardsToShow = [];
    let cardsToHide = [];

    cards.forEach(card => {
      const title  = card.querySelector("b")?.textContent.toLowerCase() || "";
      const tags   = JSON.parse(card.getAttribute("data-tags") || "[]");
      const listingId = card.getAttribute("data-id") || "";

      const matchesSearch = title.includes(searchTerm);
      // Compare data-tag value (e.g. "Amazing Pools") against the stored tags array
      const matchesFilter = activeTag
        ? tags.some(t => t.toLowerCase() === activeTag.toLowerCase())
        : true;
      // Check date availability
      const matchesAvailability = unavailableIds.size > 0
        ? !unavailableIds.has(listingId)
        : true;

      const shouldShow = matchesSearch && matchesFilter && matchesAvailability;
      const cardLink = card.closest(".sz-card-link");
      
      if (cardLink) {
        if (shouldShow) {
            cardsToShow.push(cardLink);
            anyVisible = true;
        } else {
            cardsToHide.push(cardLink);
        }
      }
    });

    // ── ANIMATED REVEAL WITH GSAP ──
    if (typeof gsap !== "undefined") {
      // 1. Hide the ones that shouldn't match
      if (cardsToHide.length > 0) {
          gsap.to(cardsToHide, {
              duration: 0.2,
              opacity: 0,
              scale: 0.95,
              onComplete: () => {
                  cardsToHide.forEach(c => {
                      c.style.display = "none";
                  });
              }
          });
      }

      // 2. Show the matching ones
      if (cardsToShow.length > 0) {
          // Immediately set display block so they take space
          cardsToShow.forEach(c => {
              if (c.style.display === "none" || c.style.display === "") {
                  c.style.display = "block";
                  // Animate them in newly
                  gsap.fromTo(c, 
                      { opacity: 0, scale: 0.9 }, 
                      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)", delay: 0.1 }
                  );
              } else {
                  // Ensure they are fully visible if they were already showing
                  gsap.to(c, { opacity: 1, scale: 1, duration: 0.2 });
              }
          });
      }
      
      // Handle the "No Match" graphic
      if (noMatchContainer) {
          if (anyVisible) {
              noMatchContainer.style.display = "none";
          } else {
              noMatchContainer.style.display = "block";
              gsap.fromTo(noMatchContainer, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
          }
      }

      // Refresh ScrollTrigger after a slight delay to allow layout adjustments
      setTimeout(() => {
          if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
          }
      }, 300);

    } else {
      // Fallback if GSAP is unavailable
      cardsToHide.forEach(c => c.style.display = "none");
      cardsToShow.forEach(c => c.style.display = "block");
      if (noMatchContainer) {
        noMatchContainer.style.display = anyVisible ? "none" : "block";
      }
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
