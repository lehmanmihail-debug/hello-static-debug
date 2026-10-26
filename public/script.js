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

// Словарь для перевода кодов погоды
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

async function getWeather(city) {
  statusText.textContent = 'Загрузка...'
  weatherCard.classList.add('hidden')

  try {
    // Используем прокси allorigins, чтобы обойти возможную блокировку
    const proxyUrl = 'https://api.allorigins.win/get?url='
    
    // 1. Геокодинг (получаем координаты)
    const geoUrl = encodeURIComponent(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`)
    const geoRes = await fetch(proxyUrl + geoUrl)
    const geoData = await geoRes.json()
    
    // Парсим ответ от прокси
    const geoResult = JSON.parse(geoData.contents)

    if (!geoResult.results || geoResult.results.length === 0) {
      statusText.textContent = 'Город не найден. Попробуйте другой.'
      return
    }

    const { latitude, longitude, name, country } = geoResult.results[0]
    
    // 2. Погода (по координатам)
    const weatherUrl = encodeURIComponent(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`)
    const weatherRes = await fetch(proxyUrl + weatherUrl)
    const weatherData = await weatherRes.json()
    
    const weatherResult = JSON.parse(weatherData.contents)
    const current = weatherResult.current
    const weatherInfo = weatherCodes[current.weather_code] || ['🌡️', 'Неизвестно']

    // 3. Выводим на экран
    cityName.textContent = `${name}, ${country}`
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`
    description.textContent = weatherInfo[1]
    weatherIcon.textContent = weatherInfo[0]
    wind.textContent = `${current.wind_speed_10m} км/ч`
    humidity.textContent = `${current.relative_humidity_2m}%`
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`

    statusText.textContent = ''
    weatherCard.classList.remove('hidden')
  } catch (error) {
    statusText.textContent = 'Ошибка при запросе. Проверьте интернет.'
    console.error('Ошибка:', error)
  }
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