// Imports removed in favor of CDN links in index.html for vanilla usage

gsap.registerPlugin(ScrollTrigger);
// Global GSAP Performance Optimizations
gsap.config({ force3D: true, nullTargetWarn: false });
gsap.ticker.lagSmoothing(1000, 16); // More frequent smoothing tasks

    // Theme Toggle (Persistent across pages, mobile-friendly)
    ; (() => {
        const root = document.documentElement;
        const toggle = document.getElementById('theme-toggle');
        const setTheme = (theme) => {
            root.setAttribute('data-theme', theme);
            try { localStorage.setItem('gap-theme-v2', theme); } catch (_) { }
            // Icons are now handled via CSS
            try {
                window.dispatchEvent(new CustomEvent('gap-theme-change', { detail: { theme } }));
            } catch (_) { }
        };
        const initTheme = () => {
            let saved = null;
            try { saved = localStorage.getItem('gap-theme-v2'); } catch (_) { }
            // Force default to dark, ignoring OS preference to ensure consistent brand experience
            setTheme(saved || 'dark');
        };
        initTheme();
        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                setTheme(current);
            });
        }
    })();

// Initialize Smooth Scroll
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
})

// Sync ScrollTrigger with Lenis
let scrollTimeout;
lenis.on('scroll', () => {
    // Throttled update to reduce main-thread load
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            ScrollTrigger.update();
            scrollTimeout = null;
        }, 16); // ~60fps throttle
    }
});

// Add Lenis to GSAP Ticker for perfect synchronization
gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert to milliseconds
});

gsap.ticker.lagSmoothing(500, 33);

// Set default GSAP ease for all animations
gsap.defaults({
    ease: "power3.out",
    duration: 1.2
});

// Page Transition Logic
(() => {
    // Inject transition element if not present
    let transitionEl = document.querySelector('.page-transition');
    if (!transitionEl) {
        transitionEl = document.createElement('div');
        transitionEl.className = 'page-transition';
        document.body.appendChild(transitionEl);
    }

    // Handle internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Check if valid link
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        // Check if open in new tab
        if (target === '_blank' || e.ctrlKey || e.metaKey) return;

        // Check if internal (same hostname)
        if (link.hostname !== window.location.hostname) return;

        e.preventDefault();

        // Play exit animation
        gsap.to(transitionEl, {
            y: '0%',
            duration: 0.6,
            ease: 'power4.inOut',
            onComplete: () => {
                window.location.href = link.href;
            }
        });
    });

    // Handle page load (entrance animation)
    // Note: The existing preloader handles the initial load reveal.
    // If navigating from another page, the preloader might not show (if cached),
    // but the transition overlay will be there.
    // However, since this is a multi-page site, the new page loads fresh.
    // We need to ensure the transition overlay is reset or animated out if it's there.
    // But since the new page HTML is fresh, the overlay starts at translateY(100%) defined in CSS.
    // So we don't need an entrance animation here unless we want to override the preloader.
    // The preloader covers the screen initially.

    // BUT: If the user navigates back, the browser might restore state.
    // To be safe, we can ensure it's hidden on load.
    gsap.set(transitionEl, { y: '100%' });
})();

(() => {
    const nav = document.querySelector('nav');
    const navToggle = document.getElementById('nav-toggle');
    const links = document.querySelectorAll('.nav-links .nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (!nav || !navToggle) return;

    const closeMenu = () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        // Close all dropdowns when menu closes
        dropdowns.forEach(d => d.classList.remove('active'));
    };

    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking links inside dropdown
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
})();

let successPopupOverlay = null;
let successPopupTimeout = null;
const showSuccessPopup = (message) => {
    if (!successPopupOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'success-popup-overlay';
        const box = document.createElement('div');
        box.className = 'success-popup';
        const icon = document.createElement('div');
        icon.className = 'success-popup-icon';
        icon.textContent = '✓';
        const msg = document.createElement('div');
        msg.className = 'success-popup-message';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'success-popup-close';
        btn.textContent = 'Close';
        box.appendChild(icon);
        box.appendChild(msg);
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        const hide = () => {
            overlay.classList.remove('active');
        };
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });
        btn.addEventListener('click', hide);
        successPopupOverlay = overlay;
    }
    const msgEl = successPopupOverlay.querySelector('.success-popup-message');
    if (msgEl) msgEl.textContent = message;
    successPopupOverlay.classList.add('active');
    if (successPopupTimeout) clearTimeout(successPopupTimeout);
    successPopupTimeout = setTimeout(() => {
        successPopupOverlay.classList.remove('active');
    }, 2200);
};

