/*
█▀▀ █   ▄▀█ █▀ █▀ █▀▀ █▀ 
█▄▄ █▄▄ █▀█ ▄█ ▄█ ██▄ ▄█ 
*/

class Player {
    constructor(data) {
        this.name = data.Name;
        this.character = data.Character;
        this.dnf = data.DNF;
        this.score = data.Score;
        this.raceTime = data.RaceTime;
    }

    getDisplayValue() {
        return this.raceTime ? formatTime(parseInt(this.raceTime)) : parseInt(this.score).toLocaleString();
    }
}

class Game {
    constructor(data) {
        this.track = data.Track;
        this.event = data.Event;
        this.when = new Date(data.When.replace(/\./g, '-'));
        this.players = [
            new Player(data.Player0),
            new Player(data.Player1)
        ].filter(p => p.name); // Filter out empty players

        // Determine game type based on first player's data
        this.gameType = this.players[0].raceTime ? 'Race' : 'Freestyle';

        this.rawData = null;
    }

    getWinner() {
        if (this.players.length < 2) return this.players[0];
        
        if (this.gameType === 'Race') {
            return this.players.reduce((a, b) => {
                // If one player DNF'd and the other didn't, the non-DNF player wins
                if (a.dnf && !b.dnf) return b;
                if (!a.dnf && b.dnf) return a;
                
                // If both players finished or both DNF'd, compare race times
                return parseInt(a.raceTime) < parseInt(b.raceTime) ? a : b;
            });
        } else {
            return this.players.reduce((a, b) => 
                parseInt(a.score) > parseInt(b.score) ? a : b
            );
        }
    }
}