// Utilities for continuous scrolling tickers
const initTicker = (selector, duration = 40) => {
    const swiper = document.querySelector(selector);
    if (!swiper) return;
    const wrapper = swiper.querySelector('.swiper-wrapper');
    if (!wrapper) return;

    if (!wrapper.dataset.tickerCloned) {
        const ogContent = wrapper.innerHTML;
        wrapper.innerHTML = ogContent + ogContent + ogContent + ogContent;
        wrapper.dataset.tickerCloned = "true";
    }
    wrapper.style.setProperty('--ticker-duration', `${duration}s`);
    wrapper.classList.add('is-ticker');
};

const yieldTask = (fn) => {
    if (window.requestIdleCallback) {
        requestIdleCallback(() => fn(), { timeout: 2000 });
    } else {
        setTimeout(fn, 1);
    }
};

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// Theme Toggle
; (() => {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const setTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('gap-theme-v2', theme); } catch (_) { }
        try {
            window.dispatchEvent(new CustomEvent('gap-theme-change', { detail: { theme } }));
        } catch (_) { }
    };
    const initTheme = () => {
        let saved = null;
        try { saved = localStorage.getItem('gap-theme-v2'); } catch (_) { }
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
if (window.innerWidth > 768) {
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

gsap.ticker.lagSmoothing(500, 33);
gsap.defaults({
    ease: "power3.out",
    duration: 1.2
});

// Page Transition Logic
(() => {
    let transitionEl = document.querySelector('.page-transition');
    if (!transitionEl) {
        transitionEl = document.createElement('div');
        transitionEl.className = 'page-transition';
        document.body.appendChild(transitionEl);
    }
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (target === '_blank' || e.ctrlKey || e.metaKey) return;
        if (link.hostname !== window.location.hostname) return;
        e.preventDefault();
        gsap.to(transitionEl, {
            y: '0%',
            duration: 0.6,
            ease: 'power4.inOut',
            onComplete: () => {
                window.location.href = link.href;
            }
        });
    });
    gsap.set(transitionEl, { y: '100%' });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            gsap.set(transitionEl, { y: '100%', clearProps: "transform" });
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('loaded');
                gsap.set(preloader, { y: '-100%', opacity: 0 });
            }
        }
    });
})();

// Mobile Nav
(() => {
    const nav = document.querySelector('nav');
    const navToggle = document.getElementById('nav-toggle');
    const links = document.querySelectorAll('.nav-links .nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');
    if (!nav || !navToggle) return;
    const closeMenu = () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        dropdowns.forEach(d => d.classList.remove('active'));
    };
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.forEach(link => link.addEventListener('click', closeMenu));
    document.querySelectorAll('.dropdown-content a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
})();

// Success Popup
let successPopupOverlay = null;
let successPopupTimeout = null;
const showSuccessPopup = (message) => {
    if (!successPopupOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'success-popup-overlay';
        overlay.innerHTML = `
            <div class="success-popup">
                <div class="success-popup-icon">✓</div>
                <div class="success-popup-message"></div>
                <button type="button" class="success-popup-close">Close</button>
            </div>`;
        document.body.appendChild(overlay);
        const hide = () => overlay.classList.remove('active');
        overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });
        overlay.querySelector('.success-popup-close').addEventListener('click', hide);
        successPopupOverlay = overlay;
    }
    successPopupOverlay.querySelector('.success-popup-message').textContent = message;
    successPopupOverlay.classList.add('active');
    if (successPopupTimeout) clearTimeout(successPopupTimeout);
    successPopupTimeout = setTimeout(() => successPopupOverlay.classList.remove('active'), 2200);
};