// Chatbot initialization deferred to reduce TBT
setTimeout(() => {
    (() => {
    const makeEl = (tag, cls) => {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        return el;
    };
    const widget = makeEl('div', 'chat-widget');
    const toggle = makeEl('button', 'chat-toggle');
    toggle.setAttribute('aria-label', 'Open Chatbot');
    toggle.innerHTML = `<svg width="40" height="40" stroke="currentColor" fill="none" class="avatar-svg"><use href="#icon-alien-chat"/></svg>`;
    const panel = makeEl('div', 'chat-panel');
    const header = makeEl('div', 'chat-header');
    const title = makeEl('div', 'chat-title');
    title.textContent = 'GAP Assistant';
    const closeBtn = makeEl('button', 'chat-close');
    closeBtn.textContent = '×';
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = makeEl('div', 'chat-body');
    const footer = makeEl('div', 'chat-footer');
    const input = makeEl('input', 'chat-input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    const send = makeEl('button', 'chat-send');
    send.textContent = 'Send';
    input.disabled = true;
    send.disabled = true;
    footer.appendChild(input);
    footer.appendChild(send);
    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    widget.appendChild(toggle);
    document.body.appendChild(widget);
    document.body.appendChild(panel);
    const tip = makeEl('div', 'chat-prompt');
    const tipLabel = makeEl('span', 'chat-prompt-label');
    tipLabel.textContent = 'Chat now';
    const tipDots = makeEl('span', 'chat-prompt-dots');
    tipDots.innerHTML = '<span></span><span></span><span></span>';
    tip.appendChild(tipLabel);
    tip.appendChild(tipDots);
    widget.appendChild(tip);
    window.addEventListener('gap-theme-change', (e) => {
        const t = e && e.detail && e.detail.theme ? e.detail.theme : document.documentElement.getAttribute('data-theme');
        updateAvatarForTheme(t);
    });
    const chatLog = [];
    let hasSelectedPrimaryIntent = false;
    const addMsg = (text, who = 'bot') => {
        const msg = makeEl('div', `chat-msg ${who}`);
        msg.textContent = text;
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
        chatLog.push({ who, text });
    };
    const addSuggestions = (items) => {
        const wrap = makeEl('div', 'chat-suggestions');
        items.forEach(t => {
            const chip = makeEl('button', 'chat-chip');
            chip.textContent = t;
            chip.addEventListener('click', () => {
                if (!hasSelectedPrimaryIntent) {
                    hasSelectedPrimaryIntent = true;
                    try {
                        input.disabled = false;
                        send.disabled = false;
                        input.placeholder = 'Type a message...';
                    } catch (_) { }
                }
                onUser(t);
            });
            wrap.appendChild(chip);
        });
        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
    };
    let expectingName = false;
    let clientName = '';
    let expectingPhone = false;
    let clientPhone = '';
    let expectingPhoneCountry = false;
    let countryCode = '';
    const reply = (text) => {
        const t = text.toLowerCase();
        if (/website\s*design/i.test(t)) {
            return 'We build fast, responsive business, e‑commerce and landing page websites.';
        }
        if (/logo\s*design/i.test(t)) {
            return 'We design modern logos and complete brand identity kits.';
        }
        if (/digital\s*marketing/i.test(t)) {
            return 'Full-stack digital marketing including SEO, social, PPC and content.';
        }
        if (/seo|search\s*engine\s*optimi/i.test(t)) {
            return 'SEO services covering technical, on-page and off-page optimisation.';
        }
        if (/google\s*ads|ppc/i.test(t)) {
            return 'We run high-ROI Google Ads campaigns tailored to your goals and budget.';
        }
        if (/social\s*media/i.test(t)) {
            return 'We manage Instagram, Facebook and LinkedIn social media marketing.';
        }
        if (/brochure/i.test(t)) {
            return 'We design print-ready brochures and flyers for your products and services.';
        }
        if (/training/i.test(t)) {
            return 'We provide marketing training workshops for businesses and teams.';
        }
        if (/others?/i.test(t)) {
            return 'We also handle custom advertising and branding requirements.';
        }
        if (/(price|cost|rate|quote)/.test(t)) {
            return 'We prepare tailored quotes after a quick chat. What service do you need?';
        }
        if (/(service|offer|do you)/.test(t)) {
            return 'We offer branding, websites, SEO, social media, PPC, brochure, newspaper and FM ads.';
        }
        if (/(contact|phone|email)/.test(t)) {
            return 'You can call +91 82206 72333 or email contact@goldenadvertising.in.';
        }
        if (/(project|start|begin)/.test(t)) {
            return 'Great! Share your goal and deadline. We will respond quickly.';
        }
        return 'I can help with services, pricing, and contact. What would you like to know?';
    };
    const sendChatToFormspree = () => {
        if (!chatLog.length) return;
        const fd = new FormData();
        fd.append('source', 'Chatbot Conversation');
        if (clientName) fd.append('name', clientName);
        if (countryCode || clientPhone) {
            const phoneLabel = `${countryCode} ${clientPhone}`.trim();
            if (phoneLabel) fd.append('phone', phoneLabel);
        }
        fd.append('_subject', 'New chatbot conversation on GAP');
        fd.append('_to', 'admin@goldenadvertising.in');
        fetch('https://formspree.io/f/xjgewnpo', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: fd
        }).catch(() => { });
    };
    const onUser = (text) => {
        if (!text || !text.trim()) return;
        const val = text.trim();
        addMsg(val, 'user');
        if (expectingName) {
            clientName = val;
            expectingName = false;
            input.value = '';
            input.placeholder = 'Type a message...';
            setTimeout(() => {
                addMsg(`Nice to meet you, ${clientName}!`, 'bot');
                setTimeout(() => {
                    addMsg('Please share your country code.', 'bot');
                    expectingPhoneCountry = true;
                    input.type = 'tel';
                    input.setAttribute('inputmode', 'numeric');
                    input.setAttribute('pattern', '^\\+?\\d{1,4}$');
                    input.placeholder = 'Country code (e.g., +91)';
                    input.className = 'chat-input tel';
                    addSuggestions(['+91', '+1', '+44', '+61', '+971', 'Others']);
                    try { input.focus(); } catch (_) { }
                }, 250);
            }, 200);
            return;
        }
        if (expectingPhoneCountry) {
            let cc = val.trim();
            if (/^others?$/i.test(cc)) {
                addMsg('Type your country code like +91', 'bot');
                input.value = '';
                return;
            }
            if (!/^\+?\d{1,4}$/.test(cc)) {
                setTimeout(() => addMsg('Please enter a valid country code (e.g., +91).', 'bot'), 150);
                try { input.focus(); } catch (_) { }
                return;
            }
            if (!cc.startsWith('+')) cc = '+' + cc;
            countryCode = cc;
            expectingPhoneCountry = false;
            input.value = '';
            addMsg(`Got it: ${countryCode}`, 'bot');
            setTimeout(() => {
                addMsg('Now enter your phone number.', 'bot');
                expectingPhone = true;
                input.type = 'tel';
                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('pattern', '[0-9]{7,15}');
                input.placeholder = 'Your phone number';
                input.className = 'chat-input tel';
                try { input.focus(); } catch (_) { }
            }, 200);
            return;
        }
        if (expectingPhone) {
            const digits = val.replace(/\D+/g, '');
            if (digits.length < 7 || digits.length > 15) {
                setTimeout(() => addMsg('Please enter a valid contact number (digits only).', 'bot'), 150);
                try { input.focus(); } catch (_) { }
                return;
            }
            clientPhone = digits;
            expectingPhone = false;
            input.value = '';
            input.type = 'text';
            input.removeAttribute('pattern');
            input.setAttribute('inputmode', 'text');
            input.className = 'chat-input';
            input.placeholder = 'Type a message...';
            setTimeout(() => {
                addMsg(`Thanks, we will contact you at ${countryCode} ${clientPhone}.`, 'bot');
                setTimeout(() => {
                    addMsg('Your query was received successfully. Our team will contact you soon.', 'bot');
                    sendChatToFormspree();
                    try {
                        input.disabled = true;
                        send.disabled = true;
                        input.blur();
                    } catch (_) { }
                    setTimeout(() => {
                        close();
                    }, 1200);
                }, 250);
            }, 200);
            return;
        }
        const r = reply(val);
        setTimeout(() => {
            addMsg(r, 'bot');
            setTimeout(() => {
                addMsg('May I know your name?', 'bot');
                expectingName = true;
                input.placeholder = 'Your name';
                input.type = 'search';
                input.setAttribute('inputmode', 'text');
                input.className = 'chat-input search';
                input.value = '';
                try { input.focus(); } catch (_) { }
            }, 250);
        }, 200);
        input.value = '';
    };
    const open = () => {
        panel.classList.add('open');
        try {
            input.disabled = !hasSelectedPrimaryIntent;
            send.disabled = !hasSelectedPrimaryIntent;
            if (!hasSelectedPrimaryIntent) {
                input.placeholder = 'Select what you are looking for above to start...';
            }
        } catch (_) { }
        if (!panel.dataset.init) {
            addMsg('What are you looking for?', 'bot');
            addSuggestions([
                'Website Designing',
                'Logo Designing',
                'Digital Marketing Services',
                'SEO (search engine optimization)',
                'Google Ads',
                'Social Media Marketing',
                'Brochure Designing',
                'Training',
                'Others'
            ]);
            panel.dataset.init = '1';
        }
        try { input.focus(); } catch (_) { }
    };
    const close = () => panel.classList.remove('open');
    let peekTimer = null;
    const triggerPeek = () => {
        widget.classList.remove('peek');
        void widget.offsetWidth;
        widget.classList.add('peek');
        tip.classList.add('show');
        setTimeout(() => tip.classList.remove('show'), 2200);
    };
    const startPeek = () => {
        if (peekTimer) return;
    };
    const stopPeek = () => {
        if (peekTimer) {
            clearInterval(peekTimer);
            peekTimer = null;
        }
        tip.classList.remove('show');
    };
    toggle.addEventListener('click', () => {
        if (panel.classList.contains('open')) close(); else open();
        stopPeek();
    });
    tip.addEventListener('click', () => {
        open();
        stopPeek();
    });
    closeBtn.addEventListener('click', close);
    send.addEventListener('click', () => onUser(input.value));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onUser(input.value);
    });
    setTimeout(startPeek, 600);
    })();
}, 1500);
const exists = (sel) => typeof sel === 'string' ? document.querySelector(sel) : !!sel;

