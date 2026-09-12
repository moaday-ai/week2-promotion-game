const PRICE_QUIZ_DATA = {
  title: "선글라스 가격 맞히기",
  priceNotice: "본 게임의 가격은 퀴즈용 예시입니다.",
  ctaUrl: "#",
  questions: [
    {
      id: "classic-black",
      image: "assets/quiz-black.png",
      alt: "퀴즈용으로 제작된 검은색 사각 프레임 선글라스",
      options: [19900, 39900, 59900, 89900],
      answerIndex: 2,
      explanation: "클래식한 프레임을 보고 떠올린 가격과 퀴즈 정답을 비교해 보세요.",
      priceType: "quiz-example",
    },
    {
      id: "sport-mirror",
      image: "assets/quiz-sport.png",
      alt: "퀴즈용으로 제작된 푸른색 미러 렌즈 스포츠 선글라스",
      options: [29900, 49900, 69900, 99900],
      answerIndex: 2,
      explanation: "곡선형 프레임과 미러 렌즈가 가격 인상에 어떤 영향을 줬는지 확인해 보세요.",
      priceType: "quiz-example",
    },
    {
      id: "round-silver",
      image: "assets/quiz-round.png",
      alt: "퀴즈용으로 제작된 은색 원형 프레임 선글라스",
      options: [24900, 44900, 64900, 84900],
      answerIndex: 1,
      explanation: "얇은 메탈 프레임의 인상을 보고 어느 가격대를 예상했는지 돌아보세요.",
      priceType: "quiz-example",
    },
  ],
  results: {
    perfect: {
      title: "가격 감각 만점!",
      description: "세 가지 스타일의 가격을 모두 정확하게 짚으셨네요.",
    },
    good: {
      title: "가격 보는 눈이 있으시네요!",
      description: "선글라스의 인상과 가격대를 꽤 정확하게 연결하셨어요.",
    },
    tryAgain: {
      title: "이번엔 감으로 승부하셨네요!",
      description: "이미지만으로 가격을 짐작하는 일은 생각보다 어렵죠. 한 번 더 도전해 보세요.",
    },
  },
};
