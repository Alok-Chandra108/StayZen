/* ============================================================
   STAYZEN — HOTEL ANIMATIONS (GSAP)
   Subtle, elegant entrance & scroll animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Guard: Make sure GSAP is available
  if (typeof gsap === 'undefined') return;

  // Register GSAP plugins
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Hero Section Entrance ──
  const heroHeading = document.querySelector('.sz-hero__heading');
  const heroSub = document.querySelector('.sz-hero__sub');
  const heroCtas = document.querySelector('.sz-hero__ctas');
  const heroStats = document.querySelector('.sz-hero__stats');
  const heroEyebrow = document.querySelector('.sz-hero__eyebrow');

  if (heroHeading) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.from(heroEyebrow, { y: 20, opacity: 0, duration: 0.6 }, 0.1)
      .from(heroHeading, { y: 40, opacity: 0, duration: 0.8 }, 0.2)
      .from(heroSub, { y: 30, opacity: 0, duration: 0.7 }, 0.4)
      .from(heroCtas, { y: 30, opacity: 0, duration: 0.6 }, 0.55)
      .from(heroStats, { y: 20, opacity: 0, duration: 0.6 }, 0.65);
  }

  // ── Listing Cards — Fade In on Scroll ──
  const listingCards = document.querySelectorAll('.sz-listing-card');
  if (listingCards.length > 0 && typeof ScrollTrigger !== 'undefined') {
    listingCards.forEach((card, i) => {
      gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: Math.min(i * 0.05, 0.4),
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ── Filter pills — Subtle entrance ──
  const filters = document.querySelectorAll('.filter');
  if (filters.length > 0) {
    gsap.from(filters, {
      y: 15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.out',
      delay: 0.3
    });
  }

  // ── Filter click functionality ──
  filters.forEach(filter => {
    filter.addEventListener('click', function() {
      const tag = this.dataset.tag;
      const isActive = this.classList.contains('active');
      
      // Toggle active state
      filters.forEach(f => f.classList.remove('active'));
      if (!isActive) {
        this.classList.add('active');
      }
      
      // Filter cards
      const cards = document.querySelectorAll('.sz-listing-card');
      const noMatch = document.querySelector('.no-match-container');
      let visibleCount = 0;

      cards.forEach(card => {
        const cardLink = card.closest('.sz-card-link') || card.closest('.list-link');
        if (!cardLink) return;

        if (isActive) {
          // Show all
          cardLink.style.display = '';
          visibleCount++;
        } else {
          const tags = JSON.parse(card.dataset.tags || '[]');
          if (tags.includes(tag)) {
            cardLink.style.display = '';
            visibleCount++;
          } else {
            cardLink.style.display = 'none';
          }
        }
      });

      if (noMatch) {
        noMatch.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  // ── Show page sections — Fade in ──
  const viewSections = document.querySelectorAll('.sz-view-section');
  if (viewSections.length > 0 && typeof ScrollTrigger !== 'undefined') {
    viewSections.forEach((section, i) => {
      gsap.from(section, {
        y: 25,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ── Booking widget entrance ──
  const ticket = document.querySelector('.sz-view-ticket');
  if (ticket) {
    gsap.from(ticket, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      ease: 'power2.out'
    });
  }

  // ── Dashboard cards — Stagger entrance ──
  const passTickets = document.querySelectorAll('.sz-pass-ticket');
  if (passTickets.length > 0) {
    gsap.from(passTickets, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  // ── Auth page entrance ──
  const authCard = document.querySelector('.sz-auth-form-card');
  if (authCard) {
    gsap.from(authCard, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.1
    });
  }

  const authLeft = document.querySelector('.sz-auth-left__text');
  if (authLeft) {
    gsap.from(authLeft, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.2
    });
  }

  // ── Global Map — Scroll reveal ──
  const globalMap = document.getElementById('global-map');
  if (globalMap && typeof ScrollTrigger !== 'undefined') {
    gsap.from(globalMap, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      scrollTrigger: {
        trigger: globalMap,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }

  // ── Tax toggle functionality ──
  const taxToggle = document.getElementById('tax-toggle');
  if (taxToggle) {
    taxToggle.addEventListener('change', function() {
      const taxInfos = document.querySelectorAll('.tax-info');
      taxInfos.forEach(info => {
        info.style.display = this.checked ? 'inline' : 'none';
      });
    });
  }

  // ── Date availability filter ──
  const checkinInput = document.getElementById('avail-checkin');
  const checkoutInput = document.getElementById('avail-checkout');
  const clearBtn = document.getElementById('avail-clear');

  if (checkinInput && typeof flatpickr !== 'undefined') {
    const fpCheckin = flatpickr(checkinInput, {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j',
      onChange: function(selectedDates) {
        if (selectedDates.length) {
          fpCheckout.set('minDate', selectedDates[0]);
          if (clearBtn) clearBtn.style.display = 'inline-block';
        }
      }
    });

    const fpCheckout = flatpickr(checkoutInput, {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j',
      onChange: function() {
        if (clearBtn) clearBtn.style.display = 'inline-block';
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        fpCheckin.clear();
        fpCheckout.clear();
        this.style.display = 'none';

        // Show all cards
        document.querySelectorAll('.sz-listing-card').forEach(card => {
          const link = card.closest('.sz-card-link') || card.closest('.list-link');
          if (link) link.style.display = '';
        });
      });
    }
  }

  // ── Global interactive map ──
  const globalMapEl = document.getElementById('global-map');
  if (globalMapEl && typeof L !== 'undefined') {
    const cards = document.querySelectorAll('.sz-listing-card');
    if (cards.length > 0) {
      const gMap = L.map('global-map', {
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(gMap);

      const bounds = [];
      cards.forEach(card => {
        const lat = parseFloat(card.dataset.lat);
        const lng = parseFloat(card.dataset.lng);
        if (lat && lng && lat !== 0 && lng !== 0) {
          const markerIcon = L.divIcon({
            className: 'brutal-marker',
            html: `<div class="brutal-marker-tag">₹${parseInt(card.dataset.price).toLocaleString("en-IN")}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(gMap);
          marker.bindPopup(`
            <div style="text-align: center; font-family: 'Inter', sans-serif; padding: 4px;">
              <h5 style="font-weight: 700; margin-bottom: 4px; font-size: 0.9rem; color: #0F1B2D;">${card.dataset.title}</h5>
              <a href="${card.dataset.url}" style="color: #C9A96E; font-weight: 600; font-size: 0.8rem; text-decoration: none;">View Details →</a>
            </div>
          `);
          bounds.push([lat, lng]);
        }
      });

      if (bounds.length > 0) {
        gMap.fitBounds(bounds, { padding: [40, 40] });
      } else {
        gMap.setView([20.5937, 78.9629], 5);
      }
    }
  }
});
