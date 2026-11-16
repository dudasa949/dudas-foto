(() => {
    'use strict';
    const G = window.GALLERY;
    if (!G) return;

    const root = document.getElementById('gallery');
    const seriesSelect = document.getElementById('filter-series');
    const yearSelect = document.getElementById('filter-year');
    const albumSelect = document.getElementById('filter-album');
    const resetButton = document.getElementById('filter-reset');
    const searchInput = document.getElementById('filter-search');
    const countLabel = document.getElementById('gallery-count');
    const filterNote = document.getElementById('gallery-filter-note');
    const lb = document.getElementById('lb');
    const lbStage = document.getElementById('lb-stage');
    const lbImg = document.getElementById('lb-img');
    const lbLoading = document.getElementById('lb-loading');
    const lbError = document.getElementById('lb-error');
    const lbTitle = document.getElementById('lb-title');
    const lbMeta = document.getElementById('lb-meta');
    const lbDate = document.getElementById('lb-date');
    const lbCount = document.getElementById('lb-count');
    const lbAsk = document.getElementById('lb-ask');
    const lbClose = document.getElementById('lb-close');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    const lbRetry = document.getElementById('lb-retry');
    const zoomHint = document.getElementById('lb-zoom-hint');

    const imageUrl = (width, p) => `https://res.cloudinary.com/${G.cloud}/image/upload/f_auto,q_auto,w_${width}/${p.v}/${p.f}`;
    const photos = [];
    G.albums.forEach(album => album.images.forEach((image, index) => photos.push({
        a: album, i: index, v: image[0], f: image[1], w: image[2] || null, h: image[3] || null
    })));

    let selectedSeries = 'all';
    let selectedYear = 'all';
    let selectedAlbum = 'all';
    let searchQuery = '';
    let visibleAlbums = [];
    let visiblePhotos = [];
    let lightboxPhotos = [];
    let currentIndex = 0;
    let previousFocus = null;
    let loadingSource = '';
    let loadingFallbackTried = false;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let gesture = null;
    const activePointers = new Map();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const uniqueSorted = values => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'hu'));

    function fillSelect(select, firstLabel, options, selected) {
        select.innerHTML = '';
        const first = document.createElement('option');
        first.value = 'all';
        first.textContent = firstLabel;
        select.appendChild(first);
        options.forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = String(value);
            option.textContent = label;
            select.appendChild(option);
        });
        select.value = String(selected);
    }

    function getYear(album) {
        return Number(album.year || String(album.dateStart || album.title.match(/20\d{2}/)?.[0] || '').slice(0, 4) || 0);
    }

    function monthName(date) {
        return new Intl.DateTimeFormat('hu-HU', { month: 'long' }).format(date);
    }

    function formatDateRange(start, end) {
        if (!start) return '';
        const d1 = new Date(`${start}T12:00:00`);
        const d2 = new Date(`${end || start}T12:00:00`);
        if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return '';
        const year1 = d1.getFullYear(), year2 = d2.getFullYear();
        if (start === (end || start)) return `${year1}. ${monthName(d1)} ${d1.getDate()}.`;
        if (year1 === year2 && d1.getMonth() === d2.getMonth()) {
            return `${year1}. ${monthName(d1)} ${d1.getDate()}–${d2.getDate()}.`;
        }
        const f = d => `${d.getFullYear()}. ${monthName(d)} ${d.getDate()}.`;
        return `${f(d1)} – ${f(d2)}`;
    }

    function setFilterOptions() {
        const seriesOptions = uniqueSorted(G.albums.map(a => a.series || 'Egyéb'));
        fillSelect(seriesSelect, 'Minden sorozat', seriesOptions.map(v => [v, v]), selectedSeries);

        const yearsForSeries = G.albums.filter(a => selectedSeries === 'all' || (a.series || 'Egyéb') === selectedSeries).map(getYear).filter(Boolean);
        const years = [...new Set(yearsForSeries)].sort((a, b) => b - a);
        if (selectedYear !== 'all' && !years.includes(Number(selectedYear))) selectedYear = 'all';
        fillSelect(yearSelect, 'Minden év', years.map(v => [v, String(v)]), selectedYear);

        const eligibleAlbums = G.albums.filter(a =>
            (selectedSeries === 'all' || (a.series || 'Egyéb') === selectedSeries) &&
            (selectedYear === 'all' || getYear(a) === Number(selectedYear))
        );
        if (selectedAlbum !== 'all' && !eligibleAlbums.some(a => a.id === selectedAlbum)) selectedAlbum = 'all';
        const albumOptions = eligibleAlbums.map(a => [a.id, a.place ? `${a.title} — ${a.place}` : a.title]);
        fillSelect(albumSelect, 'Minden album', albumOptions, selectedAlbum);
        return eligibleAlbums;
    }

    // Keresés: ékezetek és kis/nagybetű nélkül, minden beírt szónak szerepelnie kell az esemény adataiban
    const norm = text => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function matchesSearch(album) {
        if (!searchQuery) return true;
        const haystack = norm([album.title, album.place, album.series, album.year, album.dateStart ? formatDateRange(album.dateStart, album.dateEnd) : ''].join(' '));
        return norm(searchQuery).split(/\s+/).every(word => haystack.includes(word));
    }

    function render() {
        const eligibleAlbums = setFilterOptions();
        visibleAlbums = eligibleAlbums.filter(a => (selectedAlbum === 'all' || a.id === selectedAlbum) && matchesSearch(a));
        visiblePhotos = photos.filter(p => visibleAlbums.some(a => a.id === p.a.id));
        countLabel.textContent = `${visiblePhotos.length} fotó · ${visibleAlbums.length} album`;

        const activeFilters = [];
        if (selectedSeries !== 'all') activeFilters.push(selectedSeries);
        if (selectedYear !== 'all') activeFilters.push(String(selectedYear));
        if (selectedAlbum !== 'all') activeFilters.push(G.albums.find(a => a.id === selectedAlbum)?.title || '');
        if (searchQuery) activeFilters.push(`„${searchQuery}"`);
        filterNote.textContent = activeFilters.length ? `Szűrés: ${activeFilters.join(' · ')}` : 'A szűrők kombinálhatók.';

        root.innerHTML = '';
        if (!visibleAlbums.length || !visiblePhotos.length) {
            const empty = document.createElement('div');
            empty.className = 'gallery-empty';
            empty.innerHTML = '<i class="fa-regular fa-images" aria-hidden="true"></i><p>Nincs fotó ezekkel a szűrési feltételekkel.</p><button type="button" id="empty-reset">Szűrők törlése</button>';
            root.appendChild(empty);
            document.getElementById('empty-reset').addEventListener('click', resetFilters);
            return;
        }

        // Alapból csak a legújabb album van nyitva. Szűrésnél és keresésnél több találat esetén mind csukva marad,
        // egyetlen találat esetén pedig kinyílik.
        const collapsedSet = root.collapsedAlbums || (root.collapsedAlbums = new Set(G.albums.slice(1).map(a => a.id)));
        if (selectedSeries !== 'all' || selectedYear !== 'all' || selectedAlbum !== 'all' || searchQuery) {
            visibleAlbums.forEach(a => { if (visibleAlbums.length === 1) collapsedSet.delete(a.id); else collapsedSet.add(a.id); });
        }

        visibleAlbums.forEach(album => {
            const albumPhotos = visiblePhotos.filter(p => p.a.id === album.id);
            if (!albumPhotos.length) return;
            const section = document.createElement('section');
            section.className = 'gallery-album-section gallery-reveal';

            const heading = document.createElement('div');
            heading.className = 'gallery-album-heading';
            const titleWrap = document.createElement('div');
            titleWrap.className = 'gallery-album-title-wrap';
            const title = document.createElement('h2');
            title.className = 'gallery-album-title';
            title.textContent = album.title;
            titleWrap.appendChild(title);
            if (album.place) {
                const place = document.createElement('p');
                place.className = 'gallery-album-place';
                place.innerHTML = '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>';
                place.append(document.createTextNode(` ${album.place}`));
                titleWrap.appendChild(place);
            }
            if (album.dateStart) {
                const date = document.createElement('p');
                date.className = 'gallery-album-date';
                date.innerHTML = '<i class="fa-regular fa-calendar" aria-hidden="true"></i>';
                date.append(document.createTextNode(` ${formatDateRange(album.dateStart, album.dateEnd)}`));
                titleWrap.appendChild(date);
            }
            const total = document.createElement('p');
            total.className = 'gallery-album-count';
            total.textContent = `${albumPhotos.length} fotó`;
            const side = document.createElement('div');
            side.className = 'gallery-album-side';
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'gallery-album-toggle';
            side.append(toggle, total);
            heading.append(titleWrap, side);

            const grid = document.createElement('div');
            grid.className = 'gallery-masonry';
            albumPhotos.forEach(p => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'gallery-thumb is-loading';
                button.style.setProperty('--ar', ((p.w && p.h) ? p.w / p.h : 1.5).toFixed(4));
                button.setAttribute('aria-label', `${p.a.title}, ${p.a.place}: ${p.i + 1}. kép megnyitása`);
                const img = document.createElement('img');
                img.src = imageUrl(700, p);
                img.srcset = `${imageUrl(700, p)} 700w, ${imageUrl(1200, p)} 1200w`;
                img.sizes = '(max-width: 640px) 60vw, 440px';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.alt = `${p.a.title} – ${p.a.place}, ${p.i + 1}. fotó`;
                img.addEventListener('load', () => {
                    
                    
                    
                    button.classList.remove('is-loading');
                    button.classList.add('is-loaded');
                }, { once: true });
                img.addEventListener('error', () => {
                    button.classList.remove('is-loading');
                    button.classList.add('has-error');
                    if (!button.querySelector('.thumb-error-label')) {
                        const label = document.createElement('span');
                        label.className = 'thumb-error-label';
                        label.textContent = 'A fotó nem érhető el';
                        button.appendChild(label);
                    }
                }, { once: true });
                button.appendChild(img);
                button.addEventListener('click', () => openLightbox(p));
                grid.appendChild(button);
            });
            const collapse = document.createElement('div');
            collapse.className = 'gallery-collapse';
            const inner = document.createElement('div');
            inner.className = 'gallery-collapse-inner';
            inner.id = `album-${album.id}`;
            inner.appendChild(grid);
            collapse.appendChild(inner);
            const setCollapsed = state => {
                section.classList.toggle('is-collapsed', state);
                inner.inert = state;
                toggle.setAttribute('aria-expanded', String(!state));
                toggle.setAttribute('aria-controls', inner.id);
                toggle.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
                toggle.setAttribute('aria-label', state ? 'Album kinyitása' : 'Album összecsukása');
                if (state) collapsedSet.add(album.id); else collapsedSet.delete(album.id);
            };
            heading.addEventListener('click', () => setCollapsed(!section.classList.contains('is-collapsed')));   // a teljes sor kattintható
            setCollapsed(collapsedSet.has(album.id));
            section.append(heading, collapse);
            root.appendChild(section);
            if ('IntersectionObserver' in window) revealObserver.observe(section);
            else section.classList.add('is-visible');
        });
    }

    const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.01 }) : null;

    function resetFilters() {
        selectedSeries = selectedYear = selectedAlbum = 'all';
        searchQuery = '';
        searchInput.value = '';
        root.collapsedAlbums = undefined;   // újra az alapállapot: csak a legújabb album nyitva
        render();
    }

    seriesSelect.addEventListener('change', () => {
        selectedSeries = seriesSelect.value;
        render();
    });
    yearSelect.addEventListener('change', () => {
        selectedYear = yearSelect.value;
        render();
    });
    albumSelect.addEventListener('change', () => {
        selectedAlbum = albumSelect.value;
        render();
    });
    resetButton.addEventListener('click', resetFilters);
    let searchTimer;
    searchInput.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => { searchQuery = searchInput.value.trim(); render(); }, 150);
    });

    function currentPhoto() { return lightboxPhotos[currentIndex]; }

    function resetZoom() {
        zoom = 1;
        panX = 0;
        panY = 0;
        updateImageTransform(false);
    }

    function clampPan() {
        if (!lbImg.naturalWidth || zoom <= 1.001) {
            panX = 0;
            panY = 0;
            return;
        }
        const rect = lbImg.getBoundingClientRect();
        const baseWidth = rect.width / zoom;
        const baseHeight = rect.height / zoom;
        const maxX = Math.max(0, (baseWidth * zoom - lbStage.clientWidth) / 2);
        const maxY = Math.max(0, (baseHeight * zoom - lbStage.clientHeight) / 2);
        panX = Math.max(-maxX, Math.min(maxX, panX));
        panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function updateImageTransform(animate = true) {
        if (animate) lbImg.classList.remove('is-dragging');
        lbImg.style.transition = animate && !reducedMotion ? 'transform 180ms ease' : 'none';
        lbImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
        lbImg.classList.toggle('is-zoomed', zoom > 1.01);
        lb.classList.toggle('lb-zoomed', zoom > 1.01);
        lbImg.classList.toggle('is-dragging', Boolean(gesture && gesture.dragging));
        zoomHint.innerHTML = zoom > 1.01
            ? '<i class="fa-solid fa-magnifying-glass-minus" aria-hidden="true"></i> Kattintás a visszaállításhoz · húzd a kép mozgatásához'
            : '<i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i> Kattintás a nagyításhoz';
    }

    function toggleZoom() {
        zoom = zoom > 1.01 ? 1 : 2.2;
        if (zoom === 1) { panX = 0; panY = 0; }
        clampPan();
        updateImageTransform(true);
    }

    function loadCurrentImage() {
        const p = currentPhoto();
        if (!p) return;
        resetZoom();
        loadingFallbackTried = false;
        lbImg.classList.remove('is-ready');
        lbError.classList.add('hidden');
        lbImg.alt = `${p.a.title} – ${p.a.place}, ${p.i + 1}. fotó`;
        lbTitle.textContent = p.a.title;
        lbMeta.textContent = p.a.place || '';
        lbDate.textContent = p.a.dateStart ? `Verseny dátuma: ${formatDateRange(p.a.dateStart, p.a.dateEnd)}` : 'A verseny dátuma még nincs megadva.';
        lbCount.textContent = `${currentIndex + 1} / ${lightboxPhotos.length}`;
        lbAsk.href = `kapcsolat.html?tema=rally&futam=${encodeURIComponent(p.a.title + ' – ' + p.a.place)}&kep=${encodeURIComponent(p.f)}`;
        loadingSource = imageUrl(2200, p);
        lbImg.fetchPriority = 'high';
        lbImg.onload = () => {
            lbLoading.classList.add('hidden');
            lbError.classList.add('hidden');
            lbImg.classList.add('is-ready');
            lbImg.style.transform = 'translate3d(0,0,0) scale(1)';
            lbImg.style.transition = reducedMotion ? 'none' : 'opacity 220ms ease';
            zoom = 1; panX = 0; panY = 0;
            updateImageTransform(false);
            window.setTimeout(preloadNeighbors, 180);
        };
        lbImg.onerror = () => {
            if (!loadingFallbackTried) {
                loadingFallbackTried = true;
                lbImg.src = imageUrl(1400, p);
                return;
            }
            lbLoading.classList.add('hidden');
            lbError.classList.remove('hidden');
        };
        lbImg.src = loadingSource;
        if (lbImg.complete && lbImg.naturalWidth > 0) lbImg.onload();
        else lbLoading.classList.remove('hidden');
    }

    function preloadNeighbors() {
        if (lightboxPhotos.length < 2) return;
        [1, -1].forEach(step => {
            const photo = lightboxPhotos[(currentIndex + step + lightboxPhotos.length) % lightboxPhotos.length];
            const image = new Image();
            image.decoding = 'async';
            image.src = imageUrl(2200, photo);   // ugyanaz az URL, mint a nagy nézeté, így a böngésző gyorsítótárából jön
        });
    }

    // Lapozás: az új képet előre betöltjük, a régi addig látszik, és csak utána cserélünk
    let navToken = 0;
    let outAnimation = null;
    function showPhoto(index) {
        if (lightboxPhotos.length < 2) return;
        const target = (index + lightboxPhotos.length) % lightboxPhotos.length;
        const direction = index > currentIndex ? 1 : -1;
        const token = ++navToken;
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = imageUrl(2200, lightboxPhotos[target]);
        const loaded = preload.decode ? preload.decode().catch(() => {}) : new Promise(done => { preload.onload = preload.onerror = done; });
        const slow = window.setTimeout(() => { if (token === navToken) lbLoading.classList.remove('hidden'); }, 250);
        const animated = !reducedMotion && Boolean(lbImg.animate);
        if (outAnimation) outAnimation.cancel();
        outAnimation = animated
            ? lbImg.animate([{ opacity: 1 }, { opacity: 0, transform: `translate3d(${-direction * 36}px, 0, 0) scale(.985)` }], { duration: 140, easing: 'ease-in', fill: 'forwards' })
            : null;
        const finishedOut = outAnimation ? outAnimation.finished.catch(() => {}) : Promise.resolve();
        Promise.all([loaded, finishedOut]).then(() => {
            window.clearTimeout(slow);
            if (token !== navToken) return;   // közben újabb lapozás indult
            if (outAnimation) { outAnimation.cancel(); outAnimation = null; }
            currentIndex = target;
            loadCurrentImage();
            if (animated) {
                lbImg.animate(
                    [{ opacity: 0, transform: `translate3d(${direction * 36}px, 0, 0) scale(.985)` }, { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }],
                    { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }
                );
            }
        });
    }

    function openLightbox(photo) {
        const album = photo.a;
        lightboxPhotos = visiblePhotos.filter(p => p.a.id === album.id);
        currentIndex = Math.max(0, lightboxPhotos.findIndex(p => p.f === photo.f && p.i === photo.i));
        previousFocus = document.activeElement;
        lb.classList.remove('hidden');
        lb.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        document.body.style.overflow = 'hidden';
        loadCurrentImage();
        lbClose.focus({ preventScroll: true });
    }

    function closeLightbox() {
        if (lb.classList.contains('hidden')) return;
        lb.classList.add('hidden');
        lb.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        document.body.style.overflow = '';
        activePointers.clear();
        gesture = null;
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
    }

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', event => { event.stopPropagation(); showPhoto(currentIndex - 1); });
    lbNext.addEventListener('click', event => { event.stopPropagation(); showPhoto(currentIndex + 1); });
    lbRetry.addEventListener('click', () => loadCurrentImage());

    // Only a click on the actual dimmed background closes the viewer. Buttons and image clicks never do.
    lb.addEventListener('click', event => {
        if (event.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', event => {
        if (lb.classList.contains('hidden')) return;
        if (event.key === 'Escape') { event.preventDefault(); closeLightbox(); }
        else if (event.key === 'ArrowLeft' && zoom <= 1.01) { event.preventDefault(); showPhoto(currentIndex - 1); }
        else if (event.key === 'ArrowRight' && zoom <= 1.01) { event.preventDefault(); showPhoto(currentIndex + 1); }
        else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom = Math.min(3.5, zoom + 0.25); clampPan(); updateImageTransform(true); }
        else if (event.key === '-' && zoom > 1) { event.preventDefault(); zoom = Math.max(1, zoom - 0.25); if (zoom <= 1.01) { zoom = 1; panX = 0; panY = 0; } clampPan(); updateImageTransform(true); }
    });

    // Pointer gestures unify mouse drag, phone swipe and pinch-to-zoom.
    function pointDistance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function onPointerDown(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('button, a')) return;
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        try { lbStage.setPointerCapture(event.pointerId); } catch (_) {}
        if (activePointers.size === 1) {
            gesture = {
                startX: event.clientX, startY: event.clientY,
                lastX: event.clientX, lastY: event.clientY,
                startPanX: panX, startPanY: panY,
                startZoom: zoom,
                beganOnImage: event.target === lbImg,
                moved: false, multiTouch: false,
                dragging: zoom > 1.01,
                startedAt: performance.now()
            };
            if (gesture.dragging) lbImg.classList.add('is-dragging');
        } else if (activePointers.size === 2) {
            if (gesture) gesture.multiTouch = true;
            const points = [...activePointers.values()];
            gesture = { ...(gesture || {}), multiTouch: true, pinchDistance: pointDistance(points[0], points[1]), startZoom: zoom, startPanX: panX, startPanY: panY, dragging: false };
        }
        event.preventDefault();
    }

    function onPointerMove(event) {
        if (!activePointers.has(event.pointerId)) return;
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (!gesture) return;
        if (activePointers.size >= 2 && gesture.pinchDistance) {
            const points = [...activePointers.values()];
            const distance = pointDistance(points[0], points[1]);
            zoom = Math.min(3.5, Math.max(1, gesture.startZoom * distance / gesture.pinchDistance));
            if (zoom <= 1.01) { zoom = 1; panX = 0; panY = 0; }
            clampPan();
            updateImageTransform(false);
            gesture.moved = true;
            event.preventDefault();
            return;
        }
        const dx = event.clientX - gesture.startX;
        const dy = event.clientY - gesture.startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) gesture.moved = true;
        if (zoom > 1.01 && gesture.dragging) {
            panX = gesture.startPanX + dx;
            panY = gesture.startPanY + dy;
            clampPan();
            updateImageTransform(false);
            event.preventDefault();
        }
    }

    function onPointerUp(event) {
        if (!activePointers.has(event.pointerId)) return;
        const wasMulti = Boolean(gesture && gesture.multiTouch);
        const wasZoomed = zoom > 1.01;
        const finished = gesture;
        activePointers.delete(event.pointerId);
        if (activePointers.size > 0) {
            if (gesture) gesture.multiTouch = true;
            return;
        }
        gesture = null;
        lbImg.classList.remove('is-dragging');
        if (!finished || wasMulti) return;
        const dx = event.clientX - finished.startX;
        const dy = event.clientY - finished.startY;
        if (wasZoomed || finished.dragging) {
            if (!finished.moved && finished.beganOnImage) {
                toggleZoom();
                return;
            }
            clampPan();
            updateImageTransform(true);
            return;
        }
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.1) {
            showPhoto(currentIndex + (dx < 0 ? 1 : -1));
            return;
        }
        if (!finished.moved && finished.beganOnImage && performance.now() - finished.startedAt < 700) toggleZoom();
    }

    lbStage.addEventListener('pointerdown', onPointerDown);
    lbStage.addEventListener('pointermove', onPointerMove);
    lbStage.addEventListener('pointerup', onPointerUp);
    lbStage.addEventListener('pointercancel', onPointerUp);

    lbStage.addEventListener('wheel', event => {
        if (lb.classList.contains('hidden')) return;
        event.preventDefault();
        const step = event.deltaY < 0 ? 0.2 : -0.2;
        zoom = Math.max(1, Math.min(3.5, zoom + step));
        if (zoom <= 1.01) { zoom = 1; panX = 0; panY = 0; }
        clampPan();
        updateImageTransform(true);
    }, { passive: false });

    // A képek méretarányát apró mintaképekből olvassuk ki (és megjegyezzük), így a sorok nem ugrálnak betöltéskor
    function loadDims(list) {
        let cache = {};
        try { cache = JSON.parse(localStorage.getItem('adv-dims-v1') || '{}'); } catch (error) { cache = {}; }
        const pending = [];
        list.forEach(p => {
            if (p.w && p.h) return;
            if (cache[p.f]) { p.w = cache[p.f][0]; p.h = cache[p.f][1]; return; }
            pending.push(new Promise(done => {
                const probe = new Image();
                probe.onload = () => { p.w = probe.naturalWidth; p.h = probe.naturalHeight; cache[p.f] = [p.w, p.h]; done(); };
                probe.onerror = done;
                probe.src = imageUrl(64, p);
            }));
        });
        const save = () => { try { localStorage.setItem('adv-dims-v1', JSON.stringify(cache)); } catch (error) { /* nem baj */ } };
        const timeout = new Promise(done => window.setTimeout(done, 3500));
        Promise.all(pending).then(save);   // a késve érkező mintákat is megjegyezzük a következő látogatásra
        return Promise.race([Promise.all(pending), timeout]).then(save);
    }

    root.innerHTML = '<p style="color:#9ca3af">Képek betöltése…</p>';
    loadDims(photos).then(render);
})();
