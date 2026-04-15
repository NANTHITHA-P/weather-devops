// Analytics Page JavaScript
class AnalyticsDashboard {
    constructor() {
        this.isDarkTheme = true;
        this.currentUnit = 'C';
        this.analyticsChart = null;
        this.currentCity = 'London';
        this.apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setTheme();
        this.initAnalytics();
        
        // Get city from localStorage or use default
        this.currentCity = localStorage.getItem('city') || 'London';
        
        // Load weather data for the city
        this.loadWeatherData(this.currentCity);
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        const searchInput = document.getElementById('cityInput');
        
        // Theme toggle
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Search functionality
        if (searchInput) {
            // Set the input value to current city
            searchInput.value = this.currentCity;
            
            // Trigger on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchCity();
                }
            });
            
            // Trigger on input lose focus (change event)
            searchInput.addEventListener('change', (e) => {
                this.searchCity();
            });
            
            // Optional: Trigger on blur as backup
            searchInput.addEventListener('blur', (e) => {
                // Only trigger if value has changed
                if (e.target.value.trim() !== this.currentCity) {
                    this.searchCity();
                }
            });
        }

        // Data type dropdown
        const dataTypeSelect = document.getElementById('dataType');
        if (dataTypeSelect) {
            dataTypeSelect.addEventListener('change', () => {
                this.updateAnalyticsChart(dataTypeSelect.value);
            });
        }
    }

    initAnalytics() {
        console.log('Analytics initialized');
    }

    async searchCity() {
        const searchInput = document.getElementById('cityInput');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }
        
        const city = searchInput.value.trim();
        console.log('Searching for city:', city);
        
        if (!city) {
            console.log('Empty city input, using default London');
            this.currentCity = 'London';
            await this.loadWeatherData('London');
            return;
        }

        // Convert input to proper format (capitalize first letter)
        const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        console.log('Formatted city:', formattedCity);

        this.currentCity = formattedCity;
        await this.loadWeatherData(formattedCity);
    }

    async loadWeatherData(city) {
        if (this.isLoading) {
            console.log('Already loading data, skipping request');
            return;
        }

        this.isLoading = true;
        this.showLoading(true);

        try {
            // Fetch weather data from OpenWeatherMap API
            const weatherData = await this.fetchWeatherData(city);
            
            // Process the data for charts
            const processedData = this.processWeatherData(weatherData);
            
            // Update chart with processed data
            this.updateAnalyticsChart('temperature', processedData);
            
            this.showNotification(`Data loaded for ${city}`, 'success');
            console.log('Weather data loaded successfully for', city);
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showNotification(`Failed to load data for ${city}. Using sample data.`, 'warning');
            
            // Fallback to sample data
            this.loadSampleData(city);
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async fetchWeatherData(city) {
        // Check if API key is set
        if (this.apiKey === 'YOUR_API_KEY') {
            throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
        
        console.log('Fetching weather data from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City '${city}' not found`);
            } else if (response.status === 401) {
                throw new Error('Invalid API key');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('API response received:', data);
        
        return data;
    }

    processWeatherData(apiData) {
        // Extract temperature and humidity data from API response
        const forecasts = apiData.list;
        
        // Get data for next 7 days (or available forecasts)
        const temperatureData = [];
        const humidityData = [];
        const labels = [];
        
        // Process daily data (take first forecast of each day)
        const dailyData = {};
        
        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    temps: [],
                    humidity: [],
                    date: date
                };
            }
            
            dailyData[dateKey].temps.push(forecast.main.temp);
            dailyData[dateKey].humidity.push(forecast.main.humidity);
        });
        
        // Process first 7 days of data
        const sortedDates = Object.keys(dailyData).sort((a, b) => 
            new Date(a) - new Date(b)
        ).slice(0, 7);
        
        sortedDates.forEach(dateKey => {
            const dayData = dailyData[dateKey];
            
            // Calculate average temperature for the day
            const avgTemp = dayData.temps.reduce((sum, temp) => sum + temp, 0) / dayData.temps.length;
            const avgHumidity = dayData.humidity.reduce((sum, hum) => sum + hum, 0) / dayData.humidity.length;
            
            temperatureData.push(Math.round(avgTemp));
            humidityData.push(Math.round(avgHumidity));
            
            // Format date label
            const date = dayData.date;
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        });
        
        console.log('Processed data:', {
            temperature: temperatureData,
            humidity: humidityData,
            labels: labels
        });
        
        return {
            temperature: temperatureData,
            humidity: humidityData,
            labels: labels
        };
    }

    loadSampleData(city) {
        // Fallback sample data when API fails
        const sampleData = {
            'London': {
                temperature: [18, 20, 22, 19, 17, 21, 23],
                humidity: [65, 70, 68, 72, 75, 71, 69]
            },
            'Chennai': {
                temperature: [35, 36, 34, 33, 32, 34, 35],
                humidity: [80, 82, 78, 75, 77, 79, 81]
            },
            'Mumbai': {
                temperature: [32, 33, 31, 30, 29, 31, 32],
                humidity: [85, 87, 83, 80, 82, 84, 86]
            },
            'New York': {
                temperature: [15, 17, 19, 16, 14, 18, 20],
                humidity: [60, 62, 58, 65, 68, 63, 61]
            },
            'Tokyo': {
                temperature: [22, 24, 23, 21, 20, 22, 24],
                humidity: [70, 72, 68, 74, 76, 71, 69]
            },
            'Paris': {
                temperature: [16, 18, 20, 17, 15, 19, 21],
                humidity: [55, 57, 53, 60, 62, 56, 54]
            },
            'Sydney': {
                temperature: [25, 27, 26, 24, 23, 25, 27],
                humidity: [75, 77, 73, 78, 80, 76, 74]
            }
        };

        // Generate weekly labels
        const weeklyLabels = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            weeklyLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        const cityData = sampleData[city] || sampleData['London'];
        
        const processedData = {
            temperature: cityData.temperature,
            humidity: cityData.humidity,
            labels: weeklyLabels
        };
        
        this.updateAnalyticsChart('temperature', processedData);
        console.log('Using sample data for', city);
    }

    showLoading(show) {
        // Create or update loading indicator
        let loadingElement = document.getElementById('loadingIndicator');
        
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loadingIndicator';
            loadingElement.className = 'loading-indicator';
            loadingElement.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Loading weather data...</span>
                </div>
            `;
            document.body.appendChild(loadingElement);
        }
        
        if (show) {
            loadingElement.classList.add('active');
        } else {
            loadingElement.classList.remove('active');
        }
    }

    showNotification(message, type) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        // Set message and type
        notification.textContent = message;
        notification.className = `notification ${type} active`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }

    updateAnalyticsChart(dataType, externalData = null) {
        let temperatureData, humidityData, labels;
        
        if (externalData) {
            // Use external data from API
            temperatureData = externalData.temperature;
            humidityData = externalData.humidity;
            labels = externalData.labels;
        } else {
            // Use current stored data
            temperatureData = this.currentTemperatureData || [18, 20, 22, 19, 17, 21, 23];
            humidityData = this.currentHumidityData || [65, 70, 68, 72, 75, 71, 69];
            labels = this.currentLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        }
        
        // Store current data
        this.currentTemperatureData = temperatureData;
        this.currentHumidityData = humidityData;
        this.currentLabels = labels;
        
        const chartTitle = document.getElementById('chartTitle');
        const chartCanvas = document.getElementById('analyticsChart');
        
        console.log('Updating chart for:', this.currentCity, 'Type:', dataType);
        
        if (!chartCanvas) {
            console.error('Chart canvas not found');
            return;
        }
        
        let data, chartType, borderColor, backgroundColor, label, yAxisCallback;

        if (dataType === 'temperature') {
            const temperatures = temperatureData.map(temp => this.convertTemp(temp));
            
            data = [temperatures];
            chartType = 'line';
            borderColor = ['#ffd700'];
            backgroundColor = ['rgba(255, 215, 0, 0.15)'];
            label = ['Temperature'];
            yAxisCallback = (value) => value + '°';
            chartTitle.textContent = `Weather Analytics for ${this.currentCity}`;
            
            // Update statistics
            this.updateStatistics(temperatures, 'temperature');
        } else if (dataType === 'humidity') {
            const humidity = humidityData;
            
            data = [humidity];
            chartType = 'bar';
            borderColor = ['#ffd700'];
            backgroundColor = [humidity.map((_, index) => 
                `rgba(255, 215, 0, ${0.4 + (index * 0.08)})`
            )];
            label = ['Humidity %'];
            yAxisCallback = (value) => value + '%';
            chartTitle.textContent = `Weather Analytics for ${this.currentCity}`;
            
            // Update statistics
            this.updateStatistics(humidity, 'humidity');
        }

        // Destroy previous chart before creating new one
        if (this.analyticsChart) {
            console.log('Destroying previous chart');
            this.analyticsChart.destroy();
            this.analyticsChart = null;
        }

        const ctx = chartCanvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get chart context');
            return;
        }

        const datasets = data.map((dataset, index) => ({
            label: label[index],
            data: dataset,
            borderColor: borderColor[index],
            backgroundColor: Array.isArray(backgroundColor[index]) ? backgroundColor[index] : backgroundColor[index],
            borderWidth: 4,
            tension: 0.4,
            fill: chartType === 'line',
            pointRadius: chartType === 'line' ? 6 : 0,
            pointHoverRadius: chartType === 'line' ? 8 : 0,
            pointBackgroundColor: borderColor[index],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            borderRadius: chartType === 'bar' ? 12 : 0,
            hoverBackgroundColor: chartType === 'bar' ? 'rgba(255, 215, 0, 0.8)' : undefined,
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
        }));

        this.analyticsChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart',
                    delay: chartType === 'bar' ? (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 100;
                        }
                        return delay;
                    } : 0
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: this.isDarkTheme ? '#ffffff' : '#1a1a2e',
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: chartType === 'line' ? 'circle' : 'rect'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffd700',
                        borderWidth: 2,
                        cornerRadius: 12,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const unit = dataType === 'temperature' ? '°' + this.currentUnit : '%';
                                return context.dataset.label + ': ' + context.parsed.y + unit;
                            }.bind(this)
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: this.isDarkTheme ? '#ffffff' : '#1a1a2e',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: this.isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: this.isDarkTheme ? '#ffffff' : '#1a1a2e',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            callback: yAxisCallback
                        },
                        beginAtZero: dataType === 'humidity',
                        max: dataType === 'humidity' ? 100 : undefined
                    }
                }
            }
        });
        
        console.log('Chart created successfully for', this.currentCity);
    }

    updateStatistics(data, type) {
        const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
        const max = Math.max(...data);
        const min = Math.min(...data);
        
        // Calculate trend
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const trend = secondAvg > firstAvg ? '↑ Rising' : secondAvg < firstAvg ? '↓ Falling' : '→ Stable';
        
        const unit = type === 'temperature' ? '°' + this.currentUnit : '%';
        
        const avgElement = document.getElementById('avgValue');
        const maxElement = document.getElementById('maxValue');
        const minElement = document.getElementById('minValue');
        const trendElement = document.getElementById('trendValue');
        
        if (avgElement) avgElement.textContent = avg + unit;
        if (maxElement) maxElement.textContent = max + unit;
        if (minElement) minElement.textContent = min + unit;
        if (trendElement) {
            trendElement.textContent = trend;
            // Add color to trend
            trendElement.style.color = trend.includes('↑') ? '#4ade80' : trend.includes('↓') ? '#f87171' : '#ffd700';
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
        
        // Update chart with new theme
        if (this.analyticsChart) {
            this.updateAnalyticsChart(document.getElementById('dataType').value);
        }
    }

    setTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
        }
    }
}

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing analytics dashboard');
    new AnalyticsDashboard();
});
