(() => {
  "use strict";

  const GAME_DATA = {
    steps: [
      {
        key: "glasses",
        title: "선글라스를 골라주세요",
        nextLabel: "이 선글라스로 결정",
      },
      {
        key: "styles",
        title: "오늘의 스타일은?",
        nextLabel: "이 스타일로 결정",
      },
      {
        key: "backgrounds",
        title: "화보 배경을 골라주세요",
        nextLabel: "촬영하기",
      },
    ],
    glasses: [
      {
        id: "cat",
        name: "캣아이 블랙",
        description: "선명한 인상을 만드는 포인트 프레임",
        color: "#171622",
        asset: "",
        thumbnail: "",
        productUrl: "#",
      },
      {
        id: "round",
        name: "라운드 앰버",
        description: "부드러운 무드의 빈티지 라운드 프레임",
        color: "#aa5f36",
        asset: "",
        thumbnail: "",
        productUrl: "#",
      },
      {
        id: "square",
        name: "스퀘어 크림",
        description: "깔끔하고 감각적인 와이드 프레임",
        color: "#f1debd",
        asset: "",
        thumbnail: "",
        productUrl: "#",
      },
      {
        id: "sport",
        name: "스포츠 블루",
        description: "가볍고 역동적인 커브드 프레임",
        color: "#276e91",
        asset: "",
        thumbnail: "",
        productUrl: "#",
      },
    ],
    styles: [
      {
        id: "city",
        name: "시티",
        description: "도회적인 재킷 룩",
        colors: ["#ef4d36", "#20223b"],
        asset: "",
        thumbnail: "",
      },
      {
        id: "casual",
        name: "캐주얼",
        description: "편안한 데님 룩",
        colors: ["#f5c84c", "#507aa0"],
        asset: "",
        thumbnail: "",
      },
      {
        id: "active",
        name: "액티브",
        description: "경쾌한 스포츠 룩",
        colors: ["#7bcaae", "#313852"],
        asset: "",
        thumbnail: "",
      },
    ],
    backgrounds: [
      {
        id: "city",
        name: "도심의 오후",
        description: "그래픽 빌딩과 햇살",
        colors: ["#f2b4ab", "#719ab0"],
        asset: "",
        thumbnail: "",
      },
      {
        id: "ocean",
        name: "푸른 해변",
        description: "청량한 바다와 모래",
        colors: ["#87d9de", "#f7d9a0"],
        asset: "",
        thumbnail: "",
      },
      {
        id: "festival",
        name: "선셋 페스티벌",
        description: "리듬이 느껴지는 노을",
        colors: ["#ec7f69", "#6a4e91"],
        asset: "",
        thumbnail: "",
      },
    ],
    results: {
      "city:city": {
        name: "모던 시티",
        description: "정돈된 실루엣과 도심의 리듬이 만난 세련된 룩이에요.",
      },
      "city:ocean": {
        name: "어반 리조트",
        description: "도회적인 감각에 해변의 여유를 더한 반전 매력의 룩이에요.",
      },
      "city:festival": {
        name: "시티 글로우",
        description: "선명한 스타일과 노을빛이 어우러진 존재감 있는 룩이에요.",
      },
      "casual:city": {
        name: "데일리 시티",
        description: "편안한 분위기 속에 도시의 감각을 담은 자연스러운 룩이에요.",
      },
      "casual:ocean": {
        name: "이지 오션",
        description: "가벼운 옷차림과 푸른 바다가 잘 어울리는 여유로운 룩이에요.",
      },
      "casual:festival": {
        name: "프리 페스티벌",
        description: "자유로운 에너지와 따뜻한 컬러가 돋보이는 유쾌한 룩이에요.",
      },
      "active:city": {
        name: "액티브 시티",
        description: "스포티한 에너지와 도심의 속도감이 만난 자신감 있는 룩이에요.",
      },
      "active:ocean": {
        name: "액티브 오션",
        description: "햇살 아래 움직임이 더욱 빛나는 청량하고 건강한 룩이에요.",
      },
      "active:festival": {
        name: "에너지 비트",
        description: "경쾌한 실루엣과 페스티벌의 리듬을 담은 생동감 넘치는 룩이에요.",
      },
    },
  };

  const state = {
    screen: "intro",
    step: 0,
    selectedGlasses: "cat",
    selectedStyle: "city",
    selectedBackground: "city",
    isCapturing: false,
  };

  const screens = [...document.querySelectorAll("[data-screen]")];
  const game = document.querySelector(".game");
  const studio = document.querySelector("[data-studio]");
  const character = document.querySelector("[data-character]");
  const options = document.querySelector("[data-options]");
  const stepCount = document.querySelector("[data-step-count]");
  const stepTitle = document.querySelector("[data-step-title]");
  const stepDots = [...document.querySelectorAll("[data-step-dots] span")];
  const nextLabel = document.querySelector("[data-next-label]");
  const studioLabel = document.querySelector("[data-studio-label]");
  const backgroundAsset = document.querySelector("[data-background-asset]");
  const characterAsset = document.querySelector("[data-character-asset]");
  const glassesAsset = document.querySelector("[data-glasses-asset]");
  const glassesPlaceholder = document.querySelector(".glasses-placeholder");
  const countdown = document.querySelector("[data-countdown]");
  const capturePreview = document.querySelector("[data-capture-preview]");
  const captureFlash = document.querySelector("[data-capture-flash]");
  const toast = document.querySelector("[data-toast]");
  const resultPhoto = document.querySelector("[data-result-photo]");
  const resultName = document.querySelector("[data-result-name]");
  const resultDescription = document.querySelector("[data-result-description]");
  const productName = document.querySelector("[data-product-name]");
  const productDescription = document.querySelector("[data-product-description]");
  const productSwatch = document.querySelector("[data-product-swatch]");
  const productLink = document.querySelector("[data-action='product']");

  let toastTimer = 0;
  let swipeStartX = null;
  let captureToken = 0;

  function getSelected(type) {
    const stateKey = type === "glasses" ? "selectedGlasses" : type === "styles" ? "selectedStyle" : "selectedBackground";
    return GAME_DATA[type].find((item) => item.id === state[stateKey]);
  }

  function showScreen(name) {
    state.screen = name;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.classList.toggle("is-active", active);
      screen.setAttribute("aria-hidden", String(!active));
    });
    game.scrollTop = 0;
  }

  function setImageAsset(element, source, alt = "") {
    if (!source) {
      element.removeAttribute("src");
      element.alt = "";
      element.hidden = true;
      return;
    }
    element.src = source;
    element.alt = alt;
    element.hidden = false;
  }

  function updatePreview() {
    const glasses = getSelected("glasses");
    const style = getSelected("styles");
    const background = getSelected("backgrounds");

    studio.dataset.background = background.id;
    character.dataset.style = style.id;
    glassesPlaceholder.dataset.glassesShape = glasses.id;
    studioLabel.textContent = background.name;
    character.setAttribute("aria-label", `${glasses.name}, ${style.name} 스타일, ${background.name} 배경 미리보기`);

    setImageAsset(backgroundAsset, background.asset);
    setImageAsset(characterAsset, style.asset, `${style.name} 스타일 캐릭터`);
    setImageAsset(glassesAsset, glasses.asset, glasses.name);
    glassesPlaceholder.hidden = Boolean(glasses.asset);
  }

  function createPreviewMarkup(type, item) {
    if (item.thumbnail) {
      return `<img src="${item.thumbnail}" alt="" />`;
    }

    if (type === "glasses") {
      return `<span class="mini-glasses mini-${item.id}" style="--item-color:${item.color}"><i></i><i></i><b></b></span>`;
    }

    const colors = item.colors;
    if (type === "styles") {
      return `<span class="mini-outfit mini-outfit-${item.id}" style="--color-one:${colors[0]};--color-two:${colors[1]}"><i></i><b></b></span>`;
    }

    return `<span class="mini-background mini-background-${item.id}" style="--color-one:${colors[0]};--color-two:${colors[1]}"><i></i><b></b></span>`;
  }

  function renderOptions() {
    const step = GAME_DATA.steps[state.step];
    const selected = getSelected(step.key);
    const items = GAME_DATA[step.key];

    options.innerHTML = items
      .map((item) => {
        const isSelected = item.id === selected.id;
        return `
          <button
            class="option-card${isSelected ? " is-selected" : ""}"
            type="button"
            data-option-id="${item.id}"
            aria-pressed="${isSelected}"
          >
            <span class="option-visual">${createPreviewMarkup(step.key, item)}</span>
            <strong>${item.name}</strong>
            <small>${item.description}</small>
            <span class="selected-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg>
            </span>
          </button>`;
      })
      .join("");

    requestAnimationFrame(() => {
      options.querySelector(".is-selected")?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  }

  function renderStep() {
    const step = GAME_DATA.steps[state.step];
    stepCount.textContent = `${state.step + 1} / ${GAME_DATA.steps.length}`;
    stepTitle.textContent = step.title;
    nextLabel.textContent = step.nextLabel;
    stepDots.forEach((dot, index) => dot.classList.toggle("is-active", index <= state.step));
    renderOptions();
    updatePreview();
  }

  function selectItem(id) {
    const key = GAME_DATA.steps[state.step].key;
    if (!GAME_DATA[key].some((item) => item.id === id)) return;

    if (key === "glasses") state.selectedGlasses = id;
    if (key === "styles") state.selectedStyle = id;
    if (key === "backgrounds") state.selectedBackground = id;

    renderOptions();
    updatePreview();
    character.classList.remove("has-changed");
    void character.offsetWidth;
    character.classList.add("has-changed");
  }

  function moveSelection(direction) {
    const key = GAME_DATA.steps[state.step].key;
    const items = GAME_DATA[key];
    const selected = getSelected(key);
    const currentIndex = items.findIndex((item) => item.id === selected.id);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    selectItem(items[nextIndex].id);
  }

  function cloneStudio() {
    const clone = studio.cloneNode(true);
    clone.removeAttribute("data-studio");
    clone.querySelector("[data-flash]")?.remove();
    clone.querySelector(".studio-label")?.remove();
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  async function startCapture() {
    if (state.isCapturing) return;
    state.isCapturing = true;
    const token = ++captureToken;
    capturePreview.replaceChildren(cloneStudio());
    showScreen("capture");

    for (const value of ["3", "2", "1"]) {
      if (token !== captureToken) return;
      countdown.textContent = value;
      countdown.classList.remove("is-popping");
      void countdown.offsetWidth;
      countdown.classList.add("is-popping");
      await wait(650);
    }

    if (token !== captureToken) return;
    countdown.textContent = "찰칵!";
    captureFlash.classList.add("is-flashing");
    navigator.vibrate?.(45);
    await wait(520);
    captureFlash.classList.remove("is-flashing");
    state.isCapturing = false;
    renderResult();
    showScreen("result");
  }

  function renderResult() {
    const glasses = getSelected("glasses");
    const result = GAME_DATA.results[`${state.selectedStyle}:${state.selectedBackground}`];

    resultPhoto.replaceChildren(cloneStudio());
    resultName.textContent = result.name;
    resultDescription.textContent = `${result.description} ${glasses.name}이 포인트를 완성해 줍니다.`;
    productName.textContent = glasses.name;
    productDescription.textContent = glasses.description;
    productSwatch.style.setProperty("--product-color", glasses.color);
    productSwatch.dataset.shape = glasses.id;
    productLink.href = glasses.productUrl;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function resetGame() {
    captureToken += 1;
    state.screen = "styling";
    state.step = 0;
    state.selectedGlasses = GAME_DATA.glasses[0].id;
    state.selectedStyle = GAME_DATA.styles[0].id;
    state.selectedBackground = GAME_DATA.backgrounds[0].id;
    state.isCapturing = false;
    renderStep();
    showScreen("styling");
  }

  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-option-id]");
    if (option) {
      selectItem(option.dataset.optionId);
      return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    if (action === "start" || action === "restart") resetGame();
    if (action === "previous-item") moveSelection(-1);
    if (action === "next-item") moveSelection(1);
    if (action === "next-step") {
      if (state.step < GAME_DATA.steps.length - 1) {
        state.step += 1;
        renderStep();
      } else {
        startCapture();
      }
    }
    if (action === "back") {
      if (state.step > 0) {
        state.step -= 1;
        renderStep();
      } else {
        showScreen("intro");
      }
    }
    if (action === "product") {
      const glasses = getSelected("glasses");
      if (!glasses.productUrl || glasses.productUrl === "#") {
        event.preventDefault();
        showToast("상품 페이지 준비 중입니다. URL만 교체하면 바로 연결됩니다.");
      }
    }
  });

  options.addEventListener("pointerdown", (event) => {
    swipeStartX = event.clientX;
  });

  options.addEventListener("pointerup", (event) => {
    if (swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) >= 44) moveSelection(distance > 0 ? -1 : 1);
  });

  options.addEventListener("pointercancel", () => {
    swipeStartX = null;
  });

  window.addEventListener("keydown", (event) => {
    if (state.screen !== "styling" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    moveSelection(event.key === "ArrowLeft" ? -1 : 1);
  });

  updatePreview();
  showScreen("intro");
})();
