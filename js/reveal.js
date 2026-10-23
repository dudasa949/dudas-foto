// Belépő animáció: a .reveal elemek görgetéskor előtűnnek
(() => {
    const seen = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(el => seen.observe(el));
})();
