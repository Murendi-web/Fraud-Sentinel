import { useAnalytics } from '../../hooks/useAnalytics.js'
import Sparkline from '../common/Sparkline.jsx'
import { C, RISK_COLOR, RISK_BG, riskLevel, fmtZAR } from '../../utils/theme.js'

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:C.text }}>{label}</span>
        <span style={{ fontSize:11, color:C.muted }}>{value}</span>
      </div>
      <div style={{ height:5, background:C.border, borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color,
          borderRadius:3, transition:'width .5s',
          boxShadow:`0 0 8px ${color}60` }} />
      </div>
    </div>
  )
}

export default function AnalyticsPanel() {
  const { distribution, merchants, locations, loading } = useAnalytics()
  if (loading) return <div style={{ padding:40, textAlign:'center', color:C.muted }}>Loading analytics…</div>

  const maxMerchantScore = Math.max(...merchants.map(m => m.avg_risk_score), 1)

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

      {/* Risk Distribution */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:16, textTransform:'uppercase' }}>
          Risk Distribution
        </div>
        {distribution.map(d => (
          <div key={d.level} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:11, color:RISK_COLOR[d.level] }}>{d.level}</span>
              <span style={{ fontSize:11, color:C.muted }}>{d.count} ({d.percentage}%)</span>
            </div>
            <div style={{ height:6, background:C.border, borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${d.percentage}%`,
                background:RISK_COLOR[d.level], borderRadius:3,
                boxShadow:`0 0 8px ${RISK_COLOR[d.level]}60`, transition:'width .5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Merchant Risk */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:16, textTransform:'uppercase' }}>
          Top Merchant Risk
        </div>
        {merchants.slice(0,8).map((m, i) => {
          const lvl   = riskLevel(m.avg_risk_score)
          const color = RISK_COLOR[lvl]
          return (
            <div key={m.merchant} style={{ display:'flex', alignItems:'center',
              gap:9, marginBottom:9, paddingBottom:9, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:10, color:C.muted, width:14 }}>#{i+1}</span>
              <span style={{ flex:1, fontSize:11, color:C.text, overflow:'hidden',
                textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.merchant}</span>
              <span style={{ fontSize:10, color:C.muted }}>{m.transaction_count} txn</span>
              <span style={{ fontSize:11, fontWeight:800, color, fontFamily:'monospace',
                width:28, textAlign:'right' }}>{Math.round(m.avg_risk_score)}</span>
            </div>
          )
        })}
      </div>

      {/* Location Risk */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20, gridColumn:'span 2' }}>
        <div style={{ fontSize:11, color:C.muted, letterSpacing:1.5, marginBottom:16, textTransform:'uppercase' }}>
          Geographic Risk
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:9 }}>
          {locations.map(l => {
            const lvl   = riskLevel(l.avg_risk_score)
            const color = RISK_COLOR[lvl]
            return (
              <div key={l.location} style={{ background:RISK_BG[lvl],
                border:`1px solid ${color}30`, borderRadius:7, padding:'8px 12px',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:11, color:C.text }}>{l.location}</div>
                  <div style={{ fontSize:9, color:C.muted }}>{l.transaction_count} txns · {l.flagged_count} flagged</div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color, fontFamily:'monospace' }}>
                  {Math.round(l.avg_risk_score)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
