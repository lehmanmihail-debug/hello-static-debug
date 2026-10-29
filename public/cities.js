// cities.js — страница «Города мира»
// Показывает текущую погоду в 9 городах через API Open-Meteo

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CITIES = [
  { name: 'Москва', country: 'Россия', flag: '🇷🇺', lat: 55.75, lon: 37.62 },
  { name: 'Санкт-Петербург', country: 'Россия', flag: '🇷🇺', lat: 59.94, lon: 30.31 },
  { name: 'Лондон', country: 'Великобритания', flag: '🇬🇧', lat: 51.51, lon: -0.13 },
  { name: 'Париж', country: 'Франция', flag: '🇫🇷', lat: 48.85, lon: 2.35 },
  { name: 'Берлин', country: 'Германия', flag: '🇩🇪', lat: 52.52, lon: 13.4 },
  { name: 'Нью-Йорк', country: 'США', flag: '🇺🇸', lat: 40.71, lon: -74.01 },
  { name: 'Токио', country: 'Япония', flag: '🇯🇵', lat: 35.68, lon: 139.69 },
  { name: 'Дубай', country: 'ОАЭ', flag: '🇦🇪', lat: 25.2, lon: 55.27 },
  { name: 'Сидней', country: 'Австралия', flag: '🇦🇺', lat: -33.87, lon: 151.21 }
];

// Расшифровка погодных кодов WMO
const WEATHER_CODES = {
  0: { desc: 'Ясно', icon: '☀️' },
  1: { desc: 'В основном ясно', icon: '🌤️' },
  2: { desc: 'Переменная облачность', icon: '⛅' },
  3: { desc: 'Пасмурно', icon: '☁️' },
  45: { desc: 'Туман', icon: '🌫️' },
  48: { desc: 'Изморозь', icon: '🌫️' },
  51: { desc: 'Морось', icon: '🌦️' },
  53: { desc: 'Морось', icon: '🌦️' },
  55: { desc: 'Морось', icon: '🌦️' },
  61: { desc: 'Небольшой дождь', icon: '🌧️' },
  63: { desc: 'Дождь', icon: '🌧️' },
  65: { desc: 'Сильный дождь', icon: '🌧️' },
  66: { desc: 'Ледяной дождь', icon: '🌧️' },
  67: { desc: 'Ледяной дождь', icon: '🌧️' },
  71: { desc: 'Небольшой снег', icon: '🌨️' },
  73: { desc: 'Снег', icon: '🌨️' },
  75: { desc: 'Сильный снег', icon: '❄️' },
  77: { desc: 'Снежные зёрна', icon: '🌨️' },
  80: { desc: 'Ливень', icon: '🌦️' },
  81: { desc: 'Ливень', icon: '🌧️' },
  82: { desc: 'Сильный ливень', icon: '⛈️' },
  85: { desc: 'Снежный ливень', icon: '🌨️' },
  86: { desc: 'Снежный ливень', icon: '❄️' },
  95: { desc: 'Гроза', icon: '⛈️' },
  96: { desc: 'Гроза с градом', icon: '⛈️' },
  99: { desc: 'Гроза с градом', icon: '⛈️' }
};

function weatherInfo(code) {
  const info = WEATHER_CODES[code];
  if (info) return info;
  return { desc: 'Данные недоступны', icon: '🌡️' };
}

// Запрос с таймаутом 10 секунд
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

// Подсказка при сетевых проблемах
function networkHint() {
  if (window.location.protocol === 'file:') {
    return 'Страница открыта как локальный файл (file://): в Firefox такие запросы всегда блокируются. Откройте проект через Live Preview (адрес должен начинаться с http://127.0.0.1) или проверьте сайт на GitHub Pages.';
  }
  return 'Проверьте интернет и VPN. Если смотрите через предпросмотр VS Code — используйте расширение Live Preview (кнопка Go Live, адрес http://127.0.0.1:3000). Надёжнее всего проверить сайт на GitHub Pages.';
}

function cityCardHtml(city, weather) {
  if (!weather) {
    return (
      '<article class="city-card">' +
        '<p class="city-name">' + city.flag + ' ' + city.name + '</p>' +
        '<p class="city-country">' + city.country + '</p>' +
        '<span class="city-icon">🚫</span>' +
        '<p class="city-desc">Не удалось загрузить данные</p>' +
      '</article>'
    );
  }

  const current = weather.current;
  const info = weatherInfo(current.weather_code);
  return (
    '<article class="city-card">' +
      '<p class="city-name">' + city.flag + ' ' + city.name + '</p>' +
      '<p class="city-country">' + city.country + '</p>' +
      '<span class="city-icon">' + info.icon + '</span>' +
      '<p class="city-temp">' + Math.round(current.temperature_2m) + '°C</p>' +
      '<p class="city-desc">' + info.desc + '</p>' +
      '<p class="city-meta">💨 ' + Math.round(current.wind_speed_10m) + ' км/ч · ' +
        '💧 ' + current.relative_humidity_2m + '%<br>' +
        '🌡️ ощущается как ' + Math.round(current.apparent_temperature) + '°C</p>' +
    '</article>'
  );
}

function cityRequestUrl(city) {
  return FORECAST_URL +
    '?latitude=' + city.lat +
    '&longitude=' + city.lon +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
    '&timezone=auto';
}

function showLoading(isLoading) {
  const loading = document.getElementById('cities-loading');
  const section = document.getElementById('cities-section');
  if (isLoading) {
    loading.classList.remove('hidden');
    section.classList.add('hidden');
  } else {
    loading.classList.add('hidden');
    section.classList.remove('hidden');
  }
}

async function loadAllCities() {
  showLoading(true);

  const requests = CITIES.map(function (city) {
    return fetchWithTimeout(cityRequestUrl(city))
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .catch(function () {
        return null;
      });
  });

  const results = await Promise.all(requests);
  const grid = document.getElementById('cities-grid');

  const cards = CITIES.map(function (city, index) {
    return cityCardHtml(city, results[index]);
  });
  grid.innerHTML = cards.join('');

  const updated = document.getElementById('cities-updated');
  const failed = results.filter(function (item) {
    return item === null;
  }).length;

  if (failed === CITIES.length) {
    updated.className = 'error';
    updated.textContent = 'Не удалось загрузить ни один город — ' +
      'нет доступа к api.open-meteo.com. ' + networkHint();
  } else {
    updated.className = 'updated-note';
    const now = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    updated.textContent = 'Данные обновлены в ' + now +
      (failed > 0 ? ' (для ' + failed + ' городов данных нет)' : '');
  }

  showLoading(false);
}

document.getElementById('refresh-btn').addEventListener('click', function () {
  loadAllCities();
});

window.addEventListener('DOMContentLoaded', function () {
  loadAllCities();
});
