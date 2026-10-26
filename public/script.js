const API_GEO = 'https://geocoding-api.open-meteo.com/v1/search'
const API_WEATHER = 'https://api.open-meteo.com/v1/forecast'

const WEATHER_CODES = {
  0: { icon: '☀️', desc: 'Ясно' },
  1: { icon: '🌤️', desc: 'Преимущественно ясно' },
  2: { icon: '⛅', desc: 'Переменная облачность' },
  3: { icon: '☁️', desc: 'Пасмурно' },
  45: { icon: '🌫️', desc: 'Туман' },
  48: { icon: '🌫️', desc: 'Изморозь' },
  51: { icon: '🌦️', desc: 'Слабая морось' },
  53: { icon: '🌦️', desc: 'Морось' },
  55: { icon: '🌧️', desc: 'Сильная морось' },
  61: { icon: '🌧️', desc: 'Небольшой дождь' },
  63: { icon: '🌧️', desc: 'Дождь' },
  65: { icon: '🌧️', desc: 'Сильный дождь' },
  71: { icon: '🌨️', desc: 'Небольшой снег' },
  73: { icon: '🌨️', desc: 'Снег' },
  75: { icon: '❄️', desc: 'Сильный снег' },
  77: { icon: '🌨️', desc: 'Снежная крупа' },
  80: { icon: '🌦️', desc: 'Небольшой ливень' },
  81: { icon: '🌧️', desc: 'Ливень' },
  82: { icon: '⛈️', desc: 'Сильный ливень' },
  95: { icon: '⛈️', desc: 'Гроза' },
  96: { icon: '⛈️', desc: 'Гроза с градом' },
  99: { icon: '⛈️', desc: 'Сильная гроза с градом' }
}

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const form = document.getElementById('search-form')
const cityInput = document.getElementById('city-input')
const errorBox = document.getElementById('error')
const loadingBox = document.getElementById('loading')
const weatherBox = document.getElementById('weather')
const unitSwitch = document.getElementById('unit-switch')
const themeToggle = document.getElementById('theme-toggle')

let currentUnit = localStorage.getItem('unit') || 'celsius'
let currentCoords = null
let currentCityName = ''

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { icon: '❓', desc: 'Неизвестно' }
}

function showError(message) {
  errorBox.textContent = message
  errorBox.classList.remove('hidden')
  weatherBox.classList.add('hidden')
}

function hideError() {
  errorBox.classList.add('hidden')
}

function showLoading() {
  loadingBox.classList.remove('hidden')
  weatherBox.classList.add('hidden')
}

function hideLoading() {
  loadingBox.classList.add('hidden')
}

function updateUnitButtons() {
  const buttons = unitSwitch.querySelectorAll('button')
  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.unit === currentUnit)
  })
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'
  localStorage.setItem('theme', theme)
}

async function geocodeCity(city) {
  const url = `${API_GEO}?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Не удалось найти город')
  }
  const data = await response.json()
  if (!data.results || data.results.length === 0) {
    throw new Error(`Город «${city}» не найден`)
  }
  const result = data.results[0]
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country
  }
}

async function fetchWeather(latitude, longitude) {
  const url =
    `${API_WEATHER}?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    `&timezone=auto&forecast_days=5&temperature_unit=${currentUnit}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Не удалось получить прогноз')
  }
  return response.json()
}

function renderWeather(data) {
  document.getElementById('city-name').textContent = currentCityName

  const current = data.current
  const info = getWeatherInfo(current.weather_code)

  document.getElementById('current-icon').textContent = info.icon
  document.getElementById('current-temp').textContent = `${Math.round(current.temperature_2m)}°`
  document.getElementById('current-desc').textContent = info.desc
  document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°`
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`
  document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} км/ч`

  const forecastList = document.getElementById('forecast-list')
  forecastList.innerHTML = ''

  const daily = data.daily
  daily.time.forEach((dateStr, index) => {
    const date = new Date(dateStr)
    const dayInfo = getWeatherInfo(daily.weather_code[index])

    const card = document.createElement('div')
    card.className = 'forecast-card'

    const day = document.createElement('div')
    day.className = 'forecast-day'
    day.textContent = index === 0 ? 'Сегодня' : DAYS[date.getDay()]

    const icon = document.createElement('span')
    icon.className = 'forecast-icon'
    icon.textContent = dayInfo.icon

    const max = document.createElement('div')
    max.className = 'forecast-max'
    max.textContent = `${Math.round(daily.temperature_2m_max[index])}°`

    const min = document.createElement('div')
    min.className = 'forecast-min'
    min.textContent = `${Math.round(daily.temperature_2m_min[index])}°`

    card.append(day, icon, max, min)
    forecastList.append(card)
  })

  weatherBox.classList.remove('hidden')
}

async function loadWeather(latitude, longitude, name) {
  showLoading()
  hideError()
  currentCoords = { latitude, longitude }
  currentCityName = name

  try {
    const data = await fetchWeather(latitude, longitude)
    hideLoading()
    renderWeather(data)
  } catch (error) {
    hideLoading()
    showError(error.message)
  }
}

async function searchCity(city) {
  showLoading()
  hideError()

  try {
    const location = await geocodeCity(city)
    currentCoords = { latitude: location.latitude, longitude: location.longitude }
    currentCityName = location.country ? `${location.name}, ${location.country}` : location.name
    const data = await fetchWeather(location.latitude, location.longitude)
    hideLoading()
    renderWeather(data)
  } catch (error) {
    hideLoading()
    showError(error.message)
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const city = cityInput.value.trim()
  if (city) {
    searchCity(city)
  }
})

unitSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button) {
    return
  }
  const unit = button.dataset.unit
  if (unit === currentUnit) {
    return
  }
  currentUnit = unit
  localStorage.setItem('unit', unit)
  updateUnitButtons()
  if (currentCoords) {
    loadWeather(currentCoords.latitude, currentCoords.longitude, currentCityName)
  }
})

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme || 'light'
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
})

function init() {
  const savedTheme = localStorage.getItem('theme') || 'light'
  applyTheme(savedTheme)
  updateUnitButtons()
}

init()