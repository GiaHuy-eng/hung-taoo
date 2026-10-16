(() => {
  'use strict';

  const container  = document.getElementById('game-container');
  const basket     = document.getElementById('basket');
  const apple      = document.getElementById('apple');
  const scoreEl    = document.getElementById('score');
  const livesEl    = document.getElementById('lives');
  const startBtn   = document.getElementById('start-btn');
  const message    = document.getElementById('message');
  const finalScore = document.getElementById('final-score');

  const START_LIVES  = 3;
  const START_SPEED  = 150;  // tốc độ rơi ban đầu (px/giây)
  const SPEED_STEP   = 15;   // mỗi lần hứng được, táo rơi nhanh thêm
  const MAX_SPEED    = 650;  // giới hạn để táo không "xuyên" qua giỏ
  const BASKET_SPEED = 420;  // tốc độ di chuyển của giỏ (px/giây)

  let W, H, basketW, basketH, appleSize;
  let score, lives, fallSpeed, basketX, appleX, appleY;
  let running = false, rafId = 0, lastTime = 0;
  const keys = { left: false, right: false };

  // Táo hồi sinh ở đỉnh khung, vị trí left ngẫu nhiên
  function resetApple() {
    appleX = Math.floor(Math.random() * (W - appleSize + 1));
    appleY = 0;
  }

  // Cập nhật giao diện theo trạng thái
  function render() {
    basket.style.left = basketX + 'px';
    apple.style.left  = appleX + 'px';
    apple.style.top   = appleY + 'px';
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  function resetState() {
    W = container.clientWidth;
    H = container.clientHeight;
    basketW = basket.offsetWidth;
    basketH = basket.offsetHeight;
    appleSize = apple.offsetWidth;

    score = 0;
    lives = START_LIVES;
    fallSpeed = START_SPEED;
    basketX = (W - basketW) / 2;
    resetApple();
    render();
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    finalScore.textContent = 'Điểm của bạn: ' + score;
    message.classList.add('show');
    startBtn.textContent = 'Chơi lại';
  }

  // Vòng lặp game
  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // 1. Di chuyển giỏ, không cho chạy ra ngoài khung
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    basketX = Math.max(0, Math.min(W - basketW, basketX + dir * BASKET_SPEED * dt));

    // 2. Táo rơi xuống theo trục tung (top)
    appleY += fallSpeed * dt;

    // 3. Kiểm tra va chạm giữa táo và giỏ
    const overlapX = appleX < basketX + basketW && appleX + appleSize > basketX;
    const touchBasket = appleY + appleSize >= H - basketH;

    if (overlapX && touchBasket) {
      score++;
      fallSpeed = Math.min(fallSpeed + SPEED_STEP, MAX_SPEED);
      resetApple();
    } else if (appleY + appleSize >= H) {
      // Táo chạm đáy mà giỏ không hứng được
      lives--;
      resetApple();
      if (lives <= 0) {
        render();
        endGame();
        return;
        }
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    cancelAnimationFrame(rafId);
    resetState();
    message.classList.remove('show');
    startBtn.blur();
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  // Điều khiển bằng phím mũi tên Trái / Phải
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { keys.left = true;  e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft')  keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });
  window.addEventListener('blur', () => { keys.left = keys.right = false; });

  startBtn.addEventListener('click', startGame);

  resetState(); // hiển thị trạng thái ban đầu trước khi bấm "Bắt đầu"
})();