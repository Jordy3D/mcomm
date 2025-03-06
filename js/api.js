class APIService {
    static API_BASE_URL = 'http://ssxor.org/api';

    static async fetchHighscores() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/highscore`, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch highscores:', error);
            throw new Error('Unable to connect to highscore server');
        }
    }

    // TODO: Implement the remaining API methods at some point
}

// Make APIService globally available
window.APIService = APIService;