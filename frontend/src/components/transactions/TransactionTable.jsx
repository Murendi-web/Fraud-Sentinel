import { useState } from 'react'
import TransactionRow from './TransactionRow.jsx'
import { C } from '../../utils/theme.js'

const FILTERS = ['ALL','FLAGGED','CRITICAL','HIGH','MEDIUM','LOW']

export default function TransactionTable({ transactions, selected, onSelect }) {
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = transactions.filter(t => {
    const lvl = t.risk_level
    if (filter === 'FLAGGED'  && !t.is_flagged)                  return false
    if (['CRITICAL','HIGH','MEDIUM','LOW'].includes(filter) && lvl !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return t.txn_ref?.toLowerCase().includes(q) ||
             t.merchant?.toLowerCase().includes(q) ||
             t.user_id?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Toolbar */}
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`,
        display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ref, merchant, user…"
          style={{ flex:1, minWidth:140, background:C.card, border:`1px solid ${C.border}`,
            borderRadius:5, padding:'5px 9px', color:C.text, fontSize:11, outline:'none' }} />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'3px 9px', borderRadius:4, border:'none',
            background: filter===f ? `${C.accent}22` : C.card,
            color: filter===f ? C.accent : C.muted,
            fontSize:9, fontWeight:700, letterSpacing:.5,
          }}>{f}</button>
        ))}
        <span style={{ fontSize:10, color:C.muted }}>{filtered.length}</span>
      </div>

      {/* Header */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 0.8fr 80px 80px',
        gap:10, padding:'7px 16px', borderBottom:`1px solid ${C.border}`, background:C.panel }}>
        {['Transaction','Merchant','Amount','User','Level','Score'].map(h => (
          <div key={h} style={{ fontSize:9, color:C.muted, textTransform:'uppercase',
            letterSpacing:1.5, textAlign: ['Level','Score'].includes(h) ? 'center' : 'left' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflowY:'auto', flex:1 }}>
        {filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:12 }}>
            No transactions match the current filter.
          </div>
        ) : filtered.map(t => (
          <TransactionRow key={t.id} txn={t}
            onClick={onSelect} selected={selected?.id === t.id} />
        ))}
      </div>
    </div>
  )
}
