import { C } from '../../utils/theme.js'

export default function Header({ tab, setTab, paused, setPaused, criticalCount }) {
  return (
    <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
      padding:'0 24px', display:'flex', alignItems:'center', height:56, gap:18,
      position:'sticky', top:0, zIndex:100 }}>

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, background:`${C.danger}18`,
          border:`2px solid ${C.danger}`, borderRadius:8, display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:15,
          animation: criticalCount > 0 ? 'blink 2s infinite' : 'none' }}>⚠</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:C.text, letterSpacing:.5,
            fontFamily:"'Syne',sans-serif" }}>FRAUD SENTINEL</div>
          <div style={{ fontSize:8, color:C.muted, letterSpacing:2 }}>AI-POWERED · ZAR · SOUTH AFRICA</div>
        </div>
      </div>

      <div style={{ flex:1 }} />

      <div style={{ display:'flex', gap:3 }}>
        {['transactions','analytics'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'5px 13px', borderRadius:5, border:'none',
            background: tab===t ? `${C.accent}18` : 'transparent',
            color: tab===t ? C.accent : C.muted,
            fontSize:10, fontWeight:700, letterSpacing:.5,
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11 }}>
        <div style={{ width:7, height:7, borderRadius:'50%',
          background: paused ? C.warn : C.safe,
          animation: paused ? 'none' : 'pulse 1.5s infinite' }} />
        <span style={{ color:C.muted }}>{paused ? 'PAUSED' : 'LIVE'}</span>
      </div>

      <button onClick={() => setPaused(p => !p)} style={{
        padding:'5px 12px', borderRadius:5, border:`1px solid ${C.border}`,
        background:'transparent', color:C.muted, fontSize:10,
      }}>{paused ? '▶ RESUME' : '⏸ PAUSE'}</button>
    </header>
  )
}
