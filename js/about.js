// Rólam: váltás a "Fotósként" és a "Személyesen" bemutatkozás között (a háttérkép is vált)
(() => {
    const tabs = [...document.querySelectorAll('[data-tab]')];
    if (!tabs.length) return;
    const panels = [...document.querySelectorAll('[data-panel]')];
    const images = [...document.querySelectorAll('[data-bg]')];

    function select(name) {
        tabs.forEach(t => {
            const on = t.dataset.tab === name;
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
        });
        panels.forEach(p => { const on = p.dataset.panel === name; p.hidden = !on; p.classList.toggle('is-on', on); });
        images.forEach(img => img.classList.toggle('is-on', img.dataset.bg === name));
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => select(tab.dataset.tab));
        tab.addEventListener('keydown', e => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const other = tabs.find(t => t !== tab);
            other.focus();
            select(other.dataset.tab);
        });
    });
})();
