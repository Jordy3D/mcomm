/*
█ █▄ █ █ ▀█▀ 
█ █ ▀█ █  █  
*/

let currentPage = 1;
let totalPages = 1;


/*
█▀█ ▄▀█ █▀▀ █▀▀   █   █▀█ ▄▀█ █▀▄ █ █▄ █ █▀▀
█▀▀ █▀█ █▄█ ██▄   █▄▄ █▄█ █▀█ █▄▀ █ █ ▀█ █▄█
*/

async function initializeSessions() {
    const container = document.querySelector('.sessions-container');
    
    try {
        LoadingState.show(container, 'Loading sessions...');
        
        // Initialize modal first
        GameModal.initialize();
        
        // Get page from URL params, default to 1 if invalid
        const urlParams = new URLSearchParams(window.location.search);
        const page = Math.max(1, parseInt(urlParams.get('page')) || 1);
        
        await loadSessionPage(page);
    } catch (error) {
        console.error('Failed to initialize sessions:', error);
        LoadingState.showError(container, 
            'Unable to load sessions. Please try again later.',
            'loadCurrentPage'
        );
    }
}

async function loadSessionPage(page = 1) {
    const container = document.querySelector('.sessions-container');
    if (!container) return;
    
    try {
        LoadingState.show(container);
        
        page = Math.max(1, parseInt(page) || 1);
        currentPage = page;
        
        const data = await APIService.fetchSessionPage(page);
        if (!data || !data.SessionDatas) {
            throw new Error('Invalid session data received');
        }

        totalPages = data.totalPages || 1;

        if (data.SessionDatas.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>No sessions found.</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <table class="scores-table">
                    <thead>
                        <tr>
                            <th>Players</th>
                            <th>Type</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="sessionsBody">
                    </tbody>
                </table>
            `;
            renderSessions(data.SessionDatas);
        }

        renderPagination();
        
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
        
    } catch (error) {
        console.error('Failed to load session page:', error);
        LoadingState.showError(container, 
            'Failed to load sessions. Please try again.',
            'loadCurrentPage'
        );
    }
}

/*
█▀█ █▀▀ █▄ █ █▀▄ █▀▀ █▀█ █ █▄ █ █▀▀
█▀▄ ██▄ █ ▀█ █▄▀ ██▄ █▀▄ █ █ ▀█ █▄█
*/

function renderSessions(sessions) {
    const tbody = document.getElementById('sessionsBody');
    
    tbody.innerHTML = sessions.map(session => `
        <tr class="gameDetailRow" data-guid="${session.GUID}" onclick="GameModal.show('${session.GUID}')">
            <td>${session.Player0} vs ${session.Player1}</td>
            <td>${session.Ranked ? 'Ranked' : 'Casual'}</td>
            <td>${formatDate(session.When)}</td>
        </tr>
    `).join('');
}

function renderPagination() {
    const controls = document.querySelectorAll('.pagination-controls');
    
    controls.forEach(control => {
        let html = '';
        
        // Previous button
        html += `<button class="page-button" 
            ${currentPage === 1 ? 'disabled' : ''} 
            onclick="loadSessionPage(${currentPage - 1})">
            ←
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || 
                (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="page-button ${i === currentPage ? 'active' : ''}" 
                    onclick="loadSessionPage(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<button class="page-button" disabled>...</button>`;
            }
        }
        
        // Next button
        html += `<button class="page-button" 
            ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="loadSessionPage(${currentPage + 1})">
            → 
        </button>`;
            
        control.innerHTML = html;
    });
}

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀   █ █ ▄▀█ █▄ █ █▀▄ █   █▀▀ █▀█ █▀ 
██▄ ▀▄▀ ██▄ █ ▀█  █    █▀█ █▀█ █ ▀█ █▄▀ █▄▄ ██▄ █▀▄ ▄█ 
*/

document.addEventListener('DOMContentLoaded', initializeSessions);

/*
█▀▀ █   █▀█ █▄▄ ▄▀█ █   
█▄█ █▄▄ █▄█ █▄█ █▀█ █▄▄ 
*/

window.loadCurrentPage = async function() {
    await loadSessionPage(currentPage);
};
