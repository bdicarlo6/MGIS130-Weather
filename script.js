// DATA LAYER: API Configuration
const API_KEY = '9467a0b567aa775afec3624e096220d8';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// State management
let currentWeatherData = null;
let tempUnit = 'F'; // F for Fahrenheit, C for Celsius

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const initialMessage = document.getElementById('initialMessage');
const tempToggleFahrenheit = document.getElementById('tempToggleFahrenheit');
const tempToggleCelsius = document.getElementById('tempToggleCelsius');
const weatherParticles = document.getElementById('weatherParticles');

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

// UI Helper Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherCard.classList.remove('show');
    initialMessage.style.display = 'none';
}

function hideError() {
    errorMessage.classList.remove('show');
}

function showLoading() {
    loading.classList.add('show');
    searchBtn.disabled = true;
    hideError();
}

function hideLoading() {
    loading.classList.remove('show');
    searchBtn.disabled = false;
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

    document.getElementById('humidity').textContent = 
        `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = 
        `${data.wind.speed} m/s`;

    weatherCard.classList.add('show');
    initialMessage.style.display = 'none';
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;

    const temp = displayTemperature(currentWeatherData.main.temp);
    const feelsLike = displayTemperature(currentWeatherData.main.feels_like);

    document.getElementById('temperature').textContent = 
        `${temp}°${tempUnit}`;
    document.getElementById('feelsLike').textContent = 
        `Feels like ${feelsLike}°${tempUnit}`;
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

// Enhanced temperature toggle with button switching
tempToggleFahrenheit.addEventListener('click', () => {
    if (tempUnit !== 'F') {
        tempUnit = 'F';
        tempToggleFahrenheit.classList.add('active');
        tempToggleCelsius.classList.remove('active');
        updateTemperatureDisplay();
    }
});

tempToggleCelsius.addEventListener('click', () => {
    if (tempUnit !== 'C') {
        tempUnit = 'C';
        tempToggleCelsius.classList.add('active');
        tempToggleFahrenheit.classList.remove('active');
        updateTemperatureDisplay();
    }
});