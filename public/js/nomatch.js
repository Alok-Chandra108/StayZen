document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".nb-search-bar");
  const searchInput = document.querySelector(".nb-search-input");
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".listing-card");
  const noMatchContainer = document.querySelector(".no-match-container");

  if (!cards.length) return;

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  let activeTag = null; 
  let unavailableIds = new Set(); 

  // ── GLOBAL MAP INITIALIZATION ──
  const mapContainer = document.getElementById("global-map");
  let globalMap = null;
  const markers = new Map(); 
  let allMarkerGroup = null;

  if (mapContainer && typeof L !== "undefined") {
      globalMap = L.map('global-map', {
          scrollWheelZoom: false,
          attributionControl: false
      }).setView([20.5937, 78.9629], 5); 
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
      }).addTo(globalMap);
      
      allMarkerGroup = L.featureGroup().addTo(globalMap);

      cards.forEach(card => {
          const lat = parseFloat(card.getAttribute("data-lat"));
          const lng = parseFloat(card.getAttribute("data-lng"));
          const listingId = card.getAttribute("data-id");
          const price = card.getAttribute("data-price");
          const title = card.getAttribute("data-title");
          const url = card.getAttribute("data-url");

          if (lat && lng && lat !== 0 && lng !== 0) {
              const brutalIcon = L.divIcon({
                  className: 'brutal-marker',
                  html: `
                      <div class="brutal-marker-tag" style="padding: 4px 8px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; background: #0A0A0A; color: #C8FF00; border: 2px solid #0A0A0A; font-size: 14px; white-space: nowrap; box-shadow: 2px 2px 0 #FFF;">
                          ₹ ${Number(price).toLocaleString("en-IN")}
                      </div>
                  `,
                  iconSize: [0, 0],
                  iconAnchor: [0, 0]
              });

              const popupHtml = `
                  <div style="text-align: center; font-family: 'Space Grotesk', sans-serif; min-width: 150px;">
                      <h6 style="font-weight: 900; margin-bottom: 5px; text-transform: uppercase;">${title}</h6>
                      <a href="${url}" style="font-weight: 800; color: #FFF; background: #FF5722; padding: 4px 8px; text-decoration: none; display: inline-block; margin-top: 5px; border: 2px solid #000; box-shadow: 2px 2px 0 #000;">VIEW DETAILS</a>
                  </div>
              `;

              const marker = L.marker([lat, lng], { icon: brutalIcon });
              marker.bindPopup(popupHtml, { offset: [0, -20] });
              
              markers.set(listingId, marker);
              marker.addTo(allMarkerGroup);
          }
      });
      
      if (markers.size > 0) {
          globalMap.fitBounds(allMarkerGroup.getBounds(), { padding: [50, 50] });
      }
      
      setTimeout(() => globalMap.invalidateSize(), 500);
  }

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
        if (selectedDates.length >= 1 && instance.altInput) {
             instance.altInput.value = instance.formatDate(selectedDates[0], "M j, Y");
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
        }
      }
    });

    if (checkoutInput) checkoutInput.addEventListener("click", () => fp.open());
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fp.clear();
        checkoutInput.value = "";
        clearBtn.style.display = "none";
        unavailableIds = new Set();
        applyFilters(true);
      });
    }
  }

  async function fetchAvailability(checkIn, checkOut) {
    try {
      const res = await fetch(`/api/listings/available?checkIn=${checkIn}&checkOut=${checkOut}`);
      const data = await res.json();
      unavailableIds = new Set(data.unavailableIds || []);
    } catch (err) {
      console.error("Availability check failed:", err);
      unavailableIds = new Set();
    }
    applyFilters(true);
  }

  // ── UNIFIED FILTER LOGIC ──
  function applyFilters(shouldUpdateBounds = false) {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const bounds = globalMap ? globalMap.getBounds() : null;
    let anyVisible = false;
    let cardsToShow = [];
    let cardsToHide = [];
    let visibleMarkers = [];

    cards.forEach(card => {
      const title  = card.querySelector("b")?.textContent.toLowerCase() || "";
      const tags   = JSON.parse(card.getAttribute("data-tags") || "[]");
      const listingId = card.getAttribute("data-id") || "";
      const lat = parseFloat(card.getAttribute("data-lat"));
      const lng = parseFloat(card.getAttribute("data-lng"));

      const matchesSearch = title.includes(searchTerm);
      const matchesFilter = activeTag
        ? tags.some(t => t.toLowerCase() === activeTag.toLowerCase())
        : true;
      const matchesAvailability = !unavailableIds.has(listingId);
      
      // Map Bounds Check
      let matchesBounds = true;
      if (bounds && !isNaN(lat) && !isNaN(lng)) {
        matchesBounds = bounds.contains(L.latLng(lat, lng));
      }

      const shouldShow = matchesSearch && matchesFilter && matchesAvailability && matchesBounds;
      const cardLink = card.closest(".sz-card-link");
      
      if (globalMap && markers.has(listingId)) {
        const marker = markers.get(listingId);
        // We keep markers on map if they match basic filters, even if hide card due to bounds
        const matchesOthers = matchesSearch && matchesFilter && matchesAvailability;
        if (matchesOthers) {
            if (!allMarkerGroup.hasLayer(marker)) allMarkerGroup.addLayer(marker);
            if (shouldShow) visibleMarkers.push(marker);
        } else {
            if (allMarkerGroup.hasLayer(marker)) allMarkerGroup.removeLayer(marker);
        }
      }

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
      // 1. Kill any pending animations on all cards to prevent race conditions
      gsap.killTweensOf(cards);
      
      // 2. Hide out-of-bounds cards
      if (cardsToHide.length > 0) {
          gsap.to(cardsToHide, {
              duration: 0.2,
              opacity: 0,
              scale: 0.9,
              overwrite: true,
              onComplete: () => {
                  // Only hide if the card is still supposed to be hidden (extra safety)
                  cardsToHide.forEach(c => {
                      if (gsap.getProperty(c, "opacity") === 0) {
                         c.style.display = "none";
                      }
                  });
              }
          });
      }

      // 3. Show in-bounds cards
      if (cardsToShow.length > 0) {
          cardsToShow.forEach(c => {
              if (window.getComputedStyle(c).display === "none") {
                  c.style.display = "block";
                  gsap.fromTo(c, 
                      { opacity: 0, scale: 0.9, y: 15 }, 
                      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.2)", overwrite: true }
                  );
              } else {
                  // If already visible, ensure it's fully opaque
                  gsap.to(c, { opacity: 1, scale: 1, duration: 0.2, overwrite: true });
              }
          });
      }
      
      if (noMatchContainer) {
          if (anyVisible) {
              noMatchContainer.style.display = "none";
          } else {
              noMatchContainer.style.display = "block";
              gsap.fromTo(noMatchContainer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
          }
      }

      setTimeout(() => { if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(); }, 400);
    } else {
      // Fallback
      cardsToHide.forEach(c => c.style.display = "none");
      cardsToShow.forEach(c => c.style.display = "block");
      if (noMatchContainer) noMatchContainer.style.display = anyVisible ? "none" : "block";
    }

    if (globalMap && shouldUpdateBounds && visibleMarkers.length > 0) {
        const tempGroup = L.featureGroup(visibleMarkers);
        globalMap.flyToBounds(tempGroup.getBounds(), { padding: [50, 50], maxZoom: 12, duration: 0.6 });
    }
  }

  // ── LISTENERS ──
  if (globalMap) {
    globalMap.on("moveend", () => applyFilters(false));
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => applyFilters(false));
  }
  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      const tag = filter.dataset.tag;
      if (activeTag === tag) {
        filter.classList.remove("active");
        activeTag = null;
      } else {
        filters.forEach(f => f.classList.remove("active"));
        filter.classList.add("active");
        activeTag = tag;
      }
      applyFilters(true);
    });
  });
});
