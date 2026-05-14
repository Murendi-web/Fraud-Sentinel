export const C = {
  bg:'#0a0d14', surface:'#111622', panel:'#151c2c', card:'#0f1826',
  border:'#1e2a40', accent:'#00e5ff', danger:'#ff3b5c',
  warn:'#ffaa00', safe:'#00d68f', text:'#e4eaf5', muted:'#5a6a88',
}
export const RISK_COLOR = { LOW:C.safe, MEDIUM:C.warn, HIGH:C.danger, CRITICAL:'#ff0066' }
export const RISK_BG    = { LOW:'#00d68f14', MEDIUM:'#ffaa0014', HIGH:'#ff3b5c14', CRITICAL:'#ff006614' }
export const VERDICT_COLOR = { LEGITIMATE:C.safe, SUSPICIOUS:C.warn, FRAUDULENT:C.danger }
export const REC_COLOR     = { APPROVE:C.safe, REVIEW:C.warn, BLOCK:C.danger }

export const riskLevel = s => s < 30 ? 'LOW' : s < 60 ? 'MEDIUM' : s < 80 ? 'HIGH' : 'CRITICAL'
export const fmtZAR    = n => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',minimumFractionDigits:2}).format(n)
export const fmtTime   = d => new Date(d).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
export const fmtDate   = d => new Date(d).toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'})
