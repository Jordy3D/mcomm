// Navigation items configuration
const navigationItems = [
    { url: 'index.html', text: 'Home' },
    { url: 'patch.html', text: 'Patch' },
    { url: 'guide.html', text: 'Guide' },
    { url: 'highscores.html', text: 'Highscores' }
];

// Create and inject navigation
function initializeNavigation() {
    const nav = document.querySelector('.quick-nav');
    if (!nav) return;

    // Get current page URL for highlighting active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    nav.innerHTML = navigationItems
        .map(item => `
            <a href="${item.url}" 
               class="nav-item${currentPage === item.url ? ' active' : ''}">${item.text}</a>
        `).join('');
}

// Initialize collapsible panels
document.querySelectorAll('.panel-header').forEach(header => {
    header.addEventListener('click', () => {
        const panel = header.closest('.panel');
        panel.classList.toggle('collapsed');
    });
});

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNavigation);
