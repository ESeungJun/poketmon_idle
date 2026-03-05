import { useEffect, useState } from 'react'
import useStore from '../../store/useStore'
import { SHOP_ITEMS } from '../Shop/items'
import { getPokemon, resolveMove, calcLevel, expForLevel, spriteUrl } from '../../data/pokemon'

const STAT_KEYS = ['HP', '공격', '방어', '특수공격', '특수방어', '스피드']
const STAT_COLOR = {
  HP: '#FF5959', 공격: '#F5AC78', 방어: '#FAE078',
  특수공격: '#9DB7F5', 특수방어: '#A7DB8D', 스피드: '#FA92B2',
}
const BAR_MAX = 220

const NATURES = [
  { name: '개구쟁이', up: null, down: null },
  { name: '외로움',   up: '공격',    down: '방어' },
  { name: '용감한',   up: '공격',    down: '스피드' },
  { name: '개구진',   up: '공격',    down: '특수공격' },
  { name: '장난꾸러기', up: '공격',  down: '특수방어' },
  { name: '대담한',   up: '방어',    down: '공격' },
  { name: '온순한',   up: null,      down: null },
  { name: '느긋한',   up: '방어',    down: '스피드' },
  { name: '장난기',   up: '방어',    down: '특수공격' },
  { name: '촐랑대는', up: '방어',    down: '특수방어' },
  { name: '성급한',   up: '스피드',  down: '공격' },
  { name: '서두른',   up: '스피드',  down: '방어' },
  { name: '진지한',   up: null,      down: null },
  { name: '기쁜',     up: '스피드',  down: '특수공격' },
  { name: '덜렁대는', up: '스피드',  down: '특수방어' },
  { name: '냉정한',   up: '특수공격', down: '공격' },
  { name: '온화한',   up: '특수공격', down: '방어' },
  { name: '조용한',   up: '특수공격', down: '스피드' },
  { name: '솔직한',   up: null,      down: null },
  { name: '건방진',   up: '특수공격', down: '특수방어' },
  { name: '차분한',   up: '특수방어', down: '공격' },
  { name: '온후한',   up: '특수방어', down: '방어' },
  { name: '신중한',   up: '특수방어', down: '스피드' },
  { name: '주의깊은', up: '특수방어', down: '특수공격' },
  { name: '이상한',   up: null,      down: null },
]

const TYPE_COLOR = {
  고스트: '#735797', 악: '#5C5365', 격투: '#C03028', 풀: '#3a8a30',
  전기: '#C8A800', 에스퍼: '#cc3366', 노말: '#6a6a50', 독: '#A040A0',
  얼음: '#4a9898', 불꽃: '#c05010', 땅: '#b08828', 물: '#3868c8',
  바위: '#887840', 강철: '#607890', 비행: '#6890f0',
}

function calcStat(base, iv, ev, key, nature) {
  const evBonus = Math.floor((ev || 0) / 4)
  if (key === 'HP') return Math.floor((2 * base + iv + evBonus) * 50 / 100 + 60)
  let v = Math.floor((2 * base + iv + evBonus) * 50 / 100 + 5)
  if (nature.up === key)   v = Math.floor(v * 1.1)
  if (nature.down === key) v = Math.floor(v * 0.9)
  return v
}

function generate(pokemon) {
  const ivs = {}
  STAT_KEYS.forEach(k => { ivs[k] = Math.floor(Math.random() * 32) })
  const nature   = NATURES[Math.floor(Math.random() * NATURES.length)]
  const movePool = pokemon.baseMoves.map(m => m.name)
  const moves    = [...movePool].sort(() => Math.random() - 0.5).slice(0, 4)
  const ability  = pokemon.abilities[Math.floor(Math.random() * pokemon.abilities.length)]
  return { speciesId: pokemon.id, ivs, natureName: nature.name, moves, learnedPool: [...moves], abilityName: ability.name }
}

