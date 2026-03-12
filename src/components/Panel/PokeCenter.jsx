import { useState } from 'react'
import useStore from '../../store/useStore'
import { getPokemon, calcLevel } from '../../data/pokemon'

export default function PokeCenter() {
  const petSpeciesId       = useStore(s => s.petSpeciesId)
  const petStats           = useStore(s => s.petStats)
  const totalPointsEarned  = useStore(s => s.totalPointsEarned)
  const points             = useStore(s => s.points)
  const healAtCenter       = useStore(s => s.healAtCenter)
  const [healed, setHealed] = useState(false)

  const pokemon    = getPokemon(petSpeciesId)
  const level      = Math.max(1, calcLevel(totalPointsEarned || 0))
  const isFullHP   = petStats?.currentHP == null
  const isFullPP   = petStats?.movePP == null
  const noPoints   = points < 20

  const handleHeal = () => {
    healAtCenter()
    setHealed(true)
    setTimeout(() => setHealed(false), 2000)
  }

  return (
    <div style={s.wrap}>
      <img src="PokeCenter.webp" alt="포켓몬 센터" style={s.image} draggable={false} />

      <div style={s.card}>
        <div style={s.cardTitle}>포켓몬 센터</div>
        <div style={s.cardDesc}>
          포켓몬의 HP와 PP를 모두 회복합니다.
        </div>

        {petStats && (
          <div style={s.statusRow}>
            <div style={s.statusItem}>
              <span style={s.statusLabel}>HP</span>
              <span style={{ ...s.statusVal, color: isFullHP ? '#4CAF50' : '#F44336' }}>
                {isFullHP ? '최대' : `${petStats.currentHP} / 최대`}
              </span>
            </div>
            <div style={s.statusItem}>
              <span style={s.statusLabel}>PP</span>
              <span style={{ ...s.statusVal, color: isFullPP ? '#4CAF50' : '#FFC107' }}>
                {isFullPP ? '최대' : '소모됨'}
              </span>
            </div>
          </div>
        )}

        {healed ? (
          <div style={s.healedMsg}>
            {pokemon?.speciesName ?? '포켓몬'}이(가) 원기를 회복했다!
          </div>
        ) : (
          <>
            {noPoints && (
              <div style={s.costWarning}>포인트가 부족합니다 (필요: 20pt)</div>
            )}
            <button
              style={{ ...s.healBtn, opacity: (isFullHP && isFullPP) || noPoints ? 0.5 : 1 }}
              disabled={noPoints}
              onClick={handleHeal}
            >
              회복하기 · 20pt
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    display: 'block',
    imageRendering: 'pixelated',
  },
  card: {
    width: '100%',
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#eee',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#aaa',
  },
  statusRow: {
    display: 'flex',
    gap: '16px',
  },
  statusItem: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: '11px',
    color: '#888',
    background: '#2a2a3e',
    borderRadius: '4px',
    padding: '2px 6px',
  },
  statusVal: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  healBtn: {
    background: '#e63946',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
  healedMsg: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#4CAF50',
    fontWeight: 'bold',
    padding: '8px 0',
  },
  costWarning: {
    fontSize: '12px',
    color: '#F44336',
    textAlign: 'center',
  },
}
