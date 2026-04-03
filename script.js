'use strict';

// ===== NAVIGATION =====
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('section-' + name);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'practice' && !gameInitialized) {
    initGame();
    gameInitialized = true;
  }
  if (name === 'learn') {
    buildExplainBoard();
    buildElimDemo();
    buildSoleDemo();
  }
}

// ===== DARK MODE =====
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const html = document.documentElement;
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  updateToggleIcon(toggle, theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', theme);
      updateToggleIcon(toggle, theme);
    });
  }
})();

function updateToggleIcon(btn, theme) {
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    btn.setAttribute('aria-label', 'עבור למצב בהיר');
  } else {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.setAttribute('aria-label', 'עבור למצב כהה');
  }
}

// ===== FAQ =====
function toggleFaq(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-a');
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  answer.classList.toggle('open', !isOpen);
}

// ===== LEARN — STEPS =====
function showLearnStep(stepNum) {
  document.querySelectorAll('.learn-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));

  const step = document.querySelector(`.learn-step[data-step="${stepNum}"]`);
  const btn = document.querySelector(`.step-btn[data-step="${stepNum}"]`);
  if (step) step.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ===== EXPLAIN BOARD =====
const EXPLAIN_PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

let explainBuilt = false;
function buildExplainBoard() {
  if (explainBuilt) return;
  explainBuilt = true;
  const grid = document.getElementById('explain-board-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'ex-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const val = EXPLAIN_PUZZLE[r][c];
      cell.textContent = val || '';
      cell.addEventListener('click', () => highlightExplain(r, c, parseInt(cell.dataset.box)));
      grid.appendChild(cell);
    }
  }
}

function highlightExplain(row, col, box) {
  document.querySelectorAll('.ex-cell').forEach(c => {
    c.classList.remove('highlight-row', 'highlight-col', 'highlight-box');
    const r = parseInt(c.dataset.row);
    const co = parseInt(c.dataset.col);
    const b = parseInt(c.dataset.box);
    if (r === row) c.classList.add('highlight-row');
    if (co === col) c.classList.add('highlight-col');
    if (b === box) c.classList.add('highlight-box');
  });
}

// ===== ELIMINATION DEMO =====
const ELIM_PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

const ELIM_SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

// Pick clickable empty cells with only one possible value (to make the demo clear)
const CLICKABLE_CELLS = [];
let elimBuilt = false;

function buildElimDemo() {
  if (elimBuilt) return;
  elimBuilt = true;
  const demo = document.getElementById('elim-demo');
  if (!demo) return;
  demo.innerHTML = '';

  // Find empty cells that have exactly one candidate
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (ELIM_PUZZLE[r][c] === 0) {
        const candidates = getElimCandidates(r, c);
        if (candidates.length === 1) CLICKABLE_CELLS.push([r, c]);
      }
    }
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'elim-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.box = Math.floor(r / 3) * 3 + Math.floor(c / 3);

      const val = ELIM_PUZZLE[r][c];
      if (val !== 0) {
        cell.textContent = val;
        cell.classList.add('given');
      } else {
        const isClickable = CLICKABLE_CELLS.some(([cr, cc]) => cr === r && cc === c);
        if (isClickable) {
          cell.textContent = '?';
          cell.classList.add('clickable');
          cell.addEventListener('click', () => runElimDemo(r, c));
        } else {
          cell.textContent = '';
          cell.classList.add('empty');
        }
      }
      demo.appendChild(cell);
    }
  }
}

function getElimCandidates(row, col) {
  const used = new Set();
  for (let c = 0; c < 9; c++) used.add(ELIM_PUZZLE[row][c]);
  for (let r = 0; r < 9; r++) used.add(ELIM_PUZZLE[r][col]);
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      used.add(ELIM_PUZZLE[r][c]);
  used.delete(0);
  const candidates = [];
  for (let n = 1; n <= 9; n++) if (!used.has(n)) candidates.push(n);
  return candidates;
}

