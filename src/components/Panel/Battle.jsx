import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore'
import { getPokemon, spriteUrl, getMaxPP } from '../../data/pokemon'
import { STATUS_KO } from '../../data/battleEngine'
import { drawPokemon, DEFAULT_ANIMATIONS } from '../Pet/pokemonDraw'
import { getWinSize } from '../Pet/PetCanvas'

// Pixel art imports (same map as PokemonStats)
import * as squirtleData    from '../Pet/7-anims'
import * as charmanderData  from '../Pet/4-anims'
import * as bulbasaurData   from '../Pet/1-anims'
import * as ivysaurData     from '../Pet/2-anims'
import * as venusaurData    from '../Pet/3-anims'
import * as charmeleonData  from '../Pet/5-anims'
import * as charizardData   from '../Pet/6-anims'
import * as wartortleData   from '../Pet/8-anims'
import * as blastoiseData   from '../Pet/9-anims'
import * as pidgeyData      from '../Pet/16-anims'
import * as pidgeottoData   from '../Pet/17-anims'
import * as pidgeotData     from '../Pet/18-anims'
import * as pikachuData     from '../Pet/25-anims'
import * as raichuData      from '../Pet/26-anims'
import * as gastlyData      from '../Pet/92-anims'
import * as haunterData     from '../Pet/93-anims'
import * as gengarData      from '../Pet/94-anims'
import * as eeveeData       from '../Pet/133-anims'
import * as snorlaxData     from '../Pet/143-anims'

const PIXEL_ART = {
  squirtle: squirtleData, charmander: charmanderData, bulbasaur: bulbasaurData,
  ivysaur: ivysaurData,   venusaur: venusaurData,
  charmeleon: charmeleonData, charizard: charizardData,
  wartortle: wartortleData,   blastoise: blastoiseData,
  pidgey: pidgeyData, pidgeotto: pidgeottoData, pidgeot: pidgeotData,
  pikachu: pikachuData, raichu: raichuData,
  gastly: gastlyData, haunter: haunterData, gengar: gengarData,
  eevee: eeveeData, snorlax: snorlaxData,
}

const TYPE_COLOR = {
  고스트: '#735797', 악: '#5C5365',    격투: '#C03028', 풀: '#3a8a30',
  전기: '#C8A800',   에스퍼: '#cc3366', 노말: '#6a6a50', 독: '#A040A0',
  얼음: '#4a9898',   불꽃: '#c05010',   땅: '#b08828',   물: '#3868c8',
  바위: '#887840',   강철: '#607890',   비행: '#6890f0', 드래곤: '#7038F8',
}

const STATUS_COLOR = {
  burn: '#FF6B6B', poison: '#C77EFF', paralysis: '#FFD700',
  sleep: '#8888AA', freeze: '#9EECFF',
}

function PokemonSprite({ speciesId, dexNum, size = 64, flip = false }) {
  const canvasRef = useRef(null)
  const data = PIXEL_ART[speciesId]

  useEffect(() => {
    if (!data) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false
    const rows = data.BASE_BODY.length
    const cols = data.BASE_BODY[0]?.length ?? rows
    const scale = Math.floor(size / Math.max(rows, cols))
    const frame = DEFAULT_ANIMATIONS.idle.frames[0]
    drawPokemon(ctx, data.BASE_BODY, data.COLORS, frame, scale)
  }, [speciesId, size])

  if (data) {
    const rows = data.BASE_BODY.length
    const cols = data.BASE_BODY[0]?.length ?? rows
    const scale = Math.floor(size / Math.max(rows, cols))
    return (
      <canvas
        ref={canvasRef}
        width={cols * scale}
        height={rows * scale}
        style={{ imageRendering: 'pixelated', display: 'block', transform: flip ? 'scaleX(-1)' : 'none' }}
      />
    )
  }
  if (dexNum) {
    return (
      <img
        src={spriteUrl(dexNum)}
        alt={speciesId}
        draggable={false}
        style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain', display: 'block', transform: flip ? 'scaleX(-1)' : 'none' }}
      />
    )
  }
  return null
}

function HPBar({ hp, maxHP }) {
  const pct = maxHP > 0 ? Math.max(0, hp / maxHP) : 0
  const color = pct > 0.5 ? '#4CAF50' : pct > 0.2 ? '#FFC107' : '#F44336'
  return (
    <div style={s.hpBarWrap}>
      <div style={{ ...s.hpBarFill, width: `${pct * 100}%`, background: color }} />
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span style={{ ...s.statusBadge, background: STATUS_COLOR[status] ?? '#888' }}>
      {STATUS_KO[status]}
    </span>
  )
}

