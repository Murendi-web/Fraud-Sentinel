import { useState, useEffect, useRef } from 'react'
import Header from './components/layout/Header.jsx'
import StatCard from './components/common/StatCard.jsx'
import AlertBanner from './components/alerts/AlertBanner.jsx'
import TransactionTable from './components/transactions/TransactionTable.jsx'
import DetailPanel from './components/transactions/DetailPanel.jsx'
import AnalyticsPanel from './components/analytics/AnalyticsPanel.jsx'
import { useTransactions } from './hooks/useTransactions.js'
import { C, fmtZAR, riskLevel } from './utils/theme.js'

export default function App() {
  const { transactions, stats, loading, error, paused, setPaused,
          analyzeTransaction, updateStatus } = useTransactions()

  const [selected,  setSelected]  = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [alerts,    setAlerts]    = useState([])
  const [tab,       setTab]       = useState('transactions')
  const [scoreHist, setScoreHist] = useState([])
  const [volHist,   setVolHist]   = useState([])
  const [flagHist,  setFlagHist]  = useState([])
  const prevCountRef = useRef(0)

  // Track new high-risk arrivals for alert banners
  useEffect(() => {
    if (transactions.length === 0) return
    const newest = transactions[0]
    if (transactions.length > prevCountRef.current && newest.risk_score >= 75) {
      setAlerts(prev => [newest, ...prev].slice(0, 4))
    }
    prevCountRef.current = transactions.length
    setScoreHist(h => [...h.slice(-29), newest.risk_score])
    setVolHist(h   => [...h.slice(-29), newest.amount / 1000])
    setFlagHist(h  => [...h.slice(-29), newest.is_flagged ? 1 : 0])
  }, [transactions])

  const handleAnalyze = async id => {
    setAnalyzing(true)
    try {
      const updated = await analyzeTransaction(id)
      setSelected(updated)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    const updated = await updateStatus(id, status)
    setSelected(updated)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:C.bg, color:C.muted, fontSize:13 }}>
      Initialising Fraud Sentinel…
    </div>
  )

  if (error) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', background:C.bg, color:C.danger, gap:12 }}>
      <div style={{ fontSize:24 }}>⚠ Connection Error</div>
      <div style={{ fontSize:13, color:C.muted }}>{error}</div>
      <div style={{ fontSize:12, color:C.muted }}>Make sure the backend is running on port 8000</div>
    </div>
  )

  const critical = transactions.filter(t => t.risk_level === 'CRITICAL').length

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      <Header tab={tab} setTab={setTab} paused={paused}
        setPaused={setPaused} criticalCount={critical} />

      <div style={{ padding:'18px 22px' }}>

        {/* Alert banners */}
        {alerts.length > 0 && (
          <div style={{ marginBottom:14 }}>
            {alerts.map(a => (
              <AlertBanner key={a.id} txn={a}
                onDismiss={id => setAlerts(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
          <StatCard label="Total Transactions"
            value={stats?.total_transactions ?? transactions.length}
            sub={`${fmtZAR(stats?.total_volume_zar ?? 0)} volume`}
            color={C.accent} spark={volHist} />
          <StatCard label="Flagged"
            value={stats?.flagged_count ?? 0}
            sub={`${stats?.flag_rate_pct ?? 0}% flag rate`}
            color={C.warn} spark={flagHist} />
          <StatCard label="Critical Alerts"
            value={stats?.critical_count ?? critical}
            sub="Score ≥ 80"
            color={C.danger} spark={scoreHist.map(s => s >= 80 ? 1 : 0)} />
          <StatCard label="Avg Risk Score"
            value={Math.round(stats?.avg_risk_score ?? 0)}
            sub="0 = safe · 99 = critical"
            color={C.warn} spark={scoreHist} />
        </div>

        {/* Main content */}
        {tab === 'transactions' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:14,
            height:'calc(100vh - 270px)' }}>
            <TransactionTable transactions={transactions}
              selected={selected} onSelect={setSelected} />
            <div style={{ background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:10, overflow:'hidden' }}>
              <DetailPanel txn={selected} onClose={() => setSelected(null)}
                onAnalyze={handleAnalyze} onStatusUpdate={handleStatusUpdate}
                analyzing={analyzing} />
            </div>
          </div>
        ) : (
          <AnalyticsPanel />
        )}
      </div>
    </div>
  )
}
