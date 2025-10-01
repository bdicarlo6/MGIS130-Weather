// DATA LAYER: API Configuration
const API_KEY = '9467a0b567aa775afec3624e096220d8';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// State management
let currentWeatherData = null;
let tempUnit = 'F'; // F for Fahrenheit, C for Celsius
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const initialMessage = document.getElementById('initialMessage');
const tempToggleFahrenheit = document.getElementById('tempToggleFahrenheit');
const tempToggleCelsius = document.getElementById('tempToggleCelsius');
const weatherParticles = document.getElementById('weatherParticles');
const forecastSection = document.getElementById('forecastSection');
const forecastContainer = document.getElementById('forecastContainer');
const searchHistoryDiv = document.getElementById('searchHistory');
const historyButtons = document.getElementById('historyButtons');
const greeting = document.getElementById('greeting');

// Initialize - set time-based greeting
function setGreeting() {
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour < 12) {
        greetingText = 'Good Morning! ☀️ ';
    } else if (hour < 18) {
        greetingText = 'Good Afternoon! 🌤️ ';
    } else {
        greetingText = 'Good Evening! 🌙 ';
    }
    
    greeting.textContent = greetingText + 'Get current weather conditions for any city';
}

// Initialize greeting on load
setGreeting();

// PROCESSING LAYER: Temperature Conversion Functions
function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(1);
}

function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(1);
}

function displayTemperature(kelvin) {
    return tempUnit === 'F' ? kelvinToFahrenheit(kelvin) : kelvinToCelsius(kelvin);
}

// PROCESSING LAYER: Weather Icon Mapping
function getWeatherIcon(code) {
    if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
    if (code >= 300 && code < 400) return '🌧️'; // Drizzle
    if (code >= 500 && code < 600) return '🌧️'; // Rain
    if (code >= 600 && code < 700) return '❄️'; // Snow
    if (code >= 700 && code < 800) return '🌫️'; // Atmosphere
    if (code === 800) return '☀️'; // Clear
    if (code > 800) return '☁️'; // Clouds
    return '🌤️';
}

// PROCESSING LAYER: Wind Direction
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// PROCESSING LAYER: Format Time
function formatTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
    });
}

// PROCESSING LAYER: Format Visibility
function formatVisibility(meters) {
    const km = (meters / 1000).toFixed(1);
    const miles = (meters / 1609.34).toFixed(1);
    return tempUnit === 'F' ? `${miles} mi` : `${km} km`;
}

// PROCESSING LAYER: Dynamic Background Based on Weather
function updateBackgroundTheme(weatherCode, temp) {
    // Remove all weather classes
    document.body.className = '';
    
    // Clear any existing particles
    weatherParticles.innerHTML = '';
    
    const tempF = kelvinToFahrenheit(temp);
    
    // Apply theme based on weather condition
    if (weatherCode >= 200 && weatherCode < 300) {
        // Thunderstorm
        document.body.classList.add('thunderstorm');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        // Rain/Drizzle
        document.body.classList.add('rainy');
        createRainEffect();
    } else if (weatherCode >= 600 && weatherCode < 700) {
        // Snow
        document.body.classList.add('snowy');
        createSnowEffect();
    } else if (weatherCode >= 700 && weatherCode < 800) {
        // Fog/Mist
        document.body.classList.add('foggy');
    } else if (weatherCode === 800) {
        // Clear sky
        if (tempF > 80) {
            document.body.classList.add('hot-weather');
        } else if (tempF < 32) {
            document.body.classList.add('cold-weather');
        } else {
            document.body.classList.add('clear-sky');
        }
    } else if (weatherCode > 800) {
        // Cloudy
        document.body.classList.add('cloudy');
    }
}

// Create rain effect
function createRainEffect() {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.className = 'particle';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.width = '2px';
        drop.style.height = Math.random() * 20 + 10 + 'px';
        drop.style.borderRadius = '0';
        drop.style.animationDuration = Math.random() * 1 + 0.5 + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        weatherParticles.appendChild(drop);
    }
}

