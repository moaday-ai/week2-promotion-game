(() => {
  "use strict";

  const PRODUCT_URL = "";
  const MEMORY_DURATION = 3000;
  const LEVELS = [
    { number: 1, cardCount: 3 },
    { number: 2, cardCount: 4 },
    { number: 3, cardCount: 6 },
  ];
  const CARDS = [
    { id: "orange-round", name: "오렌지 라운드", image: "assets/cards/sunglasses-01.png" },
    { id: "blue-square", name: "블루 스퀘어", image: "assets/cards/sunglasses-02.png" },
    { id: "amber-aviator", name: "앰버 에비에이터", image: "assets/cards/sunglasses-03.png" },
    { id: "green-sport", name: "그린 스포츠", image: "assets/cards/sunglasses-04.png" },
    { id: "purple-cateye", name: "퍼플 캣아이", image: "assets/cards/sunglasses-05.png" },
    { id: "smoke-goggle", name: "스모크 고글", image: "assets/cards/sunglasses-06.png" },
  ];

  const root = document.querySelector("[data-game-root]");
  const screens = [...root.querySelectorAll("[data-screen]")];
  const levelText = root.querySelector("[data-level]");
  const levelProgress = root.querySelector("[data-level-progress]");
  const scoreText = root.querySelector("[data-score]");
  const phaseLabel = root.querySelector("[data-phase-label]");
  const instruction = root.querySelector("[data-instruction]");
  const phaseSupport = root.querySelector("[data-phase-support]");
  const timerWrap = root.querySelector("[data-timer-wrap]");
  const countdownText = root.querySelector("[data-countdown]");
  const timerProgress = root.querySelector("[data-timer-progress]");
  const targetWrap = root.querySelector("[data-target-wrap]");
  const targetImage = root.querySelector("[data-target-image]");
  const cardGrid = root.querySelector("[data-card-grid]");
  const feedback = root.querySelector("[data-feedback]");
  const feedbackTitle = root.querySelector("[data-feedback-title]");
  const feedbackCopy = root.querySelector("[data-feedback-copy]");
  const nextButton = root.querySelector("[data-action='next']");
  const resultMark = root.querySelector("[data-result-mark]");
  const resultTitle = root.querySelector("[data-result-title]");
  const finalScore = root.querySelector("[data-final-score]");
  const correctCount = root.querySelector("[data-correct-count]");
  const toast = root.querySelector("[data-toast]");

  let gameState = "start";
  let levelIndex = 0;
  let score = 0;
  let correctAnswers = 0;
  let currentCards = [];
  let targetCard = null;
  let correctPosition = -1;
  let answerLocked = true;
  let countdownTimer = null;
  let finishTimer = null;
  let toastTimer = null;

  function showScreen(name) {
    screens.forEach((screen) => {
      screen.classList.toggle("is-active", screen.dataset.screen === name);
    });
    gameState = name;
  }

  function randomIndex(max) {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      globalThis.crypto.getRandomValues(values);
      return Math.floor((values[0] / 4294967296) * max);
    }
    return Math.floor(Math.random() * max);
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function clearTimers() {
    window.clearInterval(countdownTimer);
    window.clearTimeout(finishTimer);
    countdownTimer = null;
    finishTimer = null;
  }

  function resetFeedback() {
    feedback.hidden = true;
    feedback.className = "feedback";
    feedbackTitle.textContent = "";
    feedbackCopy.textContent = "";
    nextButton.hidden = true;
  }

  function resetGame() {
    clearTimers();
    levelIndex = 0;
    score = 0;
    correctAnswers = 0;
    currentCards = [];
    targetCard = null;
    correctPosition = -1;
    answerLocked = true;
    scoreText.textContent = "0";
    cardGrid.replaceChildren();
    resetFeedback();
  }

  function updateHud() {
    const level = LEVELS[levelIndex];
    levelText.textContent = `LEVEL ${level.number} / ${LEVELS.length}`;
    levelProgress.style.width = `${(level.number / LEVELS.length) * 100}%`;
    scoreText.textContent = String(score);
  }

  function createMemoryCard(card, position) {
    const item = document.createElement("div");
    item.className = "memory-card";

    const number = document.createElement("span");
    number.className = "position-number";
    number.textContent = String(position + 1);

    const image = document.createElement("img");
    image.src = card.image;
    image.alt = `${position + 1}번 ${card.name} 선글라스`;
    image.draggable = false;

    item.append(number, image);
    return item;
  }

  function renderMemoryCards() {
    cardGrid.dataset.count = String(currentCards.length);
    cardGrid.setAttribute("aria-label", `${currentCards.length}개의 선글라스 위치`);
    cardGrid.replaceChildren(
      ...currentCards.map((card, position) => createMemoryCard(card, position)),
    );
  }

  function createAnswerCard(position) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-card";
    button.dataset.position = String(position);
    button.setAttribute("aria-label", `${position + 1}번 위치`);
    button.textContent = String(position + 1);
    return button;
  }

  function renderAnswerCards() {
    cardGrid.dataset.count = String(currentCards.length);
    cardGrid.setAttribute("aria-label", "기억한 위치 선택");
    cardGrid.replaceChildren(
      ...currentCards.map((_, position) => createAnswerCard(position)),
    );
  }

  function beginLevel() {
    clearTimers();
    resetFeedback();
    answerLocked = true;
    const level = LEVELS[levelIndex];

    currentCards = shuffle(CARDS).slice(0, level.cardCount);
    targetCard = currentCards[randomIndex(currentCards.length)];
    correctPosition = currentCards.findIndex((card) => card.id === targetCard.id);

    updateHud();
    phaseLabel.textContent = "위치를 기억하세요!";
    instruction.textContent = "선글라스가 있던 위치를 기억하세요";
    phaseSupport.textContent = "3초 뒤 카드가 사라져요";
    timerWrap.hidden = false;
    targetWrap.hidden = true;
    countdownText.textContent = "3";
    timerProgress.style.transform = "scaleX(1)";
    renderMemoryCards();
    showScreen("play");

    const startedAt = performance.now();
    countdownTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MEMORY_DURATION - elapsed);
      countdownText.textContent = String(Math.max(1, Math.ceil(remaining / 1000)));
      timerProgress.style.transform = `scaleX(${remaining / MEMORY_DURATION})`;
    }, 50);

    finishTimer = window.setTimeout(showQuestion, MEMORY_DURATION);
  }

  function showQuestion() {
    clearTimers();
    phaseLabel.textContent = "기억한 위치를 선택하세요";
    instruction.textContent = "이 선글라스는 몇 번째에 있었을까요?";
    phaseSupport.textContent = "번호 카드를 한 번 눌러주세요";
    timerWrap.hidden = true;
    targetImage.src = targetCard.image;
    targetImage.alt = `찾을 선글라스: ${targetCard.name}`;
    targetWrap.hidden = false;
    renderAnswerCards();
    answerLocked = false;
    gameState = "question";
  }

  function submitAnswer(selectedPosition) {
    if (gameState !== "question" || answerLocked) return;

    answerLocked = true;
    gameState = "feedback";
    const isCorrect = selectedPosition === correctPosition;
    const answerButtons = [...cardGrid.querySelectorAll(".answer-card")];

    answerButtons.forEach((button, position) => {
      button.disabled = true;
      if (position === correctPosition) button.classList.add("is-correct");
      if (!isCorrect && position === selectedPosition) button.classList.add("is-wrong");
    });

    feedback.hidden = false;
    feedback.classList.add(isCorrect ? "is-correct" : "is-wrong");

    if (isCorrect) {
      score += 100;
      correctAnswers += 1;
      scoreText.textContent = String(score);
      feedbackTitle.textContent = "정답! +100점";
      feedbackCopy.textContent = `${correctPosition + 1}번 위치를 정확히 기억했어요.`;
    } else {
      feedbackTitle.textContent = "아쉬워요!";
      feedbackCopy.textContent = `정답은 ${correctPosition + 1}번 위치였어요.`;
    }

    nextButton.textContent = levelIndex === LEVELS.length - 1 ? "결과 보기" : "다음 LEVEL";
    nextButton.hidden = false;
  }

  function advance() {
    if (gameState !== "feedback") return;
    answerLocked = true;

    if (levelIndex < LEVELS.length - 1) {
      levelIndex += 1;
      beginLevel();
      return;
    }

    showResult();
  }

  function getResultMessage() {
    if (correctAnswers === 3) return "선글라스 기억력 MASTER!";
    if (correctAnswers === 2) return "집중력이 꽤 좋으신데요?";
    return "눈 깜빡할 사이였죠? 한 번 더 도전!";
  }

  function showResult() {
    clearTimers();
    answerLocked = true;
    resultMark.textContent = `${correctAnswers}/3`;
    resultTitle.textContent = getResultMessage();
    finalScore.textContent = String(score);
    correctCount.textContent = String(correctAnswers);
    showScreen("result");
  }

  function startGame() {
    resetGame();
    beginLevel();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function openProduct(event) {
    if (!PRODUCT_URL) {
      event.preventDefault();
      showToast("상품 페이지가 준비 중입니다.");
      return;
    }
    event.currentTarget.href = PRODUCT_URL;
    event.currentTarget.target = "_blank";
    event.currentTarget.rel = "noopener noreferrer";
  }

  root.addEventListener("click", (event) => {
    const answer = event.target.closest(".answer-card");
    if (answer) {
      submitAnswer(Number(answer.dataset.position));
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "start" || action === "restart") startGame();
    if (action === "next") advance();
    if (action === "product") openProduct(event);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && gameState === "play") {
      resetGame();
      showScreen("start");
    }
  });

  showScreen("start");
})();
