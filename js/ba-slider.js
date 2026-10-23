// Előtte/utána mező: nyilak és pöttyök váltják a szempontot, a csúszka az előtte-utánát
(() => {
    const root = document.querySelector('[data-compare]');
    if (!root) return;
    const slides = [...root.querySelectorAll('.cmp-slide')];
    const dots = root.querySelector('.cmp-dots');
    const title = root.querySelector('[data-cmp-title]');
    const text = root.querySelector('[data-cmp-text]');
    let current = 0;

    slides.forEach((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}. szempont: ${slide.dataset.title}`);
        dot.addEventListener('click', () => show(i));
        dots.appendChild(dot);
        const range = slide.querySelector('input[type=range]');
        range.addEventListener('input', () => slide.style.setProperty('--pos', `${range.value}%`));
    });

    function show(i) {
        current = (i + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle('is-active', k === current));
        [...dots.children].forEach((d, k) => d.classList.toggle('is-on', k === current));
        title.textContent = slides[current].dataset.title;
        text.textContent = slides[current].dataset.text;
    }

    root.querySelector('.cmp-prev').addEventListener('click', () => show(current - 1));
    root.querySelector('.cmp-next').addEventListener('click', () => show(current + 1));
    show(0);
})();
