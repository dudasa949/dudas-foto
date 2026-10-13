document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEmailProtection();
    setActiveNavLink();
    initHeroSlider();
});

/* --- 1. Reszponzív Navigáció --- */
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

/* --- 2. Spam Elleni E-mail Védelem --- */
function initEmailProtection() {
    const user = "dudas.adam";
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

/* --- 3. Főoldali Háttér Képváltó / Ken Burns --- */
function initHeroSlider() {
    const heroBg = document.getElementById('hero-bg');
    if (!heroBg) return;

    const images = [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
    ];

    let currentIndex = 0;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        heroBg.style.opacity = '0';
        setTimeout(() => {
            heroBg.src = images[currentIndex];
            heroBg.style.opacity = '1';
        }, 500);
    }, 6000);
}
