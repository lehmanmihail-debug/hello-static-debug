// timer.js — помодоро-таймер для учёбы. Работает полностью офлайн.

const MODES = {
  pomodoro: { label: '🍅 Помодоро', minutes: 25 },
  short: { label: '☕ Короткий перерыв', minutes: 5 },
  long: { label: '🛋️ Длинный перерыв', minutes: 15 }
}

const timerDisplay = document.getElementById('timer-display')
const timerStatus = document.getElementById('timer-status')
const timerProgress = document.getElementById('timer-progress')
const timerStart = document.getElementById('timer-start')
const timerReset = document.getElementById('timer-reset')
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'))
const pomodoroCount = document.getElementById('pomodoro-count')

let currentMode = 'pomodoro'
let totalSeconds = MODES.pomodoro.minutes * 60
let secondsLeft = totalSeconds
let timerId = null
let finishedPomodoros = 0

function formatTime(total) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}

function render() {
  const time = formatTime(secondsLeft)
  timerDisplay.textContent = time
  const percent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)
  timerProgress.style.width = percent + '%'
  if (timerId) {
    document.title = time + ' · ' + MODES[currentMode].label + ' — Hello Static Debug'
  }
}

function stopTimer() {
  clearInterval(timerId)
  timerId = null
  timerStart.textContent = '▶️ Старт'
  document.title = 'Таймер — Hello Static Debug'
}

function tick() {
  secondsLeft -= 1
  if (secondsLeft <= 0) {
    stopTimer()
    secondsLeft = 0
    timerProgress.style.width = '100%'
    if (currentMode === 'pomodoro') {
      finishedPomodoros += 1
      pomodoroCount.textContent = String(finishedPomodoros)
      timerStatus.textContent = '🎉 Помодоро завершён! Сделай перерыв — ты заслужил.'
    } else {
      timerStatus.textContent = '💪 Перерыв окончен. Возвращайся к делу!'
    }
    return
  }
  render()
}

function setMode(mode) {
  stopTimer()
  currentMode = mode
  totalSeconds = MODES[mode].minutes * 60
  secondsLeft = totalSeconds
  timerStatus.textContent = MODES[mode].label + ' — нажми «Старт», когда будешь готов.'
  render()
}

if (timerDisplay && timerStart) {
  timerStart.addEventListener('click', () => {
    if (timerId) {
      stopTimer()
      timerStatus.textContent = '⏸ Пауза. Таймер ждёт тебя.'
      return
    }
    timerId = setInterval(tick, 1000)
    timerStart.textContent = '⏸ Пауза'
    timerStatus.textContent = '🚀 Погнали! Не отвлекаемся.'
    render()
  })

  timerReset.addEventListener('click', () => setMode(currentMode))

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((other) => other.classList.remove('active'))
      btn.classList.add('active')
      setMode(btn.dataset.mode)
    })
  })

  setMode('pomodoro')
}
