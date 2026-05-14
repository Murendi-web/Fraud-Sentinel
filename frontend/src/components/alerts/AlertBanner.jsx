import { C, fmtZAR } from '../../utils/theme.js'

export default function AlertBanner({ txn, onDismiss }) {
  return (
    <div style={{ background:`${C.danger}10`, border:`1px solid ${C.danger}50`,
      borderRadius:8, padding:'9px 14px', display:'flex', alignItems:'center',
      gap:10, marginBottom:6, animation:'slideIn .3s ease' }}>
      <span style={{ fontSize:15 }}>🚨</span>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:12, color:C.danger, fontWeight:700 }}>{txn.txn_ref}</span>
        <span style={{ fontSize:12, color:C.muted, marginLeft:8 }}>
          {txn.merchant} · {fmtZAR(txn.amount)} · Score: {txn.risk_score}
        </span>
      </div>
      <button onClick={() => onDismiss(txn.id)} style={{
        background:'none', border:'none', color:C.muted, fontSize:16 }}>✕</button>
    </div>
  )
}
