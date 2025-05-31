/*
█▄ █ ▄▀█ █ █ █ █▀▀ ▄▀█ ▀█▀ █ █▀█ █▄ █ 
█ ▀█ █▀█ ▀▄▀ █ █▄█ █▀█  █  █ █▄█ █ ▀█ 
*/

// Navigation items configuration
const navigationItems = [
    { url: 'index.html', text: 'Home' },
    { url: 'patch.html', text: 'Patch' },
    { url: 'guide.html', text: 'Guide' },
    { url: 'highscores.html', text: 'Highscores' },
    { url: 'history.html', text: 'History' },
    { url: 'online.html', text: 'Online' },
    { url: 'https://discord.me/ssx', text: 'Discord' },
];

// Create and inject navigation
function initializeNavigation() {
    const nav = document.querySelector('.quick-nav');
    if (!nav) return;

    // Get current page URL for highlighting active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    nav.innerHTML = navigationItems
        .map(item => {
            const isActive = currentPage === item.url;
            const isExternal = item.url.startsWith('http');

            const classString = `class="nav-item${isActive ? ' active' : ''}${isExternal ? ' external' : ''}"`;
            const hrefString = isExternal ? `href="${item.url}" target="_blank"` : `href="${item.url}"`;
            // Use template literals for better readability
            return `<a ${hrefString} ${classString}>${item.text}</a>`;
        })
        .join('');
}

/*
█   █▀█ ▄▀█ █▀▄ █ █▄ █ █▀▀ 
█▄▄ █▄█ █▀█ █▄▀ █ █ ▀█ █▄█ 
*/

// Loading state management
class LoadingState {
    static show(container, message = 'Loading...') {
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    static showError(container, message, retryCallback = null) {
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <p>${message}</p>
                ${retryCallback ? `
                    <button class="action-button" onclick="(${retryCallback})()">Retry</button>
                ` : ''}
            </div>
        `;
    }

    static clear(container) {
        if (!container) return;
        container.innerHTML = '';
    }
}

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀   █ █ ▄▀█ █▄ █ █▀▄ █   █▀▀ █▀█ █▀ 
██▄ ▀▄▀ ██▄ █ ▀█  █    █▀█ █▀█ █ ▀█ █▄▀ █▄▄ ██▄ █▀▄ ▄█ 
*/

// Initialize collapsible panels
document.querySelectorAll('.panel-header').forEach(header => {
    header.addEventListener('click', () => {
        const panel = header.closest('.panel');
        panel.classList.toggle('collapsed');
    });
});

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNavigation);

// konami code detector for raw data view
class KonamiCode {
    constructor(callback) {
        this.KONAMI_CODE = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a,Enter';
        this.konamiIndex = 0;
        this.callback = callback;

        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(e) {
        if (e.key === this.KONAMI_CODE.split(',')[this.konamiIndex]) {
            this.konamiIndex++;

            // print a progress bar in the console
            const progress = Array(this.konamiIndex + 1).join('█') + Array(this.KONAMI_CODE.split(',').length - this.konamiIndex + 1).join(' ');
            console.log(`[${progress}] ${this.konamiIndex}/${this.KONAMI_CODE.split(',').length}`);

            if (this.konamiIndex === this.KONAMI_CODE.split(',').length) {
                this.konamiIndex = 0;
                console.log('Debug view activated!');
                if (this.callback) {
                    this.callback();
                }
            }
        } else {
            this.konamiIndex = 0;
            console.log('Womp womp!');
        }
    }
}

/*
█ █ █▀▀ █   █▀█ █▀▀ █▀█ 
█▀█ ██▄ █▄▄ █▀▀ ██▄ █▀▄ 
*/

function formatTime(ticks) {
    const totalMilliseconds = (ticks / 60) * 1000;
    const minutes = Math.floor(totalMilliseconds / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = Math.floor(totalMilliseconds % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

function formatDate(dateStr) {
    // Convert "2025.3.9 5:17:16" to a more readable format
    const date = new Date(dateStr.replace(/\./g, '-'));
    return date.toLocaleString();
}

/*
█ █ █ █ █▄ █ █▀▄ █▀█ █ █ █ 
▀▄▀▄▀ █ █ ▀█ █▄▀ █▄█ ▀▄▀▄▀ 
*/

window.LoadingState = LoadingState;
