document.addEventListener("DOMContentLoaded", () => {
    // Register Plugins
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // --- 1. PRO-LEVEL INFINITE TICKER ---
        const ticker = document.querySelector(".ticker");
        if (ticker) {
            ticker.innerHTML += ticker.innerHTML; 
            const tickerLogic = gsap.to(ticker, {
                xPercent: -50, 
                repeat: -1,
                duration: 20,
                ease: "none"
            });

            ScrollTrigger.create({
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity() / 100);
                    const newScale = 1 + velocity;
                    gsap.to(tickerLogic, { timeScale: newScale, duration: 0.5 });
                }
            });
        }

        // --- 2. PHYSICS-BASED STICKERS (SCOPED) ---
        const stickerContainers = document.querySelectorAll(".sticker-canvas");
        const STICKER_TYPES = [
            { class: "sticker--pink", icon: '<path d="M50 5 L60 40 L95 40 L65 60 L75 95 L50 75 L25 95 L35 60 L5 40 L40 40 Z" fill="none" stroke-width="4"/>'},
            { class: "sticker--orange", icon: '<path d="M50 10 L50 90 M10 50 L90 50 M20 20 L80 80 M80 20 L20 80" stroke-width="6"/>' },
            { class: "sticker--blue", icon: '<path d="M10 50 L90 50 M60 20 L90 50 L60 80" stroke-width="6"/>' },
            { class: "sticker--green", icon: '<circle cx="50" cy="50" r="30" fill="none" stroke-width="4"/><path d="M50 20 L50 40 M50 60 L50 80" stroke-width="6"/>'}
        ];

        class ScopedSticker {
            constructor(parent, type) {
                this.parent = parent;
                this.el = document.createElement("div");
                this.el.className = `sticker ${type.class}`;
                this.el.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="black">${type.icon}</svg>`;
                parent.appendChild(this.el);

                const rect = parent.getBoundingClientRect();
                this.x = Math.random() * (rect.width - 100);
                this.y = Math.random() * (rect.height - 100);
                this.baseX = this.x;
                this.baseY = this.y;
                
                this.angle = Math.random() * Math.PI * 2;
                this.driftSpeed = 0.01 + Math.random() * 0.02;
                this.driftRange = 15 + Math.random() * 25;

                gsap.set(this.el, { x: this.x, y: this.y, rotation: Math.random() * 360 });
            }

            update(mouseX, mouseY) {
                this.angle += this.driftSpeed;
                const driftX = Math.cos(this.angle) * this.driftRange;
                const driftY = Math.sin(this.angle) * this.driftRange;

                let targetX = this.baseX + driftX;
                let targetY = this.baseY + driftY;

                // Local Coordinate Math
                const parentRect = this.parent.getBoundingClientRect();
                const globalX = parentRect.left + this.x + 40;
                const globalY = parentRect.top + this.y + 40;

                const dx = mouseX - globalX;
                const dy = mouseY - globalY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const threshold = 150;

                if (distance < threshold) {
                    const force = (threshold - distance) / threshold;
                    const angle = Math.atan2(dy, dx);
                    targetX -= Math.cos(angle) * force * 200;
                    targetY -= Math.sin(angle) * force * 200;
                    this.el.style.boxShadow = "16px 16px 0px #000";
                    this.el.style.transform = "scale(1.1)";
                } else {
                    this.el.style.boxShadow = "4px 4px 0px #000";
                    this.el.style.transform = "scale(1)";
                }

                this.x += (targetX - this.x) * 0.1;
                this.y += (targetY - this.y) * 0.1;

                gsap.set(this.el, { x: this.x, y: this.y });
            }
        }

        const stickers = [];
        stickerContainers.forEach(container => {
            const count = container.dataset.count || 3;
            for (let i = 0; i < count; i++) {
                stickers.push(new ScopedSticker(container, STICKER_TYPES[i % STICKER_TYPES.length]));
            }
        });

        let mX = 0, mY = 0;
        window.addEventListener("mousemove", (e) => {
            mX = e.clientX;
            mY = e.clientY;
            
            const cursor = document.querySelector(".cursor-dot");
            if(cursor) {
                gsap.to(cursor, {x: mX, y: mY, duration: 0.1, ease: "power2.out"});
            }
        });

        function tickerLoop() {
            stickers.forEach(s => s.update(mX, mY));
            requestAnimationFrame(tickerLoop);
        }
        tickerLoop();

        // --- 3. GLOBAL EFFECTS ---
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
        
        // --- 4. EXCLUSIVE HERO ROTATION ---
        const spinSvg = document.querySelector(".spin-svg");
        if (spinSvg) {
            gsap.to(spinSvg, { rotation: 360, duration: 20, repeat: -1, ease: "none" });
        }
    }
});
