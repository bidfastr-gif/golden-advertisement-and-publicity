// Imports removed in favor of CDN links in index.html for vanilla usage

gsap.registerPlugin(ScrollTrigger)

// Initialize Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
})

// Sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis to GSAP Ticker for perfect synchronization
gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert to milliseconds
});

// Disable lag smoothing for smoother scroll
gsap.ticker.lagSmoothing(0);

const exists = (sel) => typeof sel === 'string' ? document.querySelector(sel) : !!sel;
const safeFrom = (selector, vars) => {
    if (!exists(selector)) return;
    const st = vars && vars.scrollTrigger;
    if (st && typeof st.trigger === 'string' && !exists(st.trigger)) return;
    gsap.from(selector, vars);
};
const safeTo = (selector, vars) => {
    if (!exists(selector)) return;
    gsap.to(selector, vars);
};
// Preloader
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to('.loader-text', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power4.inOut',
        delay: 0.5
    })
        .to('#preloader', {
            y: '-100%',
            duration: 1.2,
            ease: 'power4.inOut'
        }, "-=0.5")
        .from('.hero-title span', {
            y: '100%',
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: 'power4.out'
        }, "-=0.8")
        .to('.hero-subtitle', {
            y: 0,
            opacity: 0.8,
            duration: 1,
            ease: 'power2.out'
        }, "-=1")
        .from('nav', {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        }, "-=1");
});


// Three.js Background Animation
const initThreeJS = (containerId = 'hero-canvas') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles Grid
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;

    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Gold Color Material
    const material = new THREE.PointsMaterial({
        size: 0.015,
        color: 0xD4AF37, // Gold
        transparent: true,
        opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    camera.position.z = 2;

    // Animation Loop
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Wave motion
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = mouseY * 0.1;
        particlesMesh.rotation.y += mouseX * 0.1;

        renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    }

    tick();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

initThreeJS('hero-canvas');
initThreeJS('about-hero-canvas');
initThreeJS('services-hero-canvas');
initThreeJS('seo-hero-canvas');
initThreeJS('smm-hero-canvas');
initThreeJS('ppc-hero-canvas');
initThreeJS('webdev-hero-canvas');
initThreeJS('web-process-anim');
initThreeJS('ecommerce-hero-canvas');

// Marquee Animation
safeTo('.marquee-content', {
    xPercent: -50,
    ease: "none",
    duration: 20,
    repeat: -1
});

// Scroll Animations
const splitTypes = document.querySelectorAll('[data-reveal-text]')

splitTypes.forEach((char, i) => {
    // Determine triggers for general sections
    gsap.from(char, {
        scrollTrigger: {
            trigger: char,
            start: 'top 80%',
            end: 'top 20%',
            scrub: false,
            markers: false
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    })
})

// Counter Animation
const counters = document.querySelectorAll('.stat-number');
counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const inc = target / 200;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = target;
        }
    };

    ScrollTrigger.create({
        trigger: counter,
        start: "top 85%",
        onEnter: () => updateCount()
    });
});

// Load Services Section and Initialize Swiper
fetch('what-we-offer.html')
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const servicesSection = doc.getElementById('services');
    if (servicesSection) {
      const container = document.getElementById('services-container');
      if (container) container.innerHTML = servicesSection.outerHTML;
      new Swiper('.services-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,
        speed: 3000,
        grabCursor: true,
        allowTouchMove: false, 
        autoplay: { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false },
      });
    }
  })
  .catch(err => console.error('Failed to load services:', err));