function runElimDemo(row, col) {
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  const cells = document.querySelectorAll('.elim-cell');
  cells.forEach(c => c.classList.remove('highlight-r', 'highlight-c', 'highlight-b', 'selected'));

  const rowNums = [], colNums = [], boxNums = [];

  cells.forEach(c => {
    const r = parseInt(c.dataset.row);
    const co = parseInt(c.dataset.col);
    const b = parseInt(c.dataset.box);
    if (r === row && !(r === row && co === col)) {
      c.classList.add('highlight-r');
      if (ELIM_PUZZLE[r][co]) rowNums.push(ELIM_PUZZLE[r][co]);
    }
    if (co === col && !(r === row && co === col)) {
      c.classList.add('highlight-c');
      if (ELIM_PUZZLE[r][co]) colNums.push(ELIM_PUZZLE[r][co]);
    }
    if (b === box && !(r === row && co === col)) {
      c.classList.add('highlight-b');
      if (ELIM_PUZZLE[r][co]) boxNums.push(ELIM_PUZZLE[r][co]);
    }
  });

  const selectedCell = document.querySelector(`.elim-cell[data-row="${row}"][data-col="${col}"]`);
  if (selectedCell) selectedCell.classList.add('selected');

  const answer = ELIM_SOLUTION[row][col];
  const allUsed = [...new Set([...rowNums, ...colNums, ...boxNums])].sort((a, b) => a - b);

  const info = document.getElementById('elim-info');
  info.innerHTML = `
    <p>📍 <strong>תא נבחר:</strong> שורה ${row + 1}, עמודה ${col + 1}</p>
    <p>🟡 <strong>בשורה</strong> כבר יש: ${rowNums.sort((a,b)=>a-b).join(', ')}</p>
    <p>🔵 <strong>בעמודה</strong> כבר יש: ${colNums.sort((a,b)=>a-b).join(', ')}</p>
    <p>🩷 <strong>בריבוע</strong> כבר יש: ${boxNums.sort((a,b)=>a-b).join(', ')}</p>
    <p>❌ <strong>מושמטים:</strong> ${allUsed.join(', ')}</p>
    <p class="elim-result">✅ התשובה: <strong>${answer}</strong> — זה המספר היחיד שנשאר!</p>
  `;
}

// ===== SOLE DEMO =====
// Show a 3x3 box where 7 can only go in one cell
const SOLE_BOX = [
  [0, 2, 9],
  [4, 0, 6],
  [0, 8, 3]
];
const SOLE_BLOCKED = [0, 1]; // row/col indices where 7 is blocked by row/col constraints
// In a real puzzle, 7 appears in row 0, row 2, col 0, col 2 outside this box
// Only cell [1][1] can hold 7

let soleBuilt = false;
function buildSoleDemo() {
  if (soleBuilt) return;
  soleBuilt = true;
  const grid = document.getElementById('sole-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement('div');
      cell.className = 'sole-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      const val = SOLE_BOX[r][c];
      cell.textContent = val || '?';
      if (val === 0) cell.classList.add('empty');
      grid.appendChild(cell);
    }
  }
}

function runSoleDemo() {
  const cells = document.querySelectorAll('.sole-cell');
  const explanation = document.getElementById('sole-explanation');

  // Reset
  cells.forEach(c => c.classList.remove('highlight', 'blocked', 'answer'));

  // Animate: show blocked → show answer
  let step = 0;
  const steps = [
    () => {
      // Show cell [0][2] blocked (row 0 has 7 elsewhere)
      cells[2].classList.add('blocked');
      cells[2].textContent = '✕';
      explanation.textContent = 'התא הימני-עליון: שורה 0 כבר מכילה 7 — חסום!';
    },
    () => {
      // Show cell [2][0] blocked (col 0 has 7 elsewhere)
      cells[6].classList.add('blocked');
      cells[6].textContent = '✕';
      explanation.textContent = 'התא השמאלי-תחתון: עמודה 0 כבר מכילה 7 — חסום!';
    },
    () => {
      // Show the answer
      cells[4].classList.add('answer');
      cells[4].textContent = '7';
      explanation.innerHTML = '✅ <strong>רק תא המרכז פנוי!</strong> 7 חייב להיות כאן — זהו המיקום הבלעדי.';
    }
  ];

  function runStep() {
    if (step < steps.length) {
      steps[step]();
      step++;
      if (step < steps.length) setTimeout(runStep, 900);
    }
  }
  runStep();
}

