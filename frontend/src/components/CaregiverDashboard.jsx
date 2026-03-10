// caregiver's view - polls every 5s for alerts assigned to them
// shows a status card in the white body, flips to full red view when alert arrives

import { useState, useEffect, useRef } from 'react'
import { FaUser } from 'react-icons/fa'
import alertService from '../services/alertService'
import './CaregiverDashboard.css'

const POLL_INTERVAL = 5000

function CaregiverDashboard({ onLogout }) {

  const [activeAlert, setActiveAlert] = useState(null)
  const [responded, setResponded] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const pollRef = useRef(null)

  const checkForAlerts = async () => {
    try {
      const data = await alertService.getLatestConfirmed()
      setLastChecked(new Date().toLocaleTimeString())
      if (data.alert) {
        setActiveAlert(data.alert)
      }
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    checkForAlerts()
    pollRef.current = setInterval(checkForAlerts, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [])

  const handleRespond = async (action) => {
    if (activeAlert) {
      try { await alertService.resolveAlert(activeAlert.id) } catch { }
    }
    setResponded(true)
    setActiveAlert(null)
  }

  // full-screen red emergency view when an alert is active
  if (activeAlert) {
    return (
      <div className="cg-emergency">
        <div className="cg-emergency-ring" />
        <h2 className="cg-emergency-title">Alert</h2>
        <p className="cg-emergency-name">{activeAlert.userName} needs help</p>
        {activeAlert.latitude && (
          <a
            className="cg-emergency-map"
            href={`https://maps.google.com/?q=${activeAlert.latitude},${activeAlert.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            View Location
          </a>
        )}
        <div className="cg-emergency-buttons">
          <button className="cg-btn-onway" onClick={() => handleRespond('onway')}>
            I'm On My Way
          </button>
          <button className="cg-btn-emergency" onClick={() => handleRespond('emergency')}>
            Calling Emergency Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sg-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/Logo.png" alt="SmartGuardian Logo" className="logo" />
            <div>
              <h1>SmartGuardian</h1>
              <p>Caregiver Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="cg-main">
        {responded ? (
          <div className="cg-status-card cg-status-responded">
            <div className="cg-dot cg-dot-green" />
            <p className="cg-status-text">Response sent. Monitoring resumed.</p>
          </div>
        ) : (
          <div className="cg-status-card">
            <div className="cg-dot cg-dot-green cg-dot-pulse" />
            <p className="cg-status-text">Monitoring - no active alerts</p>
            {lastChecked && (
              <p className="cg-status-sub">Last checked: {lastChecked}</p>
            )}
          </div>
        )}

        <p className="cg-hint">
          Keep this page open. It will automatically show an alert if the person you care for needs help.
        </p>

        <button className="cg-logout-btn" onClick={onLogout}>Log out</button>
      </main>
    </div>
  )
}

export default CaregiverDashboard