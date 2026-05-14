import { RISK_COLOR } from '../../utils/theme.js'

export default function RiskGauge({ score = 0 }) {
  const lvl = score < 30 ? 'LOW' : score < 60 ? 'MEDIUM' : score < 80 ? 'HIGH' : 'CRITICAL'
  const color = RISK_COLOR[lvl]
  const r = 42, cx = 54, cy = 54
  const toXY = deg => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  })
  const start = toXY(-180)
  const angle = (score / 100) * 180 - 90
  const end   = toXY(angle - 90)
  const large = score > 50 ? 1 : 0
  return (
    <svg width={108} height={62} viewBox="0 0 108 62">
      <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1e2a40" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={cx} y={cy - 7} textAnchor="middle" fill={color}
        fontSize="16" fontWeight="800" fontFamily="JetBrains Mono,monospace">{score}</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fill="#5a6a88"
        fontSize="7" fontFamily="JetBrains Mono,monospace">{lvl} RISK</text>
    </svg>
  )
}
