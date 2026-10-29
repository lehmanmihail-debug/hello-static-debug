// games.js — четыре мини-игры на чистом JavaScript.
// Работает полностью офлайн: никаких API, серверов и сохранений в облаке.

// ============================================================
// 1. Крестики-нолики (вы против компьютера)
// ============================================================

const tttCells = Array.from(document.querySelectorAll('.ttt-cell'))
const tttStatus = document.getElementById('ttt-status')
const tttReset = document.getElementById('ttt-reset')
const tttScoreX = document.getElementById('ttt-score-x')
const tttScoreO = document.getElementById('ttt-score-o')
const tttScoreD = document.getElementById('ttt-score-d')

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

let tttBoard = Array(9).fill('')
let tttOver = false

function tttFindWinner(board) {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  if (board.every((cell) => cell !== '')) return 'draw'
  return null
}

function tttFinish(result) {
  tttOver = true
  if (result === 'X') {
    tttStatus.textContent = '🎉 Вы победили! Компьютер в шоке.'
    tttScoreX.textContent = String(Number(tttScoreX.textContent) + 1)
  } else if (result === 'O') {
    tttStatus.textContent = '🤖 Победил компьютер. Реванш?'
    tttScoreO.textContent = String(Number(tttScoreO.textContent) + 1)
  } else {
    tttStatus.textContent = '🤝 Ничья! Классика.'
    tttScoreD.textContent = String(Number(tttScoreD.textContent) + 1)
  }
}

function tttCheckEnd() {
  const result = tttFindWinner(tttBoard)
  if (result) {
    tttFinish(result)
    return true
  }
  return false
}

function tttAiMove() {
  const free = tttBoard.map((v, i) => (v === '' ? i : null)).filter((v) => v !== null)

  // 1) если компьютер может выиграть — выигрывает
  for (const i of free) {
    const copy = [...tttBoard]
    copy[i] = 'O'
    if (tttFindWinner(copy) === 'O') return i
  }
  // 2) если игрок вот-вот выиграет — блокируем
  for (const i of free) {
    const copy = [...tttBoard]
    copy[i] = 'X'
    if (tttFindWinner(copy) === 'X') return i
  }
  // 3) центр, потом случайная клетка
  if (tttBoard[4] === '') return 4
  return free[Math.floor(Math.random() * free.length)]
}

function tttHandleClick(index) {
  if (tttOver || tttBoard[index] !== '') return
  tttBoard[index] = 'X'
  tttCells[index].textContent = '✖'
  tttCells[index].disabled = true
  if (tttCheckEnd()) return

  const aiIndex = tttAiMove()
  if (aiIndex !== undefined) {
    tttBoard[aiIndex] = 'O'
    tttCells[aiIndex].textContent = '⭕'
    tttCells[aiIndex].disabled = true
  }
  if (tttCheckEnd()) return
  tttStatus.textContent = 'Ваш ход — ставьте ✖'
}

function tttResetGame() {
  tttBoard = Array(9).fill('')
  tttOver = false
  tttCells.forEach((cell) => {
    cell.textContent = ''
    cell.disabled = false
  })
  tttStatus.textContent = 'Ваш ход — ставьте ✖'
}

if (tttCells.length && tttStatus) {
  tttCells.forEach((cell, index) => {
    cell.addEventListener('click', () => tttHandleClick(index))
  })
  tttReset.addEventListener('click', tttResetGame)
  tttResetGame()
}

// ============================================================
// 2. Камень, ножницы, бумага
// ============================================================

const rpsButtons = Array.from(document.querySelectorAll('.rps-btn'))
const rpsPlayer = document.getElementById('rps-player')
const rpcComputer = document.getElementById('rps-computer')
const rpsStatus = document.getElementById('rps-status')
const rpsScoreW = document.getElementById('rps-score-w')
const rpsScoreL = document.getElementById('rps-score-l')

const RPS_OPTIONS = [
  { name: 'камень', icon: '✊' },
  { name: 'ножницы', icon: '✌️' },
  { name: 'бумага', icon: '✋' }
]

const RPS_BEATS = { камень: 'ножницы', ножницы: 'бумага', бумага: 'камень' }

function rpsPlay(playerIndex) {
  const player = RPS_OPTIONS[playerIndex]
  const computer = RPS_OPTIONS[Math.floor(Math.random() * RPS_OPTIONS.length)]

  rpsPlayer.textContent = player.icon
  rpcComputer.textContent = computer.icon

  if (player.name === computer.name) {
    rpsStatus.textContent = '🤝 Ничья! Великие умы мыслят одинаково.'
  } else if (RPS_BEATS[player.name] === computer.name) {
    rpsStatus.textContent = '🎉 Победа! ' + player.name + ' бьёт ' + computer.name + '.'
    rpsScoreW.textContent = String(Number(rpsScoreW.textContent) + 1)
  } else {
    rpsStatus.textContent = '😞 Проигрыш: ' + computer.name + ' бьёт ' + player.name + '.'
    rpsScoreL.textContent = String(Number(rpsScoreL.textContent) + 1)
  }
}

if (rpsButtons.length && rpsStatus) {
  rpsButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => rpsPlay(index))
  })
}

// ============================================================
// 3. Угадай число от 1 до 100
// ============================================================