function BattlerRow({ battler, isWild }) {
  if (!battler) return null
  const pokemon = getPokemon(battler.speciesId)
  const name = isWild ? `야생 ${pokemon?.speciesName ?? battler.speciesId}` : (pokemon?.speciesName ?? battler.speciesId)
  const spriteSize = Math.round(getWinSize(battler.speciesId) * 0.56)
  return (
    <div style={s.battlerRow}>
      <PokemonSprite speciesId={battler.speciesId} dexNum={battler.dexNum} size={spriteSize} flip={!isWild} />
      <div style={s.battlerInfo}>
        <div style={s.battlerName}>
          {name}
          <span style={s.lv}>Lv.{battler.level}</span>
          <StatusBadge status={battler.status} />
        </div>
        <HPBar hp={battler.hp} maxHP={battler.maxHP} />
        <div style={s.hpText}>{battler.hp} / {battler.maxHP}</div>
        <div style={s.typeRow}>
          {pokemon?.types.map(t => (
            <span key={t} style={{ ...s.typeBadge, background: TYPE_COLOR[t] ?? '#888' }}>{t}</span>
          ))}
        </div>
        {battler.stages && (
          <div style={s.stageRow}>
            {Object.entries(battler.stages).filter(([k, v]) => v !== 0 && k !== '명중률' && k !== '회피율').map(([stat, v]) => (
              <span key={stat} style={{ ...s.stageBadge, color: v > 0 ? '#4CAF50' : '#F44336' }}>
                {stat.slice(0, 2)} {v > 0 ? `+${v}` : v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Battle() {
  const wildBattle          = useStore(s => s.wildBattle)
  const startWildBattle     = useStore(s => s.startWildBattle)
  const executePlayerMove   = useStore(s => s.executePlayerMove)
  const advanceBattleFrame  = useStore(s => s.advanceBattleFrame)
  const fleeFromBattle      = useStore(s => s.fleeFromBattle)
  const dismissBattle       = useStore(s => s.dismissBattle)
  const petSpeciesId        = useStore(s => s.petSpeciesId)
  const petStats            = useStore(s => s.petStats)
  const points              = useStore(s => s.points)

  // Play pending frames one by one with 0.5s delay
  useEffect(() => {
    if (wildBattle?.phase !== 'animating') return
    const timer = setTimeout(advanceBattleFrame, 500)
    return () => clearTimeout(timer)
  }, [wildBattle?.phase, wildBattle?.frameIndex, advanceBattleFrame])

  if (!petSpeciesId) {
    return <div style={s.empty}>포켓몬을 먼저 선택하세요.</div>
  }

  // No battle active — show encounter option
  if (!wildBattle) {
    const fainted = petStats?.currentHP === 0
    const noPoints = points < 10
    const cannotStart = fainted || noPoints
    return (
      <div style={s.center}>
        <div style={s.emptyIcon}>⚔️</div>
        <div style={s.emptyText}>
          {fainted ? '포켓몬이 쓰러졌다! 센터에서 회복하자.' : '야생 포켓몬을 찾으러 가자!'}
        </div>
        {noPoints && !fainted && (
          <div style={s.costWarning}>포인트가 부족합니다 (필요: 10pt)</div>
        )}
        <button style={{ ...s.encounterBtn, opacity: cannotStart ? 0.4 : 1 }} disabled={cannotStart} onClick={startWildBattle}>
          조우하기 · 10pt
        </button>
      </div>
    )
  }

  const { wild, player, phase, result, logLines = [], turn } = wildBattle
  const ended    = phase === 'ended'
  const animating = phase === 'animating'

  return (
    <div style={s.wrap}>
      {/* Wild pokemon */}
      <BattlerRow battler={wild} isWild />

      {/* Player pokemon */}
      <BattlerRow battler={player} isWild={false} />

      {/* Battle log */}
      <div style={s.logBox}>
        {logLines.filter(Boolean).map((line, i) => (
          <div key={i} style={s.logLine}>{line}</div>
        ))}
      </div>

      {/* Move buttons or result */}
      {!ended ? (
        <>
          <div style={s.turnLabel}>
            Turn {turn} — {animating ? '...' : '기술을 선택하세요'}
          </div>
          <div style={s.moveGrid}>
            {player?.resolvedMoves?.map(move => {
              const pp = player.movePP?.[move.name] ?? 0
              const maxPP = getMaxPP(move.name)
              const noPP = pp <= 0
              const disabled = noPP || animating
              return (
                <button
                  key={move.name}
                  disabled={disabled}
                  style={{ ...s.moveBtn, borderColor: TYPE_COLOR[move.type] ?? '#555', opacity: disabled ? 0.4 : 1 }}
                  onClick={() => executePlayerMove(move.name)}
                >
                  <span style={{ ...s.moveType, background: TYPE_COLOR[move.type] ?? '#555' }}>
                    {move.type}
                  </span>
                  <span style={s.moveName}>{move.name}</span>
                  <span style={s.movePP}>PP {pp}/{maxPP}</span>
                </button>
              )
            })}
          </div>
          <button style={{ ...s.fleeBtn, opacity: animating ? 0.4 : 1 }} disabled={animating} onClick={fleeFromBattle}>도망가기</button>
        </>
      ) : (
        <div style={s.resultWrap}>
          <div style={{ ...s.resultText, color: result === 'win' ? '#4CAF50' : result === 'lose' ? '#F44336' : result === 'flee_roar' ? '#9E9E9E' : '#FFC107' }}>
            {result === 'win'  && '승리! +30 포인트'}
            {result === 'lose' && '패배...'}
            {result === 'flee' && '도망쳤다!'}
            {result === 'flee_roar' && '야생 포켓몬이 도망쳤다!'}
          </div>
          <div style={s.resultButtons}>
            {result !== 'lose' && (
              <button style={s.encounterBtn} onClick={startWildBattle}>다시 조우</button>
            )}
            <button style={s.dismissBtn} onClick={dismissBattle}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', paddingTop: '40px' },
  empty: { color: '#888', textAlign: 'center', paddingTop: '40px' },
  emptyIcon: { fontSize: '48px' },
  emptyText: { color: '#aaa', fontSize: '14px' },
  costWarning: { color: '#F44336', fontSize: '12px' },
  encounterBtn: {
    background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 28px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
  },
  battlerRow: { display: 'flex', gap: '12px', alignItems: 'center', background: '#1a1a2e', borderRadius: '8px', padding: '10px' },
  battlerInfo: { flex: 1 },
  battlerName: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#eee', marginBottom: '4px' },
  lv: { fontSize: '11px', color: '#aaa', fontWeight: 'normal' },
  statusBadge: { fontSize: '10px', borderRadius: '4px', padding: '1px 5px', color: '#000', fontWeight: 'bold' },
  hpBarWrap: { height: '8px', background: '#2a2a3e', borderRadius: '4px', overflow: 'hidden', marginBottom: '2px' },
  hpBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  hpText: { fontSize: '11px', color: '#aaa' },
  typeRow: { display: 'flex', gap: '4px', marginTop: '4px' },
  typeBadge: { fontSize: '10px', borderRadius: '3px', padding: '1px 5px', color: '#fff' },
  stageRow: { display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' },
  stageBadge: { fontSize: '9px', fontWeight: 'bold' },
  logBox: {
    background: '#0f0f1e', border: '1px solid #2a2a3e', borderRadius: '8px',
    padding: '8px 12px', minHeight: '52px', fontSize: '12px', color: '#ddd', lineHeight: '1.6',
  },
  logLine: { marginBottom: '1px' },
  turnLabel: { fontSize: '12px', color: '#aaa', textAlign: 'center' },
  moveGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  moveBtn: {
    background: '#1a1a2e', border: '1px solid #555', borderRadius: '8px',
    padding: '7px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start',
  },
  moveType: { fontSize: '10px', borderRadius: '3px', padding: '1px 5px', color: '#fff' },
  moveName: { fontSize: '12px', color: '#eee', fontWeight: 'bold' },
  movePower: { fontSize: '10px', color: '#aaa' },
  movePP: { fontSize: '10px', color: '#aaa' },
  fleeBtn: {
    background: 'none', border: '1px solid #555', color: '#888', borderRadius: '8px',
    padding: '6px', fontSize: '12px', cursor: 'pointer', width: '100%',
  },
  resultWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  resultText: { fontSize: '18px', fontWeight: 'bold' },
  resultButtons: { display: 'flex', gap: '10px' },
  dismissBtn: {
    background: '#2a2a3e', color: '#aaa', border: '1px solid #555', borderRadius: '8px',
    padding: '10px 20px', fontSize: '14px', cursor: 'pointer',
  },
}