// ===== SUDOKU GAME =====
let board = [];          // current board state (0 = empty)
let solution = [];       // complete solution
let given = [];          // cells that are pre-filled (cannot be edited)
let selectedCell = null; // {row, col}
let currentDifficulty = 'easy';
let timerInterval = null;
let timerSeconds = 0;
let errorCount = 0;
let hintsLeft = 3;
let gameWon = false;
let gameInitialized = false;

// ===== PUZZLE GENERATOR =====
function generateSolvedBoard() {
  const b = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(b);
  return b;
}

function fillBoard(b) {
  const empty = findEmpty(b);
  if (!empty) return true;
  const [row, col] = empty;
  const nums = shuffle([1,2,3,4,5,6,7,8,9]);
  for (const n of nums) {
    if (isValid(b, row, col, n)) {
      b[row][col] = n;
      if (fillBoard(b)) return true;
      b[row][col] = 0;
    }
  }
  return false;
}

function findEmpty(b) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (b[r][c] === 0) return [r, c];
  return null;
}

function isValid(b, row, col, num) {
  for (let c = 0; c < 9; c++) if (b[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (b[r][col] === num) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (b[r][c] === num) return false;
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeNumbers(solved, difficulty) {
  const clues = { easy: 46, medium: 35, hard: 26 };
  const keep = clues[difficulty] || 46;
  const remove = 81 - keep;
  const puzzle = solved.map(r => [...r]);
  const positions = shuffle([...Array(81).keys()]);
  let removed = 0;
  for (const pos of positions) {
    if (removed >= remove) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return puzzle;
}

// ===== GAME INIT =====
function initGame() {
  solution = generateSolvedBoard();
  const puzzle = removeNumbers(solution, currentDifficulty);
  board = puzzle.map(r => [...r]);
  given = puzzle.map(r => r.map(v => v !== 0));
  selectedCell = null;
  errorCount = 0;
  hintsLeft = 3;
  gameWon = false;
  stopTimer();
  timerSeconds = 0;
  updateStats();
  renderBoard();
  startTimer();
  showMessage('');
}

function newGame() {
  initGame();
}

function setDifficulty(diff) {
  currentDifficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === diff));
  if (gameInitialized) initGame();
}

// ===== RENDER =====
function renderBoard() {
  const boardEl = document.getElementById('sudoku-board');
  boardEl.innerHTML = '';

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'sudoku-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `שורה ${r + 1} עמודה ${c + 1}`);
      cell.setAttribute('data-testid', `cell-${r}-${c}`);

      // data attributes for CSS 3x3 borders
      cell.setAttribute('data-col', c);
      cell.setAttribute('data-row', r);

      const val = board[r][c];
      if (val !== 0) cell.textContent = val;

      if (given[r][c]) {
        cell.classList.add('given');
      } else if (val !== 0) {
        cell.classList.add('user-entry');
      }

      cell.addEventListener('click', () => selectCell(r, c));
      boardEl.appendChild(cell);
    }
  }
  applyHighlights();
}

function getCellEl(r, c) {
  return document.querySelector(`[data-testid="cell-${r}-${c}"]`);
}

function selectCell(r, c) {
  if (gameWon) return;
  selectedCell = { row: r, col: c };
  applyHighlights();
}

