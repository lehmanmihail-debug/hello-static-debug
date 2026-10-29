// script.js — общие интерактивные штуки сайта (главная и галерея).
// Никаких запросов к интернету: все данные лежат прямо в этом файле.

// ---------- Приветствие по времени суток (главная) ----------
const greetingEl = document.getElementById('greeting')

if (greetingEl) {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    greetingEl.textContent = '☀️ Доброе утро!'
  } else if (hour >= 12 && hour < 18) {
    greetingEl.textContent = '👋 Добрый день!'
  } else if (hour >= 18 && hour < 23) {
    greetingEl.textContent = '🌆 Добрый вечер!'
  } else {
    greetingEl.textContent = '🌙 Доброй ночи, кодер!'
  }
}

// ---------- Цитата дня (главная) ----------
const quotes = [
  { text: 'Работает — не трогай.', author: 'Золотое правило разработчика' },
  { text: 'Это не баг, это недокументированная фича.', author: 'Классика программирования' },
  { text: 'Программы должны писаться для людей, чтобы их читать, и лишь попутно для машин, чтобы их исполнять.', author: 'Гарольд Абельсон' },
  { text: 'Сложность удержания кода прямо пропорциональна количеству авторских хаков в нём.', author: 'Народная мудрость тимлидов' },
  { text: 'Чтобы понять рекурсию, нужно сначала понять рекурсию.', author: 'Древний программистский фольклор' },
  { text: 'Два самых сложных дела в IT: кэширование и придумывание имён.', author: 'Фил Карлтон' },
  { text: 'Первые 90% кода занимают 90% времени. Оставшиеся 10% — ещё 90% времени.', author: 'Закон Хэйра' },
  { text: 'Лучший способ предсказать будущее — написать его своими руками.', author: 'Алан Кэй (почти)' }
]

const quoteText = document.getElementById('quote-text')
const quoteAuthor = document.getElementById('quote-author')
const newQuoteBtn = document.getElementById('new-quote')

function showRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  if (quoteText && quoteAuthor) {
    quoteText.textContent = '«' + quote.text + '»'
    quoteAuthor.textContent = '— ' + quote.author
  }
}

if (newQuoteBtn) {
  newQuoteBtn.addEventListener('click', showRandomQuote)
  showRandomQuote()
}

// ---------- Факт дня (галерея) ----------
const facts = [
  'Символ «#» в CSS-классах команды встречается 0 раз — мы пишем классы словами, а не координатами.',
  'Первая версия этого сайта показывала погоду. Теперь он показывает настроение команды — и работает всегда.',
  'Наш сайт весит меньше одной фотографии из мессенджера — меньше 100 КБ на страницу.',
  'GitHub Pages отдаёт наш сайт быстрее, чем открывается некоторые приложения на телефоне.',
  'У нас 4 мини-игры, и все написаны с нуля на чистом JavaScript — без единой библиотеки.',
  'Тёмная тема сайта включает одну CSS-переменную — и весь сайт перекрашивается сам.',
  'README проекта длиннее, чем весь HTML главной страницы. И это не шутка.',
  'Команда hello-static-debug собрана из 5 человек, и все прошли путь от «что такое git push» до деплоя на Pages.'
]

const factText = document.getElementById('fact-text')
const newFactBtn = document.getElementById('new-fact')

if (newFactBtn && factText) {
  newFactBtn.addEventListener('click', () => {
    factText.textContent = facts[Math.floor(Math.random() * facts.length)]
  })
}

// ---------- Год в футере (все страницы) ----------
const yearEl = document.getElementById('year')

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear())
}
