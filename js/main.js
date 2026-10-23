document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSiteChrome();
    initEmailProtection();
    setActiveNavLink();
    initHeroBackgroundSlider();
    initContactForm();
    initTopicFields();
});

function initNavigation() {
    const button = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (!button || !nav) return;

    let closeTimer = null;
    const openMenu = () => {
        if (closeTimer) window.clearTimeout(closeTimer);
        nav.classList.remove('hidden');
        requestAnimationFrame(() => nav.classList.add('is-open'));
        button.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-label', 'Menü bezárása');
        nav.setAttribute('aria-hidden', 'false');
    };
    const closeMenu = () => {
        nav.classList.remove('is-open');
        button.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Menü megnyitása');
        nav.setAttribute('aria-hidden', 'true');
        closeTimer = window.setTimeout(() => {
            if (!nav.classList.contains('is-open')) nav.classList.add('hidden');
        }, 300);
    };

    button.addEventListener('click', () => {
        if (button.getAttribute('aria-expanded') === 'true') closeMenu();
        else openMenu();
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 768 && button.getAttribute('aria-expanded') === 'true') closeMenu(); });
}

function initSiteChrome() {
    const header = document.querySelector('.site-header');
    const backToTop = document.getElementById('back-to-top');
    const footer = document.querySelector('.site-footer');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = () => {
        const scrolled = window.scrollY > 24;
        if (header) header.classList.toggle('is-scrolled', scrolled);
        if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 420);
        if (backToTop && footer) backToTop.style.setProperty('--lift', Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) + 'px');
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-desktop-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-accent', 'font-bold');
            link.classList.remove('text-gray-300');
        }
    });
}

function initEmailProtection() {
    const user = "advisuals.contact";
    const domain = "gmail.com";
    document.querySelectorAll('.protected-email').forEach(container => {
        const fullEmail = `${user}@${domain}`;
        if (container.tagName === 'A') {
            container.href = `mailto:${fullEmail}`;
            container.textContent = fullEmail;
        } else {
            container.textContent = fullEmail;
        }
    });
}

function initHeroBackgroundSlider() {
    const heroBg = document.getElementById('hero-bg');
    if (!heroBg) return;

    const images = [
        { src: "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792327313/mrc26_5muhi_6.jpg", alt: "MRC 2026 5. forduló – Muhi" },
        { src: "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792319961/mrc26_3viszlo_1.jpg", alt: "MRC 2026 3. forduló – Viszló-Hidvégardó" },
        { src: "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792327305/mrc26_5muhi_1.jpg", alt: "MRC 2026 5. forduló – Muhi" }
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || images.length < 2) return;

    const fadeMs = 700;
    let index = 0;
    let direction = -1; // első kép balra, majd jobbra, folyamatosan váltva
    let swapping = false;

    images.forEach(item => {
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = item.src;
    });

    function startPan() {
        const from = direction < 0 ? '1.6%' : '-1.6%';
        const to = direction < 0 ? '-1.6%' : '1.6%';
        heroBg.style.setProperty('--pan-from', from);
        heroBg.style.setProperty('--pan-to', to);
        heroBg.classList.remove('hero-pan');
        void heroBg.offsetWidth;
        heroBg.classList.add('hero-pan');
    }

    function moveToNext() {
        if (swapping) return;
        swapping = true;
        heroBg.style.opacity = '0';
        window.setTimeout(() => {
            index = (index + 1) % images.length;
            const item = images[index];
            const preload = new Image();
            preload.decoding = 'async';
            const apply = () => {
                heroBg.classList.remove('hero-pan');
                heroBg.src = item.src;
                heroBg.alt = item.alt;
                heroBg.style.opacity = '.92';
                direction *= -1;
                swapping = false;
                startPan();
            };
            preload.onload = apply;
            preload.onerror = apply;
            preload.src = item.src;
        }, fadeMs);
    }

    heroBg.addEventListener('animationend', event => {
        if (event.animationName === 'heroPan') moveToNext();
    });
    startPan();
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;   // ha az oldalon nincs űrlap, nem csinál semmit

    const status = document.getElementById('form-status');
    const button = document.getElementById('submit-btn');
    const defaultLabel = button.textContent;

    function showStatus(message, isError) {
        status.textContent = message;
        status.className = 'text-sm rounded-xl px-4 py-3 border ' + (isError
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-green-500/10 border-green-500/30 text-green-300');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();          // megállítja az átirányítást a Formspree oldalára
        button.disabled = true;
        button.textContent = 'Küldés...';
        status.className = 'hidden';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                form.reset();
                showStatus('Köszönöm az üzeneted! Hamarosan válaszolok.', false);
            } else {
                showStatus('Valami hiba történt a küldéskor. Próbáld újra, vagy írj közvetlenül az e-mail-címemre.', true);
            }
        } catch (error) {
            showStatus('Nem sikerült elküldeni. Ellenőrizd az internetkapcsolatot, vagy írj közvetlenül az e-mail-címemre.', true);
        } finally {
            button.disabled = false;
            button.textContent = defaultLabel;
        }
    });
}

function initTopicFields() {
    const topic = document.getElementById('topic');
    if (!topic) return;

    const groups = document.querySelectorAll('[data-topic-group]');

    function update() {
        //rally / car / other
        const selected = topic.options[topic.selectedIndex].dataset.group;

        groups.forEach(group => {
            const show = group.dataset.topicGroup === selected;
            group.classList.toggle('hidden', !show);
            // a letiltott mezők nem kerülnek bele az elküldött üzenetbe
            group.querySelectorAll('input').forEach(input => { input.disabled = !show; });
        });
    }

    topic.addEventListener('change', update);   // minden választásváltáskor lefut
    update();
}
