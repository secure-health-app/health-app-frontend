const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
})

const alertService = {

  // User dashboard polls this every 5s for Pi-detected falls
  getLatestPending: async () => {
    const res = await fetch(`${API_BASE}/api/alerts/fall/latest`, { headers: getAuthHeader() })
    if (!res.ok) throw new Error('Poll failed')
    return res.json()
  },

  // User says false alarm
  cancelAlert: async (alertId) => {
    const res = await fetch(`${API_BASE}/api/alerts/fall/${alertId}/cancel`, {
      method: 'POST', headers: getAuthHeader()
    })
    if (!res.ok) throw new Error('Cancel failed')
    return res.json()
  },

  // User confirms they need help - moves alert to CONFIRMED
  // caregiver view will pick it up on their next poll
  confirmAlert: async (alertId, { latitude, longitude, heartRate, steps }) => {
    const res = await fetch(`${API_BASE}/api/alerts/fall/${alertId}/confirm`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ latitude, longitude, heartRate, steps })
    })
    if (!res.ok) throw new Error('Confirm failed')
    return res.json()
  },

  // User pressed SOS manually - goes straight to CONFIRMED, no countdown
  createManualAlert: async ({ latitude, longitude, heartRate, steps } = {}) => {
    const res = await fetch(`${API_BASE}/api/alerts/manual`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ latitude, longitude, heartRate, steps })
    })
    if (!res.ok) throw new Error('Manual alert failed')
    return res.json()
  },

  // Caregiver dashboard polls this every 5s for CONFIRMED alerts
  getLatestConfirmed: async () => {
    const res = await fetch(`${API_BASE}/api/alerts/caregiver/latest`, { headers: getAuthHeader() })
    if (!res.ok) throw new Error('Caregiver poll failed')
    return res.json()
  },

  // Caregiver tapped a response button - marks alert as resolved so it stops showing
  resolveAlert: async (alertId) => {
    const res = await fetch(`${API_BASE}/api/alerts/caregiver/${alertId}/resolve`, {
      method: 'POST', headers: getAuthHeader()
    })
    if (!res.ok) throw new Error('Resolve failed')
    return res.json()
  }
}

export default alertService