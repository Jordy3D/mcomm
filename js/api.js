// API Endpoints for SSX Online Revival
// 
// ┃ METHOD ┃ ENDPOINT        ┃ DESCRIPTION                                   ┃
// ┣━━━━━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
// ┃ GET    ┃ /highscore      ┃ Returns all highscores                        ┃
// ┃ GET    ┃ /highscore/<ID> ┃ Returns highscores for the given course       ┃
// ┃ GET    ┃ /online         ┃ Returns all online players                    ┃
// ┃ GET    ┃ /room           ┃ Returns all rooms and the players inside them ┃
// ┃        ┃                 ┃                                               ┃
// ┃        ┃                 ┃                                               ┃
// ┃        ┃                 ┃                                               ┃

class APIService {
    static API_BASE_URL = 'http://ssxor.org/api';
    static LOCAL_DATA_PATH = '/data/example';
    static LOCAL_DATA_ENABLED = false;
    
    static CORS_PROXY = 'https://corsproxy.io/';
    static CORS_PROXY_ENABLED = true;
    static PROXY_NEEDED = ['localhost', 'github.io', '127.0.0.1'];

    static ENDPOINTS = {
        HIGHSCORES: { path: 'highscore', localFile: 'highscores.json' },
        ONLINE_PLAYERS: { path: 'online', localFile: 'online.json' },
        ACTIVE_ROOMS: { path: 'room', localFile: 'room.json' },
    };

    static async loadLocalData(filename) {
        try {
            const response = await fetch(`${this.LOCAL_DATA_PATH}/${filename}`);
            if (!response.ok) {
                throw new Error(`Local file ${filename} not found`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to load local data ${filename}:`, error);
            return null;
        }
    }

    static async fetchFromAPI(endpointKey) {
        if (!this.ENDPOINTS[endpointKey]) {
            throw new Error(`Unknown endpoint: ${endpointKey}`);
        }
        
        const endpoint = this.ENDPOINTS[endpointKey];
        var url = `${this.API_BASE_URL}/${endpoint.path}`;

        if (this.CORS_PROXY_ENABLED) {
            if (this.PROXY_NEEDED.some(host => window.location.href.includes(host)))
                url = `${this.CORS_PROXY}${url}`;
        }
        
        try {
            // Try server first
            const response = await fetch(url, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            if (!this.LOCAL_DATA_ENABLED) {
                throw new Error(`Unable to connect to ${endpoint.path} server`);
            }

            console.warn(`Server API failed for ${endpoint.path}, trying local file:`, error);
            
            // Fall back to local data
            const localData = await this.loadLocalData(endpoint.localFile);
            if (localData) {
                console.info(`Using local example data for ${endpoint.path}`);
                return localData;
            }
            
            throw new Error(`Unable to load data for ${endpoint.path}`);
        }
    }

    static async fetchHighscores() {
        return this.fetchFromAPI('HIGHSCORES');
    }

    static async fetchOnlinePlayers() {
        return this.fetchFromAPI('ONLINE_PLAYERS');
    }

    static async fetchRooms() {
        return this.fetchFromAPI('ACTIVE_ROOMS');
    }
}

/*
█ █ █ █ █▄ █ █▀▄ █▀█ █ █ █ 
▀▄▀▄▀ █ █ ▀█ █▄▀ █▄█ ▀▄▀▄▀ 
*/

window.APIService = APIService;