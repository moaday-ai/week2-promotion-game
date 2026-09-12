# 찰칵! 선글라스 스타일리스트

교육 과제용 모바일 우선 스타일링 게임입니다.

## 실행

프로젝트 루트에서 `npm start`를 실행한 뒤 아래 주소로 접속합니다.

`http://localhost:4173/stylist/`

## 이미지 에셋과 상품 URL

게임 비주얼은 `assets/` 아래에 역할별로 정리되어 있으며, `game.js`의 `GAME_DATA`에서 조합합니다.

- `assets/glasses/`: 캐릭터 오버레이와 선택 카드에 사용하는 선글라스 4종
- `assets/character/`: 시티·캐주얼·액티브 의상별 투명 캐릭터 3종
- `assets/backgrounds/`: 도심·해변·페스티벌 배경 3종
- `glasses[].asset`: 캐릭터 위에 겹칠 투명 PNG 경로
- `glasses[].thumbnail`: 선택 카드와 결과 상품 카드용 이미지 경로
- `glasses[].productUrl`: 실제 상품 상세 URL
- `styles[].asset`: 스타일별 포즈가 포함된 캐릭터 투명 PNG 경로
- `backgrounds[].asset`: 세로형 배경 이미지 경로

현재 상품 URL은 `#`으로 유지되어 상품 버튼을 누르면 준비 중 안내가 표시됩니다. 에셋 경로를 비우면 CSS fallback이 표시됩니다.