// Chatbot UI
const initNonCriticalUI = () => {
    (() => {
        const makeEl = (tag, cls) => {
            const el = document.createElement(tag);
            if (cls) el.className = cls;
            return el;
        };
        const darkAvatarSrc = './assets/alien_chatbot_icon.webp';
        const lightAvatarSrc = './assets/Light_chatbot.webp';
        const widget = makeEl('div', 'chat-widget');
        const toggle = makeEl('button', 'chat-toggle');
        const avatar = document.createElement('img');
        avatar.className = 'avatar-img';
        const updateAvatarForTheme = (theme) => {
            const t = theme || document.documentElement.getAttribute('data-theme') || 'dark';
            avatar.src = t === 'light' ? lightAvatarSrc : darkAvatarSrc;
        };
        updateAvatarForTheme();
        avatar.alt = 'Assistant';
        avatar.width = 140;
        toggle.appendChild(avatar);
        const panel = makeEl('div', 'chat-panel');
        panel.innerHTML = `
            <div class="chat-header"><div class="chat-title">GAP Assistant</div><button class="chat-close">×</button></div>
            <div class="chat-body"></div>
            <div class="chat-footer"><input type="text" class="chat-input" placeholder="Type a message..." disabled /><button class="chat-send" disabled>Send</button></div>`;
        widget.innerHTML += `<div class="chat-prompt"><span class="chat-prompt-label">Chat now</span><span class="chat-prompt-dots"><span></span><span></span><span></span></span></div>`;
        widget.appendChild(toggle);
        document.body.appendChild(widget);
        document.body.appendChild(panel);

        const body = panel.querySelector('.chat-body');
        const input = panel.querySelector('.chat-input');
        const send = panel.querySelector('.chat-send');
        const closeBtn = panel.querySelector('.chat-close');
        const tip = widget.querySelector('.chat-prompt');

        let chatLog = [];
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
                        input.disabled = false;
                        send.disabled = false;
                        input.placeholder = 'Type a message...';
                    }
                    onUser(t);
                });
                wrap.appendChild(chip);
            });
            body.appendChild(wrap);
            body.scrollTop = body.scrollHeight;
        };

        let expectingName = false, clientName = '', expectingPhone = false, clientPhone = '', expectingPhoneCountry = false, countryCode = '';

        const reply = (text) => {
            const t = text.toLowerCase();
            if (/website|logo|marketing|seo|google ads|social|brochure|training/.test(t)) return 'That sounds like a great project. We specialize in high-impact results for that service.';
            if (/(price|cost|rate|quote)/.test(t)) return 'We prepare tailored quotes after a quick chat. What service do you need?';
            return 'I can help with services, pricing, and contact. What would you like to know?';
        };

        const onUser = (text) => {
            if (!text || !text.trim()) return;
            const val = text.trim();
            addMsg(val, 'user');
            if (expectingName) {
                clientName = val; expectingName = false;
                addMsg(`Nice to meet you, ${clientName}!`, 'bot');
                setTimeout(() => {
                    addMsg('Please share your country code.', 'bot');
                    expectingPhoneCountry = true;
                    input.type = "tel"; input.placeholder = "+91";
                    addSuggestions(["+91", "+1", "Others"]);
                }, 250);
            } else if (expectingPhoneCountry) {
                countryCode = val; expectingPhoneCountry = false;
                addMsg(`Got it: ${countryCode}`, 'bot');
                setTimeout(() => {
                    addMsg("Now enter your phone number.", "bot");
                    expectingPhone = true; input.placeholder = "Phone number";
                }, 250);
            } else if (expectingPhone) {
                clientPhone = val; expectingPhone = false;
                input.type = "text"; input.placeholder = "Type a message...";
                addMsg(`Thanks, we'll reach out soon at ${countryCode} ${clientPhone}.`, 'bot');
                // sendChatToFormspree(chatLog, clientName, countryCode, clientPhone);
            } else {
                addMsg(reply(val), 'bot');
                setTimeout(() => {
                    addMsg('May I know your name?', 'bot');
                    expectingName = true; input.placeholder = 'Your name';
                }, 250);
            }
            input.value = '';
        };

        const open = () => {
            panel.classList.add('open');
            if (!panel.dataset.init) {
                addMsg('What are you looking for?', 'bot');
                addSuggestions(['Website Designing', 'Logo Designing', 'Digital Marketing', 'Others']);
                panel.dataset.init = '1';
            }
        };
        const close = () => panel.classList.remove('open');
        toggle.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
        closeBtn.addEventListener('click', close);
        send.addEventListener('click', () => onUser(input.value));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') onUser(input.value); });
    })();
};

if (window.requestIdleCallback) requestIdleCallback(initNonCriticalUI, { timeout: 3000 });
else setTimeout(initNonCriticalUI, 2000);

// Animation Helpers
const safeFrom = (selector, vars) => {
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    if (!els || els.length === 0) return;
    els.forEach(el => {
        const defaults = {
            y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', force3D: true,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true, fastScrollEnd: true }
        };
        gsap.from(el, Object.assign({}, defaults, vars || {}));
    });
};

// Three.js Background
const initThreeJS = (container) => {
    if (!container) return;
    // Load immediately if visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startThreeJS(container);
                observer.unobserve(container);
            }
        });
    }, { rootMargin: '200px' });
    observer.observe(container);
    // Fallback for hero containers that are already in view
    if (container.classList.contains('hero-background') || container.id.includes('hero')) {
        setTimeout(() => startThreeJS(container), 100);
    }
};

