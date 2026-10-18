document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEmailProtection();
    setActiveNavLink();
    initHeroBackgroundSlider();
});

function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
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
        "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792319961/mrc26_3viszlo_1.jpg",
        "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792327313/mrc26_5muhi_6.jpg",
        "https://res.cloudinary.com/n5bkfxuh/image/upload/f_auto,q_auto/v1792328895/mrc26_2kaza_6.jpg"
    ];

    const FADE_MS = 900;   // egyeznie kell a CSS transition idejével (0.9s)
    const PAN_AMOUNT = 1.5;  // ennyi % az elmozdulás, a scale(1.1) miatt max ~5% biztonságos

    let currentIndex = 0;
    let direction = 1;     // 1 = balról jobbra, -1 = jobbról balra

    // Előtöltés, hogy váltáskor ne villanjon be üres háttér
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    function startPan() {
        heroBg.style.setProperty('--pan-from', `${-PAN_AMOUNT * direction}%`);
        heroBg.style.setProperty('--pan-to', `${PAN_AMOUNT * direction}%`);

        heroBg.classList.remove('hero-pan');
        void heroBg.offsetWidth;   // reflow: így indul újra az animáció nulláról
        heroBg.classList.add('hero-pan');

        direction *= -1;           // következő kép az ellenkező irányba megy
    }

    // Amikor a mozgás lelassult és megállt: fade ki -> képcsere -> fade be + új mozgás
    heroBg.addEventListener('animationend', () => {
        heroBg.style.opacity = '0';

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % images.length;
            heroBg.src = images[currentIndex];
            heroBg.style.opacity = '';   // visszaáll a CSS-ben megadott 0.4-re
            startPan();
        }, FADE_MS);
    });

    startPan();
}
