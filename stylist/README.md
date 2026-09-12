# 찰칵! 선글라스 스타일리스트

교육 과제용 모바일 우선 스타일링 게임입니다.

## 실행

프로젝트 루트에서 `npm start`를 실행한 뒤 아래 주소로 접속합니다.

`http://localhost:4173/stylist/`

## 상품과 이미지 교체

`game.js`의 `GAME_DATA`만 수정하면 됩니다.

- `glasses[].asset`: 캐릭터 위에 겹칠 투명 PNG 경로
- `glasses[].thumbnail`: 선택 카드용 이미지 경로
- `glasses[].productUrl`: 실제 상품 상세 URL
- `styles[].asset`: 스타일별 포즈가 포함된 캐릭터 투명 PNG 경로
- `backgrounds[].asset`: 세로형 배경 이미지 경로

에셋 경로가 빈 문자열이면 현재 CSS placeholder가 표시됩니다.

권장 폴더는 `assets/glasses`, `assets/glasses-thumbs`, `assets/character`, `assets/backgrounds`입니다.