// Optimized Reveal Helpers
const setupReveal = (selector) => {
    const elements = gsap.utils.toArray(selector);
    if (elements.length === 0) return;
    elements.forEach(el => el.classList.add('reveal'));
    
    ScrollTrigger.batch(elements, {
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true, onComplete: () => batch.forEach(el => el.classList.add('is-visible')) }),
        start: 'top 85%'
    });
};

const safeFrom = (selector, vars) => {
    const elements = gsap.utils.toArray(selector);
    if (elements.length === 0) return;
    
    ScrollTrigger.batch(elements, {
        onEnter: batch => {
            const defaults = {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.1,
                overwrite: true
            };
            const config = Object.assign({}, defaults, vars || {});
            if (config.scrollTrigger) delete config.scrollTrigger;
            gsap.from(batch, config);
        },
        start: (vars && vars.scrollTrigger && vars.scrollTrigger.start) || 'top 85%',
        once: true,
        // Proactively kill to free up memory
        onRefresh: self => self.progress === 1 && self.kill()
    });
};

// Phase 3: safeRepeat Helper for CPU Efficiency
// Automatically plays infinite animations only when in viewport
const safeRepeat = (selector, vars, triggerSelector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    
    const anim = gsap.to(selector, { 
        ...vars, 
        repeat: -1, 
        paused: true,
        overwrite: 'auto'
    });
    
    ScrollTrigger.create({
        trigger: triggerSelector || selector,
        start: 'top 110%',
        end: 'bottom -10%',
        onEnter: () => anim.play(),
        onLeave: () => anim.pause(),
        onEnterBack: () => anim.play(),
        onLeaveBack: () => anim.pause()
    });
    
    return anim;
};

