import Sparkline from './Sparkline.jsx'
import { C } from '../../utils/theme.js'

export default function StatCard({ label, value, sub, color, spark }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'16px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, opacity:.45 }}>
        <Sparkline data={spark} color={color || C.accent} height={38} />
      </div>
      <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase',
        letterSpacing:1.5, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:color||C.text,
        fontFamily:'JetBrains Mono,monospace', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{sub}</div>}
    </div>
  )
}