function applyHighlights() {
  const cells = document.querySelectorAll('.sudoku-cell');
  cells.forEach(cell => {
    cell.classList.remove('selected', 'highlighted', 'same-num', 'error-cell', 'hint-cell');
  });

  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const val = board[r][c];

    // Error check
    if (!given[r][c] && val !== 0 && val !== solution[r][c]) {
      cell.classList.add('error-cell');
    }
  });

  if (!selectedCell) return;
  const { row, col } = selectedCell;
  const selVal = board[row][col];

  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    if (r === row && c === col) {
      cell.classList.add('selected');
    } else if (
      r === row || c === col ||
      (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3))
    ) {
      cell.classList.add('highlighted');
    }

    if (selVal !== 0 && board[r][c] === selVal && !(r === row && c === col)) {
      cell.classList.add('same-num');
    }
  });
}

// ===== NUMBER ENTRY =====
function enterNumber(num) {
  if (!selectedCell || gameWon) return;
  const { row, col } = selectedCell;
  if (given[row][col]) { showMessage('תא זה ניתן ואינו ניתן לעריכה', 'error'); return; }

  if (num === 0) {
    board[row][col] = 0;
  } else {
    if (board[row][col] === num) { board[row][col] = 0; } // toggle
    else board[row][col] = num;
  }

  const cell = getCellEl(row, col);
  if (cell) {
    cell.textContent = board[row][col] || '';
    cell.classList.toggle('user-entry', board[row][col] !== 0);
  }

  // Check if incorrect
  if (num !== 0 && board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
    errorCount++;
    updateStats();
    showMessage('שגיאה! המספר אינו נכון במקום זה.', 'error');
  } else {
    showMessage('');
  }

  applyHighlights();
  checkWin();
}

// Keyboard support
document.addEventListener('keydown', e => {
  if (!selectedCell || gameWon) return;
  const { row, col } = selectedCell;

  if (e.key >= '1' && e.key <= '9') {
    enterNumber(parseInt(e.key));
    return;
  }
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    enterNumber(0);
    return;
  }

  // Arrow navigation
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, 1], ArrowRight: [0, -1] };
  if (moves[e.key]) {
    e.preventDefault();
    const [dr, dc] = moves[e.key];
    const nr = Math.max(0, Math.min(8, row + dr));
    const nc = Math.max(0, Math.min(8, col + dc));
    selectCell(nr, nc);
  }
});

// ===== CHECK =====
function checkBoard() {
  if (gameWon) return;
  let hasError = false;
  let hasEmpty = false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!given[r][c]) {
        if (board[r][c] === 0) { hasEmpty = true; }
        else if (board[r][c] !== solution[r][c]) { hasError = true; }
      }
    }
  }

  if (hasError) {
    showMessage('יש שגיאות בלוח — הכיתוב האדום מסמן אותן.', 'error');
  } else if (hasEmpty) {
    showMessage('אין שגיאות עד כה! ממשיכים...', 'success');
  } else {
    winGame();
  }
  applyHighlights();
}

// ===== HINT =====
function getHint() {
  if (gameWon || hintsLeft <= 0) {
    showMessage('אין רמזים נוספים.', 'error');
    return;
  }

  // Find an empty cell
  const empties = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!given[r][c] && board[r][c] === 0) empties.push([r, c]);

  if (empties.length === 0) { checkBoard(); return; }

  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  board[r][c] = solution[r][c];

  const cell = getCellEl(r, c);
  if (cell) {
    cell.textContent = solution[r][c];
    cell.classList.add('user-entry', 'hint-cell');
    setTimeout(() => cell.classList.remove('hint-cell'), 1000);
  }

  hintsLeft--;
  updateStats();
  showMessage(`רמז: מספר ${solution[r][c]} בשורה ${r + 1}, עמודה ${c + 1}`, 'info');
  applyHighlights();
  checkWin();
}

// ===== SOLVE =====
function solveBoard() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!given[r][c]) {
        board[r][c] = solution[r][c];
        const cell = getCellEl(r, c);
        if (cell) {
          cell.textContent = solution[r][c];
          cell.classList.add('user-entry');
          cell.classList.remove('error-cell');
        }
      }
    }
  }
  stopTimer();
  showMessage('הלוח נפתר! לחצו "תשבץ חדש" כדי להתחיל מחדש.', 'info');
  applyHighlights();
}

