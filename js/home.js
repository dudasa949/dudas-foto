// Főoldal: belépő animációk, "görgess tovább" eltüntetése, futam-kártyák és számok az adatokból
(() => {
    // 1) Belépő animáció
    const items = document.querySelectorAll('.reveal');
    const seen = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => seen.observe(el));

    // 2) "Görgess tovább" eltűnik az első görgetésre
    const cue = document.querySelector('.scroll-cue');
    if (cue) window.addEventListener('scroll', () => cue.classList.toggle('is-hidden', window.scrollY > 60), { passive: true });

    // 3) Futam-kártyák és számok a galéria adataiból (js/gallery-data.js)
    const G = window.GALLERY;
    if (!G) return;
    const photos = G.albums.reduce((sum, a) => sum + a.images.length, 0);
    document.querySelectorAll('[data-count="albums"]').forEach(el => (el.textContent = G.albums.length));
    document.querySelectorAll('[data-count="photos"]').forEach(el => (el.textContent = photos));

    const list = document.getElementById('latest-albums');
    if (!list) return;
    G.albums.slice(0, 3).forEach((a, n) => {
        const [v, f] = a.images[a.cover || 0];
        const src = `https://res.cloudinary.com/${G.cloud}/image/upload/f_auto,q_auto,w_900,c_fill,ar_4:3,g_auto/${v}/${f}`;
        const card = document.createElement('a');
        card.href = 'galeria.html';
        card.className = 'album-card reveal';
        card.style.setProperty('--d', `${n * 100}ms`);
        card.innerHTML = `<img src="${src}" alt="${a.title} – ${a.place}" loading="lazy">
            <div class="meta"><p class="text-sm text-gray-300">${a.title}</p>
            <h3 class="text-xl font-bold text-white">${a.place}</h3>
            <p class="text-sm text-gray-400">${a.images.length} kép</p></div>`;
        list.appendChild(card);
        seen.observe(card);
    });
})();
