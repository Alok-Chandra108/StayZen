document.addEventListener("DOMContentLoaded", () => {
    // Register Plugins
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // --- 1. GLOBAL MARQUEE SPEED CONTROL ---
        const marquees = document.querySelectorAll(".ticker, .sz-view-marquee-track");
        marquees.forEach(m => {
            const mLogic = gsap.to(m, {
                xPercent: -50,
                repeat: -1,
                duration: 25,
                ease: "none"
            });

            ScrollTrigger.create({
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity() / 150);
                    const newScale = 1 + velocity;
                    gsap.to(mLogic, { timeScale: newScale, duration: 0.4 });
                }
            });
        });

        // --- 2. SHOW PAGE REVEALS ---
        const showSections = document.querySelectorAll('.sz-view-section');
        showSections.forEach((sec, i) => {
            const title = sec.querySelector('.sz-view-section-title');
            const content = sec.querySelector('.sz-view-desc-text, .sz-view-amenities, .sz-view-tags, .sz-view-map-container, .sz-view-review-list');
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sec,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            if(title) {
                tl.from(title, {
                    x: -100,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power4.out"
                });
            }

            if(content) {
                tl.from(content, {
                    y: 40,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.4");
            }
        });

        // --- 3. DASHBOARD TICKET REVEAL ---
        const tickets = document.querySelectorAll('.sz-pass-ticket');
        if(tickets.length > 0) {
            gsap.from(tickets, {
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.2)",
                delay: 0.3
            });
        }

        // --- 4. STICKER WOBBLE (GLOBAL) ---
        if (document.querySelector(".nb-form-sticker")) {
            gsap.to(".nb-form-sticker", {
                y: 10,
                rotation: "+=2",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // --- 5. LEGACY/REUSED COMPONENTS ---
        const cards = document.querySelectorAll('.listing-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.4)",
                delay: (i % 3) * 0.1
            });
        });

        // Cursor Dot
        let mX = 0, mY = 0;
        window.addEventListener("mousemove", (e) => {
            mX = e.clientX;
            mY = e.clientY;
            const cursor = document.querySelector(".cursor-dot");
            if(cursor) {
                gsap.to(cursor, {x: mX, y: mY, duration: 0.1, ease: "power2.out"});
            }
        });
    }
});
