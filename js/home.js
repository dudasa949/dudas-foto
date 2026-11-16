// Főoldal: "görgess tovább" eltüntetése, számok nulláról számolása, futam-kártyák a galéria adataiból
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nf = new Intl.NumberFormat('hu-HU');

    // 1) "Görgess tovább" eltűnik az első görgetésre
    const cue = document.querySelector('.scroll-cue');
    if (cue) window.addEventListener('scroll', () => cue.classList.toggle('is-hidden', window.scrollY > 60), { passive: true });

    // 2) A galéria adataiból: számok és futam-kártyák (js/gallery-data.js)
    const G = window.GALLERY;
    if (G) {
        const photos = G.albums.reduce((sum, a) => sum + a.images.length, 0);
        document.querySelectorAll('[data-count="albums"]').forEach(el => { el.dataset.countup = G.albums.length; el.textContent = G.albums.length; });
        document.querySelectorAll('[data-count="photos"]').forEach(el => { el.dataset.countup = photos; el.textContent = photos; });

        const list = document.getElementById('latest-albums');
        if (list) G.albums.slice(0, 3).forEach((a, n) => {
            const [v, f] = a.images[a.cover || 0];
            const src = `https://res.cloudinary.com/${G.cloud}/image/upload/f_auto,q_auto,w_900,c_fill,ar_4:3,g_auto/${v}/${f}`;
            const card = document.createElement('a');
            card.href = 'galeria.html';
            card.className = 'album-card reveal';
            card.style.setProperty('--d', `${n * 100}ms`);
            card.innerHTML = `<img src="${src}" alt="${a.title} – ${a.place}" loading="lazy">
                <div class="meta"><p class="text-sm text-gray-300">${a.place ? a.title : (a.series || '')}</p>
                <h3 class="text-xl font-bold text-white">${a.place || a.title}</h3>
                <p class="text-sm text-gray-400">${a.images.length} kép</p></div>`;
            list.appendChild(card);
            if (window.revealObserve) window.revealObserve(card);
        });
    }

    // 3) A számok nulláról felszámolnak, amikor láthatóvá válnak
    function countUp(el) {
        const target = Number(el.dataset.countup);
        if (!target) return;
        if (reduced) { el.textContent = nf.format(target); return; }
        const start = performance.now();
        const duration = 900;
        const tick = now => {
            const t = Math.min(1, (now - start) / duration);
            el.textContent = nf.format(Math.round(target * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    const counters = document.querySelectorAll('[data-countup]');
    if (!reduced) counters.forEach(el => { el.textContent = '0'; });
    if ('IntersectionObserver' in window) {
        const seen = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) { countUp(e.target); seen.unobserve(e.target); }
        }), { threshold: 0.6 });
        counters.forEach(el => seen.observe(el));
    } else counters.forEach(countUp);
})();
