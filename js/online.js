class OnlineTracker {
    static REFRESH_INTERVAL = 10000; // 10 seconds
    static #updateInterval = null;
    static #isInitialized = false;
    
    /*
    █ █▄ █ █ ▀█▀ 
    █ █ ▀█ █  █  
    */

    static async initialize() {
        // Initial load with spinner
        await this.updateData(true);
        this.#isInitialized = true;
        
        // Set up periodic updates
        this.#updateInterval = setInterval(() => this.updateData(false), this.REFRESH_INTERVAL);
    }

    /*
    █▀▄ ▄▀█ ▀█▀ ▄▀█  
    █▄▀ █▀█  █  █▀█  
    */

    static async updateData(isInitialLoad = false) {
        const roomsContainer = document.getElementById('rooms-container');
        const playersContainer = document.getElementById('players-container');
        
        try {
            // Show loading state on initial load or retry
            if (isInitialLoad) {
                LoadingState.show(roomsContainer, 'Loading rooms...');
                LoadingState.show(playersContainer, 'Loading players...');
            }

            const [rooms, players] = await Promise.all([
                APIService.fetchRooms(),
                APIService.fetchOnlinePlayers()
            ]);
            
            this.displayRooms(rooms);
            this.displayPlayers(players);
        } catch (error) {
            console.error('Failed to update online data:', error);
            if (isInitialLoad || !roomsContainer.children.length) {
                LoadingState.showError(
                    roomsContainer, 
                    'Failed to load rooms', 
                    'async () => OnlineTracker.updateData(true)'
                );
            }
            if (isInitialLoad || !playersContainer.children.length) {
                LoadingState.showError(playersContainer, 'Failed to load players');
            }
        }
    }

    /*
    █▀▄ █ █▀ █▀█ █   ▄▀█ █▄█ 
    █▄▀ █ ▄█ █▀▀ █▄▄ █▀█  █  
    */

    static displayRooms(rooms) {
        const container = document.getElementById('rooms-container');
        if (!container) return;

        container.innerHTML = rooms.length ? '' : '<p>No active rooms</p>';

        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-card';
            roomElement.innerHTML = `
                <h3>
                    ${room.roomName}
                    <span class="room-type">${room.roomType} ${room.password ? '🔒' : ''}</span>
                </h3>
                <div class="room-players">
                    ${room.Players.length ? 
                        room.Players.map(player => this.createPlayerElement(player).outerHTML).join('') : 
                        '<div class="player-card">Empty</div>'
                    }
                </div>
            `;
            container.appendChild(roomElement);
        });
    }

    static displayPlayers(players) {
        const container = document.getElementById('players-container');
        if (!container) return;

        container.innerHTML = players.length ? '' : '<p>No players online</p>';

        players.forEach(player => {
            const playerElement = this.createPlayerElement(player);
            container.appendChild(playerElement);
        });
    }

    /*
    █ █ █▀▀ █   █▀█ █▀▀ █▀█ 
    █▀█ ██▄ █▄▄ █▀▀ ██▄ █▀▄ 
    */

    static createPlayerElement(player) {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-card';
        playerElement.innerHTML = `
            <span class="player-name">${player.playerName}</span>
            <span class="player-version">${player.playerVersion}</span>
        `;
        return playerElement;
    }
}

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀   █ █ ▄▀█ █▄ █ █▀▄ █   █▀▀ █▀█ █▀ 
██▄ ▀▄▀ ██▄ █ ▀█  █    █▀█ █▀█ █ ▀█ █▄▀ █▄▄ ██▄ █▀▄ ▄█ 
*/

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => OnlineTracker.initialize());