export default function PokemonStats() {
  const petStats          = useStore(s => s.petStats)
  const setPetStats       = useStore(s => s.setPetStats)
  const petName           = useStore(s => s.petName)
  const setPetName        = useStore(s => s.setPetName)
  const petSpeciesId      = useStore(s => s.petSpeciesId)
  const petEVs            = useStore(s => s.petEVs)
  const ownedTMs          = useStore(s => s.ownedTMs)
  const equippedTool      = useStore(s => s.equippedTool)
  const swapMove          = useStore(s => s.swapMove)
  const useTM             = useStore(s => s.useTM)
  const initialized       = useStore(s => s.initialized)
  const totalPointsEarned = useStore(s => s.totalPointsEarned || 0)

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [swapSlot, setSwapSlot] = useState(null)

  const pokemon = getPokemon(petSpeciesId)

  useEffect(() => {
    if (!initialized || !pokemon) return
    if (!petStats || petStats.speciesId !== pokemon.id) {
      setPetStats(generate(pokemon))
    }
  }, [initialized, pokemon, petStats])

  // 포켓몬 미선택 상태
  if (!pokemon) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIcon}>🔮</div>
        <div style={s.emptyText}>포켓몬이 없습니다</div>
        <div style={s.emptyHint}>스타팅 포켓몬을 선택하면<br />스탯을 확인할 수 있어요</div>
      </div>
    )
  }

  if (!petStats) return null

  const currentLevel = calcLevel(totalPointsEarned)
  const currentLevelExp = expForLevel(currentLevel)
  const nextLevelExp = expForLevel(currentLevel + 1)
  const expProgress = totalPointsEarned - currentLevelExp
  const expNeeded = nextLevelExp - currentLevelExp
  const expPct = expNeeded > 0 ? Math.min(100, Math.round(expProgress / expNeeded * 100)) : 100
  const canEvolve = pokemon.evolveAt && currentLevel >= pokemon.evolveAt

  const nature      = NATURES.find(n => n.name === petStats.natureName) || NATURES[0]
  const ability     = pokemon.abilities.find(a => a.name === petStats.abilityName) || pokemon.abilities[0]
  const learnedPool = petStats.learnedPool || petStats.moves || []
  const moves       = petStats.moves.map(name => resolveMove(name, pokemon, SHOP_ITEMS)).filter(Boolean)
  const toolItem    = equippedTool ? SHOP_ITEMS.find(i => i.id === equippedTool) : null

  const saveName = () => {
    if (nameInput.trim()) setPetName(nameInput.trim())
    setEditing(false)
  }

  const learnedMoves     = learnedPool.map(name => resolveMove(name, pokemon, SHOP_ITEMS)).filter(Boolean)
  const availableForSwap = learnedMoves.filter(m => !petStats.moves.includes(m.name))

  const total = STAT_KEYS.reduce((sum, k) =>
    sum + calcStat(pokemon.baseStats[k], petStats.ivs[k], petEVs[k], k, nature), 0)

  const myTMs = SHOP_ITEMS.filter(i => i.category === 'tm' && ownedTMs.includes(i.id))

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
          <img
            src={spriteUrl(pokemon.dexNum)}
            alt={pokemon.speciesName}
            style={s.headerSprite}
            draggable={false}
          />
          <div style={{ flex: 1 }}>
            {editing ? (
              <input style={s.nameInput} value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                autoFocus maxLength={10} />
            ) : (
              <div style={s.nameRow}>
                <span style={s.name}>{petName || pokemon.speciesName}</span>
                <button onClick={() => { setNameInput(petName || pokemon.speciesName); setEditing(true) }} style={s.editBtn}>✏️</button>
              </div>
            )}
            <div style={s.dex}>#{String(pokemon.dexNum).padStart(3, '0')} · Lv.{currentLevel}</div>
            <div style={s.types}>
              {pokemon.types.map(t => (
                <span key={t} style={{ ...s.typeBadge, background: TYPE_COLOR[t] || '#555' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={s.xpSection}>
        <div style={s.xpLabelRow}>
          <span style={s.xpLabel}>EXP</span>
          <span style={s.xpVal}>{expProgress} / {expNeeded}</span>
          {canEvolve && <span style={s.evolveTag}>진화 가능!</span>}
        </div>
        <div style={s.xpBarBg}>
          <div style={{ ...s.xpBarFill, width: `${expPct}%` }} />
        </div>
      </div>

      {/* 성격 · 특성 · 지니기 */}
      <div style={s.infoRow}>
        <span style={s.label}>성격</span>
        <span style={s.value}>
          {nature.name}
          {nature.up   && <span style={s.up}>   {nature.up}↑</span>}
          {nature.down && <span style={s.down}> {nature.down}↓</span>}
        </span>
      </div>
      <div style={s.infoRow}>
        <span style={s.label}>특성</span>
        <span style={s.value}>{ability.name}<span style={s.abilityDesc}> — {ability.desc}</span></span>
      </div>
      <div style={s.infoRow}>
        <span style={s.label}>지니기</span>
        {toolItem ? (
          <span style={s.value}>{toolItem.emoji} {toolItem.name}<span style={s.abilityDesc}> — {toolItem.effect}</span></span>
        ) : (
          <span style={{ ...s.value, color: '#444' }}>없음</span>
        )}
      </div>

      <div style={s.divider} />

      {/* 스탯 */}
      <div style={s.sectionTitle}>스탯</div>
      {STAT_KEYS.map(key => {
        const ev  = petEVs[key] || 0
        const val = calcStat(pokemon.baseStats[key], petStats.ivs[key], ev, key, nature)
        const pct = Math.min(100, Math.round(val / BAR_MAX * 100))
        const isUp = nature.up === key
        const isDn = nature.down === key
        return (
          <div key={key} style={s.statRow}>
            <span style={{ ...s.statName, color: isUp ? '#FF6B6B' : isDn ? '#6B9EFF' : '#aaa' }}>{key}</span>
            <span style={s.statBase}>{pokemon.baseStats[key]}</span>
            <div style={s.barBg}>
              <div style={{ ...s.barFill, width: `${pct}%`, background: STAT_COLOR[key] }} />
            </div>
            <span style={{ ...s.statVal, color: isUp ? '#FF6B6B' : isDn ? '#6B9EFF' : '#fff' }}>{val}</span>
            {ev > 0 && <span style={s.evTag}>EV{ev}</span>}
          </div>
        )
      })}
      <div style={s.totalRow}>
        <span style={s.totalLabel}>합계</span>
        <span style={s.totalVal}>{total}</span>
      </div>

      <div style={s.divider} />

      {/* 기술 */}
      <div style={{ ...s.sectionTitle, display: 'flex', justifyContent: 'space-between' }}>
        <span>기술</span>
        {swapSlot !== null && <span style={{ color: '#FF6B6B', fontSize: '10px' }}>교체할 기술 선택</span>}
      </div>
      <div style={s.moveGrid}>
        {moves.map((m, idx) => (
          <div key={m.name} style={{ ...s.moveCard, ...(swapSlot === idx ? s.moveCardSel : {}) }}>
            <div style={s.moveTop}>
              <span style={{ ...s.typeBadge, background: TYPE_COLOR[m.type] || '#555', fontSize: '10px' }}>{m.type}</span>
              <span style={s.moveCat}>{m.category}</span>
              <button onClick={() => setSwapSlot(swapSlot === idx ? null : idx)} style={s.swapBtn}>↔</button>
            </div>
            <div style={s.moveName}>{m.name}</div>
            <div style={s.movePower}>{m.power ? `위력 ${m.power}` : '변화기'}</div>
          </div>
        ))}
      </div>

      {/* 교체 피커 */}
      {swapSlot !== null && (
        <div style={s.swapPicker}>
          {availableForSwap.length === 0
            ? <div style={s.swapEmpty}>교체 가능한 기술 없음 — 아래 기술머신 사용</div>
            : availableForSwap.map(m => (
              <button key={m.name} onClick={() => { swapMove(swapSlot, m.name); setSwapSlot(null) }} style={s.swapOption}>
                <span style={{ ...s.typeBadge, background: TYPE_COLOR[m.type] || '#555', fontSize: '10px' }}>{m.type}</span>
                <span style={{ color: '#fff', marginLeft: '6px' }}>{m.name}</span>
                <span style={{ marginLeft: 'auto', color: '#666', fontSize: '11px' }}>{m.power ? `위력 ${m.power}` : '변화'}</span>
              </button>
            ))
          }
        </div>
      )}

      {/* 보유 기술머신 */}
      {myTMs.length > 0 && (
        <>
          <div style={s.divider} />
          <div style={s.sectionTitle}>보유 기술머신 ({myTMs.length}개)</div>
          {myTMs.map(tm => {
            const alreadyLearned = learnedPool.includes(tm.moveName)
            const compatible     = pokemon.learnableTMs.includes(tm.id)
            return (
              <div key={tm.id} style={s.tmRow}>
                <div style={s.tmLeft}>
                  <span style={s.tmNum}>{tm.tmNum}</span>
                  <span style={s.tmEmoji}>{tm.emoji}</span>
                  <div>
                    <div style={s.tmName}>{tm.name}</div>
                    <div style={s.tmMeta}>
                      <span style={{ ...s.typeBadge, background: TYPE_COLOR[tm.moveType] || '#555', fontSize: '9px' }}>
                        {tm.moveType}
                      </span>
                      <span style={s.tmCat}>{tm.moveCategory}</span>
                      {tm.movePower && <span style={s.tmPower}>위력 {tm.movePower}</span>}
                    </div>
                  </div>
                </div>
                <div style={s.tmRight}>
                  {alreadyLearned ? (
                    <span style={s.tmBadgeLearned}>학습 완료</span>
                  ) : compatible ? (
                    <button onClick={() => useTM(tm.moveName)} style={s.tmUseBtn}>사용</button>
                  ) : (
                    <span style={s.tmBadgeNo}>배울 수 없음</span>
                  )}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

const s = {
  container: { fontSize: '13px', paddingBottom: '8px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' },
  emptyIcon: { fontSize: '48px', opacity: 0.3 },
  emptyText: { fontSize: '15px', color: '#555', fontWeight: 'bold' },
  emptyHint: { fontSize: '12px', color: '#3a3a5e', textAlign: 'center', lineHeight: '1.6' },
  header: { background: '#1a1a2e', borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' },
  headerSprite: { imageRendering: 'pixelated', width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  name: { fontSize: '18px', fontWeight: 'bold', color: '#fff' },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '0', opacity: 0.5 },
  nameInput: { fontSize: '16px', fontWeight: 'bold', background: '#2a2a3e', border: '1px solid #667eea', borderRadius: '6px', color: '#fff', padding: '2px 8px', width: '110px', outline: 'none' },
  dex: { fontSize: '11px', color: '#555', marginTop: '2px', marginBottom: '4px' },
  types: { display: 'flex', gap: '5px', alignItems: 'center', marginTop: '2px' },
  typeBadge: { fontSize: '11px', color: '#fff', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' },
  xpSection: { marginBottom: '8px' },
  xpLabelRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' },
  xpLabel: { fontSize: '10px', color: '#555', letterSpacing: '1px' },
  xpVal: { fontSize: '10px', color: '#444', flex: 1 },
  evolveTag: { fontSize: '10px', color: '#ffd700', background: '#2a2500', borderRadius: '4px', padding: '1px 6px', fontWeight: 'bold', animation: 'none' },
  xpBarBg: { height: '6px', background: '#2a2a3e', borderRadius: '3px', overflow: 'hidden' },
  xpBarFill: { height: '100%', background: 'linear-gradient(90deg, #667eea, #a78bfa)', borderRadius: '3px', transition: 'width 0.3s ease' },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '4px 0' },
  label: { color: '#555', width: '32px', flexShrink: 0 },
  value: { color: '#ccc', lineHeight: '1.4' },
  up: { color: '#FF6B6B', fontSize: '11px' },
  down: { color: '#6B9EFF', fontSize: '11px' },
  abilityDesc: { color: '#555', fontSize: '11px' },
  divider: { height: '1px', background: '#2a2a3e', margin: '10px 0' },
  sectionTitle: { color: '#555', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' },
  statRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' },
  statName: { width: '52px', fontSize: '11px', textAlign: 'right', flexShrink: 0 },
  statBase: { width: '24px', fontSize: '11px', textAlign: 'right', color: '#444', flexShrink: 0 },
  barBg: { flex: 1, height: '7px', background: '#2a2a3e', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px' },
  statVal: { width: '28px', fontSize: '12px', textAlign: 'right', fontWeight: 'bold', flexShrink: 0 },
  evTag: { fontSize: '9px', color: '#4CAF50', background: '#1a3a1a', borderRadius: '3px', padding: '1px 3px', flexShrink: 0, minWidth: '30px', textAlign: 'center' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' },
  totalLabel: { color: '#555', fontSize: '11px' },
  totalVal: { color: '#888', fontSize: '12px', fontWeight: 'bold', width: '28px', textAlign: 'right' },
  moveGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  moveCard: { background: '#1a1a2e', borderRadius: '8px', padding: '8px 10px', border: '1px solid transparent' },
  moveCardSel: { borderColor: '#667eea' },
  moveTop: { display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' },
  moveCat: { fontSize: '10px', color: '#555', flex: 1 },
  swapBtn: { background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer', padding: '0 2px' },
  moveName: { fontSize: '13px', color: '#fff', fontWeight: 'bold', marginBottom: '2px' },
  movePower: { fontSize: '11px', color: '#666' },
  swapPicker: { marginTop: '10px', background: '#1a1a2e', borderRadius: '8px', padding: '8px', border: '1px solid #2a2a3e' },
  swapEmpty: { fontSize: '11px', color: '#555', textAlign: 'center', padding: '6px 0' },
  swapOption: { display: 'flex', alignItems: 'center', width: '100%', background: '#2a2a3e', border: 'none', borderRadius: '6px', padding: '7px 10px', cursor: 'pointer', marginBottom: '4px' },
  tmRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a2e', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px' },
  tmLeft: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
  tmNum: { fontSize: '10px', color: '#444', fontFamily: 'monospace', width: '30px', flexShrink: 0 },
  tmEmoji: { fontSize: '18px', flexShrink: 0 },
  tmName: { fontSize: '12px', color: '#fff', fontWeight: 'bold', marginBottom: '3px' },
  tmMeta: { display: 'flex', gap: '4px', alignItems: 'center' },
  tmCat: { fontSize: '10px', color: '#555' },
  tmPower: { fontSize: '10px', color: '#666' },
  tmRight: { flexShrink: 0, marginLeft: '8px' },
  tmUseBtn: { background: '#667eea', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' },
  tmBadgeLearned: { fontSize: '10px', color: '#4CAF50' },
  tmBadgeNo: { fontSize: '10px', color: '#FF6B6B' },
}
