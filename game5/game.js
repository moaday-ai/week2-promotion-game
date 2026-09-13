(() => {
  "use strict";

  const data = window.GAME5_DATA;
  const state = {
    screen: "intro",
    questionIndex: 0,
    answers: [],
    selectedChoiceId: null,
    resultType: null,
    transitionTimer: 0,
  };

  const screens = [...document.querySelectorAll("[data-screen]")];
  const currentQuestion = document.querySelector("[data-current-question]");
  const totalQuestions = document.querySelector("[data-total-questions]");
  const progress = document.querySelector("[data-progress]");
  const progressFill = document.querySelector("[data-progress-fill]");
  const questionText = document.querySelector("[data-question]");
  const choices = document.querySelector("[data-choices]");
  const resultName = document.querySelector("[data-result-name]");
  const resultCatchphrase = document.querySelector("[data-result-catchphrase]");
  const resultDescription = document.querySelector("[data-result-description]");
  const resultVisual = document.querySelector("[data-result-visual]");
  const resultImage = document.querySelector("[data-result-image]");
  const keywords = document.querySelector("[data-keywords]");
  const ctaLabel = document.querySelector("[data-cta-label]");
  const productLink = document.querySelector("[data-action='product']");
  const toast = document.querySelector("[data-toast]");

  let toastTimer = 0;

  function showScreen(name) {
    state.screen = name;
    screens.forEach((screen) => {
      const isActive = screen.dataset.screen === name;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.querySelector(`[data-screen="${name}"]`)?.scrollTo(0, 0);
  }

  function recordAnswer(questionId, typeId, choiceId) {
    const existingIndex = state.answers.findIndex((answer) => answer.questionId === questionId);
    const answer = { questionId, type: typeId, choiceId };
    if (existingIndex >= 0) state.answers[existingIndex] = answer;
    else state.answers.push(answer);
    return [...state.answers];
  }

  function calculateScores(answers) {
    const scores = Object.fromEntries(data.typeOrder.map((type) => [type, 0]));
    answers.forEach((answer) => {
      if (Object.hasOwn(scores, answer.type)) scores[answer.type] += 1;
    });
    return scores;
  }

  function resolveTie(scores, answers) {
    const highestScore = Math.max(...Object.values(scores));
    const leaders = data.typeOrder.filter((type) => scores[type] === highestScore);
    if (leaders.length === 1) return leaders[0];

    for (let index = data.questions.length - 1; index >= 0; index -= 1) {
      const questionId = data.questions[index].id;
      const answer = answers.find((item) => item.questionId === questionId);
      if (answer && leaders.includes(answer.type)) return answer.type;
    }

    return leaders[0];
  }

  function getResult(typeId) {
    return data.results[typeId] || data.results.DB;
  }

  function renderQuestion() {
    const question = data.questions[state.questionIndex];
    const displayNumber = state.questionIndex + 1;
    state.selectedChoiceId = null;

    currentQuestion.textContent = String(displayNumber);
    totalQuestions.textContent = String(data.questions.length);
    progress.setAttribute("aria-valuemax", String(data.questions.length));
    progress.setAttribute("aria-valuenow", String(displayNumber));
    progressFill.style.width = `${(displayNumber / data.questions.length) * 100}%`;
    questionText.textContent = question.prompt;

    choices.innerHTML = question.choices
      .map(
        (choice, index) => `
          <button
            class="choice-button"
            type="button"
            data-choice-id="${choice.id}"
            data-choice-type="${choice.type}"
            aria-pressed="false"
          >
            <span class="choice-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span>${choice.label}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </button>`,
      )
      .join("");
  }

  function renderResult(typeId) {
    const result = getResult(typeId);
    state.resultType = result.code;
    resultName.textContent = result.name;
    resultCatchphrase.textContent = result.catchphrase;
    resultDescription.textContent = result.description;
    resultImage.src = result.image;
    resultImage.alt = result.imageAlt;
    resultVisual.dataset.theme = result.theme;
    keywords.innerHTML = result.keywords.map((keyword) => `<li>${keyword}</li>`).join("");
    ctaLabel.textContent = result.cta;
    productLink.href = result.url;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function startQuiz() {
    clearTimeout(state.transitionTimer);
    state.questionIndex = 0;
    state.answers = [];
    state.selectedChoiceId = null;
    state.resultType = null;
    renderQuestion();
    showScreen("question");
    requestAnimationFrame(() => choices.querySelector("button")?.focus({ preventScroll: true }));
  }

  function selectChoice(button) {
    if (state.selectedChoiceId) return;
    const question = data.questions[state.questionIndex];
    const selectedChoice = question.choices.find((choice) => choice.id === button.dataset.choiceId);
    if (!selectedChoice) return;

    state.selectedChoiceId = selectedChoice.id;
    recordAnswer(question.id, selectedChoice.type, selectedChoice.id);
    choices.querySelectorAll("button").forEach((choiceButton) => {
      const isSelected = choiceButton === button;
      choiceButton.disabled = true;
      choiceButton.classList.toggle("is-selected", isSelected);
      choiceButton.setAttribute("aria-pressed", String(isSelected));
    });

    navigator.vibrate?.(18);
    state.transitionTimer = window.setTimeout(() => {
      if (state.questionIndex < data.questions.length - 1) {
        state.questionIndex += 1;
        renderQuestion();
        showScreen("question");
        choices.querySelector("button")?.focus({ preventScroll: true });
        return;
      }

      const scores = calculateScores(state.answers);
      const typeId = resolveTie(scores, state.answers);
      renderResult(typeId);
      showScreen("calculating");
      state.transitionTimer = window.setTimeout(() => showScreen("result"), 620);
    }, 300);
  }

  function restartQuiz() {
    clearTimeout(state.transitionTimer);
    state.questionIndex = 0;
    state.answers = [];
    state.selectedChoiceId = null;
    state.resultType = null;
    showScreen("intro");
    document.querySelector("[data-action='start']")?.focus({ preventScroll: true });
  }

  document.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-choice-id]");
    if (choice) {
      selectChoice(choice);
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    const action = actionTarget?.dataset.action;
    if (action === "start") startQuiz();
    if (action === "restart") restartQuiz();
    if (action === "product") {
      const result = getResult(state.resultType);
      if (!result.url || result.url === "#") {
        event.preventDefault();
        showToast("상품 페이지 준비 중입니다.");
      }
    }
  });

  window.Game5Logic = Object.freeze({ calculateScores, resolveTie, getResult });
  showScreen("intro");
})();
