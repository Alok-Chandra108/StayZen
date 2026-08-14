/* ============================================================
   STAYZEN — HOTEL ANIMATIONS (GSAP)
   Entrance & scroll animations only — NO filter/map/flatpickr logic
   (Filter, map, flatpickr owned by nomatch.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

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

  // ── Filter pills — entrance ──
  const filterPills = document.querySelectorAll('.filter');
  if (filterPills.length > 0) {
    gsap.from(filterPills, {
      y: 15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.out',
      delay: 0.3
    });
  }

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
    gsap.from(ticket, { y: 30, opacity: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' });
  }

  // ── Dashboard cards — Stagger entrance ──
  const passTickets = document.querySelectorAll('.sz-pass-ticket');
  if (passTickets.length > 0) {
    gsap.from(passTickets, { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
  }

  // ── Auth page entrance ──
  const authCard = document.querySelector('.sz-auth-form-card');
  if (authCard) {
    gsap.from(authCard, { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
  }

  const authLeft = document.querySelector('.sz-auth-left__text');
  if (authLeft) {
    gsap.from(authLeft, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 });
  }

  // ── Global Map — Scroll reveal ──
  const globalMapEl = document.getElementById('global-map');
  if (globalMapEl && typeof ScrollTrigger !== 'undefined') {
    gsap.from(globalMapEl, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      scrollTrigger: {
        trigger: globalMapEl,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }

  // ── Tax toggle functionality ──
  const taxToggle = document.getElementById('tax-toggle');
  if (taxToggle) {
    taxToggle.addEventListener('change', function () {
      document.querySelectorAll('.tax-info').forEach(info => {
        info.style.display = this.checked ? 'inline' : 'none';
      });
    });
  }
});
