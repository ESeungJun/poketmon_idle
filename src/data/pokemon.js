// Pokemon species registry
// Sprite: PokeAPI Generation I (Red/Blue transparent)
export function spriteUrl(dexNum) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/${dexNum}.png`
}

// XP formula: level n requires n² × 4 total points earned
export function expForLevel(n) {
  return n * n * 4
}

// Current level from total points earned (min 1)
export function calcLevel(totalPointsEarned) {
  return Math.max(1, Math.floor(Math.sqrt((totalPointsEarned || 0) / 4)))
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
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 3 },
      { name: '씨뿌리기', type: '풀', category: '변화', power: null, learnAt: 7 },
      { name: '덩굴채찍', type: '풀', category: '물리', power: 45, learnAt: 9 },
      { name: '독가루', type: '독', category: '변화', power: null, learnAt: 13 },
      { name: '수면가루', type: '풀', category: '변화', power: null, learnAt: 13 },
      { name: '돌진', type: '노말', category: '물리', power: 90, learnAt: 15 },
      { name: '잎날가르기', type: '풀', category: '물리', power: 55, learnAt: 19 },
      { name: '달콤한향기', type: '노말', category: '변화', power: null, learnAt: 21 },
      { name: '성장', type: '노말', category: '변화', power: null, learnAt: 25 },
      { name: '이판사판태클', type: '노말', category: '물리', power: 120, learnAt: 27 },
      { name: '고민씨', type: '풀', category: '변화', power: null, learnAt: 31 },
      { name: '광합성', type: '풀', category: '변화', power: null, learnAt: 33 },
      { name: '씨폭탄', type: '풀', category: '물리', power: 80, learnAt: 37 },
    ],
    learnableTMs: ['tm06', 'tm11', 'tm17', 'tm18', 'tm44', 'tm53', 'tm87', 'tm90'],
    evolveAt: 16, evolveTo: 'ivysaur',
  },
  ivysaur: {
    id: 'ivysaur', dexNum: 2, speciesName: '이상해풀',
    types: ['풀', '독'],
    baseStats: { HP: 60, 공격: 60, 방어: 62, 특수공격: 80, 특수방어: 80, 스피드: 60 },
    abilities: [
      { name: '심록', desc: 'HP가 1/3 이하일 때 풀 기술 위력 1.5배' },
      { name: '엽록소', desc: '맑은 날씨에 스피드 2배' },
    ],
    baseMoves: [
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '씨뿌리기', type: '풀', category: '변화', power: null, learnAt: 1 },
      { name: '덩굴채찍', type: '풀', category: '물리', power: 45, learnAt: 9 },
      { name: '독가루', type: '독', category: '변화', power: null, learnAt: 13 },
      { name: '수면가루', type: '풀', category: '변화', power: null, learnAt: 13 },
      { name: '돌진', type: '노말', category: '물리', power: 90, learnAt: 15 },
      { name: '잎날가르기', type: '풀', category: '물리', power: 55, learnAt: 20 },
      { name: '달콤한향기', type: '노말', category: '변화', power: null, learnAt: 23 },
      { name: '성장', type: '노말', category: '변화', power: null, learnAt: 28 },
      { name: '이판사판태클', type: '노말', category: '물리', power: 120, learnAt: 31 },
      { name: '고민씨', type: '풀', category: '변화', power: null, learnAt: 36 },
      { name: '광합성', type: '풀', category: '변화', power: null, learnAt: 39 },
      { name: '솔라빔', type: '풀', category: '특수', power: 120, learnAt: 44 },
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
      { name: '꽃잎댄스', type: '풀', category: '특수', power: 120, learnAt: 1 },
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '씨뿌리기', type: '풀', category: '변화', power: null, learnAt: 1 },
      { name: '덩굴채찍', type: '풀', category: '물리', power: 45, learnAt: 1 },
      { name: '독가루', type: '독', category: '변화', power: null, learnAt: 13 },
      { name: '수면가루', type: '풀', category: '변화', power: null, learnAt: 13 },
      { name: '돌진', type: '노말', category: '물리', power: 90, learnAt: 15 },
      { name: '잎날가르기', type: '풀', category: '물리', power: 55, learnAt: 20 },
      { name: '달콤한향기', type: '노말', category: '변화', power: null, learnAt: 23 },
      { name: '성장', type: '노말', category: '변화', power: null, learnAt: 28 },
      { name: '이판사판태클', type: '노말', category: '물리', power: 120, learnAt: 31 },
      { name: '고민씨', type: '풀', category: '변화', power: null, learnAt: 39 },
      { name: '광합성', type: '풀', category: '변화', power: null, learnAt: 45 },
      { name: '꽃보라', type: '풀', category: '물리', power: 90, learnAt: 50 },
      { name: '솔라빔', type: '풀', category: '특수', power: 120, learnAt: 53 },
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
      { name: '할퀴기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '불꽃세례', type: '불꽃', category: '특수', power: 40, learnAt: 7 },
      { name: '연막', type: '노말', category: '변화', power: null, learnAt: 10 },
      { name: '용의분노', type: '드래곤', category: '특수', power: null, learnAt: 16 },
      { name: '겁나는얼굴', type: '노말', category: '변화', power: null, learnAt: 19 },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65, learnAt: 25 },
      { name: '불꽃튀기기', type: '불꽃', category: '특수', power: 70, learnAt: 28 },
      { name: '베어가르기', type: '노말', category: '물리', power: 70, learnAt: 34 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90, learnAt: 37 },
      { name: '회오리불꽃', type: '불꽃', category: '특수', power: 35, learnAt: 43 },
      { name: '연옥', type: '불꽃', category: '특수', power: 100, learnAt: 46 },
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
      { name: '할퀴기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '불꽃세례', type: '불꽃', category: '특수', power: 40, learnAt: 1 },
      { name: '연막', type: '노말', category: '변화', power: null, learnAt: 10 },
      { name: '용의분노', type: '드래곤', category: '특수', power: null, learnAt: 17 },
      { name: '겁나는얼굴', type: '노말', category: '변화', power: null, learnAt: 21 },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65, learnAt: 28 },
      { name: '불꽃튀기기', type: '불꽃', category: '특수', power: 70, learnAt: 32 },
      { name: '베어가르기', type: '노말', category: '물리', power: 70, learnAt: 39 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90, learnAt: 43 },
      { name: '회오리불꽃', type: '불꽃', category: '특수', power: 35, learnAt: 50 },
      { name: '연옥', type: '불꽃', category: '특수', power: 100, learnAt: 54 },
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
      { name: '날개치기', type: '비행', category: '물리', power: 60, learnAt: 1 },
      { name: '할퀴기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '울음소리', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '불꽃세례', type: '불꽃', category: '특수', power: 40, learnAt: 7 },
      { name: '연막', type: '노말', category: '변화', power: null, learnAt: 10 },
      { name: '용의분노', type: '드래곤', category: '특수', power: null, learnAt: 17 },
      { name: '겁나는얼굴', type: '노말', category: '변화', power: null, learnAt: 21 },
      { name: '불꽃엄니', type: '불꽃', category: '물리', power: 65, learnAt: 28 },
      { name: '불꽃튀기기', type: '불꽃', category: '특수', power: 70, learnAt: 32 },
      { name: '베어가르기', type: '노말', category: '물리', power: 70, learnAt: 41 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90, learnAt: 47 },
      { name: '회오리불꽃', type: '불꽃', category: '특수', power: 35, learnAt: 56 },
      { name: '연옥', type: '불꽃', category: '특수', power: 100, learnAt: 62 },
      { name: '열풍', type: '불꽃', category: '특수', power: 95, learnAt: 71 },
      { name: '플레어드라이브', type: '불꽃', category: '물리', power: 120, learnAt: 77 },
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
      { name: '빗속준비', desc: '비 날씨에 매 턴 HP 1/16 회복' },
    ],
    baseMoves: [
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '꼬리흔들기', type: '노말', category: '변화', power: null, learnAt: 4 },
      { name: '물대포', type: '물', category: '특수', power: 40, learnAt: 7 },
      { name: '껍질에숨기', type: '물', category: '변화', power: null, learnAt: 10 },
      { name: '거품', type: '물', category: '특수', power: 40, learnAt: 13 },
      { name: '물기', type: '악', category: '물리', power: 60, learnAt: 16 },
      { name: '고속스핀', type: '노말', category: '물리', power: 50, learnAt: 19 },
      { name: '보호', type: '노말', category: '변화', power: null, learnAt: 22 },
      { name: '물의파동', type: '물', category: '특수', power: 60, learnAt: 25 },
      { name: '아쿠아테일', type: '물', category: '물리', power: 90, learnAt: 28 },
      { name: '로케트박치기', type: '노말', category: '물리', power: 130, learnAt: 31 },
      { name: '철벽', type: '강철', category: '변화', power: null, learnAt: 34 },
      { name: '비바라기', type: '물', category: '변화', power: null, learnAt: 37 },
      { name: '하이드로펌프', type: '물', category: '특수', power: 110, learnAt: 40 },
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
      { name: '빗속준비', desc: '비 날씨에 매 턴 HP 1/16 회복' },
    ],
    baseMoves: [
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '꼬리흔들기', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '물대포', type: '물', category: '특수', power: 40, learnAt: 1 },
      { name: '껍질에숨기', type: '물', category: '변화', power: null, learnAt: 10 },
      { name: '거품', type: '물', category: '특수', power: 40, learnAt: 13 },
      { name: '물기', type: '악', category: '물리', power: 60, learnAt: 17 },
      { name: '고속스핀', type: '노말', category: '물리', power: 50, learnAt: 21 },
      { name: '보호', type: '노말', category: '변화', power: null, learnAt: 25 },
      { name: '물의파동', type: '물', category: '특수', power: 60, learnAt: 29 },
      { name: '아쿠아테일', type: '물', category: '물리', power: 90, learnAt: 33 },
      { name: '로케트박치기', type: '노말', category: '물리', power: 130, learnAt: 37 },
      { name: '철벽', type: '강철', category: '변화', power: null, learnAt: 41 },
      { name: '비바라기', type: '물', category: '변화', power: null, learnAt: 45 },
      { name: '하이드로펌프', type: '물', category: '특수', power: 110, learnAt: 49 },
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
      { name: '빗속준비', desc: '비 날씨에 매 턴 HP 1/16 회복' },
    ],
    baseMoves: [
      { name: '러스터캐논', type: '강철', category: '특수', power: 80, learnAt: 1 },
      { name: '몸통박치기', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '꼬리흔들기', type: '노말', category: '변화', power: null, learnAt: 1 },
      { name: '물대포', type: '물', category: '특수', power: 40, learnAt: 1 },
      { name: '껍질에숨기', type: '물', category: '변화', power: null, learnAt: 1 },
      { name: '거품', type: '물', category: '특수', power: 40, learnAt: 13 },
      { name: '물기', type: '악', category: '물리', power: 60, learnAt: 17 },
      { name: '고속스핀', type: '노말', category: '물리', power: 50, learnAt: 21 },
      { name: '보호', type: '노말', category: '변화', power: null, learnAt: 25 },
      { name: '물의파동', type: '물', category: '특수', power: 60, learnAt: 29 },
      { name: '아쿠아테일', type: '물', category: '물리', power: 90, learnAt: 33 },
      { name: '로케트박치기', type: '노말', category: '물리', power: 130, learnAt: 40 },
      { name: '철벽', type: '강철', category: '변화', power: null, learnAt: 47 },
      { name: '비바라기', type: '물', category: '변화', power: null, learnAt: 54 },
      { name: '하이드로펌프', type: '물', category: '특수', power: 110, learnAt: 60 },
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
      { name: '직진주', desc: '방어 스탯이 하락하지 않음' },
    ],
    baseMoves: [
      { name: '쪼기', type: '노말', category: '물리', power: 35, learnAt: 1 },
      { name: '모래뿌리기', type: '땅', category: '변화', power: null, learnAt: 5 },
      { name: '바람일으키기', type: '비행', category: '물리', power: 40, learnAt: 9 },
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 13 },
      { name: '날개치기', type: '비행', category: '물리', power: 60, learnAt: 19 },
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
      { name: '직진주', desc: '방어 스탯이 하락하지 않음' },
    ],
    baseMoves: [
      { name: '날개치기', type: '비행', category: '물리', power: 60, learnAt: 1 },
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 21 },
      { name: '바람일으키기', type: '비행', category: '특수', power: 40, learnAt: 28 },
      { name: '에어슬래시', type: '비행', category: '특수', power: 75, learnAt: 36 },
      { name: '모래뿌리기', type: '노말', category: '변화', power: null, learnAt: 44 },
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
      { name: '직진주', desc: '방어 스탯이 하락하지 않음' },
    ],
    baseMoves: [
      { name: '에어슬래시', type: '비행', category: '특수', power: 75, learnAt: 1 },
      { name: '날개치기', type: '비행', category: '물리', power: 60, learnAt: 1 },
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 38 },
      { name: '바람일으키기', type: '비행', category: '특수', power: 40, learnAt: 45 },
      { name: '뽐내기', type: '노말', category: '변화', power: null, learnAt: 55 },
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
      { name: '전기쇼크', type: '전기', category: '특수', power: 40, learnAt: 1 },
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 13 },
      { name: '10만볼트', type: '전기', category: '특수', power: 90, learnAt: 21 },
      { name: '아이언테일', type: '강철', category: '물리', power: 100, learnAt: 29 },
      { name: '번개', type: '전기', category: '특수', power: 110, learnAt: 37 },
    ],
    learnableTMs: ['tm17', 'tm24', 'tm25', 'tm44', 'tm87', 'tm90'],
    evolveAt: null, evolveTo: null,
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
      { name: '10만볼트', type: '전기', category: '특수', power: 90, learnAt: 1 },
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '아이언테일', type: '강철', category: '물리', power: 100, learnAt: 38 },
      { name: '번개', type: '전기', category: '특수', power: 110, learnAt: 42 },
      { name: '지진', type: '땅', category: '물리', power: 100, learnAt: 50 },
      { name: '기합구슬', type: '격투', category: '특수', power: 120, learnAt: 58 },
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
      { name: '나이트헤드', type: '고스트', category: '특수', power: null, learnAt: 1 },
      { name: '최면술', type: '에스퍼', category: '변화', power: null, learnAt: 9 },
      { name: '맹독', type: '독', category: '변화', power: null, learnAt: 15 },
      { name: '저주', type: '고스트', category: '변화', power: null, learnAt: 20 },
      { name: '섀도볼', type: '고스트', category: '특수', power: 80, learnAt: 27 },
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
      { name: '섀도볼', type: '고스트', category: '특수', power: 80, learnAt: 1 },
      { name: '최면술', type: '에스퍼', category: '변화', power: null, learnAt: 1 },
      { name: '맹독', type: '독', category: '변화', power: null, learnAt: 27 },
      { name: '꿈먹기', type: '에스퍼', category: '특수', power: 100, learnAt: 35 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90, learnAt: 45 },
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
      { name: '섀도볼', type: '고스트', category: '특수', power: 80, learnAt: 1 },
      { name: '최면술', type: '에스퍼', category: '변화', power: null, learnAt: 1 },
      { name: '병상첨병', type: '고스트', category: '특수', power: 65, learnAt: 1 },
      { name: '맹독', type: '독', category: '변화', power: null, learnAt: 38 },
      { name: '악의파동', type: '악', category: '특수', power: 80, learnAt: 42 },
      { name: '에너지볼', type: '풀', category: '특수', power: 90, learnAt: 48 },
      { name: '기합구슬', type: '격투', category: '특수', power: 120, learnAt: 54 },
      { name: '번개', type: '전기', category: '특수', power: 110, learnAt: 60 },
      { name: '저주', type: '고스트', category: '변화', power: null, learnAt: 65 },
      { name: '아픔나누기', type: '노말', category: '변화', power: null, learnAt: 70 },
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
      { name: '전광석화', type: '노말', category: '물리', power: 40, learnAt: 1 },
      { name: '돌진', type: '노말', category: '물리', power: 35, learnAt: 1 },
      { name: '물기', type: '악', category: '물리', power: 60, learnAt: 9 },
      { name: '애교부리기', type: '노말', category: '변화', power: null, learnAt: 17 },
      { name: '누르기', type: '노말', category: '물리', power: 85, learnAt: 29 },
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
      { name: '누르기', type: '노말', category: '물리', power: 85, learnAt: 1 },
      { name: '잠자기', type: '에스퍼', category: '변화', power: null, learnAt: 1 },
      { name: '울부짖기', type: '노말', category: '변화', power: null, learnAt: 17 },
      { name: '냉동빔', type: '얼음', category: '특수', power: 90, learnAt: 25 },
      { name: '지진', type: '땅', category: '물리', power: 100, learnAt: 33 },
      { name: '기가임팩트', type: '노말', category: '물리', power: 150, learnAt: 45 },
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
      { name: '사이코키네시스', type: '에스퍼', category: '특수', power: 90, learnAt: 1 },
      { name: '그림자분신', type: '노말', category: '변화', power: null, learnAt: 10 },
      { name: '화염방사', type: '불꽃', category: '특수', power: 90, learnAt: 20 },
      { name: '냉동빔', type: '얼음', category: '특수', power: 90, learnAt: 30 },
      { name: '번개', type: '전기', category: '특수', power: 110, learnAt: 40 },
      { name: '지진', type: '땅', category: '물리', power: 100, learnAt: 50 },
    ],
    learnableTMs: ['tm01', 'tm06', 'tm11', 'tm13', 'tm14', 'tm15', 'tm17', 'tm18', 'tm24', 'tm25', 'tm26', 'tm29', 'tm30', 'tm35', 'tm36', 'tm37', 'tm44', 'tm50', 'tm52', 'tm53', 'tm61', 'tm65', 'tm71', 'tm80', 'tm85', 'tm87', 'tm90', 'tm91', 'tm94'],
    evolveAt: null, evolveTo: null,
  },
}

export function getPokemon(id) {
  return id ? (POKEMON_DB[id] ?? null) : null
}

// Returns moves learnable at or below the given level, sorted by learnAt
export function getMovesUpToLevel(pokemon, level) {
  return pokemon.baseMoves
    .filter(m => (m.learnAt ?? 1) <= level)
    .sort((a, b) => (a.learnAt ?? 1) - (b.learnAt ?? 1))
}

// Returns moves not yet learnable (learnAt > level)
export function getUpcomingMoves(pokemon, level) {
  return pokemon.baseMoves
    .filter(m => (m.learnAt ?? 1) > level)
    .sort((a, b) => (a.learnAt ?? 1) - (b.learnAt ?? 1))
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
