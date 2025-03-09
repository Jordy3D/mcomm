class GameModal {
    static modal = null;
    static overlay = null;
    static container = null;
    static currentRaceDataFile = null;
    static rawDataShown = false;

    static initialize() {
        if (!this.modal) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay';
            
            this.modal = document.createElement('div');
            this.modal.className = 'modal game-modal';
            
            this.container = document.createElement('div');
            this.container.className = 'modal-content game-container';
            
            this.modal.appendChild(this.container);
            
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.modal);

            this.overlay.addEventListener('click', () => this.hide());
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') this.hide();
            });
        }
    }

    static async show(raceDataFile) {
        this.initialize();
        this.currentRaceDataFile = raceDataFile;
        
        try {
            LoadingState.show(this.container, 'Loading game data...');
            
            this.overlay.classList.add('active');
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            raceDataFile = raceDataFile.replace(/ /g, '.');
            raceDataFile = raceDataFile.replace(/:/g, '.');
            
            const data = await APIService.fetchGame(raceDataFile);
            const game = new Game(data);
            this.render(game);
        } catch (error) {
            console.error('Failed to load game:', error);
            LoadingState.showError(this.container, 
                'Unable to load game data. Please try again later.'
            );
        }
    }

    static hide() {
        this.overlay.classList.remove('active');
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentRaceDataFile = null;
        this.rawDataShown = false;
    }

    static render(game) {
        const winner = game.getWinner();
        
        this.container.innerHTML = `
            <button class="modal-close">&times;</button>
            <div class="game-header">
                <span class="event-type">${game.event}</span>
                <h2>${game.track}</h2>
                <div class="game-info">
                    <span class="game-date">${game.when.toLocaleString()}</span>
                </div>
            </div>
            <div class="players-container">
                ${game.players.map((player, index) => `
                    <div class="player-card ${player === winner ? 'winner' : ''}">
                        <div class="player-header">
                            <span class="player-name">${player.name}</span>
                            <span class="player-character">${player.character}</span>
                        </div>
                        <div class="player-stats">
                            <div class="stat-value">${player.getDisplayValue()}</div>
                            ${player.dnf ? '<div class="dnf-badge">DNF</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add close button handler
        this.container.querySelector('.modal-close').addEventListener('click', () => this.hide());

        // Only show raw data button if it was activated
        if (this.rawDataShown) {
            this.addRawDataButton();
        }
    }

    static addRawDataButton() {
        const rawDataButton = document.createElement('button');
        rawDataButton.classList.add('raw-data-button');
        rawDataButton.textContent = 'Show Raw Data';
        this.container.appendChild(rawDataButton);

        let rawDataElement = null;

        rawDataButton.addEventListener('click', async () => {
            if (rawDataElement) {
                this.container.removeChild(rawDataElement);
                rawDataElement = null;
                rawDataButton.textContent = 'Show Raw Data';
            } else {
                rawDataElement = document.createElement('pre');
                rawDataElement.classList.add('raw-data');

                // replace all spaces with dots
                let urlRaceDataFile = this.currentRaceDataFile.replace(/ /g, '.');
                urlRaceDataFile = urlRaceDataFile.replace(/:/g, '.');

                // Use the stored race data file
                const rawData = await APIService.fetchGame(urlRaceDataFile, true);
                rawDataElement.textContent = JSON.stringify(rawData, null, 2);
                
                this.container.appendChild(rawDataElement);
                rawDataButton.textContent = 'Hide Raw Data';
            }
        });
    }

    static showRawData() {
        if (this.rawDataShown) return;

        this.rawDataShown = true;
        if (this.container) {
            this.addRawDataButton();
        }
    }
}

/*
█▀▄ █▀▀ █▄▄ █ █ █▀▀ 
█▄▀ ██▄ █▄█ █▄█ █▄█ 
*/

const konamiCode = new KonamiCode(() => {
    GameModal.showRawData();
});

/*
█ █ █ █ █▄ █ █▀▄ █▀█ █ █ █ 
▀▄▀▄▀ █ █ ▀█ █▄▀ █▄█ ▀▄▀▄▀ 
*/

window.GameModal = GameModal;
