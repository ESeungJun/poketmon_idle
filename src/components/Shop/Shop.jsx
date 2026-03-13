import { useState } from 'react'
import useStore from '../../store/useStore'
import { SHOP_ITEMS } from './items'

const TABS = ['도구', '강화 아이템', '기술머신']

export default function Shop() {
  const [tab, setTab] = useState(0)

  const points         = useStore(s => s.points)
  const purchasedItems = useStore(s => s.purchasedItems)
  const equippedTool   = useStore(s => s.equippedTool)
  const petEVs         = useStore(s => s.petEVs)
  const ownedTMs       = useStore(s => s.ownedTMs)
  const purchaseItem   = useStore(s => s.purchaseItem)
  const equipTool      = useStore(s => s.equipTool)
  const applyVitamin   = useStore(s => s.applyVitamin)
  const buyTM          = useStore(s => s.buyTM)

  const totalEVs = Object.values(petEVs).reduce((s, v) => s + v, 0)

  return (
    <div style={st.container}>
      <div style={st.header}>
        <span style={st.title}>🛍️ 아이템 샵</span>
        <span style={st.balance}>⭐ {points.toLocaleString()}</span>
      </div>

      <div style={st.tabBar}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            style={{ ...st.tab, ...(tab === i ? st.tabActive : {}) }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── 도구 탭 ── */}
      {tab === 0 && (
        <div style={st.section}>
          <div style={st.sectionDesc}>
            한 번에 하나만 지닐 수 있습니다 · 스탯 탭에서 효과 확인
          </div>
          <div style={st.grid2}>
            {SHOP_ITEMS.filter(i => i.category === 'tool').map(item => {
              const owned    = purchasedItems.includes(item.id)
              const equipped = equippedTool === item.id
              const canAfford = points >= item.cost
              return (
                <div key={item.id} style={{
                  ...st.tmCard,
                  ...(equipped ? st.toolEquipped : owned ? st.tmOwned : {}),
                }}>
                  <div style={st.tmHeader}>
                    <span style={st.tmEmoji}>{item.emoji}</span>
                    <span style={st.tmName}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#FFD700', marginBottom: '3px' }}>{item.effect}</div>
                  <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px' }}>{item.description}</div>
                  {owned ? (
                    <button onClick={() => equipTool(item.id)} style={{
                      ...st.btn,
                      background: equipped ? '#FF6B9D' : '#2a2a3e',
                      color: equipped ? '#FFF' : '#AAA',
                      border: equipped ? 'none' : '1px solid #444',
                    }}>{equipped ? '지니는 중' : '지니기'}</button>
                  ) : (
                    <button onClick={() => purchaseItem(item.id, item.cost)}
                      disabled={!canAfford}
                      style={{
                        ...st.btn,
                        background: canAfford ? '#667eea' : '#2a2a3e',
                        color: canAfford ? '#FFF' : '#555',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}>⭐ {item.cost.toLocaleString()}</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 강화 아이템 탭 ── */}
      {tab === 1 && (
        <div style={st.section}>
          <div style={st.evTotal}>
            총 EV: {totalEVs} / 510
            <div style={st.evTotalBar}>
              <div style={{ ...st.evTotalFill, width: `${Math.min(100, totalEVs / 510 * 100)}%` }} />
            </div>
          </div>
          <div style={st.sectionDesc}>
            스탯당 최대 252 EV · 전체 합계 최대 510 EV<br />
            EV는 실제 스탯 수치에 반영됩니다
          </div>
          <div style={st.grid3}>
            {SHOP_ITEMS.filter(i => i.category === 'vitamin').map(item => {
              const ev = petEVs[item.stat] || 0
              const atStatMax = ev >= 252
              const atTotalMax = totalEVs >= 510
              const atMax = atStatMax || atTotalMax
              const canAfford = points >= item.cost
              const remaining = Math.min(252 - ev, 510 - totalEVs)
              return (
                <div key={item.id} style={{ ...st.card, ...(atMax ? st.cardOwned : {}) }}>
                  <div style={st.emoji}>{item.emoji}</div>
                  <div style={st.cardName}>{item.name}</div>
                  <div style={st.cardDesc}>{item.description}</div>
                  <div style={st.evLabel}>{ev} / 252 EV</div>
                  <div style={st.evBar}>
                    <div style={{ ...st.evFill, width: `${ev / 252 * 100}%` }} />
                  </div>
                  <button
                    onClick={() => applyVitamin(item.stat, item.cost)}
                    disabled={atMax || !canAfford}
                    style={{
                      ...st.btn,
                      background: atMax ? '#2a2a3e' : canAfford ? '#667eea' : '#2a2a3e',
                      color: atMax ? '#444' : canAfford ? '#FFF' : '#555',
                      cursor: atMax || !canAfford ? 'not-allowed' : 'pointer',
                    }}>
                    {atMax ? (atStatMax ? '최대' : 'EV 한계') : `⭐ ${item.cost.toLocaleString()}`}
                  </button>
                  {!atMax && <div style={st.remainLabel}>+{Math.min(10, remaining)} EV 추가</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 기술머신 탭 ── */}
      {tab === 2 && (
        <div style={st.section}>
          <div style={st.sectionDesc}>
            구매 후 스탯 탭에서 사용 가능
          </div>
          <div style={st.grid2}>
            {SHOP_ITEMS.filter(i => i.category === 'tm').map(item => {
              const owned = ownedTMs.includes(item.id)
              const canAfford = points >= item.cost
              return (
                <div key={item.id} style={{ ...st.tmCard, ...(owned ? st.tmOwned : {}) }}>
                  <div style={st.tmHeader}>
                    <span style={st.tmNum}>{item.tmNum}</span>
                    <span style={st.tmEmoji}>{item.emoji}</span>
                    <span style={st.tmName}>{item.name}</span>
                  </div>
                  <div style={st.tmInfo}>
                    <span style={{ ...st.tmType, background: TYPE_BG[item.moveType] || '#444' }}>
                      {item.moveType}
                    </span>
                    <span style={st.tmCat}>{item.moveCategory}</span>
                    {item.movePower && <span style={st.tmPower}>위력 {item.movePower}</span>}
                  </div>
                  {owned ? (
                    <div style={st.ownedBadge}>✓ 보유 중</div>
                  ) : (
                    <button
                      onClick={() => buyTM(item.id, item.cost)}
                      disabled={!canAfford}
                      style={{
                        ...st.btn,
                        background: canAfford ? '#667eea' : '#2a2a3e',
                        color: canAfford ? '#FFF' : '#555',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        marginTop: '6px',
                      }}>
                      ⭐ {item.cost.toLocaleString()}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const TYPE_BG = {
  고스트: '#735797', 악: '#5C5365', 격투: '#C03028', 풀: '#3a8a30',
  전기: '#C8A800', 에스퍼: '#cc3366', 노말: '#6a6a50', 독: '#A040A0',
  얼음: '#4a9898', 불꽃: '#c05010', 땅: '#b08828', 물: '#3868c8',
  바위: '#887840', 강철: '#607890',
}

const st = {
  container: { background: '#1a1a2e', borderRadius: '12px', padding: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' },
  balance: { fontSize: '14px', color: '#FFD700', fontWeight: 'bold' },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '14px', background: '#0f0f1e', borderRadius: '8px', padding: '4px' },
  tab: { flex: 1, background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer', padding: '5px 4px', borderRadius: '6px' },
  tabActive: { background: '#2a2a3e', color: '#FFF' },
  section: { marginBottom: '8px' },
  sectionTitle: { fontSize: '11px', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
  sectionDesc: { fontSize: '11px', color: '#555', marginBottom: '10px', lineHeight: '1.6' },
  evTotal: { fontSize: '12px', color: '#888', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' },
  evTotalBar: { flex: 1, height: '5px', background: '#2a2a3e', borderRadius: '3px', overflow: 'hidden' },
  evTotalFill: { height: '100%', background: '#667eea', borderRadius: '3px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  card: { background: '#2a2a3e', borderRadius: '10px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', border: '2px solid transparent' },
  cardOwned: { borderColor: '#3a3a6e' },
  cardEquipped: { borderColor: '#FF6B9D', background: '#2a1a2e' },
  emoji: { fontSize: '24px' },
  cardName: { fontSize: '12px', fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  cardDesc: { fontSize: '9px', color: '#666', textAlign: 'center', lineHeight: '1.3' },
  evLabel: { fontSize: '10px', color: '#888', marginTop: '2px' },
  evBar: { width: '100%', height: '4px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden' },
  evFill: { height: '100%', background: '#667eea', borderRadius: '2px' },
  remainLabel: { fontSize: '9px', color: '#4CAF50' },
  btn: { marginTop: '4px', padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '11px', width: '100%' },
  tmCard: { background: '#2a2a3e', borderRadius: '10px', padding: '10px 12px', border: '2px solid transparent' },
  tmOwned: { borderColor: '#2a4a2e' },
  toolEquipped: { borderColor: '#FF6B9D', background: '#2a1a2e' },
  tmHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
  tmNum: { fontSize: '10px', color: '#555', fontFamily: 'monospace' },
  tmEmoji: { fontSize: '18px' },
  tmName: { fontSize: '13px', color: '#fff', fontWeight: 'bold' },
  tmInfo: { display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' },
  tmType: { fontSize: '10px', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' },
  tmCat: { fontSize: '10px', color: '#666' },
  tmPower: { fontSize: '10px', color: '#888', marginLeft: 'auto' },
  ownedBadge: { fontSize: '11px', color: '#4CAF50', marginTop: '6px', textAlign: 'center' },
}
