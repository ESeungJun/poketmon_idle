포켓몬 공식 한국어 기술·아이템 이름을 검증한다.

다음 단계를 순서대로 수행하라:

1. `src/data/pokemon.js`와 `src/components/Shop/items.js`를 읽어 모든 기술 이름(move name)과 아이템 이름을 추출한다.

2. 각 기술 이름에 대해 PokeAPI(`https://pokeapi.co/api/v2/move/{slug}`)를 조회해 한국어 공식명(`names` 배열 중 `language.name === "ko"`)을 확인한다.
   - slug 변환 규칙: 한국어 이름으로는 검색 안 됨. CLAUDE.md의 수정 이력 표와 아래 슬러그 매핑을 참고한다.
   - 알 수 없는 기술은 `pokemon-expert` 에이전트를 통해 영어명을 먼저 확인한 뒤 API 조회한다.

3. 현재 코드의 이름과 PokeAPI 한국어 공식명이 다른 항목을 표로 출력한다:

| 파일 | 현재 이름 | 공식 한국어명 | 영어명 |
|------|-----------|---------------|--------|

4. 불일치 항목이 있으면 수정 여부를 사용자에게 묻고, 승인 시 파일을 수정한다.

5. 아이템(지니기 아이템, 비타민)도 동일한 방법으로 검증한다.
   - 아이템 API: `https://pokeapi.co/api/v2/item/{slug}`

## 자주 쓰는 슬러그 매핑

| 한국어명 | 영어 슬러그 |
|----------|-------------|
| 덩굴채찍 | vine-whip |
| 불꽃뿜기 | ember |
| 화염방사 | flamethrower |
| 물대포 | water-gun |
| 파도타기 | surf |
| 10만볼트 | thunderbolt |
| 번개 | thunder |
| 지진 | earthquake |
| 솔라빔 | solar-beam |
| 기가드레인 | giga-drain |
| 섀도볼 | shadow-ball |
| 사이코키네시스 | psychokinesis |
| 얼음빔 | ice-beam |
| 눈보라 | blizzard |
| 기합구슬 | focus-blast |
| 악의파동 | dark-pulse |
| 에어슬래시 | air-slash |
| 에너지볼 | energy-ball |
| 냉동빔 | ice-beam |
| 기가임팩트 | giga-impact |
| 누르기 | body-slam |
| 바람일으키기 | gust |
| 거품광선 | bubble-beam |
| 애교부리기 | charm |
| 아픔나누기 | pain-split |
| 울부짖기 | roar |
| 병상첨병 | hex |
| 뽐내기 | swagger |
| 힘껏펀치 | focus-punch |
| 스톤에지 | stone-edge |
| 대폭발 | explosion |
| 바위깨기 | rock-smash |
| 오물폭탄 | sludge-bomb |
| 최면술 | hypnosis |
| 저주 | curse |
| 고드름침 | icicle-spear |
| 꿈먹기 | dream-eater |
| 그림자분신 | double-team |
| 나이트헤드 | night-shade |
| 잠자기 | rest |
| 방어 | protect |
| 비바라기 | rain-dance |
| 쾌청 | sunny-day |
| 모래폭풍 | sandstorm |