const initTicker = (selector, duration = 40) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const wrapper = el.querySelector('.swiper-wrapper');
    if (!wrapper) return;
    if (!wrapper.dataset.tickerCloned) {
        wrapper.innerHTML += wrapper.innerHTML;
        wrapper.dataset.tickerCloned = 'true';
    }
    wrapper.style.setProperty('--ticker-duration', `${duration}s`);
    wrapper.classList.add('is-ticker');
};
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    const loaderContent = document.querySelector('.loader-content') || document.querySelector('.loader-text');
    const preloader = document.getElementById('preloader');
    if (loaderContent && preloader) {
        tl.to(loaderContent, {
            y: -50,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
            delay: 0.2
        })
            .to(preloader, {
                y: '-100%',
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: () => {
                    preloader.classList.add('loaded');
                    // Ensure Lenis is notified of the height change if any
                    if (typeof lenis !== 'undefined') lenis.resize();
                }
            }, "-=0.1");
    }

    // Safety fallback: If preloader is still there after 5 seconds, hide it
    // Safety fallback: If preloader is still there after 5 seconds, hide it
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('loaded')) {
            gsap.to(preloader, {
                y: '-100%',
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: () => {
                    preloader.classList.add('loaded');
                    if (typeof lenis !== 'undefined') lenis.resize();
                }
            });
        }
    }, 5000);

    tl.from('nav', {
        y: -80,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
    });

    const heroTitleSpans = document.querySelectorAll('.hero-title span');
    if (heroTitleSpans.length > 0) {
        tl.from(heroTitleSpans, {
            y: '100%',
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power4.out'
        }, "-=0.3");
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        tl.to(heroSubtitle, {
            y: 0,
            opacity: 0.8,
            duration: 0.5,
            ease: 'power2.out'
        }, "-=0.5");
    }
});


// Optimized Three.js Background Animation with IntersectionObserver
const initThreeJS = (containerId = 'hero-canvas') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let scene, camera, renderer, particlesMesh, material, clock;
    let requestID;
    let mouseX = 0, mouseY = 0;
    let initialized = false;

    const init = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        container.appendChild(renderer.domElement);

        const particlesGeometry = new THREE.BufferGeometry();
        const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.innerWidth < 768;
        // Reduced particle counts for lower CPU usage (40-60% reduction)
        const particlesCount = prefersReduce ? (isMobile ? 80 : 150) : (isMobile ? 220 : 550);
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 10;
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        material = new THREE.PointsMaterial({
            size: 0.015,
            color: isLight ? 0x0D0D0D : 0xD4AF37,
            transparent: true,
            opacity: 0.8,
        });

        particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);
        camera.position.z = 2;
        clock = new THREE.Clock();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);
        window.addEventListener('gap-theme-change', onThemeChange);
        initialized = true;
    };

    const onMouseMove = (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    };

    const onResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const onThemeChange = (e) => {
        const t = e && e.detail && e.detail.theme ? e.detail.theme : document.documentElement.getAttribute('data-theme');
        material.color.set(t === 'light' ? 0x0D0D0D : 0xD4AF37);
    };

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        particlesMesh.rotation.y = elapsedTime * (prefersReduce ? 0.025 : 0.05);
        particlesMesh.rotation.x = mouseY * 0.08;
        particlesMesh.rotation.y += mouseX * 0.08;
        renderer.render(scene, camera);
        requestID = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!initialized) init();
                tick();
            } else {
                cancelAnimationFrame(requestID);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);
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
initThreeJS('logo-hero-canvas');
initThreeJS('brochure-hero-canvas');
initThreeJS('newspaper-hero-canvas');
initThreeJS('fm-hero-canvas');
initThreeJS('case-study-hero-canvas');
initThreeJS('contact-hero-canvas');

// Scroll Animations
// Optimized Scroll Animations using Batching
const splitTypes = gsap.utils.toArray('[data-reveal-text]');
if (splitTypes.length > 0) {
    ScrollTrigger.batch(splitTypes, {
        onEnter: batch => gsap.from(batch, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: true
        }),
        start: 'top 85%',
        once: true,
        onRefresh: self => self.progress === 1 && self.kill()
    });
}

