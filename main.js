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


// Store particle materials to update colors on theme switch
const particleMaterials = [];

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
    particleMaterials.push(material);

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

// Testimonial Carousel Animation
safeTo('.testimonial-track', {
    xPercent: -50,
    ease: "none",
    duration: 40,
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
    
    // Trigger on scroll
    ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => updateCount()
    });
});

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const htmlElement = document.documentElement;

const updateParticlesColor = (isLight) => {
    const color = isLight ? 0x000000 : 0xD4AF37; // Black for Light Mode, Gold for Dark Mode
    particleMaterials.forEach(mat => {
        mat.color.setHex(color);
        mat.opacity = isLight ? 0.8 : 0.8; 
        mat.size = isLight ? 0.04 : 0.015; // Significantly larger for light mode visibility
        mat.needsUpdate = true;
    });
};

// Check local storage or default to dark
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
    updateParticlesColor(true);
} else {
    // Ensure dark mode state is visual default
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
    updateParticlesColor(false);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = htmlElement.getAttribute('data-theme') === 'light';
        
        if (isLight) {
            // Switch to Dark
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            updateParticlesColor(false);
        } else {
            // Switch to Light
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            updateParticlesColor(true);
        }
    });
}