// Create snow effect
function createSnowEffect() {
    for (let i = 0; i < 30; i++) {
        const flake = document.createElement('div');
        flake.className = 'particle';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.width = Math.random() * 8 + 4 + 'px';
        flake.style.height = flake.style.width;
        flake.style.animationDuration = Math.random() * 3 + 2 + 's';
        flake.style.animationDelay = Math.random() * 3 + 's';
        weatherParticles.appendChild(flake);
    }
}

// PROCESSING LAYER: Date Formatting
function formatDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
}

// PROCESSING LAYER: Format Day for Forecast
function formatDay(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}

// SEARCH HISTORY MANAGEMENT
function addToSearchHistory(cityName) {
    // Remove if already exists
    searchHistory = searchHistory.filter(city => city.toLowerCase() !== cityName.toLowerCase());
    
    // Add to beginning
    searchHistory.unshift(cityName);
    
    // Keep only last 5
    searchHistory = searchHistory.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    
    // Update UI
    displaySearchHistory();
}

function displaySearchHistory() {
    if (searchHistory.length === 0) {
        searchHistoryDiv.classList.remove('show');
        return;
    }
    
    historyButtons.innerHTML = '';
    searchHistory.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'history-btn';
        btn.textContent = city;
        btn.addEventListener('click', () => {
            cityInput.value = city;
            fetchWeather(city);
        });
        historyButtons.appendChild(btn);
    });
    
    searchHistoryDiv.classList.add('show');
}

// Initialize search history display
displaySearchHistory();

// UI Helper Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherCard.classList.remove('show');
    forecastSection.classList.remove('show');
    initialMessage.style.display = 'none';
}

function hideError() {
    errorMessage.classList.remove('show');
}

function showLoading() {
    loading.classList.add('show');
    searchBtn.disabled = true;
    locationBtn.disabled = true;
    hideError();
}

function hideLoading() {
    loading.classList.remove('show');
    searchBtn.disabled = false;
    locationBtn.disabled = false;
}

// PROCESSING LAYER: Update UI with Weather Data
function displayWeatherData(data) {
    currentWeatherData = data;

    // Update background theme
    updateBackgroundTheme(data.weather[0].id, data.main.temp);

    document.getElementById('cityName').textContent = 
        `${data.name}, ${data.sys.country}`;
    document.getElementById('currentDate').textContent = formatDate();
    document.getElementById('weatherIcon').textContent = 
        getWeatherIcon(data.weather[0].id);
    document.getElementById('weatherDescription').textContent = 
        data.weather[0].description;
    
    updateTemperatureDisplay();

    // Display temperature range
    const tempMin = displayTemperature(data.main.temp_min);
    const tempMax = displayTemperature(data.main.temp_max);
    document.getElementById('tempRange').textContent = 
        `High: ${tempMax}° | Low: ${tempMin}°`;

    // Basic details
    document.getElementById('humidity').textContent = 
        `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = 
        `${data.wind.speed} m/s`;

    // Extended details
    document.getElementById('sunrise').textContent = 
        formatTime(data.sys.sunrise, data.timezone);
    document.getElementById('sunset').textContent = 
        formatTime(data.sys.sunset, data.timezone);
    document.getElementById('pressure').textContent = 
        `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = 
        formatVisibility(data.visibility);
    document.getElementById('cloudCover').textContent = 
        `${data.clouds.all}%`;
    document.getElementById('windDirection').textContent = 
        getWindDirection(data.wind.deg);

    weatherCard.classList.add('show');
    initialMessage.style.display = 'none';

    // Add to search history
    addToSearchHistory(data.name);

    // Fetch 5-day forecast
    fetch5DayForecast(data.coord.lat, data.coord.lon);
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;

    const temp = displayTemperature(currentWeatherData.main.temp);
    const feelsLike = displayTemperature(currentWeatherData.main.feels_like);

    document.getElementById('temperature').textContent = 
        `${temp}°${tempUnit}`;
    document.getElementById('feelsLike').textContent = 
        `Feels like ${feelsLike}°${tempUnit}`;

    // Update temp range
    const tempMin = displayTemperature(currentWeatherData.main.temp_min);
    const tempMax = displayTemperature(currentWeatherData.main.temp_max);
    document.getElementById('tempRange').textContent = 
        `High: ${tempMax}° | Low: ${tempMin}°`;

    // Update visibility
    document.getElementById('visibility').textContent = 
        formatVisibility(currentWeatherData.visibility);
}

