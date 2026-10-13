/**
 * main.js - Globális logika & biztonsági funkciók
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEmailProtection();
    setActiveNavLink();
});

/* --- 1. Mobil Menü Kezelése --- */
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }
}

/* --- 2. Aktív Menüpont Kiemelése --- */
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-accent', 'font-bold');
            link.classList.remove('text-gray-300');
        }
    });
}

/* --- 3. Spam Elleni E-mail Obfuszkáció --- */
function initEmailProtection() {
    // Az e-mail címed részei szétszedve, hogy a spambotok ne tudják kikaparni a kódforrásból
    const user = "john.doe"; // cseréld le a saját felhasználónevedre
    const domain = "gmail.com"; // cseréld le a saját domainedre
    
    const emailContainers = document.querySelectorAll('.protected-email');

    emailContainers.forEach(container => {
        const fullEmail = `${user}@${domain}`;
        
        // Ha az elem egy hivatkozás (<a>)
        if (container.tagName === 'A') {
            container.href = `mailto:${fullEmail}`;
            container.textContent = fullEmail;
        } else {
            container.textContent = fullEmail;
        }
    });
}
