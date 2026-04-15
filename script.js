// Modern Weather Dashboard JavaScript
class WeatherDashboard {
    constructor() {
        this.currentUnit = 'C';
        this.currentCity = 'London';
        this.weatherData = {};
        this.favorites = this.loadFavorites();
        this.isDarkTheme = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.searchWeather();
        this.setTheme();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    setupEventListeners() {
        // Search functionality (may not exist on every page)
        const searchInput = document.getElementById('cityInput');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const errorMessage = document.getElementById('errorMessage');
        const themeToggle = document.getElementById('themeToggle');
        const tempToggle = document.getElementById('tempToggle');
        const analyticsBtn = document.getElementById('analyticsBtn');

        // Search on Enter key
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchWeather();
                }
            });
        }

        // Analytics button click
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                this.goToAnalytics();
            });
        }

        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Temperature toggle
        if (tempToggle) {
            tempToggle.addEventListener('change', () => {
                this.currentUnit = tempToggle.checked ? 'F' : 'C';
                this.updateWeatherDisplay();
            });
        }

        // Close error message on click
        if (errorMessage) {
            errorMessage.addEventListener('click', () => {
                errorMessage.classList.remove('active');
            });
        }
    }

    async searchWeather() {
        const city = document.getElementById('cityInput').value.trim();
        if (!city) return;

        this.showLoading(true);
        this.hideError();

        try {
            // Simulate API call (replace with real API)
            const weatherData = await this.fetchWeatherData(city);
            this.weatherData = weatherData;
            
            this.updateWeatherDisplay();
            this.updateBackground(weatherData.condition);
            this.addToFavorites(city);
            
            this.showLoading(false);
        } catch (error) {
            this.showError('City not found. Please try again.');
            this.showLoading(false);
        }
    }

    goToAnalytics() {
        const city = document.getElementById('cityInput').value.trim();
        if (!city) {
            this.showError('Please enter a city name first.');
            return;
        }

        // Save city to localStorage
        localStorage.setItem('city', city);
        
        // Redirect to analytics page
        window.location.href = 'analytics.html';
    }

    async fetchWeatherData(city) {
        // Simulated weather data (replace with real API call)
        return new Promise((resolve) => {
            setTimeout(() => {
                const conditions = ['clear', 'cloudy', 'rainy', 'sunny', 'partly-cloudy'];
                const icons = ['fa-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-sun', 'fa-cloud-sun'];
                const randomIndex = Math.floor(Math.random() * conditions.length);
                
                resolve({
                    city: city,
                    temperature: Math.floor(Math.random() * 20) + 15,
                    feelsLike: Math.floor(Math.random() * 20) + 12,
                    condition: conditions[randomIndex],
                    icon: icons[randomIndex],
                    humidity: Math.floor(Math.random() * 40) + 40,
                    windSpeed: Math.floor(Math.random() * 20) + 5,
                    uvIndex: Math.floor(Math.random() * 11),
                    visibility: Math.floor(Math.random() * 10) + 5,
                    pressure: Math.floor(Math.random() * 50) + 990,
                    sunrise: '6:30 AM',
                    sunset: '7:15 PM',
                    hourly: this.generateHourlyData(),
                    weekly: this.generateWeeklyData()
                });
            }, 1000);
        });
    }

    generateHourlyData() {
        const hourly = [];
        const now = new Date();
        
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
            hourly.push({
                time: hour.getHours() + ':00',
                temperature: Math.floor(Math.random() * 15) + 15,
                icon: ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'][Math.floor(Math.random() * 4)]
            });
        }
        
        return hourly;
    }

    generateWeeklyData() {
        const weekly = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        
        for (let i = 0; i < 7; i++) {
            const dayIndex = (today + i) % 7;
            weekly.push({
                day: i === 0 ? 'Today' : days[dayIndex],
                high: Math.floor(Math.random() * 10) + 20,
                low: Math.floor(Math.random() * 8) + 10,
                icon: ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'][Math.floor(Math.random() * 4)]
            });
        }
        
        return weekly;
    }

    updateWeatherDisplay() {
        if (!this.weatherData.city) return;

        // Update current weather
        document.getElementById('cityName').textContent = this.weatherData.city;
        document.getElementById('currentTemp').textContent = this.convertTemp(this.weatherData.temperature);
        document.getElementById('tempUnit').textContent = `°${this.currentUnit}`;
        document.getElementById('weatherDescription').textContent = this.weatherData.condition;
        document.getElementById('weatherIcon').className = `fas ${this.weatherData.icon}`;
        document.getElementById('feelsLike').textContent = this.convertTemp(this.weatherData.feelsLike);

        // Update highlights
        document.getElementById('humidity').textContent = `${this.weatherData.humidity}%`;
        document.getElementById('windSpeed').textContent = `${this.weatherData.windSpeed} km/h`;
        document.getElementById('uvIndex').textContent = this.weatherData.uvIndex;
        document.getElementById('visibility').textContent = `${this.weatherData.visibility} km`;
        document.getElementById('pressure').textContent = `${this.weatherData.pressure} mb`;
        document.getElementById('sunrise').textContent = this.weatherData.sunrise;
        document.getElementById('sunset').textContent = this.weatherData.sunset;

        // Update hourly forecast
        this.updateHourlyForecast();

        // Update weekly forecast
        this.updateWeeklyForecast();
    }

    updateHourlyForecast() {
        const container = document.getElementById('hourlyForecast');
        container.innerHTML = '';

        this.weatherData.hourly.forEach((hour, index) => {
            const hourDiv = document.createElement('div');
            hourDiv.className = 'hourly-item';
            hourDiv.innerHTML = `
                <div class="hourly-time">${hour.time}</div>
                <div class="hourly-icon"><i class="fas ${hour.icon}"></i></div>
                <div class="hourly-temp">${this.convertTemp(hour.temperature)}°</div>
            `;
            container.appendChild(hourDiv);
        });
    }

    updateWeeklyForecast() {
        const container = document.getElementById('weeklyForecast');
        container.innerHTML = '';

        this.weatherData.weekly.forEach((day, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'weekly-item';
            dayDiv.innerHTML = `
                <div class="weekly-day">${day.day}</div>
                <div class="weekly-icon"><i class="fas ${day.icon}"></i></div>
                <div class="weekly-temps">
                    <div class="weekly-high">${this.convertTemp(day.high)}°</div>
                    <div class="weekly-low">${this.convertTemp(day.low)}°</div>
                </div>
            `;
            container.appendChild(dayDiv);
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-US', options);
        document.getElementById('currentDateTime').textContent = dateString;
    }

    updateBackground(condition) {
        const body = document.body;
        // Remove all weather classes first
        body.classList.remove('sunny', 'cloudy', 'rainy', 'night');
        
        switch(condition.toLowerCase()) {
            case 'clear':
            case 'sunny':
                body.classList.add('sunny');
                break;
            case 'cloudy':
            case 'partly-cloudy':
                body.classList.add('cloudy');
                break;
            case 'rainy':
                body.classList.add('rainy');
                break;
            default:
                body.classList.add('night');
        }
    }

    convertTemp(temp) {
        if (this.currentUnit === 'F') {
            return Math.round((temp * 9/5) + 32);
        }
        return temp;
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        const themeIcon = document.getElementById('themeIcon');
        
        if (this.isDarkTheme) {
            document.body.classList.remove('light-theme');
            themeIcon.className = 'fas fa-moon';
        } else {
            document.body.classList.add('light-theme');
            themeIcon.className = 'fas fa-sun';
        }
        
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    }

    setTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeIcon = document.getElementById('themeIcon');

        if (savedTheme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
        } else {
            this.isDarkTheme = true;
            document.body.classList.remove('light-theme');
            if (themeIcon) themeIcon.className = 'fas fa-moon';
        }
    }

    addToFavorites(city) {
        if (!this.favorites.includes(city)) {
            this.favorites.push(city);
            this.saveFavorites();
        }
    }

    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        document.getElementById('errorText').textContent = message;
        errorMessage.classList.add('active');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.remove('active');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});