// Counter Animation
// Optimized Counter Animation using GSAP
const counters = document.querySelectorAll('.stat-number');
counters.forEach(counter => {
    const target = +counter.getAttribute('data-count');
    const obj = { value: 0 };
    
    ScrollTrigger.create({
        trigger: counter,
        start: "top 90%",
        onEnter: () => {
            gsap.to(obj, {
                value: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    counter.innerText = Math.ceil(obj.value);
                }
            });
        },
        once: true
    });
});

// Reusable 3D Scroll Effect Function
// Optimized 3D Scroll Effect using Batching
const apply3DScrollEffect = (selector, stagger = 0.1) => {
    const elements = gsap.utils.toArray(selector);
    if (elements.length === 0) return;

    ScrollTrigger.batch(elements, {
        onEnter: batch => gsap.fromTo(batch,
            { y: 20, opacity: 0, scale: 0.98 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: stagger,
                ease: 'power3.out',
                overwrite: true
            }
        ),
        start: 'top 95%',
        once: true,
        onRefresh: self => self.progress === 1 && self.kill()
    });

    elements.forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.02, duration: 0.2, ease: 'power2.out' }));
        el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1.0, duration: 0.2, ease: 'power2.out' }));
    });
};

// Load Services Section and Initialize Swiper
fetch('what-we-offer.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const servicesSection = doc.getElementById('services');
        if (servicesSection) {
            const container = document.getElementById('services-container');
            if (container) {
                container.innerHTML = servicesSection.outerHTML;

                // Use CSS ticker instead of Swiper for continuous marquee
                // Add a small delay to ensure DOM is ready and layout is calculated
                setTimeout(() => {
                    initTicker('.services-swiper', 40);
                }, 300);
            }
        }
    })
    .catch(err => console.error('Failed to load services:', err));

(() => {
    initTicker('.projects-swiper', 40);
})();

(() => {
    initTicker('.partners-swiper', 40);
})();

// Unified Workflow Section Animation
(() => {
    const sections = document.querySelectorAll('.workflow-section');
    if (sections.length === 0) return;

    sections.forEach(section => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                once: true
            }
        });

        const label = section.querySelector('.section-label');
        const heading = section.querySelector('h2');
        const steps = section.querySelectorAll('.workflow-step');
        const connectors = section.querySelectorAll('.workflow-connector');

        if (label) {
            tl.from(label, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        }

        if (heading) {
            tl.from(heading, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, label ? '-=0.4' : '0');
        }

        if (steps.length > 0) {
            tl.from(steps, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'back.out(1.2)'
            }, '-=0.2');
        }

        if (connectors.length > 0) {
            tl.to(connectors, {
                scaleX: 1,
                duration: 1,
                stagger: 0.3,
                ease: 'expo.out'
            }, '-=0.8');
        }
    });
})();