// ===== WIN =====
function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== solution[r][c]) return;
  winGame();
}

function winGame() {
  gameWon = true;
  stopTimer();
  const timeStr = formatTime(timerSeconds);
  document.getElementById('win-time').textContent = timeStr;
  document.getElementById('win-errors').textContent = errorCount;
  document.getElementById('win-text').textContent =
    errorCount === 0
      ? `פתרתם ללא שגיאות אחת! מדהים!`
      : `פתרתם עם ${errorCount} שגיאות. כל הכבוד!`;
  document.getElementById('win-modal').removeAttribute('hidden');
}

function closeModal(id) {
  document.getElementById(id).setAttribute('hidden', '');
}

// ===== TIMER =====
function startTimer() {
  timerInterval = setInterval(() => {
    timerSeconds++;
    document.getElementById('timer-display').textContent = formatTime(timerSeconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ===== STATS =====
function updateStats() {
  document.getElementById('errors-display').textContent = errorCount;
  document.getElementById('hints-display').textContent = hintsLeft;
}

// ===== MESSAGES =====
function showMessage(msg, type = '') {
  const el = document.getElementById('game-message');
  el.textContent = msg;
  el.className = 'game-message' + (type ? ' ' + type : '');
}

// ===== iOS / TOUCH SUPPORT =====

// Prevent iOS double-tap zoom on buttons and cells
function preventDoubleTapZoom(el) {
  let lastTap = 0;
  el.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
    }
    lastTap = now;
  }, { passive: false });
}

// Vibrate on cell selection (works on Android; iOS 13+ via AudioContext trick)
function hapticLight() {
  if (navigator.vibrate) navigator.vibrate(10);
  // iOS Safari: use a tiny AudioContext click for tactile feedback simulation
  try {
    if (window._hapticAC) {
      const osc = window._hapticAC.createOscillator();
      const gain = window._hapticAC.createGain();
      osc.connect(gain);
      gain.connect(window._hapticAC.destination);
      gain.gain.setValueAtTime(0, window._hapticAC.currentTime);
      osc.start();
      osc.stop(window._hapticAC.currentTime + 0.001);
    }
  } catch(_) {}
}

// Swipe-to-navigate between sections on mobile
(function setupSwipeNav() {
  const sections = ['home', 'learn', 'practice'];
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    // Only swipe from edges (within 30px of screen edge)
    if (touchStartX > 30 && touchStartX < window.innerWidth - 30) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Horizontal swipe, not vertical scroll
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

    const activeBtn = document.querySelector('.nav-btn.active');
    if (!activeBtn) return;
    const currentSection = activeBtn.dataset.section;
    const idx = sections.indexOf(currentSection);

    // RTL: swipe right = previous section, swipe left = next section
    if (dx > 0 && idx > 0) showSection(sections[idx - 1]);
    if (dx < 0 && idx < sections.length - 1) showSection(sections[idx + 1]);
  }, { passive: true });
})();

// Prevent iOS overscroll rubber-band on practice board interaction
document.getElementById && document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('sudoku-board');
  if (board) {
    board.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
});

// Unlock AudioContext for iOS haptics on first touch
document.addEventListener('touchstart', function unlockAudio() {
  try {
    window._hapticAC = new (window.AudioContext || window.webkitAudioContext)();
  } catch(_) {}
  document.removeEventListener('touchstart', unlockAudio);
}, { once: true, passive: true });

// Apply double-tap prevention to all buttons after DOM ready
function applyIOSTouchFixes() {
  document.querySelectorAll('button, .sudoku-cell, .num-btn, .diff-btn').forEach(el => {
    preventDoubleTapZoom(el);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showSection('home');
  // Delay touch fix setup so dynamic elements (board) are also covered
  setTimeout(applyIOSTouchFixes, 500);

  // Handle PWA shortcut URLs
  const hash = window.location.hash;
  if (hash === '#practice') showSection('practice');
  if (hash === '#learn') showSection('learn');
});
