(() => {
  "use strict";

  const questions = [
    {
      id: "q1",
      prompt: "햇살 좋은 주말, 가장 먼저 떠오르는 장면은?",
      choices: [
        { id: "q1-ap", label: "강변을 달리며 하루 시작", type: "AP" },
        { id: "q1-cs", label: "새로 생긴 거리와 카페 탐방", type: "CS" },
        { id: "q1-ta", label: "지도에 없던 풍경 찾아 출발", type: "TA" },
        { id: "q1-db", label: "동네 산책과 느긋한 브런치", type: "DB" },
      ],
    },
    {
      id: "q2",
      prompt: "외출 준비의 마지막 한 끗은?",
      choices: [
        { id: "q2-ap", label: "움직여도 흐트러지지 않는 느낌", type: "AP" },
        { id: "q2-cs", label: "오늘 룩을 완성하는 포인트", type: "CS" },
        { id: "q2-ta", label: "어디서 사진 찍어도 좋은 분위기", type: "TA" },
        { id: "q2-db", label: "오래 써도 부담 없는 편안함", type: "DB" },
      ],
    },
    {
      id: "q3",
      prompt: "햇빛이 강해진 순간, 나는?",
      choices: [
        { id: "q3-ap", label: "리듬을 유지하고 계속 움직인다", type: "AP" },
        { id: "q3-cs", label: "선글라스까지 포함해 룩을 점검한다", type: "CS" },
        { id: "q3-ta", label: "빛이 멋진 새로운 장소를 찾아간다", type: "TA" },
        { id: "q3-db", label: "그늘을 골라 여유롭게 속도를 낮춘다", type: "DB" },
      ],
    },
    {
      id: "q4",
      prompt: "선글라스를 보자마자 손이 가는 디자인은?",
      choices: [
        { id: "q4-ap", label: "역동적인 커브드 실루엣", type: "AP" },
        { id: "q4-cs", label: "존재감 있는 볼드 프레임", type: "CS" },
        { id: "q4-ta", label: "여행 사진에 잘 담기는 클래식 프레임", type: "TA" },
        { id: "q4-db", label: "어떤 옷에도 자연스러운 베이직 프레임", type: "DB" },
      ],
    },
  ];

  const results = {
    AP: {
      code: "AP",
      name: "액티브 퍼포머형",
      catchphrase: "햇살 아래서 더 빨라지는 에너지.",
      description:
        "가만히 있기보다 움직일 때 기분이 살아나는 타입이에요. 선글라스도 경쾌하고 역동적인 인상을 주는 스타일에 자연스럽게 눈이 갑니다.",
      keywords: ["커브드 실루엣", "스포티", "미러 포인트", "선명한 컬러"],
      image: "assets/results/active.png",
      imageAlt: "블루 미러 렌즈의 커브드 스포츠 선글라스",
      cta: "액티브 스타일 둘러보기",
      url: "#",
      theme: "active",
    },
    CS: {
      code: "CS",
      name: "시티 스타일러형",
      catchphrase: "거리 전체를 나만의 런웨이로.",
      description:
        "기능만큼 오늘의 옷과 분위기를 중요하게 보는 감각파예요. 얼굴에 확실한 포인트를 만드는 프레임이 당신의 도시적인 무드를 살려줍니다.",
      keywords: ["볼드 프레임", "스퀘어", "블랙", "모던"],
      image: "assets/results/city.png",
      imageAlt: "볼드한 블랙 스퀘어 선글라스",
      cta: "시티 포인트 스타일 보기",
      url: "#",
      theme: "city",
    },
    TA: {
      code: "TA",
      name: "트래블 어드벤처형",
      catchphrase: "새로운 풍경에는 새로운 시선이 필요해.",
      description:
        "익숙한 길보다 다음 장면을 기대하는 탐험가 타입이에요. 여행 사진과 다양한 옷차림에 자연스럽게 어울리는 개성 있는 클래식 무드를 좋아합니다.",
      keywords: ["클래식", "웰링턴", "앰버", "포토제닉"],
      image: "assets/results/travel.png",
      imageAlt: "따뜻한 앰버 컬러의 클래식 웰링턴 선글라스",
      cta: "트래블 무드 스타일 보기",
      url: "#",
      theme: "travel",
    },
    DB: {
      code: "DB",
      name: "데일리 밸런서형",
      catchphrase: "매일 손이 가는 편안한 센스.",
      description:
        "과한 연출보다 자연스럽고 균형 잡힌 선택을 즐기는 타입이에요. 어느 일정에나 부담 없이 어울리는 담백한 선글라스 무드가 잘 맞습니다.",
      keywords: ["라이트웨이트", "뉴트럴", "라운드", "데일리"],
      image: "assets/results/daily.png",
      imageAlt: "가볍고 얇은 뉴트럴 그레이 라운드 선글라스",
      cta: "데일리 스타일 둘러보기",
      url: "#",
      theme: "daily",
    },
  };

  window.GAME5_DATA = Object.freeze({
    typeOrder: Object.freeze(["AP", "CS", "TA", "DB"]),
    questions: Object.freeze(questions),
    results: Object.freeze(results),
  });
})();
