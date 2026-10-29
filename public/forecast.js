// forecast.js — страница «Прогноз на неделю»
// Данные: открытый API Open-Meteo (геокодинг + прогноз на 7 дней)

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const forecastForm = document.getElementById('forecast-form');
const cityInput = document.getElementById('forecast-city');
const statusText = document.getElementById('forecast-status');
const loadingBlock = document.getElementById('forecast-loading');
const resultCard = document.getElementById('forecast-result');
const cityNameEl = document.getElementById('forecast-city-name');
const gridEl = document.getElementById('forecast-grid');

// Расшифровка погодных кодов WMO (https://open-meteo.com/en/docs)
const WEATHER_CODES = {
  0: { desc: 'Ясно', icon: '☀️' },
  1: { desc: 'Преимущественно ясно', icon: '🌤️' },
  2: { desc: 'Переменная облачность', icon: '⛅' },
  3: { desc: 'Пасмурно', icon: '☁️' },
  45: { desc: 'Туман', icon: '🌫️' },
  48: { desc: 'Изморозь', icon: '🌫️' },
  51: { desc: 'Слабая морось', icon: '🌦️' },
  53: { desc: 'Морось', icon: '🌦️' },
  55: { desc: 'Сильная морось', icon: '🌦️' },
  56: { desc: 'Ледяная морось', icon: '🌧️' },
  57: { desc: 'Сильная ледяная морось', icon: '🌧️' },
  61: { desc: 'Небольшой дождь', icon: '🌧️' },
  63: { desc: 'Дождь', icon: '🌧️' },
  65: { desc: 'Сильный дождь', icon: '🌧️' },
  66: { desc: 'Ледяной дождь', icon: '🌧️' },
  67: { desc: 'Сильный ледяной дождь', icon: '🌧️' },
  71: { desc: 'Небольшой снег', icon: '🌨️' },
  73: { desc: 'Снег', icon: '🌨️' },
  75: { desc: 'Сильный снег', icon: '❄️' },
  77: { desc: 'Снежные зёрна', icon: '🌨️' },
  80: { desc: 'Небольшой ливень', icon: '🌦️' },
  81: { desc: 'Ливень', icon: '🌧️' },
  82: { desc: 'Сильный ливень', icon: '⛈️' },
  85: { desc: 'Снежный ливень', icon: '🌨️' },
  86: { desc: 'Сильный снежный ливень', icon: '❄️' },
  95: { desc: 'Гроза', icon: '⛈️' },
  96: { desc: 'Гроза с градом', icon: '⛈️' },
  99: { desc: 'Сильная гроза с градом', icon: '⛈️' }
};

function weatherInfo(code) {
  const info = WEATHER_CODES[code];
  if (info) return info;
  return { desc: 'Погода неизвестна', icon: '🌡️' };
}

// Запрос с таймаутом 10 секунд, чтобы страница не висела вечно
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, 10000);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Подсказка: почему запрос к API мог не пройти в текущем окружении
function networkHint() {
  if (window.location.protocol === 'file:') {
    return 'Страница открыта как локальный файл (file://): в Firefox такие запросы всегда блокируются. Откройте проект через Live Preview (адрес должен начинаться с http://127.0.0.1) или проверьте сайт на GitHub Pages.';
  }
  return 'Проверьте интернет и VPN. Если смотрите через предпросмотр VS Code — используйте расширение Live Preview (кнопка Go Live, адрес http://127.0.0.1:3000). Надёжнее всего проверить сайт на GitHub Pages.';
}

function errorText(err) {
  if (err && err.name === 'AbortError') {
    return 'превышено время ожидания (10 секунд)';
  }
  if (err && err.message) {
    return err.message;
  }
  return 'сеть недоступна';
}

function formatDay(isoDate, index) {
  const date = new Date(isoDate + 'T12:00:00');
  if (index === 0) return 'Сегодня';
  if (index === 1) return 'Завтра';
  return date.toLocaleDateString('ru-RU', { weekday: 'long' });
}

function formatDate(isoDate) {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function dayCardHtml(day, index) {
  const info = weatherInfo(day.weather_code);
  const name = formatDay(day.date, index);
  const date = formatDate(day.date);
  const precipitation = day.precipitation_probability_max;
  return (
    '<article class="day-card">' +
      '<p class="day-name">' + name + '</p>' +
      '<p class="day-date">' + date + '</p>' +
      '<span class="day-icon">' + info.icon + '</span>' +
      '<p class="day-desc">' + info.desc + '</p>' +
      '<p class="day-temps">' +
        '<span class="day-max">' + Math.round(day.temperature_2m_max) + '°</span>' +
        '<span class="day-min">' + Math.round(day.temperature_2m_min) + '°</span>' +
      '</p>' +
      '<p class="day-extra">💧 ' + precipitation + '% · 💨 ' +
        Math.round(day.wind_speed_10m_max) + ' км/ч</p>' +
    '</article>'
  );
}

function renderForecast(placeName, data) {
  const daily = data.daily;
  cityNameEl.textContent = '📍 ' + placeName;

  const cards = daily.time.map(function (date, index) {
    const day = {
      date: date,
      weather_code: daily.weather_code[index],
      temperature_2m_max: daily.temperature_2m_max[index],
      temperature_2m_min: daily.temperature_2m_min[index],
      precipitation_probability_max: daily.precipitation_probability_max[index] || 0,
      wind_speed_10m_max: daily.wind_speed_10m_max[index]
    };
    return dayCardHtml(day, index);
  });

  gridEl.innerHTML = cards.join('');
  resultCard.classList.remove('hidden');
}

function showLoading(isLoading) {
  if (isLoading) {
    loadingBlock.classList.remove('hidden');
    resultCard.classList.add('hidden');
  } else {
    loadingBlock.classList.add('hidden');
  }
}

async function loadForecast(city) {
  statusText.textContent = 'Ищем город «' + city + '»...';
  showLoading(true);

  try {
    const geoUrl = GEOCODING_URL +
      '?name=' + encodeURIComponent(city) +
      '&count=1&language=ru&format=json';
    const geoResponse = await fetchWithTimeout(geoUrl);
    const geoData = await geoResponse.json();
    const place = geoData.results && geoData.results[0];

    if (!place) {
      statusText.textContent = 'Город не найден. Попробуйте другое написание.';
      return;
    }

    statusText.textContent = 'Загружаем прогноз...';
    const placeName = place.name + (place.country ? ', ' + place.country : '');
    const params = [
      'latitude=' + place.latitude,
      'longitude=' + place.longitude,
      'daily=weather_code,temperature_2m_max,temperature_2m_min,' +
        'precipitation_probability_max,wind_speed_10m_max',
      'timezone=auto',
      'forecast_days=7'
    ].join('&');
    const forecastResponse = await fetchWithTimeout(FORECAST_URL + '?' + params);
    const forecastData = await forecastResponse.json();

    renderForecast(placeName, forecastData);
    statusText.textContent = 'Прогноз обновлён ✅';
  } catch (err) {
    statusText.textContent = 'Не удалось загрузить данные (' + errorText(err) + '). ' + networkHint();
  } finally {
    showLoading(false);
  }
}

forecastForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) loadForecast(city);
});

window.addEventListener('DOMContentLoaded', function () {
  loadForecast('Москва');
});
