(() => {
  "use strict";

  const GAME_DURATION = 20;
  const MAX_HITS = 3;
  const START_SPAWN_INTERVAL = 950;
  const FINAL_SPAWN_INTERVAL = 520;
  const START_HAZARD_DURATION = [3800, 4800];
  const FINAL_HAZARD_DURATION = [2350, 3050];
  const PRODUCT_URL = "#"; // 실제 상품 URL로 교체하세요.

  const screens = [...document.querySelectorAll("[data-screen]")];
  const gameCard = document.querySelector(".game-card");
  const arena = document.querySelector("[data-arena]");
  const player = document.querySelector("[data-player]");
  const timeText = document.querySelector("[data-time]");
  const timeBar = document.querySelector("[data-time-bar]");
  const shields = [...document.querySelectorAll("[data-shields] svg")];
  const shieldGroup = document.querySelector("[data-shields]");
  const playHint = document.querySelector("[data-play-hint]");
  const countdown = document.querySelector("[data-countdown]");
  const toast = document.querySelector("[data-toast]");
  const soundButton = document.querySelector("[data-action='sound']");

  let gameState = "start";
  let hits = 0;
  let playerX = 50;
  let startTime = 0;
  let lastSpawn = 0;
  let rafId = 0;
  let hazards = [];
  let invulnerableUntil = 0;
  let toastTimer = 0;
  let impactTimer = 0;
  let motionOffset = 0;
  let lastFrameTime = 0;
  let audioContext = null;
  let bgmTimer = 0;
  let bgmStep = 0;
  let audioMuted = false;

  function ensureAudio() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(frequency, duration, type = "triangle", volume = 0.025, delay = 0, endFrequency = frequency) {
    const context = audioMuted ? null : audioContext;
    if (!context) return;
    const startAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), startAt + duration);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playBgmStep() {
    if (audioMuted || gameState !== "play") return;
    const notes = [220, 277, 330, 277, 392, 330, 277, 247];
    playTone(notes[bgmStep % notes.length], 0.13, "triangle", 0.018);
    if (bgmStep % 4 === 0) playTone(92, 0.11, "sine", 0.028, 0, 48);
    bgmStep += 1;
  }

  function startBgm() {
    if (audioMuted || !ensureAudio()) return;
    clearInterval(bgmTimer);
    bgmStep = 0;
    soundButton.dataset.playing = "true";
    playBgmStep();
    bgmTimer = window.setInterval(playBgmStep, 220);
  }

  function stopBgm() {
    clearInterval(bgmTimer);
    bgmTimer = 0;
    soundButton.dataset.playing = "false";
  }

  function playHitSound() {
    if (!ensureAudio()) return;
    soundButton.dataset.lastSound = "hit";
    playTone(190, 0.18, "sawtooth", 0.035, 0, 82);
  }

  function playSuccessSound() {
    if (!ensureAudio()) return;
    soundButton.dataset.lastSound = "success";
    [330, 440, 554, 659].forEach((frequency, index) => playTone(frequency, 0.24, "triangle", 0.032, index * 0.1));
  }

  function playFailureSound() {
    if (!ensureAudio()) return;
    soundButton.dataset.lastSound = "failure";
    playTone(220, 0.42, "sawtooth", 0.03, 0, 74);
  }

  function toggleSound() {
    audioMuted = !audioMuted;
    soundButton.classList.toggle("is-muted", audioMuted);
    soundButton.setAttribute("aria-pressed", String(audioMuted));
    soundButton.setAttribute("aria-label", audioMuted ? "사운드 켜기" : "음소거");
    if (audioMuted) stopBgm();
    else if (gameState === "play") startBgm();
  }

  function showScreen(name) {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    screens.forEach((screen) => {
      const isActive = screen.dataset.screen === name;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    gameCard.scrollTop = 0;
    gameState = name;
  }

  function resetHud() {
    hits = 0;
    playerX = 50;
    player.style.left = "50%";
    timeText.textContent = String(GAME_DURATION);
    timeBar.style.transform = "scaleX(1)";
    shields.forEach((shield) => shield.classList.remove("is-lost"));
    shieldGroup.setAttribute("aria-label", `남은 방어력 ${MAX_HITS}`);
    playHint.classList.remove("is-hidden");
  }

  function clearGame() {
    cancelAnimationFrame(rafId);
    stopBgm();
    clearTimeout(impactTimer);
    gameCard.classList.remove("is-impact");
    hazards.forEach((hazard) => hazard.el.remove());
    hazards = [];
  }

  async function startGame() {
    clearGame();
    resetHud();
    showScreen("play");
    startBgm();
    countdown.classList.add("is-visible");

    for (const value of ["3", "2", "1", "GO!"]) {
      countdown.textContent = value;
      await new Promise((resolve) => setTimeout(resolve, value === "GO!" ? 420 : 520));
      if (gameState !== "play") return;
    }

    countdown.classList.remove("is-visible");
    startTime = performance.now();
    lastSpawn = startTime - START_SPAWN_INTERVAL * 0.45;
    lastFrameTime = startTime;
    motionOffset = 0;
    rafId = requestAnimationFrame(gameLoop);
  }

  function getDifficulty(elapsed) {
    const progress = Math.min(1, elapsed / GAME_DURATION);
    const eased = progress * progress * (3 - 2 * progress);
    const finalProgress = Math.max(0, (progress - 0.75) / 0.25);
    const finalPush = finalProgress * finalProgress * (3 - 2 * finalProgress);
    const mix = (from, to) => from + (to - from) * eased;

    return {
      spawnInterval: mix(START_SPAWN_INTERVAL, FINAL_SPAWN_INTERVAL) * (1 - finalPush * 0.15),
      minDuration: mix(START_HAZARD_DURATION[0], FINAL_HAZARD_DURATION[0]) * (1 - finalPush * 0.1),
      maxDuration: mix(START_HAZARD_DURATION[1], FINAL_HAZARD_DURATION[1]) * (1 - finalPush * 0.1),
      burstChance: 0.03 + eased * 0.25 + finalPush * 0.22,
      motionSpeed: 76 + eased * 64 + finalPush * 36,
    };
  }

  function spawnHazard(now, difficulty, occupiedX = []) {
    const el = document.createElement("div");
    el.className = "hazard";
    el.innerHTML = '<img src="assets/sun-hazard.png" alt="" draggable="false">';
    arena.appendChild(el);

    const width = el.getBoundingClientRect().width;
    let x = width / 2 + Math.random() * Math.max(0, arena.clientWidth - width);
    for (let attempt = 0; attempt < 6 && occupiedX.some((otherX) => Math.abs(x - otherX) < width * 1.55); attempt += 1) {
      x = width / 2 + Math.random() * Math.max(0, arena.clientWidth - width);
    }
    const duration = difficulty.minDuration + Math.random() * (difficulty.maxDuration - difficulty.minDuration);
    const scale = 0.78 + Math.random() * 0.42;
    hazards.push({ el, x, y: -width * 1.4, width, born: now, duration, scale, hit: false });
    return x;
  }

  function movePlayer(clientX) {
    if (gameState !== "play") return;
    const rect = arena.getBoundingClientRect();
    const playerWidth = player.getBoundingClientRect().width;
    const min = playerWidth / 2;
    const max = rect.width - playerWidth / 2;
    const localX = Math.max(min, Math.min(max, clientX - rect.left));
    playerX = (localX / rect.width) * 100;
    player.style.left = `${playerX}%`;
    playHint.classList.add("is-hidden");
  }

  function isColliding(hazard) {
    if (hazard.hit || performance.now() < invulnerableUntil) return false;
    const p = player.getBoundingClientRect();
    const h = hazard.el.getBoundingClientRect();
    const insetX = Math.min(22, p.width * 0.14);
    const insetY = Math.min(12, p.height * 0.2);
    const hInset = h.width * 0.19;
    return (
      p.left + insetX < h.right - hInset &&
      p.right - insetX > h.left + hInset &&
      p.top + insetY < h.bottom - hInset &&
      p.bottom - insetY > h.top + hInset
    );
  }

  function registerHit(hazard, now) {
    hazard.hit = true;
    hazard.el.remove();
    hits += 1;
    invulnerableUntil = now + 650;
    player.classList.remove("is-hit");
    void player.offsetWidth;
    player.classList.add("is-hit");
    clearTimeout(impactTimer);
    gameCard.classList.remove("is-impact");
    void gameCard.offsetWidth;
    gameCard.classList.add("is-impact");
    impactTimer = setTimeout(() => gameCard.classList.remove("is-impact"), 280);
    playHitSound();
    navigator.vibrate?.(70);

    shields[MAX_HITS - hits]?.classList.add("is-lost");
    const remaining = Math.max(0, MAX_HITS - hits);
    shieldGroup.setAttribute("aria-label", `남은 방어력 ${remaining}`);

    if (hits >= MAX_HITS) endGame(false);
  }

  function gameLoop(now) {
    if (gameState !== "play") return;

    const elapsed = (now - startTime) / 1000;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    timeText.textContent = String(Math.ceil(remaining));
    timeBar.style.transform = `scaleX(${remaining / GAME_DURATION})`;

    if (remaining <= 0) {
      endGame(true);
      return;
    }

    const difficulty = getDifficulty(elapsed);
    const frameDelta = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    motionOffset += difficulty.motionSpeed * frameDelta;
    gameCard.style.setProperty("--far-offset", `${elapsed * 1.2}px`);
    gameCard.style.setProperty("--scenery-offset", `${(motionOffset * 0.55) % 146}px`);
    gameCard.style.setProperty("--road-offset", `${motionOffset % 112}px`);
    gameCard.style.setProperty("--near-offset", `${(motionOffset * 1.55) % 64}px`);

    if (now - lastSpawn >= difficulty.spawnInterval) {
      const spawnCount = Math.random() < difficulty.burstChance ? 2 : 1;
      const occupiedX = [];
      for (let index = 0; index < spawnCount; index += 1) {
        occupiedX.push(spawnHazard(now + index * 70, difficulty, occupiedX));
      }
      lastSpawn = now;
    }

    const arenaHeight = arena.clientHeight;
    hazards.forEach((hazard) => {
      const progress = (now - hazard.born) / hazard.duration;
      hazard.y = -hazard.width * 1.5 + progress * (arenaHeight + hazard.width * 2.2);
      hazard.el.style.transform = `translate(${hazard.x - hazard.width / 2}px, ${hazard.y}px) scale(${hazard.scale})`;
      if (isColliding(hazard)) registerHit(hazard, now);
    });

    hazards = hazards.filter((hazard) => {
      const keep = !hazard.hit && hazard.y < arenaHeight + hazard.width;
      if (!keep) hazard.el.remove();
      return keep;
    });

    if (gameState === "play") rafId = requestAnimationFrame(gameLoop);
  }

  function endGame(success) {
    clearGame();
    showScreen(success ? "success" : "failure");
    if (success) playSuccessSound();
    else playFailureSound();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "start" || action === "restart") startGame();
    if (action === "sound") toggleSound();
    if (action === "benefit") {
      event.preventDefault();
      if (PRODUCT_URL === "#") {
        showToast("상품 URL 준비 중입니다. 나중에 PRODUCT_URL만 교체해 주세요.");
      } else {
        window.location.href = PRODUCT_URL;
      }
    }
  });

  arena.addEventListener("pointerdown", (event) => {
    arena.setPointerCapture?.(event.pointerId);
    movePlayer(event.clientX);
  });
  arena.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" || event.buttons === 1) movePlayer(event.clientX);
  });

  window.addEventListener("keydown", (event) => {
    if (gameState !== "play" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const rect = arena.getBoundingClientRect();
    const delta = event.key === "ArrowLeft" ? -rect.width * 0.065 : rect.width * 0.065;
    movePlayer(rect.left + rect.width * (playerX / 100) + delta);
    playHint.classList.add("is-hidden");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && gameState === "play") {
      clearGame();
      showScreen("start");
      showToast("게임이 일시 중단되어 시작 화면으로 돌아왔습니다.");
    }
  });

  showScreen("start");
})();
