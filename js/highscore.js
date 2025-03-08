/*
█ █▄ █ █ ▀█▀ 
█ █ ▀█ █  █  
*/

let courses = [];
let activeMode = 'race';
let activeTab = null;
let filters = {
    versions: new Set(['NTSC', 'PAL 1.0', 'PAL 2.0']),
    search: ''
};

// Make the initialization function globally available for the retry button
window.loadHighscores = async function() {
    await initializeHighscores();
};

/*
█▀▀ █   ▄▀█ █▀ █▀ █▀▀ █▀ 
█▄▄ █▄▄ █▀█ ▄█ ▄█ ██▄ ▄█ 
*/

class ScoreEntry {
    constructor(gameVersion, name, score, raceDataFile) {
        this.gameVersion = gameVersion;
        this.name = name;
        this.score = score;
        this.date = this.parseDate(raceDataFile);
    }

    parseDate(raceDataFile) {
        if (raceDataFile === "NULL") return null;
        const parts = raceDataFile.split(' ');
        return new Date(`${parts[1].replace(/\./g, '-')} ${parts[2]}`);
    }
}

class CourseEntry {
    constructor(id, name, entries) {
        this.id = id;
        this.name = name;
        this.mode = this.determineMode(id);
        this.scores = entries
            .filter(e => e.RaceDataFile !== "NULL")
            .map(e => new ScoreEntry(e.GameVersion, e.Name, e.Score, e.RaceDataFile));
    }

    determineMode(id) {
        // IDs 4-11 are Race mode, 12-28 are Freestyle mode
        if (id >= 4 && id <= 11) return 'race';
        if (id >= 12 && id <= 28) return 'freestyle';
        return null; // For Overall or invalid entries
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

/*
█▀▄▀█ ▄▀█ █ █▄ █ 
█ ▀ █ █▀█ █ █ ▀█ 
*/

async function initializeHighscores() {
    const container = document.querySelector('.scores-container');
    
    try {
        LoadingState.show(container, 'Loading highscores...');
        
        const data = await APIService.fetchHighscores();
        courses = data.courseEntries
            .filter(course => course.Name !== "Null" && course.Name !== "Overall")
            .map(course => new CourseEntry(course.ID, course.Name, course.Entries));
        
        // Initialize UI elements first
        initializeModeButtons();
        initializeTabs();
        
        // Explicitly set initial mode and select first tab
        const raceCourses = courses.filter(c => c.mode === 'race');
        if (raceCourses.length > 0) {
            activeMode = 'race';
            
            // Create the table structure
            container.innerHTML = `
                <table class="scores-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Version</th>
                            <th class="score-header">Time</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="scoresBody"></tbody>
                </table>
            `;
            
            // Now select the tab which will populate the table
            selectTab(raceCourses[0].id);
        }
    } catch (error) {
        console.error('Failed to initialize highscores:', error);
        LoadingState.showError(container, 
            'Unable to connect to highscore server. Please try again later.',
            'loadHighscores'
        );
    }
}

/*
█▀▀ █▀█ █▄ █ ▀█▀ █▀█ █▀█ █   █▀ 
█▄▄ █▄█ █ ▀█  █  █▀▄ █▄█ █▄▄ ▄█ 
*/

function initializeModeButtons() {
    const modeContainer = document.querySelector('.mode-buttons');
    modeContainer.innerHTML = `
        <button class="mode-button active" data-mode="race">Race</button>
        <button class="mode-button" data-mode="freestyle">Freestyle</button>
    `;

    modeContainer.addEventListener('click', e => {
        if (e.target.classList.contains('mode-button')) {
            setMode(e.target.dataset.mode);
        }
    });
}

function initializeTabs() {
    const tabsContainer = document.querySelector('.course-tabs');
    tabsContainer.innerHTML = courses
        .filter(course => course.mode === activeMode)
        .map(course => `
            <button class="tab-button" data-id="${course.id}">
                ${course.name}
            </button>
        `).join('');

    tabsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('tab-button')) {
            selectTab(parseInt(e.target.dataset.id));
        }
    });
}

function setMode(mode) {
    activeMode = mode;
    
    // Update mode button styling
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update existing header
    const scoreHeader = document.querySelector('.score-header');
    if (scoreHeader) {
        scoreHeader.textContent = mode === 'race' ? 'Time' : 'Score';
    }

    // Update tabs for this mode
    initializeTabs();
    
    // Select first tab of this mode
    const modeCourses = courses.filter(c => c.mode === mode);
    if (modeCourses.length > 0) {
        selectTab(modeCourses[0].id);
    }
}

function selectTab(courseId) {
    activeTab = courseId;
    
    // Update tab styling
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.id == courseId);
    });

    updateScoresDisplay();
}

function updateScoresDisplay() {
    const course = courses.find(c => c.id === activeTab);
    if (!course) return;

    const filteredScores = course.scores.filter(score => {
        const versionMatch = filters.versions.has(score.gameVersion);
        const searchMatch = !filters.search || 
            score.name.toLowerCase().includes(filters.search.toLowerCase());
        return versionMatch && searchMatch;
    });

    document.getElementById('scoresBody').innerHTML = filteredScores
        .map((score, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.gameVersion}</td>
                <td>${course.mode === 'race' ? formatTime(score.score) : score.score.toLocaleString()}</td>
                <td>${score.date?.toLocaleString() || 'N/A'}</td>
            </tr>
        `).join('');
}

function updateVersionButtonStates() {
    const searchTerm = filters.search.toLowerCase();
    if (!searchTerm) {
        // If no search term, enable all version buttons
        document.querySelectorAll('.version-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        return;
    }

    // For each version button, check if there are any matching scores
    document.querySelectorAll('.version-button').forEach(btn => {
        const version = btn.dataset.version;
        const hasMatches = courses.some(course => 
            course.scores.some(score => 
                score.gameVersion === version && 
                score.name.toLowerCase().includes(searchTerm)
            )
        );

        // btn.disabled = !hasMatches;
        // btn.style.opacity = hasMatches ? '1' : '0.5';
        
        // // If a disabled button is active, deactivate it
        // if (!hasMatches && btn.classList.contains('active')) {
        //     btn.classList.remove('active');
        //     filters.versions.delete(version);
        // }
    });

    // Update the display after modifying filters
    updateScoresDisplay();
}

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀   █ █ ▄▀█ █▄ █ █▀▄ █   █▀▀ █▀█ █▀ 
██▄ ▀▄▀ ██▄ █ ▀█  █    █▀█ █▀█ █ ▀█ █▄▀ █▄▄ ██▄ █▀▄ ▄█ 
*/

// Event Listeners
document.querySelector('.version-filters').addEventListener('click', e => {
    if (e.target.classList.contains('version-button')) {
        e.target.classList.toggle('active');
        const version = e.target.dataset.version;
        if (e.target.classList.contains('active')) {
            filters.versions.add(version);
        } else {
            filters.versions.delete(version);
        }
        updateScoresDisplay();
    }
});

document.getElementById('playerSearch').addEventListener('input', e => {
    filters.search = e.target.value;
    updateVersionButtonStates();
    updateScoresDisplay();
});

// Initialize when document is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeHighscores();
    } catch (error) {
        console.error('Failed to load highscores:', error);
    }
});
