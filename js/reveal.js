// Belépő animáció: a .reveal elemek megjelennek, amint a képernyőre érnek.
// Ami betöltéskor már látszik, azonnal megjelenik; a többi görgetéskor.
(() => {
    const show = el => el.classList.add('is-in');
    const visible = el => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) { show(e.target); observer.unobserve(e.target); }
        }), { threshold: 0.01 })
        : null;

    function watch(el) {
        if (!observer || visible(el)) show(el);
        else observer.observe(el);
    }
    window.revealObserve = watch;   // a JS-ből később létrehozott elemekhez
    document.querySelectorAll('.reveal').forEach(watch);
})();
