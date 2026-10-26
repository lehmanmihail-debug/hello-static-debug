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

async function getWeather(city) {
  statusText.textContent = 'Загрузка...'
  weatherCard.classList.add('hidden')

  try {
    // Используем сервис wttr.in (работает без ключей и блокировок)
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    
    if (!res.ok) {
      throw new Error('Город не найден')
    }

    const data = await res.json()
    
    if (!data.current_condition || data.current_condition.length === 0) {
      statusText.textContent = 'Город не найден. Попробуйте другой.'
      return
    }

    const current = data.current_condition[0]
    
    // Данные из wttr.in
    const temp = current.temp_C
    const feels = current.FeelsLikeC
    const hum = current.humidity
    const windSpeed = current.windspeedKmph
    const desc = current.weatherDesc[0].value

    // Подбираем эмодзи по описанию (так как wttr.in отдает текст)
    let emoji = '🌡️'
    const descLower = desc.toLowerCase()
    if (descLower.includes('sun') || descLower.includes('clear')) emoji = '☀️'
    else if (descLower.includes('cloud') || descLower.includes('overcast')) emoji = '☁️'
    else if (descLower.includes('rain') || descLower.includes('drizzle')) emoji = '🌧️'
    else if (descLower.includes('snow')) emoji = '❄️'
    else if (descLower.includes('thunder')) emoji = '⛈️'

    statusText.textContent = ''

    cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1)
    temperature.textContent = `${temp}°C`
    description.textContent = desc
    weatherIcon.textContent = emoji
    wind.textContent = `${windSpeed} км/ч`
    humidity.textContent = `${hum}%`
    feelsLike.textContent = `${feels}°C`

    weatherCard.classList.remove('hidden')
  } catch (error) {
    statusText.textContent = 'Ошибка: город не найден или проблемы с сетью.'
    console.error('Ошибка при запросе:', error)
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