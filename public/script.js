const form = document.getElementById('search-form')
const input = document.getElementById('city-input')
const statusText = document.getElementById('status')
const weatherCard = document.getElementById('weather-card')

const cityName = document.getElementById('city-name')
const temperature = document.getElementById('temperature')
const description = document.getElementById('weather-description')
const wind = document.getElementById('wind')
const humidity = document.getElementById('humidity')
const feelsLike = document.getElementById('feels-like')
const weatherIcon = document.getElementById('weather-icon')

// Локальная база данных (демо-режим)
const mockWeatherData = {
  'москва': { temp: 15, feels: 13, wind: 4, hum: 65, desc: 'Переменная облачность', icon: '⛅' },
  'санкт-петербург': { temp: 12, feels: 10, wind: 6, hum: 75, desc: 'Небольшой дождь', icon: '🌧️' },
  'спб': { temp: 12, feels: 10, wind: 6, hum: 75, desc: 'Небольшой дождь', icon: '🌧️' },
  'лондон': { temp: 16, feels: 15, wind: 5, hum: 80, desc: 'Туман', icon: '🌫️' },
  'сочи': { temp: 24, feels: 25, wind: 3, hum: 60, desc: 'Ясно', icon: '☀️' },
  'казань': { temp: 14, feels: 12, wind: 4, hum: 60, desc: 'Облачно', icon: '☁️' }
};

function getWeather(city) {
  statusText.textContent = 'Загрузка...';
  weatherCard.classList.add('hidden');

  // Имитируем задержку сети (чтобы было реалистично)
  setTimeout(() => {
    const normalizedCity = city.toLowerCase().trim();
    const data = mockWeatherData[normalizedCity];

    if (!data) {
      statusText.textContent = 'Город не найден в демо-базе. Попробуйте: Москва, СПб, Лондон, Сочи или Казань.';
      return;
    }

    statusText.textContent = '';
    
    // Выводим данные
    cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    temperature.textContent = `${data.temp}°C`;
    description.textContent = data.desc;
    weatherIcon.textContent = data.icon;
    wind.textContent = `${data.wind} км/ч`;
    humidity.textContent = `${data.hum}%`;
    feelsLike.textContent = `${data.feels}°C`;

    weatherCard.classList.remove('hidden');
  }, 500); // Полсекунды задержки
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const city = input.value.trim()
  if (city) getWeather(city)
})

window.addEventListener('DOMContentLoaded', () => {
  input.value = 'Москва'
  getWeather('Москва')
})