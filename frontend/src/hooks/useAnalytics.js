import { useState, useEffect } from 'react'
import { api } from '../services/api.js'

export function useAnalytics() {
  const [distribution, setDistribution] = useState([])
  const [merchants, setMerchants]       = useState([])
  const [locations, setLocations]       = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([api.riskDistribution(), api.merchantRisk(), api.locationRisk()])
      .then(([d, m, l]) => { setDistribution(d); setMerchants(m); setLocations(l) })
      .finally(() => setLoading(false))
  }, [])

  return { distribution, merchants, locations, loading }
}
