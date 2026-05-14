import { C, RISK_COLOR, RISK_BG, riskLevel, fmtZAR, fmtTime } from '../../utils/theme.js'

export default function TransactionRow({ txn, onClick, selected }) {
  const lvl   = riskLevel(txn.risk_score)
  const color = RISK_COLOR[lvl]
  return (
    <div onClick={() => onClick(txn)} style={{
      display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 0.8fr 80px 80px',
      gap:10, padding:'10px 16px', cursor:'pointer',
      background: selected ? `${color}08` : 'transparent',
      borderLeft:`3px solid ${selected ? color : 'transparent'}`,
      borderBottom:`1px solid ${C.border}`,
      transition:'background .15s',
    }}>
      <div>
        <div style={{ fontFamily:'monospace', fontSize:11, color:C.accent }}>{txn.txn_ref}</div>
        <div style={{ fontSize:10, color:C.muted }}>{fmtTime(txn.created_at)}</div>
      </div>
      <div>
        <div style={{ fontSize:12, color:C.text, fontWeight:600 }}>{txn.merchant}</div>
        <div style={{ fontSize:10, color:C.muted }}>{txn.location}</div>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmtZAR(txn.amount)}</div>
        <div style={{ fontSize:10, color:C.muted }}>{txn.card_type} {txn.card_number}</div>
      </div>
      <div style={{ fontSize:11, color:C.muted, alignSelf:'center' }}>{txn.user_id}</div>
      <div style={{ textAlign:'center', alignSelf:'center' }}>
        <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:4,
          background:RISK_BG[lvl], color, fontSize:9, fontWeight:700, letterSpacing:1 }}>
          {lvl}
        </span>
      </div>
      <div style={{ textAlign:'center', alignSelf:'center' }}>
        <div style={{ width:34, height:34, borderRadius:'50%',
          background:`${color}15`, border:`2px solid ${color}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto', color, fontSize:12, fontWeight:800, fontFamily:'monospace' }}>
          {txn.risk_score}
        </div>
      </div>
    </div>
  )
}
