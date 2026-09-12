(() => {
  "use strict";

  const data = PRICE_QUIZ_DATA;
  const screens = [...document.querySelectorAll("[data-screen]")];
  const noticeElements = [...document.querySelectorAll("[data-price-notice]")];
  const progressText = document.querySelector("[data-progress-text]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const questionImage = document.querySelector("[data-question-image]");
  const questionHeading = document.querySelector("[data-question-heading]");
  const optionsContainer = document.querySelector("[data-options]");
  const feedback = document.querySelector("[data-feedback]");
  const feedbackTitle = document.querySelector("[data-feedback-title]");
  const answerPrice = document.querySelector("[data-answer-price]");
  const explanation = document.querySelector("[data-explanation]");
  const nextLabel = document.querySelector("[data-next-label]");
  const resultScore = document.querySelector("[data-result-score]");
  const resultTitle = document.querySelector("[data-result-title]");
  const resultDescription = document.querySelector("[data-result-description]");
  const productLink = document.querySelector("[data-action='product']");
  const toast = document.querySelector("[data-toast]");

  const state = {
    screen: "start",
    currentIndex: 0,
    score: 0,
    answered: false,
    selectedIndex: null,
  };

  let toastTimer = 0;

  function formatPrice(value) {
    return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
  }

  function showScreen(name) {
    state.screen = name;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.classList.toggle("is-active", active);
      screen.setAttribute("aria-hidden", String(!active));
    });
    document.querySelector(".game-card").scrollTop = 0;
  }

  function resetState() {
    state.currentIndex = 0;
    state.score = 0;
    state.answered = false;
    state.selectedIndex = null;
  }

  function renderQuestion() {
    const question = data.questions[state.currentIndex];
    state.answered = false;
    state.selectedIndex = null;

    progressText.textContent = `${state.currentIndex + 1} / ${data.questions.length}`;
    progressBar.style.transform = `scaleX(${(state.currentIndex + 1) / data.questions.length})`;
    questionImage.src = question.image;
    questionImage.alt = question.alt;
    feedback.hidden = true;
    feedback.classList.remove("is-correct", "is-wrong");

    optionsContainer.innerHTML = question.options
      .map(
        (price, index) => `
          <button class="price-option" type="button" data-option-index="${index}">
            ${formatPrice(price)}
          </button>`,
      )
      .join("");
  }

  function selectAnswer(selectedIndex) {
    if (state.screen !== "quiz" || state.answered) return;

    const question = data.questions[state.currentIndex];
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) return;

    state.answered = true;
    state.selectedIndex = selectedIndex;
    const isCorrect = selectedIndex === question.answerIndex;
    if (isCorrect) state.score += 1;

    [...optionsContainer.querySelectorAll(".price-option")].forEach((button, index) => {
      button.disabled = true;
      if (index === question.answerIndex) button.classList.add("is-correct");
      if (index === selectedIndex && !isCorrect) button.classList.add("is-wrong");
    });

    feedbackTitle.textContent = isCorrect ? "정답이에요!" : "아쉬워요!";
    answerPrice.textContent = `퀴즈 정답은 ${formatPrice(question.options[question.answerIndex])}!`;
    explanation.textContent = question.explanation;
    nextLabel.textContent = state.currentIndex === data.questions.length - 1 ? "결과 보기" : "다음 문제";
    feedback.classList.add(isCorrect ? "is-correct" : "is-wrong");
    feedback.hidden = false;
  }

  function getResult() {
    if (state.score === data.questions.length) return data.results.perfect;
    if (state.score === data.questions.length - 1) return data.results.good;
    return data.results.tryAgain;
  }

  function renderResult() {
    const result = getResult();
    resultScore.innerHTML = `${data.questions.length}문제 중 <em>${state.score}문제 정답!</em>`;
    resultTitle.textContent = result.title;
    resultDescription.textContent = result.description;
    productLink.href = data.ctaUrl;
    showScreen("result");
  }

  function startGame() {
    clearTimeout(toastTimer);
    toast.classList.remove("is-visible");
    toast.textContent = "";
    resetState();
    renderQuestion();
    showScreen("quiz");
    questionHeading.focus({ preventScroll: true });
  }

  function nextQuestion() {
    if (!state.answered) return;
    if (state.currentIndex >= data.questions.length - 1) {
      renderResult();
      return;
    }

    state.currentIndex += 1;
    renderQuestion();
    questionHeading.focus({ preventScroll: true });
  }

  function restartGame() {
    startGame();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.textContent = "";
    }, 2600);
  }

  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-option-index]");
    if (option) {
      selectAnswer(Number(option.dataset.optionIndex));
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    const action = actionElement?.dataset.action;
    if (!action) return;

    if (action === "start") startGame();
    if (action === "next") nextQuestion();
    if (action === "restart") restartGame();
    if (action === "product") {
      if (!data.ctaUrl || data.ctaUrl === "#") {
        event.preventDefault();
        showToast("상품 페이지 준비 중입니다. URL을 연결하면 바로 이동할 수 있어요.");
      }
    }
  });

  noticeElements.forEach((element) => {
    element.textContent = data.priceNotice;
  });
  showScreen("start");
})();
