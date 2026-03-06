// Pokemon species registry
// Sprite: PokeAPI Generation I (Red/Blue transparent)
export function spriteUrl(dexNum) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/${dexNum}.png`
}

// XP formula: level n requires n² × 4 total points earned
export function expForLevel(n) {
  return n * n * 4
}

// Current level from total points earned (floor(sqrt(xp/4)))
export function calcLevel(totalPointsEarned) {
  return Math.floor(Math.sqrt((totalPointsEarned || 0) / 4))
}

// Selectable base Pokémon (no pre-evolution)
export const STARTERS = ['bulbasaur', 'charmander', 'squirtle']

export const POKEMON_DB = {
  // ── 이상해씨 계열 ───────────────────────────────────────────────────
  bulbasaur: {
    id: 'bulbasaur', dexNum: 1, speciesName: '이상해씨',
    types: ['풀', '독'],
    baseStats: { HP: 45, 공격: 49, 방어: 49, 특수공격: 65, 특수방어: 65, 스피드: 45 },
    abilities: [
      { name: '심록', desc: 'HP가 1/3 이하일 때 풀 기술 위력 1.5배' },
      { name: '엽록소', desc: '맑은 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '덩굴채찍', type: '풀', category: '물리', power: 45 },
      { name: '씨뿌리기', type: '풀', category: '변화', power: null },
      { name: '독가루', type: '독', category: '변화', power: null },
      { name: '잠자기가루', type: '풀', category: '변화', power: null },
      { name: '에너지볼', type: '풀', category: '특수', power: 90 },
      { name: '솔라빔', type: '풀', category: '특수', power: 120 },
    ],
    learnableTMs: ['tm06', 'tm11', 'tm17', 'tm18', 'tm44', 'tm53', 'tm87', 'tm90'],
    evolveAt: 16, evolveTo: 'ivysaur',
  },
  ivysaur: {
    id: 'ivysaur', dexNum: 2, speciesName: '이상해풀',
    types: ['풀', '독'],
    baseStats: { HP: 60, 공격: 62, 방어: 63, 특수공격: 80, 특수방어: 80, 스피드: 60 },
    abilities: [
      { name: '심록', desc: 'HP가 1/3 이하일 때 풀 기술 위력 1.5배' },
      { name: '엽록소', desc: '맑은 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '덩굴채찍', type: '풀', category: '물리', power: 45 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90 },
      { name: '독가루', type: '독', category: '변화', power: null },
      { name: '잠자기가루', type: '풀', category: '변화', power: null },
      { name: '솔라빔', type: '풀', category: '특수', power: 120 },
      { name: '기가드레인', type: '풀', category: '특수', power: 75 },
    ],
    learnableTMs: ['tm06', 'tm11', 'tm17', 'tm18', 'tm44', 'tm53', 'tm87', 'tm90'],
    evolveAt: 32, evolveTo: 'venusaur',
  },
  venusaur: {
    id: 'venusaur', dexNum: 3, speciesName: '이상해꽃',
    types: ['풀', '독'],
    baseStats: { HP: 80, 공격: 82, 방어: 83, 특수공격: 100, 특수방어: 100, 스피드: 80 },
    abilities: [
      { name: '심록', desc: 'HP가 1/3 이하일 때 풀 기술 위력 1.5배' },
      { name: '엽록소', desc: '맑은 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '솔라빔', type: '풀', category: '특수', power: 120 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90 },
      { name: '기가드레인', type: '풀', category: '특수', power: 75 },
      { name: '독독', type: '독', category: '변화', power: null },
      { name: '잠자기가루', type: '풀', category: '변화', power: null },
      { name: '지진', type: '땅', category: '물리', power: 100 },
    ],
    learnableTMs: ['tm06', 'tm11', 'tm17', 'tm18', 'tm26', 'tm44', 'tm53', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 파이리 계열 ───────────────────────────────────────────────────
  charmander: {
    id: 'charmander', dexNum: 4, speciesName: '파이리',
    types: ['불꽃'],
    baseStats: { HP: 39, 공격: 52, 방어: 43, 특수공격: 60, 특수방어: 50, 스피드: 65 },
    abilities: [
      { name: '맹화', desc: 'HP가 1/3 이하일 때 불꽃 기술 위력 1.5배' },
      { name: '태양의힘', desc: '맑은 날씨에 특수공격 1.5배, HP 소모' },
    ],
    baseMoves: [
      { name: '불꽃뿜기', type: '불꽃', category: '특수', power: 40 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90 },
      { name: '할퀴기', type: '노말', category: '물리', power: 40 },
      { name: '도깨비불', type: '불꽃', category: '변화', power: null },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65 },
    ],
    learnableTMs: ['tm11', 'tm17', 'tm26', 'tm35', 'tm44', 'tm50', 'tm61', 'tm87', 'tm90'],
    evolveAt: 16, evolveTo: 'charmeleon',
  },
  charmeleon: {
    id: 'charmeleon', dexNum: 5, speciesName: '리자드',
    types: ['불꽃'],
    baseStats: { HP: 58, 공격: 64, 방어: 58, 특수공격: 80, 특수방어: 65, 스피드: 80 },
    abilities: [
      { name: '맹화', desc: 'HP가 1/3 이하일 때 불꽃 기술 위력 1.5배' },
      { name: '태양의힘', desc: '맑은 날씨에 특수공격 1.5배, HP 소모' },
    ],
    baseMoves: [
      { name: '화염방사', type: '불꽃', category: '특수', power: 90 },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65 },
      { name: '할퀴기', type: '노말', category: '물리', power: 40 },
      { name: '도깨비불', type: '불꽃', category: '변화', power: null },
      { name: '악의파동', type: '악', category: '특수', power: 80 },
    ],
    learnableTMs: ['tm11', 'tm17', 'tm26', 'tm35', 'tm44', 'tm50', 'tm61', 'tm65', 'tm87', 'tm90'],
    evolveAt: 36, evolveTo: 'charizard',
  },
  charizard: {
    id: 'charizard', dexNum: 6, speciesName: '리자몽',
    types: ['불꽃', '비행'],
    baseStats: { HP: 78, 공격: 84, 방어: 78, 특수공격: 109, 특수방어: 85, 스피드: 100 },
    abilities: [
      { name: '맹화', desc: 'HP가 1/3 이하일 때 불꽃 기술 위력 1.5배' },
      { name: '태양의힘', desc: '맑은 날씨에 특수공격 1.5배, HP 소모' },
    ],
    baseMoves: [
      { name: '화염방사', type: '불꽃', category: '특수', power: 90 },
      { name: '에어슬래시', type: '비행', category: '특수', power: 75 },
      { name: '악의파동', type: '악', category: '특수', power: 80 },
      { name: '지진', type: '땅', category: '물리', power: 100 },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65 },
      { name: '폭발', type: '노말', category: '물리', power: 250 },
    ],
    learnableTMs: ['tm11', 'tm13', 'tm15', 'tm17', 'tm26', 'tm35', 'tm44', 'tm50', 'tm52', 'tm61', 'tm65', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 꼬부기 계열 ───────────────────────────────────────────────────
  squirtle: {
    id: 'squirtle', dexNum: 7, speciesName: '꼬부기',
    types: ['물'],
    baseStats: { HP: 44, 공격: 48, 방어: 65, 특수공격: 50, 특수방어: 64, 스피드: 43 },
    abilities: [
      { name: '급류', desc: 'HP가 1/3 이하일 때 물 기술 위력 1.5배' },
      { name: '빗속준비', desc: '비 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '물대포', type: '물', category: '특수', power: 40 },
      { name: '물뿜기', type: '물', category: '특수', power: 65 },
      { name: '방어', type: '노말', category: '변화', power: null },
      { name: '조개껍질방어', type: '물', category: '변화', power: null },
      { name: '파도타기', type: '물', category: '특수', power: 90 },
    ],
    learnableTMs: ['tm13', 'tm17', 'tm18', 'tm26', 'tm44', 'tm80', 'tm87', 'tm90'],
    evolveAt: 16, evolveTo: 'wartortle',
  },
  wartortle: {
    id: 'wartortle', dexNum: 8, speciesName: '어니부기',
    types: ['물'],
    baseStats: { HP: 59, 공격: 63, 방어: 80, 특수공격: 65, 특수방어: 80, 스피드: 58 },
    abilities: [
      { name: '급류', desc: 'HP가 1/3 이하일 때 물 기술 위력 1.5배' },
      { name: '빗속준비', desc: '비 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '파도타기', type: '물', category: '특수', power: 90 },
      { name: '물뿜기', type: '물', category: '특수', power: 65 },
      { name: '얼음빔', type: '얼음', category: '특수', power: 90 },
      { name: '방어', type: '노말', category: '변화', power: null },
      { name: '조개껍질방어', type: '물', category: '변화', power: null },
    ],
    learnableTMs: ['tm13', 'tm14', 'tm17', 'tm18', 'tm26', 'tm44', 'tm80', 'tm87', 'tm90', 'tm91'],
    evolveAt: 36, evolveTo: 'blastoise',
  },
  blastoise: {
    id: 'blastoise', dexNum: 9, speciesName: '거북왕',
    types: ['물'],
    baseStats: { HP: 79, 공격: 83, 방어: 100, 특수공격: 85, 특수방어: 105, 스피드: 78 },
    abilities: [
      { name: '급류', desc: 'HP가 1/3 이하일 때 물 기술 위력 1.5배' },
      { name: '빗속준비', desc: '비 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '파도타기', type: '물', category: '특수', power: 90 },
      { name: '냉동빔', type: '얼음', category: '특수', power: 90 },
      { name: '눈보라', type: '얼음', category: '특수', power: 110 },
      { name: '지진', type: '땅', category: '물리', power: 100 },
      { name: '조개껍질방어', type: '물', category: '변화', power: null },
      { name: '폭포오르기', type: '물', category: '물리', power: 80 },
    ],
    learnableTMs: ['tm13', 'tm14', 'tm15', 'tm17', 'tm18', 'tm26', 'tm44', 'tm80', 'tm87', 'tm90', 'tm91'],
    evolveAt: null, evolveTo: null,
  },

  // ── 구구 계열 ─────────────────────────────────────────────────────
  pidgey: {
    id: 'pidgey', dexNum: 16, speciesName: '구구',
    types: ['노말', '비행'],
    baseStats: { HP: 40, 공격: 45, 방어: 40, 특수공격: 35, 특수방어: 35, 스피드: 56 },
    abilities: [
      { name: '예리한눈', desc: '명중률이 하락하지 않음, 상대의 회피율 무시' },
      { name: '직진주', desc: '상대의 보호기를 무시하고 공격' },
    ],
    baseMoves: [
      { name: '쪼기', type: '노말', category: '물리', power: 35 },
      { name: '모래공격', type: '노말', category: '변화', power: null },
      { name: '회오리', type: '비행', category: '특수', power: 40 },
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '날개치기', type: '비행', category: '물리', power: 60 },
    ],
    learnableTMs: ['tm15', 'tm17', 'tm37', 'tm44', 'tm87', 'tm90'],
    evolveAt: 18, evolveTo: 'pidgeotto',
  },
  pidgeotto: {
    id: 'pidgeotto', dexNum: 17, speciesName: '피죤',
    types: ['노말', '비행'],
    baseStats: { HP: 63, 공격: 60, 방어: 55, 특수공격: 50, 특수방어: 50, 스피드: 71 },
    abilities: [
      { name: '예리한눈', desc: '명중률이 하락하지 않음, 상대의 회피율 무시' },
      { name: '직진주', desc: '상대의 보호기를 무시하고 공격' },
    ],
    baseMoves: [
      { name: '날개치기', type: '비행', category: '물리', power: 60 },
      { name: '에어슬래시', type: '비행', category: '특수', power: 75 },
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '회오리', type: '비행', category: '특수', power: 40 },
      { name: '모래공격', type: '노말', category: '변화', power: null },
    ],
    learnableTMs: ['tm15', 'tm17', 'tm37', 'tm44', 'tm87', 'tm90'],
    evolveAt: 36, evolveTo: 'pidgeot',
  },
  pidgeot: {
    id: 'pidgeot', dexNum: 18, speciesName: '피죤투',
    types: ['노말', '비행'],
    baseStats: { HP: 83, 공격: 80, 방어: 75, 특수공격: 70, 특수방어: 70, 스피드: 101 },
    abilities: [
      { name: '예리한눈', desc: '명중률이 하락하지 않음, 상대의 회피율 무시' },
      { name: '직진주', desc: '상대의 보호기를 무시하고 공격' },
    ],
    baseMoves: [
      { name: '에어슬래시', type: '비행', category: '특수', power: 75 },
      { name: '날개치기', type: '비행', category: '물리', power: 60 },
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '회오리', type: '비행', category: '특수', power: 40 },
      { name: '자화자찬', type: '노말', category: '변화', power: null },
    ],
    learnableTMs: ['tm15', 'tm17', 'tm37', 'tm44', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 피카츄 계열 ───────────────────────────────────────────────────
  pikachu: {
    id: 'pikachu', dexNum: 25, speciesName: '피카츄',
    types: ['전기'],
    baseStats: { HP: 35, 공격: 55, 방어: 40, 특수공격: 50, 특수방어: 50, 스피드: 90 },
    abilities: [
      { name: '정전기', desc: '접촉한 상대를 30% 확률로 마비' },
      { name: '피뢰침', desc: '전기 기술을 흡수해 특수공격 1단계 상승' },
    ],
    baseMoves: [
      { name: '전기충격', type: '전기', category: '특수', power: 40 },
      { name: '10만볼트', type: '전기', category: '특수', power: 90 },
      { name: '번개', type: '전기', category: '특수', power: 110 },
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '아이언테일', type: '강철', category: '물리', power: 100 },
    ],
    learnableTMs: ['tm17', 'tm24', 'tm25', 'tm44', 'tm87', 'tm90'],
    evolveAt: 36, evolveTo: 'raichu',
  },
  raichu: {
    id: 'raichu', dexNum: 26, speciesName: '라이츄',
    types: ['전기'],
    baseStats: { HP: 60, 공격: 90, 방어: 55, 특수공격: 90, 특수방어: 80, 스피드: 110 },
    abilities: [
      { name: '정전기', desc: '접촉한 상대를 30% 확률로 마비' },
      { name: '피뢰침', desc: '전기 기술을 흡수해 특수공격 1단계 상승' },
    ],
    baseMoves: [
      { name: '10만볼트', type: '전기', category: '특수', power: 90 },
      { name: '번개', type: '전기', category: '특수', power: 110 },
      { name: '아이언테일', type: '강철', category: '물리', power: 100 },
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '지진', type: '땅', category: '물리', power: 100 },
      { name: '기합구슬', type: '격투', category: '특수', power: 120 },
    ],
    learnableTMs: ['tm17', 'tm24', 'tm25', 'tm26', 'tm44', 'tm52', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 고오스 계열 ───────────────────────────────────────────────────
  gastly: {
    id: 'gastly', dexNum: 92, speciesName: '고오스',
    types: ['고스트', '독'],
    baseStats: { HP: 30, 공격: 35, 방어: 30, 특수공격: 100, 특수방어: 35, 스피드: 80 },
    abilities: [
      { name: '부유', desc: '땅 타입 기술에 면역' },
    ],
    baseMoves: [
      { name: '섀도볼', type: '고스트', category: '특수', power: 80 },
      { name: '최면술', type: '에스퍼', category: '변화', power: null },
      { name: '저주', type: '고스트', category: '변화', power: null },
      { name: '독독', type: '독', category: '변화', power: null },
      { name: '나이트헤드', type: '고스트', category: '특수', power: null },
    ],
    learnableTMs: ['tm06', 'tm17', 'tm29', 'tm30', 'tm36', 'tm44', 'tm65', 'tm85', 'tm87', 'tm90'],
    evolveAt: 25, evolveTo: 'haunter',
  },
  haunter: {
    id: 'haunter', dexNum: 93, speciesName: '고우스트',
    types: ['고스트', '독'],
    baseStats: { HP: 45, 공격: 50, 방어: 45, 특수공격: 115, 특수방어: 55, 스피드: 95 },
    abilities: [
      { name: '부유', desc: '땅 타입 기술에 면역' },
    ],
    baseMoves: [
      { name: '섀도볼', type: '고스트', category: '특수', power: 80 },
      { name: '최면술', type: '에스퍼', category: '변화', power: null },
      { name: '꿈먹기', type: '에스퍼', category: '특수', power: 100 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90 },
      { name: '독독', type: '독', category: '변화', power: null },
    ],
    learnableTMs: ['tm06', 'tm17', 'tm29', 'tm30', 'tm36', 'tm44', 'tm53', 'tm65', 'tm85', 'tm87', 'tm90'],
    evolveAt: 36, evolveTo: 'gengar',
  },
  gengar: {
    id: 'gengar', dexNum: 94, speciesName: '겐가르',
    types: ['고스트', '독'],
    baseStats: { HP: 60, 공격: 65, 방어: 60, 특수공격: 130, 특수방어: 75, 스피드: 110 },
    abilities: [
      { name: '저주받은몸', desc: '피격 시 30% 확률로 상대 기술 봉인' },
      { name: '부유', desc: '땅 타입 기술에 면역' },
    ],
    baseMoves: [
      { name: '섀도볼', type: '고스트', category: '특수', power: 80 },
      { name: '헥스', type: '고스트', category: '특수', power: 65 },
      { name: '악의파동', type: '악', category: '특수', power: 80 },
      { name: '기합구슬', type: '격투', category: '특수', power: 120 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90 },
      { name: '번개', type: '전기', category: '특수', power: 110 },
      { name: '저주', type: '고스트', category: '변화', power: null },
      { name: '최면술', type: '에스퍼', category: '변화', power: null },
      { name: '통증나누기', type: '노말', category: '변화', power: null },
      { name: '독독', type: '독', category: '변화', power: null },
    ],
    learnableTMs: ['tm06', 'tm11', 'tm13', 'tm14', 'tm17', 'tm18', 'tm24', 'tm25', 'tm26', 'tm29', 'tm30', 'tm35', 'tm36', 'tm44', 'tm52', 'tm53', 'tm61', 'tm65', 'tm85', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 이브이 ────────────────────────────────────────────────────────
  eevee: {
    id: 'eevee', dexNum: 133, speciesName: '이브이',
    types: ['노말'],
    baseStats: { HP: 55, 공격: 55, 방어: 50, 특수공격: 45, 특수방어: 65, 스피드: 55 },
    abilities: [
      { name: '적응력', desc: '자신과 같은 타입의 기술 위력 2배' },
      { name: '도주', desc: '야생 배틀에서 반드시 도망칠 수 있음' },
    ],
    baseMoves: [
      { name: '퀵어택', type: '노말', category: '물리', power: 40 },
      { name: '베어물기', type: '악', category: '물리', power: 60 },
      { name: '돌진', type: '노말', category: '물리', power: 35 },
      { name: '귀여운부탁', type: '노말', category: '변화', power: null },
      { name: '보디슬램', type: '노말', category: '물리', power: 85 },
    ],
    learnableTMs: ['tm15', 'tm17', 'tm44', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 잠만보 ────────────────────────────────────────────────────────
  snorlax: {
    id: 'snorlax', dexNum: 143, speciesName: '잠만보',
    types: ['노말'],
    baseStats: { HP: 160, 공격: 110, 방어: 65, 특수공격: 65, 특수방어: 110, 스피드: 30 },
    abilities: [
      { name: '면역', desc: '독에 걸리지 않음' },
      { name: '두꺼운지방', desc: '얼음·불꽃 타입 기술의 피해 반감' },
    ],
    baseMoves: [
      { name: '보디슬램', type: '노말', category: '물리', power: 85 },
      { name: '잠자기', type: '에스퍼', category: '변화', power: null },
      { name: '냉동빔', type: '얼음', category: '특수', power: 90 },
      { name: '지진', type: '땅', category: '물리', power: 100 },
      { name: '기가임팩트', type: '노말', category: '물리', power: 150 },
      { name: '고함치기', type: '노말', category: '변화', power: null },
    ],
    learnableTMs: ['tm13', 'tm14', 'tm15', 'tm17', 'tm26', 'tm44', 'tm50', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
  },

  // ── 뮤 ───────────────────────────────────────────────────────────
  mew: {
    id: 'mew', dexNum: 151, speciesName: '뮤',
    types: ['에스퍼'],
    baseStats: { HP: 100, 공격: 100, 방어: 100, 특수공격: 100, 특수방어: 100, 스피드: 100 },
    abilities: [
      { name: '동조', desc: '상대의 특성을 복사해 사용' },
    ],
    baseMoves: [
      { name: '사이코키네시스', type: '에스퍼', category: '특수', power: 90 },
      { name: '번개', type: '전기', category: '특수', power: 110 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90 },
      { name: '냉동빔', type: '얼음', category: '특수', power: 90 },
      { name: '지진', type: '땅', category: '물리', power: 100 },
      { name: '그림자분신', type: '노말', category: '변화', power: null },
    ],
    learnableTMs: ['tm01', 'tm06', 'tm11', 'tm13', 'tm14', 'tm15', 'tm17', 'tm18', 'tm24', 'tm25', 'tm26', 'tm29', 'tm30', 'tm35', 'tm36', 'tm37', 'tm44', 'tm50', 'tm52', 'tm53', 'tm61', 'tm65', 'tm71', 'tm80', 'tm85', 'tm87', 'tm90', 'tm91', 'tm94'],
    evolveAt: null, evolveTo: null,
  },
}

export function getPokemon(id) {
  return id ? (POKEMON_DB[id] ?? null) : null
}

// Resolve a move name to full move data.
// Searches species baseMoves first, then TM items list.
export function resolveMove(moveName, pokemon, shopItems) {
  const base = pokemon.baseMoves.find(m => m.name === moveName)
  if (base) return base
  const tm = shopItems.find(i => i.category === 'tm' && i.moveName === moveName)
  if (tm) return { name: tm.moveName, type: tm.moveType, category: tm.moveCategory, power: tm.movePower }
  return null
}