safeFrom('.hero .hero-subtitle');


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
safeFrom('#ecom-offer h2', {
    scrollTrigger: {
        trigger: '#ecom-offer',
        start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
});
safeFrom('#ecom-offer p', {
    scrollTrigger: {
        trigger: '#ecom-offer',
        start: 'top 80%'
    },
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12
});
safeFrom('.logo-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.logo-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.logo-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.logo-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.logo-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.logo-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('#logo-process h2', {
    scrollTrigger: {
        trigger: '#logo-process',
        start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
});
safeFrom('#logo-process p', {
    scrollTrigger: {
        trigger: '#logo-process',
        start: 'top 80%'
    },
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12
});
safeFrom('.brochure-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.brochure-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.brochure-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.brochure-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.brochure-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.brochure-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('#brochure-process h2', {
    scrollTrigger: {
        trigger: '#brochure-process',
        start: 'top 80%'
    },
    y: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
});
safeFrom('#brochure-process p', {
    scrollTrigger: {
        trigger: '#brochure-process',
        start: 'top 80%'
    },
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12
});
safeFrom('.newspaper-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.newspaper-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.newspaper-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.newspaper-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.newspaper-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.newspaper-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.fm-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.fm-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.fm-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.fm-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.fm-hero .hero-contacts .cta-button', {
    scrollTrigger: {
        trigger: '.fm-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.15
});
safeFrom('.case-study-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.case-study-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.case-study-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.case-study-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});
safeFrom('.contact-hero .page-hero-content h1', {
    scrollTrigger: {
        trigger: '.contact-hero',
        start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});
safeFrom('.contact-hero .hero-subtitle', {
    scrollTrigger: {
        trigger: '.contact-hero',
        start: 'top 80%'
    },
    y: 20,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
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
; (() => {
    const imageGrid = document.querySelector('.image-grid');
    if (imageGrid) {
        safeFrom('.image-card', {
            scrollTrigger: {
                trigger: imageGrid,
                start: 'top 85%'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }
})();

// Workflow section safeFrom handled in unified animation
; (() => {
    const newsSvg1 = document.querySelector('.newspaper-illustration svg');
    const newsSvg2 = document.querySelector('.newspaper-illustration-2 svg');
    if (newsSvg1) {
        safeRepeat('.newspaper-illustration .progress-fill', { attr: { width: 300 }, duration: 2.2, ease: 'power1.inOut', yoyo: true });
        
        gsap.fromTo('.newspaper-illustration .paper-layout rect', { opacity: 0.5 }, {
            opacity: 0.9,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power1.out',
            scrollTrigger: { trigger: '.newspaper-illustration', start: 'top 85%', once: true }
        });

        safeRepeat('.newspaper-illustration .ads line', { x: 4, duration: 1.6, yoyo: true, stagger: 0.1, ease: 'sine.inOut' }, '.newspaper-illustration');
        safeRepeat('.newspaper-illustration .ads circle', { scale: 1.05, transformOrigin: '50% 50%', duration: 1.4, yoyo: true, ease: 'sine.inOut' }, '.newspaper-illustration');
        safeFrom('.newspaper-illustration svg', {
            scrollTrigger: { trigger: '.newspaper-illustration', start: 'top 85%' },
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
    if (newsSvg2) {
        safeRepeat('.newspaper-illustration-2 .progress-fill-2', { attr: { width: 300 }, duration: 2.2, ease: 'power1.inOut', yoyo: true });
        safeRepeat('.newspaper-illustration-2 .billboard line', { x: 3, duration: 1.6, yoyo: true, stagger: 0.1, ease: 'sine.inOut' }, '.newspaper-illustration-2');
        safeFrom('.newspaper-illustration-2 svg', {
            scrollTrigger: { trigger: '.newspaper-illustration-2', start: 'top 85%' },
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
})();
; (() => {
    const fmSvg = document.querySelector('.fm-illustration svg');
    if (!fmSvg) return;
    safeRepeat('.fm-illustration .progress-fill', { attr: { width: 300 }, duration: 2.2, ease: 'power1.inOut', yoyo: true });
    safeRepeat('.fm-illustration .eq-bars rect', { scaleY: 1.3, transformOrigin: '50% 100%', duration: 0.8, yoyo: true, stagger: 0.1, ease: 'sine.inOut' }, '.fm-illustration');
    safeRepeat('.fm-illustration .radio-dial', { rotate: 18, transformOrigin: '50% 50%', duration: 1.6, yoyo: true, ease: 'sine.inOut' }, '.fm-illustration');
    const waves = document.querySelectorAll('.fm-illustration .wave');
    waves.forEach((w, i) => {
        const len = w.getTotalLength ? w.getTotalLength() : 200;
        w.style.strokeDasharray = `${len}`;
        w.style.strokeDashoffset = `${len}`;
        safeRepeat(w, { strokeDashoffset: 0, duration: 2 + i * 0.3, yoyo: true, ease: 'power1.inOut' }, '.fm-illustration');
    });
    safeFrom('.fm-illustration svg', {
        scrollTrigger: { trigger: '.fm-illustration', start: 'top 85%' },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
})();

; (() => {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    safeFrom('.contact-card', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out'
    });
    safeFrom('.contact-form-card', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const country = data.get('country_code') || '';
        const rawPhone = data.get('phone') || '';
        const fullPhone = `${country} ${rawPhone}`.trim();
        data.set('phone', fullPhone);
        data.append('source', 'Website Contact Form');
        data.append('_to', 'admin@goldenadvertising.in');
        data.append('_subject', 'New form submission on GAP');
        const email = data.get('email');
        if (email) data.append('_replyto', email);
        fetch('https://formspree.io/f/xjgewnpo', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: data
        }).then((response) => {
            if (response.ok) {
                form.reset();
                showSuccessPopup('Your enquiry has been submitted.');
            } else {
                alert('Unable to send message. Please email contact@goldenadvertising.in directly.');
            }
        }).catch(() => {
            alert('Unable to send message. Please email contact@goldenadvertising.in directly.');
        });
    });
})();
; (() => {
    const brochureSvg = document.querySelector('.brochure-illustration svg');
    if (brochureSvg) {
        safeRepeat('.brochure-illustration .progress-fill', { attr: { width: 300 }, duration: 2.2, ease: 'power1.inOut', yoyo: true });
        gsap.fromTo('.brochure-illustration .brochure-pages rect', {
            opacity: 0.4
        }, {
            opacity: 0.8,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power1.out'
        });
        safeRepeat('.brochure-illustration .brochure-content line', { x: 4, duration: 1.6, yoyo: true, stagger: 0.1, ease: 'sine.inOut' }, '.brochure-illustration');
        safeRepeat('.brochure-illustration .brochure-content rect', { scale: 1.03, transformOrigin: '50% 50%', duration: 1.6, yoyo: true, ease: 'sine.inOut' }, '.brochure-illustration');
        safeFrom('.brochure-illustration svg', {
            scrollTrigger: {
                trigger: '.brochure-illustration',
                start: 'top 85%'
            },
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
})();
; (() => {
    const processSvg = document.querySelector('.brochure-process-illustration svg');
    if (!processSvg) return;
    safeRepeat('.brochure-process-illustration .step-card', { y: 0, opacity: 1, duration: 1.2, ease: 'sine.inOut', yoyo: true, stagger: 0.12 }, '.brochure-process-illustration');
    safeRepeat('.brochure-process-illustration .flow-arrow', { opacity: 1, duration: 1.4, ease: 'sine.inOut', yoyo: true, stagger: 0.2 }, '.brochure-process-illustration');
    safeFrom('.brochure-process-illustration svg', {
        scrollTrigger: {
            trigger: '.brochure-process-illustration',
            start: 'top 85%'
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
})();
; (() => {
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

; (() => {
    const ecomSvg = document.querySelector('.ecom-illustration svg');
    if (ecomSvg) {
        safeRepeat('.ecom-illustration .cart', { x: 20, duration: 2, yoyo: true, ease: 'sine.inOut' });
        safeRepeat('.ecom-illustration .progress-fill', { attr: { width: 280 }, duration: 2.2, ease: 'power1.inOut', yoyo: true });
        safeRepeat('.ecom-illustration .progress-fill-2', { attr: { width: 220 }, duration: 2.0, ease: 'power1.inOut', yoyo: true });
        safeRepeat('.ecom-illustration .boxes rect', { y: '-=5', duration: 1.6, yoyo: true, stagger: 0.2, ease: 'sine.inOut' }, '.ecom-illustration');
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

; (() => {
    const offerSvg = document.querySelector('.ecom-offer-illustration svg');
    if (!offerSvg) return;
    safeRepeat('.ecom-offer-illustration .offer-bar-fill', { attr: { width: 220 }, duration: 2.0, ease: 'power1.inOut', yoyo: true, stagger: 0.2 }, '.ecom-offer-illustration');
    safeRepeat('.ecom-offer-illustration .offer-dot', { y: -4, duration: 1.4, ease: 'sine.inOut', yoyo: true, stagger: 0.15 }, '.ecom-offer-illustration');
    safeFrom('.ecom-offer-illustration svg', {
        scrollTrigger: {
            trigger: '.ecom-offer-illustration',
            start: 'top 85%'
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
})();

; (() => {
    const logoSvg = document.querySelector('.logo-illustration svg');
    if (!logoSvg) return;
    safeRepeat('.logo-illustration .logo-mark', { scale: 1.08, transformOrigin: '50% 50%', duration: 1.6, yoyo: true, ease: 'sine.inOut' });
    safeRepeat('.logo-illustration .progress-fill', { attr: { width: 300 }, duration: 2.4, ease: 'power1.inOut', yoyo: true });
    safeRepeat('.logo-illustration .pen', { x: 6, y: 4, duration: 1.8, yoyo: true, ease: 'sine.inOut' });
    safeFrom('.logo-illustration svg', {
        scrollTrigger: {
            trigger: '.logo-illustration',
            start: 'top 85%'
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
})();
; (() => {
    const processSvg = document.querySelector('.logo-process-illustration svg');
    if (!processSvg) return;
    safeRepeat('.logo-process-illustration .step-dot', { scale: 1.1, opacity: 1, duration: 1.4, ease: 'sine.inOut', yoyo: true, stagger: 0.15 }, '.logo-process-illustration');
    safeRepeat('.logo-process-illustration .logo-tiles rect', { y: 0, opacity: 1, duration: 1.2, ease: 'sine.inOut', yoyo: true, stagger: 0.12 }, '.logo-process-illustration');
    safeRepeat('.logo-process-illustration .final-mark', { scale: 1.06, duration: 1.6, transformOrigin: '50% 50%', yoyo: true, ease: 'sine.inOut' }, '.logo-process-illustration');
    safeFrom('.logo-process-illustration svg', {
        scrollTrigger: {
            trigger: '.logo-process-illustration',
            start: 'top 85%'
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    });
})();
; (() => {
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

// Apply 3D effect to all card types across the project
apply3DScrollEffect('.package-card');
apply3DScrollEffect('.adv-card');
apply3DScrollEffect('.service-card');
apply3DScrollEffect('.case-study-card');
apply3DScrollEffect('.blog-card');
apply3DScrollEffect('.feature-card');
apply3DScrollEffect('.contact-card');
apply3DScrollEffect('.contact-form-card');
// apply3DScrollEffect('.workflow-step'); removed for unified entrance animation
// Disabling hover scale for project marquee images per user request
apply3DScrollEffect('.projects-marquee .image-card', 0, false);
apply3DScrollEffect('.image-card:not(.projects-marquee .image-card)');

apply3DScrollEffect('.stat-item');
apply3DScrollEffect('.anim-card');
apply3DScrollEffect('.testimonial-card');
// Partners and Contact sections
// Skip 3D effect on partners to keep ticker smooth
// Keeping 3D effect limited to primary cards to save CPU
// apply3DScrollEffect('#contact p', 0, false);
// apply3DScrollEffect('h1:not(.logo-name)', 0, false);
// apply3DScrollEffect('h2', 0, false);
// apply3DScrollEffect('h3:not(.service-title)', 0, false);
// apply3DScrollEffect('h4', 0, false);
// apply3DScrollEffect('p:not(.logo-tagline):not(.hero-subtitle)', 0, false);
// apply3DScrollEffect('li', 0, false);

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


// Dedicated Team Section reveal (ensures smooth stagger and avoids overlap)
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

; (() => {
    const mount = () => {
        if (document.getElementById('enquiry-modal')) return;
        const html = `
        <div id="enquiry-modal" class="enquiry-modal" aria-hidden="true">
          <div class="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
            <button class="enquiry-close" type="button" aria-label="Close">×</button>
            <h3 id="enquiry-title" class="enquiry-title">Quick Enquiry</h3>
            <form class="enquiry-form" method="POST" action="https://formspree.io/f/xjgewnpo">
              <div class="enquiry-row">
                <input type="text" name="name" placeholder="Your Name" required />
                <input type="tel" name="phone" placeholder="Phone" required />
              </div>
              <div class="enquiry-row">
                <input type="email" name="email" placeholder="Email" required />
                <select name="service" class="select-gradient-text" required>
                  <option value="">Select a Service</option>
                  <option>Search Engine Optimization (SEO)</option>
                  <option>Social Media Marketing</option>
                  <option>Website Development</option>
                  <option>E‑Commerce Website Development</option>
                  <option>Logo Designing</option>
                  <option>Brochure Designing</option>
                  <option>Newspaper Advertising</option>
                  <option>FM Advertising</option>
                </select>
              </div>
              <textarea name="message" placeholder="Tell us briefly about your requirement" required></textarea>
              <div class="enquiry-hint">We will get back to you soon.</div>
              <button type="submit" class="cta-button cta-button--block"><span class="btn-text">Submit</span></button>
            </form>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    };
    const open = () => {
        mount();
        const modal = document.getElementById('enquiry-modal');
        const dialog = modal.querySelector('.enquiry-dialog');
        modal.classList.add('active');
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        gsap.fromTo(dialog, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
    };
    const close = () => {
        const modal = document.getElementById('enquiry-modal');
        if (!modal) return;
        const dialog = modal.querySelector('.enquiry-dialog');
        gsap.to(dialog, { y: 30, opacity: 0, duration: 0.25, ease: 'power2.in' });
        gsap.to(modal, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => modal.classList.remove('active') });
    };
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.cta-button');
        if (btn) {
            const txt = btn.querySelector('.btn-text') ? btn.querySelector('.btn-text').textContent.trim().toLowerCase() : '';
            const trigger = btn.hasAttribute('data-enquiry-trigger') || txt.includes('quick enquiry') || txt.includes('start your project');
            if (trigger) {
                e.preventDefault();
                open();
                return;
            }
        }
        if (e.target.id === 'enquiry-modal') {
            close();
        }
        if (e.target.classList && e.target.classList.contains('enquiry-close')) {
            e.preventDefault();
            close();
        }
    });
    document.addEventListener('submit', (e) => {
        const form = e.target.closest('.enquiry-form');
        if (!form) return;
        e.preventDefault();
        const data = new FormData(form);
        data.append('source', 'Quick Enquiry Modal');
        data.append('_to', 'admin@goldenadvertising.in');
        data.append('_subject', 'New quick enquiry on GAP');
        const email = data.get('email');
        if (email) data.append('_replyto', email);
        fetch('https://formspree.io/f/xjgewnpo', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: data
        }).then((response) => {
            if (response.ok) {
                form.reset();
                const hint = form.querySelector('.enquiry-hint');
                if (hint) {
                    hint.textContent = 'Your enquiry has been submitted.';
                }
                showSuccessPopup('Your enquiry has been submitted.');
            } else {
                alert('Unable to send enquiry. Please email contact@goldenadvertising.in directly.');
            }
        }).catch(() => {
            alert('Unable to send enquiry. Please email contact@goldenadvertising.in directly.');
        });
    });
})();

; (() => {
    // Home Page Specific Scroll Animations

    // Helper to wrap characters for split text
    const wrapChars = (element) => {
        element.style.display = 'inline-block';
        element.style.overflow = 'hidden';
        element.style.verticalAlign = 'top';
        const text = element.textContent;
        element.innerHTML = '';
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.transform = 'translateY(100%)';
            span.style.opacity = '0';
            element.appendChild(span);
        });
    };

    // Workflow section animation handled by unified logic below

    // Workflow Steps Animation handled by apply3DScrollEffect() in main scope

    // Stats Banner - Rolling Numbers & Fade
    safeFrom('.stats-banner', {
        scrollTrigger: { trigger: '.stats-banner', start: 'top 90%' },
        y: 30, opacity: 0, duration: 1, ease: 'power3.out'
    });

    // Projects Section - Parallax & Reveal
    safeFrom('.projects-section .cta-button', {
        scrollTrigger: { trigger: '.projects-section', start: 'top 80%' },
        x: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power3.out'
    });

    // Enhanced Project Card Animation - Staggered Reveal
    const projectCards = document.querySelectorAll('.projects-grid .image-card');
    if (projectCards.length > 0) {
        gsap.set(projectCards, { y: 100, opacity: 0 }); // Initial state

        ScrollTrigger.batch(projectCards, {
            onEnter: batch => gsap.to(batch, {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power4.out',
                overwrite: true
            }),
            start: 'top 80%',
            once: true,
            onRefresh: self => self.progress === 1 && self.kill()
        });
    }

    // Partners Section - Staggered Logo Reveal
    safeFrom('.partners-swiper', {
        scrollTrigger: { trigger: '.partners-section', start: 'top 80%' },
        y: 30, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out'
    });

    // Contact Section CTA Reveal
    const contactBtn = document.querySelector('#contact .cta-button');
    if (contactBtn) {
        safeFrom('#contact .cta-button', {
            scrollTrigger: { trigger: '#contact', start: 'top 80%' },
            y: 20, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out'
        });
    }
})();
