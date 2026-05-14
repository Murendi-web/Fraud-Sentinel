import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api.js'
import { FraudWebSocket } from '../services/websocket.js'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [paused, setPaused]             = useState(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const fetchAll = useCallback(async () => {
    try {
      const [txns, s] = await Promise.all([api.listTransactions(1, 100), api.summary()])
      setTransactions(txns.items)
      setStats(s)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const ws = new FraudWebSocket(msg => {
      if (msg.type === 'NEW_TRANSACTION' && !pausedRef.current) {
        setTransactions(prev => [msg.data, ...prev].slice(0, 200))
        setStats(prev => prev ? ({
          ...prev,
          total_transactions: prev.total_transactions + 1,
          total_volume_zar: prev.total_volume_zar + msg.data.amount,
          flagged_count: prev.flagged_count + (msg.data.is_flagged ? 1 : 0),
          critical_count: prev.critical_count + (msg.data.risk_level === 'CRITICAL' ? 1 : 0),
        }) : prev)
      }
    })
    ws.connect()
    return () => ws.disconnect()
  }, [fetchAll])

  const analyzeTransaction = useCallback(async id => {
    const updated = await api.analyzeTransaction(id)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    const updated = await api.updateStatus(id, status)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  return { transactions, stats, loading, error, paused, setPaused,
           analyzeTransaction, updateStatus, refresh: fetchAll }
}
