// contacts.js — копирование контактов в буфер и отправка формы через почтовый клиент.
// Работает офлайн: форма открывает ваш почтовый клиент, ничего никуда не отправляется сама.

const CONTACT_EMAIL = 'hello.static.debug@gmail.com'

// ---------- Кнопки «Скопировать» ----------
const copyButtons = Array.from(document.querySelectorAll('.copy-btn'))

function fallbackCopy(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  try {
    document.execCommand('copy')
  } catch {
    // старые браузеры могут не уметь — просто закрываем
  }
  document.body.removeChild(area)
}

function handleCopy(event) {
  const btn = event.currentTarget
  const value = btn.dataset.copy || ''
  const original = btn.textContent

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).catch(() => fallbackCopy(value))
  } else {
    fallbackCopy(value)
  }

  btn.textContent = 'Скопировано ✓'
  setTimeout(() => {
    btn.textContent = original
  }, 1500)
}

copyButtons.forEach((btn) => {
  btn.addEventListener('click', handleCopy)
})

// ---------- Форма обратной связи (открывает почтовый клиент) ----------
const contactForm = document.getElementById('contact-form')
const contactSuccess = document.getElementById('contact-success')

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const name = document.getElementById('cf-name').value.trim()
    const email = document.getElementById('cf-email').value.trim()
    const message = document.getElementById('cf-message').value.trim()

    const subject = encodeURIComponent('Сообщение с сайта команды — от ' + name)
    const body = encodeURIComponent(
      'Имя: ' + name + '\n' +
      'E-mail: ' + email + '\n\n' +
      message
    )

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body

    if (contactSuccess) {
      contactSuccess.textContent = '📬 Открылся ваш почтовый клиент — осталось нажать «Отправить»!'
    }
  })
}
