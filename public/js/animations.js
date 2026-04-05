document.addEventListener("DOMContentLoaded", () => {
    // 1. Custom Brutalist Cursor
    const cursor = document.querySelector(".cursor-dot");
    if(cursor) {
        gsap.set(cursor, {xPercent: -50, yPercent: -50});
        window.addEventListener("mousemove", (e) => {
            gsap.to(cursor, {x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out"});
        });
        
        // Hover effect on links
        document.querySelectorAll("a, button, .filter, input[type='checkbox']").forEach(el => {
            el.addEventListener("mouseenter", () => gsap.to(cursor, {scale: 3, backgroundColor: "rgba(255, 87, 34, 0.4)", border: "2px solid #000"}));
            el.addEventListener("mouseleave", () => gsap.to(cursor, {scale: 1, backgroundColor: "#C0FF00", border: "3px solid #000"}));
        });
    }

    // Register ScrollTrigger
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // 2. Global Scroll Animations (Cards)
        const cards = document.querySelectorAll('.listing-card, .review-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                y: 60,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.5)",
                delay: (i % 3) * 0.1 // stagger by column roughly
            });
        });

        // 3. Stagger Text Reveal for Hero
        const heroTitle = document.querySelector('.hero-gsap-text');
        if(heroTitle) {
            const text = heroTitle.innerText;
            heroTitle.innerHTML = "";
            text.split(" ").forEach(word => {
                const span = document.createElement("span");
                span.innerHTML = word + "&nbsp;";
                span.style.display = "inline-block";
                heroTitle.appendChild(span);
            });

            gsap.from(".hero-gsap-text span", {
                y: 80,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.2
            });
        }
        
        // Form slide in
        gsap.from(".brutal-form-container", {
            y: 50,
            opacity: 0,
            duration: 0.7,
            ease: "circ.out",
            delay: 0.1
        });

        // 4. Infinite Rotate SVGs
        gsap.to(".spin-svg", {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: "linear"
        });
        
        // Bounce SVGs
        gsap.to(".bounce-svg", {
            y: -15,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut"
        });
    }
});
