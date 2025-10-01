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
const tempToggle = document.getElementById('tempToggle');

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
    
    tempToggle.textContent = 
        `Switch to °${tempUnit === 'F' ? 'C' : 'F'}`;
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

tempToggle.addEventListener('click', () => {
    tempUnit = tempUnit === 'F' ? 'C' : 'F';
    updateTemperatureDisplay();
});