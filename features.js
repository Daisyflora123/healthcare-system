/**
 * EcoPulse - Extended Features Set
 * Includes Theme Engine, Voice Assistant, Watchlist, and Export functionalities.
 */

// --- 1. Theme Engine (Dark/Light) ---
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('ecoPulse_theme', newTheme);
    updateThemeIcon(newTheme);

    // Update chart theme dynamically without full reload
    if (typeof aqiChartInstance !== 'undefined' && aqiChartInstance) {
        const isLightMode = newTheme === 'light';
        Chart.defaults.color = isLightMode ? '#555566' : '#888888';
        if (aqiChartInstance.options?.scales?.y) {
            aqiChartInstance.options.scales.y.grid.color = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
        }
        aqiChartInstance.update();
    }
}

function updateThemeIcon(theme) {
    const iconEl = document.getElementById('themeIcon');
    if (!iconEl) return;
    // Dark mode  → show ☀️ sun   (click = switch to light)
    // Light mode → show 🌙 moon  (click = switch to dark)
    iconEl.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

function initTheme() {
    const savedTheme = localStorage.getItem('ecoPulse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// --- 2. Voice Assistant (Text to Speech) ---
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text to speech!");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// --- 3. Watchlist Management ---
function toggleWatchlist() {
    const city = document.getElementById('cityName')?.innerText;
    if (!city || city === "--" || city === "Locating...") return;

    let list = JSON.parse(localStorage.getItem('ecoPulse_watchlist') || '[]');
    const index = list.indexOf(city);

    if (index > -1) {
        list.splice(index, 1);
    } else {
        list.push(city);
    }

    localStorage.setItem('ecoPulse_watchlist', JSON.stringify(list));
    renderWatchlist();
    updateWatchlistButton();
}

function updateWatchlistButton() {
    const city = document.getElementById('cityName')?.innerText;
    const btn = document.getElementById('watchlistToggleBtn');
    const icon = document.getElementById('watchlistIcon');
    const text = document.getElementById('watchlistText');

    if (!btn || !city || city === "--" || city === "Locating...") return;

    let list = JSON.parse(localStorage.getItem('ecoPulse_watchlist') || '[]');
    if (list.includes(city)) {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-danger');
        icon.className = 'fa-solid fa-bookmark-slash';
        text.innerText = 'Remove from Watchlist';
    } else {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-danger');
        icon.className = 'fa-solid fa-bookmark';
        text.innerText = 'Save to Watchlist';
    }
}

function renderWatchlist() {
    const container = document.getElementById('watchlistContainer');
    if (!container) return;

    const list = JSON.parse(localStorage.getItem('ecoPulse_watchlist') || '[]');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No cities saved yet.</p>';
        return;
    }

    list.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.marginRight = '10px';
        btn.style.marginBottom = '10px';
        btn.style.fontSize = '12px';
        btn.innerText = city;
        btn.onclick = () => {
            document.getElementById('cityInput').value = city;
            if (typeof loadCity === 'function') loadCity();
        };
        container.appendChild(btn);
    });
}

// --- 4. Export Report ---
function printReport() {
    window.print();
}

// Apply theme immediately on script load
initTheme();