const startThreeJS = (container) => {
    if (typeof THREE === 'undefined') {
        // If not loaded yet, wait for library sync (now handled by index.html queue)
        setTimeout(() => startThreeJS(container), 200);
        return;
    }
    if (container.querySelector('canvas')) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    camera.position.z = 2;
    const particlesCount = window.innerWidth < 768 ? 200 : 700;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 10;
    const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const mat = new THREE.PointsMaterial({ size: 0.015, color: document.documentElement.getAttribute('data-theme') === 'light' ? 0x0D0D0D : 0xD4AF37, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Points(geom, mat); scene.add(mesh);
    const clock = new THREE.Clock();
    const tick = () => {
        requestAnimationFrame(tick);
        const elapsed = clock.getElapsedTime();
        mesh.rotation.y = elapsed * 0.04;
        renderer.render(scene, camera);
    };
    tick();
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

// Initializers
const initAll = () => {
    const tl = gsap.timeline();
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('loaded')) {
        tl.to('.loader-content', { y: -30, opacity: 0, duration: 0.3 })
          .to(preloader, { y: '-100%', duration: 0.4, ease: 'power4.inOut', onComplete: () => {
              preloader.classList.add('loaded');
              if (window.lenis) window.lenis.resize();
          }}, "-=0.05");
    }
    tl.from('nav', { y: -80, opacity: 0, duration: 0.3 }, "-=0.6");
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) tl.fromTo(heroSubtitle, { y: 20, opacity: 0 }, { y: 0, opacity: 0.8, duration: 0.5 }, "-=0.7");

    // Start All Backgrounds immediately
    document.querySelectorAll('.hero-background, [id$="-canvas"]').forEach(c => initThreeJS(c));
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Scroll Reveal
yieldTask(() => {
    document.querySelectorAll('[data-reveal-text]').forEach(el => {
        gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 80%', once: true }, y: 50, opacity: 0, duration: 1 });
    });
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = +el.getAttribute('data-count');
        const obj = { v: 0 };
        gsap.to(obj, { v: target, duration: 2, scrollTrigger: { trigger: el, start: "top 85%", once: true }, onUpdate: () => el.innerText = Math.ceil(obj.v) });
    });
});

// Service Hero Animations
const services = ['.about-hero', '.services-hero', '.seo-hero', '.smm-hero', '.ppc-hero', '.ecommerce-hero', '.logo-hero', '.brochure-hero', '.newspaper-hero', '.fm-hero', '.case-study-hero', '.contact-hero'];
services.forEach(s => {
    safeFrom(`${s} h1`, { y: 40 });
    safeFrom(`${s} .hero-subtitle`, { delay: 0.1 });
    safeFrom(`${s} .cta-button`, { stagger: 0.1, delay: 0.2 });
});

// Forms
(() => {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        fetch('https://formspree.io/f/xjgewnpo', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
            .then(res => { if (res.ok) { form.reset(); showSuccessPopup('Submitted!'); } });
    });
})();

// Tickers
yieldTask(() => {
    initTicker('.services-swiper', 40);
    initTicker('.partners-swiper', 30);
});

// Modal & Enquiry Trigger
(() => {
    const injectModal = () => {
        if (document.getElementById('enquiry-modal')) return;
        const html = `
        <div id="enquiry-modal" class="enquiry-modal" aria-hidden="true">
          <div class="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
            <button class="enquiry-close" type="button" aria-label="Close">×</button>
            <h3 id="enquiry-title" class="enquiry-title">Quick Enquiry</h3>
            <form class="enquiry-form">
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

    const openModal = () => {
        injectModal();
        const modal = document.getElementById('enquiry-modal');
        if (modal) {
            modal.classList.add('active');
            gsap.fromTo(modal.querySelector('.enquiry-dialog'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
        }
    };
    const closeModal = () => {
        const modal = document.getElementById('enquiry-modal');
        if (modal) {
            gsap.to(modal.querySelector('.enquiry-dialog'), { y: 30, opacity: 0, duration: 0.25, ease: "power2.in" });
            gsap.to(modal, { opacity: 0, duration: 0.2, onComplete: () => {
                modal.classList.remove('active');
                gsap.set(modal, { opacity: 1 });
            }});
        }
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.cta-button, .service-link, .nav-link');
        if (btn) {
            const text = btn.textContent.toLowerCase();
            if (btn.hasAttribute('data-enquiry-trigger') || 
                text.includes('enquiry') || 
                text.includes('start your project') || 
                text.includes('book a call')) {
                e.preventDefault();
                openModal();
            }
        }
        if (e.target.id === 'enquiry-modal' || e.target.classList.contains('enquiry-close')) {
            e.preventDefault();
            closeModal();
        }
    });

    document.addEventListener('submit', (e) => {
        const form = e.target.closest('.enquiry-form');
        if (!form) return;
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if(btn) btn.disabled = true;
        const formData = new FormData(form);
        formData.append("source", "Quick Enquiry Modal - " + window.location.pathname);
        fetch('https://formspree.io/f/xjgewnpo', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        }).then(res => {
            if (res.ok) {
                form.reset();
                showSuccessPopup("Your enquiry has been submitted.");
                closeModal();
            } else {
                alert("Submission failed. Please try again.");
            }
        }).finally(() => { if(btn) btn.disabled = false; });
    });
})();
})();
