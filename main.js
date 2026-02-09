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

<<<<<<< Updated upstream
// Load Services Section and Initialize Swiper
fetch('what-we-offer.html')
  .then(response => response.text())
  .then(html => {
    // Parse the fetched HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const servicesSection = doc.getElementById('services');
    
    // Inject only the services section
    if (servicesSection) {
      document.getElementById('services-container').innerHTML = servicesSection.outerHTML;
      
      // Initialize Swiper
      new Swiper('.services-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,
        speed: 3000,
        grabCursor: true,
        allowTouchMove: false, 
        autoplay: {
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        },
        breakpoints: {
          320: {
            spaceBetween: 20,
          },
          768: {
            spaceBetween: 30,
          },
          1024: {
            spaceBetween: 30,
          },
          1200: {
            spaceBetween: 30,
          }
        }
      });
    }
  })
  .catch(err => console.error('Failed to load services:', err));

// Magnetic Button Effect (Simple) - Disabled
/*
=======
// Feature Cards Animation
safeFrom('.feature-card', {
    scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 75%'
    },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

safeFrom('.service-card', {
    scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 75%'
    },
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out'
});
// Magnetic Button Effect (Simple)
>>>>>>> Stashed changes
const btns = document.querySelectorAll('.cta-button');

btns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        const position = btn.getBoundingClientRect();
        const x = e.pageX - position.left - position.width / 2;
        const y = e.pageY - position.top - position.height / 2;

        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
    });

    btn.addEventListener('mouseout', () => {
        btn.style.transform = 'translate(0px, 0px)';
    });
});
<<<<<<< Updated upstream
*/
=======

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
>>>>>>> Stashed changes
