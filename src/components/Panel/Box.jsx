import { useState } from 'react'
import useStore from '../../store/useStore'
import { getPokemon, calcLevel } from '../../data/pokemon'
import { TYPE_COLOR } from '../../constants/typeColors'
import StaticPokemonSprite from '../Pet/StaticPokemonSprite'

const MiniSprite = ({ speciesId, dexNum, size = 40 }) => (
  <StaticPokemonSprite speciesId={speciesId} dexNum={dexNum} size={size} />
)

export default function Box() {
  const caughtPokemon   = useStore(s => s.caughtPokemon)
  const swapPartner     = useStore(s => s.swapPartner)
  const releaseFromBox  = useStore(s => s.releaseFromBox)
  const wildBattle      = useStore(s => s.wildBattle)
  const petSpeciesId    = useStore(s => s.petSpeciesId)
  const totalPointsEarned = useStore(s => s.totalPointsEarned)
  const [selected, setSelected] = useState(null)
  const [confirmRelease, setConfirmRelease] = useState(null)

  const playerLevel = Math.max(1, calcLevel(totalPointsEarned || 0))

  if (!caughtPokemon || caughtPokemon.length === 0) {
    return (
      <div style={st.empty}>
        <div style={st.emptyIcon}>📦</div>
        <div style={st.emptyText}>보관함이 비어있습니다</div>
        <div style={st.emptyHint}>야생 포켓몬을 잡아서 보관함에 넣어보세요!</div>
      </div>
    )
  }

  const selectedPoke = selected !== null ? caughtPokemon[selected] : null
  const selectedInfo = selectedPoke ? getPokemon(selectedPoke.speciesId) : null

  return (
    <div style={st.wrap}>
      <div style={st.header}>
        <span style={st.title}>📦 보관함</span>
        <span style={st.count}>{caughtPokemon.length}마리</span>
      </div>

      {/* Grid */}
      <div style={st.grid}>
        {caughtPokemon.map((poke, i) => {
          const info = getPokemon(poke.speciesId)
          const isSelected = selected === i
          return (
            <div
              key={i}
              onClick={() => setSelected(isSelected ? null : i)}
              style={{ ...st.cell, ...(isSelected ? st.cellSelected : {}) }}
            >
              <MiniSprite speciesId={poke.speciesId} dexNum={poke.dexNum} size={36} />
              <div style={st.cellName}>{poke.nickname || info?.speciesName || poke.speciesId}</div>
              <div style={st.cellLevel}>Lv.{poke.level}</div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selectedPoke && selectedInfo && (
        <div style={st.detail}>
          <div style={st.detailHeader}>
            <MiniSprite speciesId={selectedPoke.speciesId} dexNum={selectedPoke.dexNum} size={48} />
            <div style={st.detailMeta}>
              <div style={st.detailName}>
                {selectedPoke.nickname || selectedInfo.speciesName}
                {selectedPoke.nickname && <span style={st.detailSpecies}> ({selectedInfo.speciesName})</span>}
              </div>
              <div style={st.detailLv}>Lv.{selectedPoke.level}</div>
              <div style={st.typeRow}>
                {selectedInfo.types.map(t => (
                  <span key={t} style={{ ...st.typeBadge, background: TYPE_COLOR[t] ?? '#888' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={st.detailRow}>
            <span style={st.label}>성격</span>
            <span style={st.value}>{selectedPoke.natureName ?? '-'}</span>
          </div>
          <div style={st.detailRow}>
            <span style={st.label}>특성</span>
            <span style={st.value}>{selectedPoke.abilityName ?? '-'}</span>
          </div>
          <div style={st.detailRow}>
            <span style={st.label}>기술</span>
            <span style={st.value}>{(selectedPoke.moves || []).join(', ') || '-'}</span>
          </div>

          <div style={st.actions}>
            {wildBattle ? (
              <div style={st.disabledNote}>배틀 중에는 교체할 수 없습니다</div>
            ) : (
              <button
                style={st.swapBtn}
                onClick={() => {
                  swapPartner(selected)
                  setSelected(null)
                }}
              >
                파트너 교체
              </button>
            )}
            {confirmRelease === selected ? (
              <div style={st.confirmRow}>
                <span style={st.confirmText}>정말 놓아주시겠습니까?</span>
                <button style={st.confirmYes} onClick={() => {
                  releaseFromBox(selected)
                  setSelected(null)
                  setConfirmRelease(null)
                }}>예</button>
                <button style={st.confirmNo} onClick={() => setConfirmRelease(null)}>아니오</button>
              </div>
            ) : (
              <button style={st.releaseBtn} onClick={() => setConfirmRelease(selected)}>놓아주기</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const st = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '40px' },
  emptyIcon: { fontSize: '48px' },
  emptyText: { color: '#aaa', fontSize: '14px' },
  emptyHint: { color: '#555', fontSize: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  count: { fontSize: '12px', color: '#888' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
  },
  cell: {
    background: '#1a1a2e', borderRadius: '10px', padding: '8px 4px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.2s',
  },
  cellSelected: { borderColor: '#667eea' },
  cellName: { fontSize: '10px', color: '#ddd', fontWeight: 'bold', textAlign: 'center' },
  cellLevel: { fontSize: '9px', color: '#888' },
  detail: {
    background: '#1a1a2e', borderRadius: '12px', padding: '14px',
  },
  detailHeader: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' },
  detailMeta: { flex: 1 },
  detailName: { fontSize: '15px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'baseline', gap: '4px' },
  detailSpecies: { fontSize: '11px', color: '#888', fontWeight: 'normal' },
  detailLv: { fontSize: '12px', color: '#aaa' },
  typeRow: { display: 'flex', gap: '4px', marginTop: '4px' },
  typeBadge: { fontSize: '10px', borderRadius: '3px', padding: '1px 5px', color: '#fff' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2a2a3e' },
  label: { fontSize: '12px', color: '#888' },
  value: { fontSize: '12px', color: '#ddd', textAlign: 'right', maxWidth: '60%' },
  actions: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
  swapBtn: {
    background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
  },
  releaseBtn: {
    background: 'none', border: '1px solid #555', color: '#888', borderRadius: '8px',
    padding: '6px', fontSize: '11px', cursor: 'pointer',
  },
  disabledNote: { fontSize: '11px', color: '#F44336', textAlign: 'center' },
  confirmRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  confirmText: { fontSize: '11px', color: '#F44336', flex: 1 },
  confirmYes: {
    background: '#F44336', color: '#fff', border: 'none', borderRadius: '6px',
    padding: '4px 12px', fontSize: '11px', cursor: 'pointer',
  },
  confirmNo: {
    background: '#2a2a3e', color: '#aaa', border: '1px solid #555', borderRadius: '6px',
    padding: '4px 12px', fontSize: '11px', cursor: 'pointer',
  },
}