const guessForm = document.getElementById('guess-form')
const guessInput = document.getElementById('guess-input')
const guessStatus = document.getElementById('guess-status')
const guessAttempts = document.getElementById('guess-attempts')
const guessReset = document.getElementById('guess-reset')

let guessSecret = 0
let guessCount = 0

function guessNewGame() {
  guessSecret = Math.floor(Math.random() * 100) + 1
  guessCount = 0
  guessInput.value = ''
  guessInput.disabled = false
  guessAttempts.textContent = 'Попыток: 0'
  guessStatus.textContent = 'Я загадал число от 1 до 100. Попробуй угадать!'
}

if (guessForm && guessStatus) {
  guessForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const value = Number(guessInput.value)

    if (!value || value < 1 || value > 100) {
      guessStatus.textContent = '⚠️ Введи число от 1 до 100!'
      return
    }

    guessCount += 1
    guessAttempts.textContent = 'Попыток: ' + guessCount

    if (value === guessSecret) {
      guessStatus.textContent = '🎉 Угадал! Это было ' + guessSecret + '. Попыток: ' + guessCount + '.'
      guessInput.disabled = true
    } else if (value < guessSecret) {
      guessStatus.textContent = '⬆️ Больше! (загаданное число выше)'
    } else {
      guessStatus.textContent = '⬇️ Меньше! (загаданное число ниже)'
    }
    guessInput.select()
  })
  guessReset.addEventListener('click', guessNewGame)
  guessNewGame()
}

// ============================================================
// 4. Викторина «Знаешь IT?»
// ============================================================

const quizProgress = document.getElementById('quiz-progress')
const quizQuestion = document.getElementById('quiz-question')
const quizOptions = document.getElementById('quiz-options')
const quizNext = document.getElementById('quiz-next')
const quizStatus = document.getElementById('quiz-status')

const QUIZ_QUESTIONS = [
  {
    q: 'Что делает тег <a href="...">?',
    options: ['Создаёт ссылку', 'Делает текст жирным', 'Вставляет картинку', 'Создаёт таблицу'],
    correct: 0
  },
  {
    q: 'Какое CSS-свойство задаёт цвет текста?',
    options: ['background', 'font-size', 'color', 'margin'],
    correct: 2
  },
  {
    q: 'Что такое Git?',
    options: ['Браузер', 'Система контроля версий', 'Язык программирования', 'Название сайта'],
    correct: 1
  },
  {
    q: 'Какой оператор в JS сравнивает значение И тип?',
    options: ['=', '==', '=>', '==='],
    correct: 3
  },
  {
    q: 'Что выведет typeof 42 в JavaScript?',
    options: ['"int"', '"number"', '"float"', '"digit"'],
    correct: 1
  },
  {
    q: 'Как объявить константу в современном JS?',
    options: ['var x = 1', 'let x = 1', 'const x = 1', 'static x = 1'],
    correct: 2
  }
]

let quizCurrent = 0
let quizScore = 0

function quizRender() {
  const item = QUIZ_QUESTIONS[quizCurrent]
  quizProgress.textContent = 'Вопрос ' + (quizCurrent + 1) + ' из ' + QUIZ_QUESTIONS.length
  quizQuestion.textContent = item.q
  quizOptions.innerHTML = ''
  quizNext.classList.add('hidden')
  quizStatus.textContent = ''

  item.options.forEach((option, index) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'quiz-option'
    btn.textContent = option
    btn.addEventListener('click', () => quizAnswer(index, btn))
    quizOptions.appendChild(btn)
  })
}

function quizAnswer(index, btn) {
  const item = QUIZ_QUESTIONS[quizCurrent]
  const buttons = Array.from(quizOptions.children)

  buttons.forEach((b) => {
    b.disabled = true
    if (buttons.indexOf(b) === item.correct) {
      b.classList.add('correct')
    }
  })

  if (index === item.correct) {
    quizScore += 1
    quizStatus.textContent = '✅ Верно!'
  } else {
    btn.classList.add('wrong')
    quizStatus.textContent = '❌ Неа. Правильный ответ подсвечен.'
  }

  quizNext.classList.remove('hidden')
  quizNext.textContent = quizCurrent === QUIZ_QUESTIONS.length - 1 ? 'Показать результат' : 'Следующий вопрос →'
}

function quizFinish() {
  const percent = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)
  let title = '🤔 Есть куда расти'
  if (percent >= 100) title = '🏆 Сеньор!'
  if (percent >= 67) title = '😎 Уверенный мидл'
  if (percent <= 33) title = '🌱 Джун, но старательный'

  quizProgress.textContent = 'Итог: ' + quizScore + ' из ' + QUIZ_QUESTIONS.length + ' (' + percent + '%)'
  quizQuestion.textContent = title
  quizOptions.innerHTML = ''
  quizStatus.textContent = 'Нажми «Ещё раз», чтобы попробовать снова.'
  quizNext.textContent = '🔄 Ещё раз'
}

if (quizNext && quizQuestion) {
  quizNext.addEventListener('click', () => {
    if (quizCurrent < QUIZ_QUESTIONS.length - 1) {
      quizCurrent += 1
      quizRender()
    } else if (quizNext.textContent.includes('Ещё раз')) {
      quizCurrent = 0
      quizScore = 0
      quizRender()
    } else {
      quizFinish()
    }
  })
  quizRender()
}
