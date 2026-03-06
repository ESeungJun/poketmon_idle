---
name: verify-pokemon-ko
description: 포켓몬 기술·아이템·포켓몬 이름이 추가되거나 수정될 때 자동으로 공식 한국어 명칭을 검증한다. `src/data/pokemon.js` 또는 `src/components/Shop/items.js`에 기술명·아이템명·포켓몬명을 추가하거나 수정하는 작업이 포함될 때마다 반드시 이 스킬을 실행한다.
---

# 포켓몬 공식 한국어 명칭 검증 스킬

포켓몬 기술·아이템·포켓몬 이름이 추가되거나 수정되면 **자동으로** 아래 절차를 수행한다.

## 트리거 조건

다음 중 하나라도 해당하면 즉시 실행:
- `src/data/pokemon.js`에 기술명(moves) 추가/수정
- `src/components/Shop/items.js`에 아이템명 추가/수정
- 포켓몬 이름(speciesName 등) 추가/수정

## 검증 절차

### 1단계: 대상 추출
수정된 파일에서 변경된 기술명·아이템명만 추출한다. (전체 재검증 불필요)

### 2단계: PokeAPI 조회
- 기술: `https://pokeapi.co/api/v2/move/{slug}`
- 아이템: `https://pokeapi.co/api/v2/item/{slug}`
- `names` 배열에서 `language.name === "ko"` 항목의 name을 가져온다.
- slug를 모를 경우 아래 슬러그 매핑 참고. 없으면 `pokemon-expert` 에이전트로 영어명 확인 후 재조회.

### 3단계: 불일치 보고
현재 코드의 이름과 PokeAPI 공식 한국어명이 다른 항목을 표로 출력:

| 파일 | 현재 이름 | 공식 한국어명 | 영어명 |
|------|-----------|---------------|--------|

### 4단계: 수정
불일치 항목이 있으면 사용자에게 수정 여부를 묻고, 승인 시 파일을 수정한다.

---

## 슬러그 매핑

| 한국어명 | 영어 슬러그 |
|----------|-------------|
| 덩굴채찍 | vine-whip |
| 씨뿌리기 | leech-seed |
| 독가루 | poison-powder |
| 수면가루 | sleep-powder |
| 솔라빔 | solar-beam |
| 기가드레인 | giga-drain |
| 에너지볼 | energy-ball |
| 할퀴기 | scratch |
| 불꽃세례 | ember |
| 도깨비불 | will-o-wisp |
| 불꽃엄니 | fire-fang |
| 화염방사 | flamethrower |
| 악의파동 | dark-pulse |
| 에어슬래시 | air-slash |
| 지진 | earthquake |
| 물대포 | water-gun |
| 껍질에숨기 | withdraw |
| 거품광선 | bubble-beam |
| 파도타기 | surf |
| 방어 | protect |
| 냉동빔 | ice-beam |
| 눈보라 | blizzard |
| 쪼기 | peck |
| 모래뿌리기 | sand-attack |
| 바람일으키기 | gust |
| 전광석화 | quick-attack |
| 날개치기 | wing-attack |
| 뽐내기 | swagger |
| 전기쇼크 | thunder-shock |
| 아이언테일 | iron-tail |
| 10만볼트 | thunderbolt |
| 번개 | thunder |
| 기합구슬 | focus-blast |
| 나이트헤드 | night-shade |
| 최면술 | hypnosis |
| 맹독 | toxic |
| 저주 | curse |
| 섀도볼 | shadow-ball |
| 꿈먹기 | dream-eater |
| 병상첨병 | hex |
| 아픔나누기 | pain-split |
| 물기 | bite |
| 애교부리기 | charm |
| 누르기 | body-slam |
| 돌진 | take-down |
| 잠자기 | rest |
| 울부짖기 | roar |
| 기가임팩트 | giga-impact |
| 사이코키네시스 | psychic |
| 그림자분신 | double-team |
| 힘껏펀치 | focus-punch |
| 쾌청 | sunny-day |
| 오물폭탄 | sludge-bomb |
| 모래바람 | sandstorm |
| 대폭발 | explosion |
| 스톤에지 | stone-edge |
| 폭포오르기 | waterfall |
| 대타출동 | substitute |
| 고드름침 | icicle-spear |
| 바위깨기 | rock-smash |
| 비바라기 | rain-dance |

## 아이템 슬러그 매핑

| 한국어명 | 영어 슬러그 |
|----------|-------------|
| 생명의구슬 | life-orb |
| 구애안경 | choice-specs |
| 구애스카프 | choice-scarf |
| 먹다남은음식 | leftovers |
| 조개껍질방울 | shell-bell |
| 기합의띠 | focus-sash |
| 검은진흙 | black-sludge |
| 박식안경 | wise-glasses |
| 저주의부적 | spell-tag |
| 독바늘 | poison-barb |
| 맥스업 | hp-up |
| 타우린 | protein |
| 사포닌 | iron |
| 리보플라빈 | calcium |
| 키토산 | zinc |
| 알칼로이드 | carbos |
