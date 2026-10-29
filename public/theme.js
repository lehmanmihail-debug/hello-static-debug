// theme.js — переключение светлой/тёмной темы на всех страницах.
// Подключается на каждой странице перед остальными скриптами.

const themeToggle = document.getElementById('theme-toggle')

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
  }
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'
  }
}

// Восстанавливаем сохранённый выбор (если браузер разрешает localStorage)
let savedTheme = null
try {
  savedTheme = localStorage.getItem('theme')
} catch {
  // file:// в некоторых браузерах может блокировать localStorage — это не ошибка
}
applyTheme(savedTheme === 'dark' ? 'dark' : 'light')

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark'
    const next = isDark ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // игнорируем: тема просто не сохранится между открытиями
    }
  })
}
