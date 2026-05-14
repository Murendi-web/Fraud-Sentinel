const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Transactions
  listTransactions: (page=1, pageSize=50, filter='', search='') => {
    const params = new URLSearchParams({ page, page_size: pageSize })
    if (filter === 'FLAGGED') params.set('flagged_only', 'true')
    else if (filter && filter !== 'ALL') params.set('risk_level', filter)
    if (search) params.set('search', search)
    return req(`/api/transactions?${params}`)
  },
  getTransaction: id => req(`/api/transactions/${id}`),
  createTransaction: data => req('/api/transactions', { method:'POST', body:JSON.stringify(data) }),
  analyzeTransaction: id => req(`/api/transactions/${id}/analyze`, { method:'POST' }),
  updateStatus: (id, status) => req(`/api/transactions/${id}/status?status=${status}`, { method:'PATCH' }),

  // Analytics
  summary: () => req('/api/analytics/summary'),
  riskDistribution: () => req('/api/analytics/risk-distribution'),
  merchantRisk: () => req('/api/analytics/merchant-risk'),
  locationRisk: () => req('/api/analytics/location-risk'),

  // Health
  health: () => fetch(`${BASE}/health`).then(r => r.json()),
}
