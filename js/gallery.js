
    (() => {
        const G = window.GALLERY;
        if (!G) return;
        const root = document.getElementById('gallery');
        const url = (tr, p) => `https://res.cloudinary.com/${G.cloud}/image/upload/${tr}/${p.v}/${p.f}`;

        // Minden kép egy listában: a = album, i = sorszám az albumban, w/h = méret (ha ismert)
        const all = [];
        G.albums.forEach(a => a.images.forEach((im, i) => all.push({ a, i, v: im[0], f: im[1], w: im[2], h: im[3] })));
        const kind = p => (p.h > p.w ? 'tall' : 'wide');
        let albumFilter = 'all', orient = 'all', visible = [], cur = 0;

        // Ha az adatfájl nem tartalmaz méretet, apró mintaképből olvassuk ki (így nincs ugrálás)
        const probe = p => new Promise(done => {
            const t = new Image();
            t.onload = () => { p.w = t.naturalWidth; p.h = t.naturalHeight; done(); };
            t.onerror = () => { p.w = 3; p.h = 2; done(); };
            t.src = url('f_auto,q_auto,w_48', p);
        });

        function chips(box, items, current, onPick) {
            box.innerHTML = '';
            items.forEach(([value, label]) => {
                const b = document.createElement('button');
                const on = value === current;
                b.className = 'px-4 py-2 rounded-full text-sm font-medium border transition ' +
                    (on ? 'bg-accent border-accent text-white' : 'border-white/15 text-gray-300 hover:border-white/40');
                b.textContent = label;
                b.onclick = () => onPick(value);
                box.appendChild(b);
            });
        }

        function render() {
            visible = all.filter(p => (albumFilter === 'all' || p.a.id === albumFilter) && (orient === 'all' || kind(p) === orient));
            chips(document.getElementById('album-chips'),
                [['all', 'Minden album'], ...G.albums.map(a => [a.id, `${a.round}. forduló · ${a.place}`])],
                albumFilter, v => { albumFilter = v; render(); });
            chips(document.getElementById('orient-chips'),
                [['all', 'Minden kép'], ['wide', 'Fekvő'], ['tall', 'Álló']],
                orient, v => { orient = v; render(); });
            document.getElementById('gallery-count').textContent = `${visible.length} kép`;

            root.innerHTML = '';
            G.albums.forEach(a => {
                const items = visible.filter(p => p.a === a);
                if (!items.length) return;
                const sec = document.createElement('section');
                sec.className = 'opacity-0 translate-y-4 transition duration-700';
                sec.innerHTML = `<div class="flex items-end justify-between gap-4 mb-5">
                    <div><h2 class="text-2xl sm:text-3xl font-bold tracking-tight">${a.title}</h2><p class="text-gray-400">${a.place}</p></div>
                    <p class="text-sm text-gray-400">${items.length} kép</p></div>
                    <div class="columns-2 md:columns-3 gap-3"></div>`;
                items.forEach(p => {
                    const b = document.createElement('button');
                    b.className = 'group block w-full mb-3 break-inside-avoid overflow-hidden rounded-xl bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';
                    b.style.aspectRatio = `${p.w} / ${p.h}`;
                    b.setAttribute('aria-label', `${a.title}, ${a.place}: ${p.i + 1}. kép nagyítása`);
                    b.innerHTML = `<img src="${url('f_auto,q_auto,w_700', p)}" loading="lazy" alt="${a.title} – ${a.place}, ${p.i + 1}. kép"
                        class="w-full h-full object-cover opacity-0 transition duration-500 group-hover:scale-105">`;
                    b.firstChild.onload = e => e.target.classList.remove('opacity-0');
                    b.onclick = () => open(visible.indexOf(p));
                    sec.lastElementChild.appendChild(b);
                });
                root.appendChild(sec);
                seen.observe(sec);
            });
            if (!visible.length) root.innerHTML = '<p class="text-gray-400">Ebben a szűrésben nincs kép.</p>';
        }

        // Belépő animáció görgetéskor
        const seen = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.remove('opacity-0', 'translate-y-4'); seen.unobserve(e.target); }
        }), { rootMargin: '0px 0px -8% 0px' });

        // Nagyított nézet
        const lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img');
        function show(i) {
            cur = (i + visible.length) % visible.length;
            const p = visible[cur];
            lbImg.style.opacity = 0;
            lbImg.onload = () => (lbImg.style.opacity = 1);
            lbImg.src = url('f_auto,q_auto,w_2400', p);
            lbImg.alt = `${p.a.title} – ${p.a.place}, ${p.i + 1}. kép`;
            document.getElementById('lb-title').textContent = p.a.title;
            document.getElementById('lb-meta').textContent = `${p.a.place} · ${cur + 1} / ${visible.length}`;
            document.getElementById('lb-ask').href = `kapcsolat.html?tema=rally&futam=${encodeURIComponent(p.a.title + ' – ' + p.a.place)}&kep=${encodeURIComponent(p.f)}`;
            [cur + 1, cur - 1].forEach(n => { const q = visible[(n + visible.length) % visible.length]; new Image().src = url('f_auto,q_auto,w_2400', q); });
        }
        function open(i) { lb.classList.remove('hidden'); document.body.style.overflow = 'hidden'; show(i); }
        function close() { lb.classList.add('hidden'); document.body.style.overflow = ''; }
        document.getElementById('lb-close').onclick = close;
        document.getElementById('lb-prev').onclick = () => show(cur - 1);
        document.getElementById('lb-next').onclick = () => show(cur + 1);
        lb.addEventListener('click', e => { if (e.target === lb || e.target.parentElement === lb) close(); });
        document.addEventListener('keydown', e => {
            if (lb.classList.contains('hidden')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(cur - 1);
            if (e.key === 'ArrowRight') show(cur + 1);
        });
        let x0 = null;
        lb.addEventListener('touchstart', e => (x0 = e.touches[0].clientX), { passive: true });
        lb.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - x0;
            if (x0 !== null && Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
            x0 = null;
        });

        root.innerHTML = '<p class="text-gray-400">Képek betöltése…</p>';
        Promise.all(all.filter(p => !p.w).map(probe)).then(render);
    })();
    
