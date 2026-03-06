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
| 씨뿌리기 | leech-seed |
| 독가루 | poison-powder |
| 수면가루 | sleep-powder |
| 솔라빔 | solar-beam |
| 기가드레인 | giga-drain |
| 에너지볼 | energy-ball |
| 할퀴기 | scratch |
| 불꽃뿜기 | ember |
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
| 얼음빔 | ice-beam |
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
| 냉동빔 | ice-beam |
| 기가임팩트 | giga-impact |
| 사이코키네시스 | psychic |
| 그림자분신 | double-team |
| 힘껏펀치 | focus-punch |
| 쾌청 | sunny-day |
| 오물폭탄 | sludge-bomb |
| 모래폭풍 | sandstorm |
| 대폭발 | explosion |
| 스톤에지 | stone-edge |
| 폭포오르기 | waterfall |
| 대체 | substitute |
| 고드름침 | icicle-spear |
| 바위깨기 | rock-smash |
| 비바라기 | rain-dance |
