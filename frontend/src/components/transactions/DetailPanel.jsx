import { useState } from 'react'
import RiskGauge from '../common/RiskGauge.jsx'
import { C, RISK_COLOR, VERDICT_COLOR, REC_COLOR, riskLevel, fmtZAR } from '../../utils/theme.js'

export default function DetailPanel({ txn, onClose, onAnalyze, onStatusUpdate, analyzing }) {
  const [note, setNote] = useState('')

  if (!txn) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100%', color:C.muted, gap:12 }}>
      <div style={{ fontSize:36, opacity:.2 }}>🔍</div>
      <div style={{ fontSize:12 }}>Select a transaction to inspect</div>
    </div>
  )

  const lvl   = riskLevel(txn.risk_score)
  const color = RISK_COLOR[lvl]
  const ai    = txn.ai_analysis
  const vc    = ai ? VERDICT_COLOR[ai.verdict]        : color
  const rc    = ai ? REC_COLOR[ai.recommendation]     : color

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color:C.accent, fontFamily:'monospace' }}>{txn.txn_ref}</div>
          <div style={{ fontSize:10, color:C.muted }}>{txn.user_id} · {txn.card_type} {txn.card_number}</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:18 }}>✕</button>
      </div>

      <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
        <RiskGauge score={txn.risk_score} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:14 }}>
        {[['Amount', fmtZAR(txn.amount)], ['Merchant', txn.merchant],
          ['Location', txn.location], ['Category', txn.merchant_category],
          ['Velocity', `${txn.velocity} txn/hr`], ['Status', txn.status],
        ].map(([k, v]) => (
          <div key={k} style={{ background:C.card, border:`1px solid ${C.border}`,
            borderRadius:6, padding:'7px 10px' }}>
            <div style={{ fontSize:9, color:C.muted, marginBottom:2,
              textTransform:'uppercase', letterSpacing:1 }}>{k}</div>
            <div style={{ fontSize:11, color:C.text, fontWeight:600, wordBreak:'break-all' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase',
          letterSpacing:1.5, marginBottom:7 }}>Risk Signals</div>
        {[
          ['Foreign Transaction', txn.is_foreign  ? 'YES' : 'NO',   txn.is_foreign],
          ['Night Transaction',   txn.is_night    ? 'YES' : 'NO',   txn.is_night],
          ['High-Risk Merchant',  txn.is_high_risk_merchant ? 'YES':'NO', txn.is_high_risk_merchant],
          ['Velocity / hr',       txn.velocity,                       txn.velocity > 8],
        ].map(([label, val, risky]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between',
            padding:'4px 0', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:11, color:C.muted }}>{label}</span>
            <span style={{ fontSize:11, fontWeight:700, color: risky ? C.danger : C.safe }}>{String(val)}</span>
          </div>
        ))}
      </div>

      {/* Status buttons */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1.5, marginBottom:7 }}>
          Update Status
        </div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional analyst note…"
          style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`,
            borderRadius:5, padding:'5px 8px', color:C.text, fontSize:11,
            outline:'none', marginBottom:7 }} />
        <div style={{ display:'flex', gap:6 }}>
          {[['APPROVE','APPROVED',C.safe],['REVIEW','REVIEWING',C.warn],['BLOCK','BLOCKED',C.danger]].map(([label,status,col]) => (
            <button key={label} onClick={() => onStatusUpdate(txn.id, status)} style={{
              flex:1, padding:'6px 0', borderRadius:5, border:`1px solid ${col}50`,
              background:`${col}10`, color:col, fontSize:10, fontWeight:700, letterSpacing:.5,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {!ai && (
        <button onClick={() => onAnalyze(txn.id)} disabled={analyzing} style={{
          width:'100%', padding:'10px 0', borderRadius:6,
          border:`1px solid ${C.accent}`, background: analyzing ? C.panel : `${C.accent}12`,
          color:C.accent, fontSize:11, fontWeight:700, letterSpacing:1,
          cursor: analyzing ? 'not-allowed' : 'pointer', marginBottom:10,
        }}>{analyzing ? '⟳ ANALYSING WITH AI…' : '⚡ ANALYSE WITH AI'}</button>
      )}

      {ai && (
        <div style={{ background:C.card, border:`1px solid ${vc}40`, borderRadius:8, padding:14 }}>
          <div style={{ fontSize:9, color:C.muted, letterSpacing:1.5, marginBottom:10 }}>AI ANALYSIS (Claude)</div>
          {[['Verdict', ai.verdict, vc], ['Confidence', `${ai.confidence}%`, vc]].map(([k,v,col]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:10, color:C.muted }}>{k}</span>
              <span style={{ fontWeight:800, color:col, fontSize:12 }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:10, color:C.muted }}>Recommendation</span>
            <span style={{ padding:'2px 10px', borderRadius:4,
              background:`${rc}20`, color:rc, fontSize:10, fontWeight:700 }}>{ai.recommendation}</span>
          </div>
          <div style={{ fontSize:11, color:C.text, lineHeight:1.65, marginBottom:10 }}>{ai.reasoning}</div>
          {ai.key_factors?.length > 0 && (
            <div>
              <div style={{ fontSize:9, color:C.muted, letterSpacing:1.5, marginBottom:5 }}>KEY FACTORS</div>
              {ai.key_factors.map((f, i) => (
                <div key={i} style={{ fontSize:10, color:C.accent, marginBottom:3 }}>▸ {f}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
