const form = document.getElementById('search-form')
const input = document.getElementById('city-input')
const status = document.getElementById('status')
const weatherCard = document.getElementById('weather-card')

const cityName = document.getElementById('city-name')
const temperature = document.getElementById('temperature')
const description = document.getElementById('weather-description')
const wind = document.getElementById('wind')
const humidity = document.getElementById('humidity')
const feelsLike = document.getElementById('feels-like')
const weatherIcon = document.getElementById('weather-icon')

// Словарь для перевода кодов погоды в эмодзи и текст
const weatherCodes = {
  0: ['☀️', 'Ясно'],
  1: ['🌤️', 'Преимущественно ясно'],
  2: ['⛅', 'Переменная облачность'],
  3: ['☁️', 'Облачно'],
  45: ['🌫️', 'Туман'],
  48: ['🌫️', 'Иней и туман'],
  51: ['🌦️', 'Легкая морось'],
  53: ['🌦️', 'Морось'],
  55: ['🌧️', 'Сильная морось'],
  61: ['🌧️', 'Небольшой дождь'],
  63: ['🌧️', 'Дождь'],
  65: ['🌧️', 'Сильный дождь'],
  71: ['🌨️', 'Небольшой снег'],
  73: ['🌨️', 'Снег'],
  75: ['❄️', 'Сильный снег'],
  80: ['🌦️', 'Ливень'],
  95: ['⛈️', 'Гроза'],
}

// Функция получения погоды
async function getWeather(city) {
  status.textContent = 'Загрузка...'
  weatherCard.classList.add('hidden')

  try {
    // 1. Ищем координаты города
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`)
    const geoData = await geoRes.json()

    if (!geoData.results || geoData.results.length === 0) {
      status.textContent = 'Город не найден. Попробуйте другой.'
      return
    }

    const { latitude, longitude, name, country } = geoData.results[0]
    status.textContent = ''

    // 2. Получаем погоду по координатам
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`)
    const weatherData = await weatherRes.json()
    
    const current = weatherData.current
    const weatherInfo = weatherCodes[current.weather_code] || ['🌡️', 'Неизвестно']

    // 3. Выводим на экран
    cityName.textContent = `${name}, ${country}`
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`
    description.textContent = weatherInfo[1]
    weatherIcon.textContent = weatherInfo[0]
    wind.textContent = `${current.wind_speed_10m} км/ч`
    humidity.textContent = `${current.relative_humidity_2m}%`
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`

    weatherCard.classList.remove('hidden')
  } catch (error) {
    status.textContent = 'Ошибка сети. Проверьте подключение к интернету.'
    console.error('Ошибка при запросе:', error)
  }
}

// Обработка формы
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const city = input.value.trim()
  if (city) getWeather(city)
})

// ДОБАВЛЕНО: Автоматический показ Москвы при загрузке (для теста)
window.addEventListener('DOMContentLoaded', () => {
  input.value = 'Москва'
  getWeather('Москва')
})