// Feature Cards Animation
safeFrom('.feature-card', {
    scrollTrigger: { trigger: '.services-grid', start: 'top 75%' },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

safeFrom('.service-card', {
    scrollTrigger: { trigger: '.services-grid', start: 'top 75%' },
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out'
});
 
 
safeFrom('.about-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.about-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

safeFrom('.services-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.services-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

safeFrom('.services-hero .hero-tags', {
    scrollTrigger: {
        trigger: '.services-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});

safeFrom('.services-hero .hero-cta', {
    scrollTrigger: {
        trigger: '.services-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2
});
safeFrom('.seo-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.seo-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

safeFrom('.seo-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.seo-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});

safeFrom('.seo-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.seo-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});

safeFrom('.smm-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.smm-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.smm-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.smm-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.smm-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.smm-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.ppc-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.ppc-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.ppc-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.ppc-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.ppc-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.ppc-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.ecommerce-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.ecommerce-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.ecommerce-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.ecommerce-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.ecommerce-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.ecommerce-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.adv-list li', {
    scrollTrigger: {
        trigger: '.adv-panel',
        start: 'top 80%'
    },
    y: 16,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.08
});
safeFrom('.webdev-illustration svg', {
    scrollTrigger: {
        trigger: '.webdev-illustration',
        start: 'top 85%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
});
safeFrom('.webdev-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.webdev-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.webdev-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.webdev-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.webdev-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.webdev-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.image-card', {
    scrollTrigger: {
        trigger: '.image-grid',
        start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
});

safeFrom('.workflow-step', {
    scrollTrigger: {
        trigger: '.workflow-section',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.25,
    ease: 'power3.out'
});

safeTo('.workflow-connector', {
    scrollTrigger: {
        trigger: '.workflow-section',
        start: 'top 80%'
    },
    scaleX: 1,
    duration: 1,
    stagger: 0.25,
    ease: 'power3.out'
});
(() => {
    const cards = document.querySelectorAll('.tilt');
    if (cards.length === 0) return;
    cards.forEach(card => {
        let bounds;
        const calc = (e) => {
            if (!bounds) bounds = card.getBoundingClientRect();
            const x = e.clientX - bounds.left - bounds.width / 2;
            const y = e.clientY - bounds.top - bounds.height / 2;
            const rx = (-y / bounds.height) * 10;
            const ry = (x / bounds.width) * 10;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        };
        card.addEventListener('mousemove', calc);
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0)';
            bounds = undefined;
        });
    });
})();

(() => {
    const ecomSvg = document.querySelector('.ecom-illustration svg');
    if (ecomSvg) {
        gsap.to('.ecom-illustration .cart', {
            x: 20,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
        });
        gsap.to('.ecom-illustration .progress-fill', {
            attr: { width: 280 },
            duration: 2.2,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true
        });
        gsap.to('.ecom-illustration .progress-fill-2', {
            attr: { width: 220 },
            duration: 2.0,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true
        });
        gsap.to('.ecom-illustration .boxes rect', {
            y: '-=5',
            duration: 1.6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            stagger: 0.2
        });
        safeFrom('.ecom-illustration svg', {
            scrollTrigger: {
                trigger: '.ecom-illustration',
                start: 'top 85%'
            },
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
})();

(() => {
    const target = document.getElementById('webdev-typing');
    const cursor = document.getElementById('webdev-cursor');
    if (!target || !cursor) return;
    const lines = [
        'const app = new Website({ responsive: true });',
        'app.optimize({ speed: \"fast\", seo: \"on\" });',
        'deploy(\"gap\", { region: \"in\", secure: true });'
    ];
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    const typeLine = (text) => gsap.to({ i: 0 }, {
        i: text.length,
        duration: Math.max(0.8, text.length * 0.05),
        ease: 'none',
        onUpdate: function () {
            const idx = Math.floor(this.targets()[0].i);
            target.textContent = text.slice(0, idx);
        }
    });
    lines.forEach((line) => {
        tl.add(typeLine(line));
        tl.to({}, { duration: 0.6 });
    });
    gsap.to(cursor, { opacity: 0.2, repeat: -1, yoyo: true, duration: 0.4 });
})();

safeFrom('.package-card', {
    scrollTrigger: {
        trigger: '.package-grid',
        start: 'top 80%'
    },
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out'
});

safeFrom('.adv-card', {
    scrollTrigger: {
        trigger: '.adv-grid',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
});
safeFrom('.about-hero .hero-tags', {
    scrollTrigger: {
        trigger: '.about-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});

safeFrom('.about-hero .hero-cta', {
    scrollTrigger: {
        trigger: '.about-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2
});
safeFrom('.who-text', {
    scrollTrigger: {
        trigger: '.who-text',
        start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
});

safeFrom('.team-card', {
    scrollTrigger: {
        trigger: '.team-grid',
        start: 'top 75%'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
});

safeFrom('.testimonial-quote', {
    scrollTrigger: {
        trigger: '.testimonial-quote',
        start: 'top 85%'
    },
    y: 25,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
});

const initTestimonialCarousel = () => {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.testimonial-track');
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    if (cards.length === 0) return;
    let x = 0;
    let running = false;
    const speed = 2;
    const getGap = () => parseFloat(getComputedStyle(track).gap || '0');
    let gap = getGap();
    const tick = () => {
        const delta = gsap.ticker.deltaRatio();
        x -= speed * delta;
        track.style.transform = `translateX(${x}px)`;
        const first = track.firstElementChild;
        const w = first.getBoundingClientRect().width;
        if (-x >= w + gap) {
            track.appendChild(first);
            x += w + gap;
        }
    };
    ScrollTrigger.create({
        trigger: carousel,
        start: 'top 90%',
        onEnter: () => {
            if (!running) {
                gsap.ticker.add(tick);
                running = true;
            }
        },
        onLeaveBack: () => {
            if (running) {
                gsap.ticker.remove(tick);
                running = false;
            }
        }
    });
    window.addEventListener('resize', () => {
        gap = getGap();
    });
};

initTestimonialCarousel();
