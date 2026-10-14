document.addEventListener('DOMContentLoaded', () => {
    const range = document.getElementById('comparison-range');
    const beforeLayer = document.getElementById('comparison-before');
    const handle = document.getElementById('comparison-handle');

    if (range && beforeLayer && handle) {
        range.addEventListener('input', (e) => {
            const val = e.target.value;
            beforeLayer.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
            handle.style.left = `${val}%`;
        });
    }
});
