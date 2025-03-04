document.querySelectorAll('.panel-header').forEach(header => {
    header.addEventListener('click', () => {
        const panel = header.closest('.panel');
        panel.classList.toggle('collapsed');
    });
});