// DATA LAYER: Fetch Weather Data from API
async function fetchWeather(city) {
    try {
        showLoading();

        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            throw new Error('Failed to fetch weather data. Please try again later.');
        }

        const data = await response.json();
        displayWeatherData(data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// DATA LAYER: Fetch Weather by Coordinates (for geolocation)
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();

        const response = await fetch(
            `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather data for your location.');
        }

        const data = await response.json();
        displayWeatherData(data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// DATA LAYER: Fetch 5-Day Forecast
async function fetch5DayForecast(lat, lon) {
    try {
        const response = await fetch(
            `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch forecast data.');
        }

        const data = await response.json();
        displayForecast(data);

    } catch (error) {
        console.error('Forecast error:', error);
        // Don't show error to user, just hide forecast section
        forecastSection.classList.remove('show');
    }
}

// PROCESSING LAYER: Display 5-Day Forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    // Group forecast by day (API returns data every 3 hours)
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temps: [],
                weather: item.weather[0],
                allItems: []
            };
        }
        
        dailyForecasts[dateKey].temps.push(item.main.temp);
        dailyForecasts[dateKey].allItems.push(item);
    });

    // Get first 5 days
    const days = Object.values(dailyForecasts).slice(0, 5);

    days.forEach(day => {
        const tempMax = Math.max(...day.temps);
        const tempMin = Math.min(...day.temps);
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        card.innerHTML = `
            <div class="forecast-day">${formatDay(day.date)}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather.id)}</div>
            <div class="forecast-temp">
                <span class="forecast-temp-high">${displayTemperature(tempMax)}°</span>
                <span> / </span>
                <span class="forecast-temp-low">${displayTemperature(tempMin)}°</span>
            </div>
            <div class="forecast-desc">${day.weather.description}</div>
        `;
        
        forecastContainer.appendChild(card);
    });

    forecastSection.classList.add('show');
}

// GEOLOCATION: Get user's current location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        },
        (error) => {
            hideLoading();
            let errorMsg = 'Unable to retrieve your location.';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out.';
                    break;
            }
            
            showError(errorMsg);
        }
    );
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Geolocation button
locationBtn.addEventListener('click', () => {
    getUserLocation();
});

// Enhanced temperature toggle with button switching
tempToggleFahrenheit.addEventListener('click', () => {
    if (tempUnit !== 'F') {
        tempUnit = 'F';
        tempToggleFahrenheit.classList.add('active');
        tempToggleCelsius.classList.remove('active');
        updateTemperatureDisplay();
        
        // Update forecast if visible
        if (currentWeatherData && forecastSection.classList.contains('show')) {
            fetch5DayForecast(currentWeatherData.coord.lat, currentWeatherData.coord.lon);
        }
    }
});

tempToggleCelsius.addEventListener('click', () => {
    if (tempUnit !== 'C') {
        tempUnit = 'C';
        tempToggleCelsius.classList.add('active');
        tempToggleFahrenheit.classList.remove('active');
        updateTemperatureDisplay();
        
        // Update forecast if visible
        if (currentWeatherData && forecastSection.classList.contains('show')) {
            fetch5DayForecast(currentWeatherData.coord.lat, currentWeatherData.coord.lon);
        }
    }
});