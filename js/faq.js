// GYIK: keresés a kérdések és válaszok között
(() => {
    const input = document.getElementById('faq-search');
    if (!input) return;
    const items = [...document.querySelectorAll('.faq-item')];
    const empty = document.getElementById('faq-empty');
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        items.forEach(item => {
            const match = !q || item.textContent.toLowerCase().includes(q);
            item.hidden = !match;
            if (match) shown++;
        });
        empty.hidden = shown > 0;
    });
})();
