// Kapcsolat: az űrlap küldése a háttérben, szép visszajelzéssel az oldalon
(() => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const success = document.getElementById('form-success');
    const status = document.getElementById('form-status');
    const button = document.getElementById('submit-btn');
    const topic = document.getElementById('topic');
    const label = button.textContent.trim();

    function showError(message) {
        status.textContent = message;
        status.className = 'text-sm rounded-xl px-4 py-3 border bg-red-500/10 border-red-500/30 text-red-300';
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();           // ne vigyen át a Formspree oldalára
        button.disabled = true;
        button.textContent = 'Küldés...';
        form.setAttribute('aria-busy', 'true');
        status.className = 'hidden';
        try {
            const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
            if (response.ok) {
                form.reset();
                topic.dispatchEvent(new Event('change'));   // a témához tartozó mezők visszaállnak
                form.hidden = true;
                success.hidden = false;
                success.focus();
            } else {
                showError('Valami hiba történt a küldéskor. Próbáld újra, vagy írj közvetlenül az e-mail-címemre.');
            }
        } catch (error) {
            showError('Nem sikerült elküldeni. Ellenőrizd az internetkapcsolatot, vagy írj közvetlenül az e-mail-címemre.');
        } finally {
            button.disabled = false;
            button.textContent = label;
            form.removeAttribute('aria-busy');
        }
    });

    document.getElementById('new-message').addEventListener('click', () => {
        success.hidden = true;
        form.hidden = false;
        document.getElementById('name').focus();
    });
})();
