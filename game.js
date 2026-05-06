// game.js — полноценная логика игры 2048
(function() {
  // --- Игровое состояние ---
  let board = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];
  let score = 0;
  let best = 0;
  let gameActive = true;
  let winNotified = false;

  // DOM элементы
  const boardContainer = document.getElementById('gameBoard');
  const scoreSpan = document.getElementById('gameScore');
  const bestSpan = document.getElementById('gameBest');
  const messageDiv = document.getElementById('gameMessage');
  const resetBtn = document.getElementById('resetGameBtn');

  // Загрузка лучшего счета
  function loadBest() {
    const saved = localStorage.getItem('2048_best_score_split');
    if (saved && !isNaN(parseInt(saved))) best = parseInt(saved);
    else best = 0;
    if (bestSpan) bestSpan.innerText = best;
  }

  function saveBest() {
    if (score > best) {
      best = score;
      localStorage.setItem('2048_best_score_split', best);
      if (bestSpan) bestSpan.innerText = best;
    }
  }

  function updateUI() {
    if (scoreSpan) scoreSpan.innerText = score;
    if (bestSpan) bestSpan.innerText = best;
    saveBest();
  }

  // Рендер поля
  function renderBoard() {
    if (!boardContainer) return;
    boardContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const val = board[i][j];
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (val !== 0) {
          tile.setAttribute('data-val', val);
          tile.innerText = val;
        } else {
          tile.setAttribute('data-val', '0');
          tile.innerText = '';
          tile.style.backgroundColor = '#1e293b';
        }
        boardContainer.appendChild(tile);
      }
    }
  }

  // Добавление случайной плитки
  function addRandomTile() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length === 0) return false;
    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  // Проверка возможности хода
  function canMove() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true;
        if (j < 3 && board[i][j] === board[i][j+1]) return true;
        if (i < 3 && board[i][j] === board[i+1][j]) return true;
      }
    }
    return false;
  }

  // Объединение линии (сжатие + слияние)
  function mergeLine(line) {
    let filtered = line.filter(v => v !== 0);
    let result = [];
    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i+1]) {
        let merged = filtered[i] * 2;
        result.push(merged);
        score += merged;
        i++;
      } else {
        result.push(filtered[i]);
      }
    }
    while (result.length < 4) result.push(0);
    return result;
  }

  // Основная механика движения
  function move(direction) {
    if (!gameActive) return false;

    const oldBoard = JSON.parse(JSON.stringify(board));
    const oldScore = score;

    if (direction === 'left') {
      for (let i = 0; i < 4; i++) board[i] = mergeLine(board[i]);
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const rev = [...board[i]].reverse();
        const merged = mergeLine(rev);
        board[i] = merged.reverse();
      }
    } else if (direction === 'up') {
      for (let j = 0; j < 4; j++) {
        const col = [board[0][j], board[1][j], board[2][j], board[3][j]];
        const merged = mergeLine(col);
        for (let i = 0; i < 4; i++) board[i][j] = merged[i];
      }
    } else if (direction === 'down') {
      for (let j = 0; j < 4; j++) {
        const col = [board[0][j], board[1][j], board[2][j], board[3][j]].reverse();
        const merged = mergeLine(col);
        const finalCol = merged.reverse();
        for (let i = 0; i < 4; i++) board[i][j] = finalCol[i];
      }
    }

    let changed = false;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (oldBoard[i][j] !== board[i][j]) changed = true;
      }
    }
    if (!changed && score === oldScore) return false;

    updateUI();
    addRandomTile();
    renderBoard();

    // Проверка победы (2048)
    let hasWin = false;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 2048 && !winNotified && gameActive) {
          winNotified = true;
          if (messageDiv) messageDiv.innerHTML = '🏆 ПОЗДРАВЛЯЮ! ВЫ СОБРАЛИ 2048! 🏆<br>Можно продолжать игру.';
          hasWin = true;
        }
      }
    }

    if (!canMove() && gameActive) {
      gameActive = false;
      if (messageDiv) messageDiv.innerHTML = '💀 ИГРА ОКОНЧЕНА! Нет доступных ходов. Нажми "Новая игра" 💀';
    } else if (!hasWin && gameActive && messageDiv && !winNotified) {
      messageDiv.innerHTML = '🎮 Игра продолжается. Свайпай или стрелки.';
    }
    return true;
  }

  // Инициализация / новая игра
  function initGame() {
    board = [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ];
    score = 0;
    gameActive = true;
    winNotified = false;
    addRandomTile();
    addRandomTile();
    updateUI();
    renderBoard();
    if (messageDiv) messageDiv.innerHTML = '🎮 Используй стрелки ← ↑ ↓ → или проводи пальцем.';
  }

  // --- Обработчики событий ---
  function handleKey(e) {
    const key = e.key;
    if (!gameActive) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
        if (messageDiv) messageDiv.innerHTML = '❗ Игра окончена. Нажмите "Новая игра" ❗';
      }
      return;
    }
    let dir = null;
    if (key === 'ArrowLeft') dir = 'left';
    else if (key === 'ArrowRight') dir = 'right';
    else if (key === 'ArrowUp') dir = 'up';
    else if (key === 'ArrowDown') dir = 'down';
    if (dir) {
      e.preventDefault();
      move(dir);
      saveBest();
      updateUI();
      renderBoard();
      if (!canMove() && gameActive) {
        gameActive = false;
        if (messageDiv) messageDiv.innerHTML = '💀 ИГРА ОКОНЧЕНА! Нет ходов. 💀';
      }
    }
  }

  // Свайпы для мобильных устройств
  let touchStartX = 0, touchStartY = 0;
  
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }
  
  function handleTouchEnd(e) {
    if (!gameActive) {
      if (messageDiv) messageDiv.innerHTML = '❗ Игра окончена. Нажмите "Новая игра" ❗';
      return;
    }
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    const minDist = 25;
    
    if (Math.abs(diffX) < minDist && Math.abs(diffY) < minDist) return;
    
    let dir = null;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      dir = diffX > 0 ? 'right' : 'left';
    } else {
      dir = diffY > 0 ? 'down' : 'up';
    }
    
    if (dir) {
      move(dir);
      saveBest();
      updateUI();
      renderBoard();
      if (!canMove() && gameActive) {
        gameActive = false;
        if (messageDiv) messageDiv.innerHTML = '💀 ИГРА ОКОНЧЕНА! Нет ходов. 💀';
      }
    }
    e.preventDefault();
  }

  // Сброс игры
  function resetGame() {
    initGame();
    saveBest();
    renderBoard();
  }

  // Регистрация событий
  window.addEventListener('keydown', handleKey);
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }
  
  if (boardContainer) {
    boardContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    boardContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    boardContainer.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Старт игры
  loadBest();
  initGame();
})();
