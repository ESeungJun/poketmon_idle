import { useState } from 'react'
import useStore from '../../store/useStore'
import { STARTERS, getPokemon, spriteUrl } from '../../data/pokemon'

const TYPE_COLOR = {
  풀: '#3a8a30', 독: '#A040A0', 불꽃: '#c05010', 물: '#3868c8',
  노말: '#6a6a50', 비행: '#6890f0', 전기: '#C8A800', 고스트: '#735797',
  에스퍼: '#cc3366', 강철: '#607890',
}

const STARTER_DATA = STARTERS.map(id => getPokemon(id))

export default function StarterSelect() {
  const selectStarter = useStore(s => s.selectStarter)
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleSelect = (id) => {
    setSelected(id)
    setTimeout(() => selectStarter(id), 400)
  }

  return (
    <div style={s.wrapper}>
      <div style={s.title}>파트너 포켓몬을 선택하세요!</div>
      <div style={s.subtitle}>함께 성장할 포켓몬을 골라주세요</div>

      <div style={s.grid}>
        {STARTER_DATA.map(pokemon => {
          const isHovered = hovered === pokemon.id
          const isSelected = selected === pokemon.id
          return (
            <button
              key={pokemon.id}
              style={{
                ...s.card,
                ...(isHovered ? s.cardHover : {}),
                ...(isSelected ? s.cardSelected : {}),
              }}
              onClick={() => handleSelect(pokemon.id)}
              onMouseEnter={() => setHovered(pokemon.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={s.spriteWrap}>
                <img
                  src={spriteUrl(pokemon.dexNum)}
                  alt={pokemon.speciesName}
                  style={s.sprite}
                  draggable={false}
                />
              </div>
              <div style={s.name}>{pokemon.speciesName}</div>
              <div style={s.dex}>#{String(pokemon.dexNum).padStart(3, '0')}</div>
              <div style={s.types}>
                {pokemon.types.map(t => (
                  <span key={t} style={{ ...s.typeBadge, background: TYPE_COLOR[t] || '#555' }}>{t}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  wrapper: {
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '12px',
    color: '#555',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    width: '100%',
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    padding: '10px 6px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'border-color 0.15s, background 0.15s',
  },
  cardHover: {
    borderColor: '#667eea',
    background: '#1e1e38',
  },
  cardSelected: {
    borderColor: '#a78bfa',
    background: '#252540',
  },
  spriteWrap: {
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    imageRendering: 'pixelated',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  name: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
  },
  dex: {
    fontSize: '10px',
    color: '#444',
  },
  types: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    fontSize: '9px',
    color: '#fff',
    padding: '1px 5px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
}
