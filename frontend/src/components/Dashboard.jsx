import './Dashboard.css'
import { FaHeartbeat, FaCalendarAlt, FaPills, FaWalking, FaMoon, FaUser } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import fitbitService from '../services/fitbitService'
import alertService from '../services/alertService'

const ALERT_POLL_INTERVAL = 5000
const COUNTDOWN_SECONDS = 30
const FITBIT_REFRESH_INTERVAL = 1 * 60 * 1000

function Dashboard({ onLogout, onNavigateToAppointments, onNavigateToMedications, onNavigateToSettings }) {

  const [activityMinutes, setActivityMinutes] = useState(null)
  const [steps, setSteps] = useState(null)
  const [sleep, setSleep] = useState(null)
  const [restingHR, setRestingHR] = useState(null)
  const [heartRate, setHeartRate] = useState(null)
  const [caregiverMessage, setCaregiverMessage] = useState(null)
  const [messageShown, setMessageShown] = useState(false)

  const [activeAlert, setActiveAlert] = useState(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [alertLocation, setAlertLocation] = useState(null)

  const confirmedRef = useRef(false)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)
  // ref mirror of activeAlert - fixes stale closure in poll interval
  const activeAlertRef = useRef(null)

  // Fitbit 

  const fetchHeartRate = async () => {
    try {
      const data = await fitbitService.getHeartRate()
      const resting = data?.["activities-heart"]?.[0]?.value?.restingHeartRate
      const current = data?.["activities-heart"]?.[0]?.value?.heartRateZones?.[0]?.max
      setHeartRate(current ?? resting ?? 'N/A')
      setRestingHR(resting ?? 'N/A')
    } catch (error) {
      if (error?.status === 401) {
        setHeartRate("Pull to connect")
        return
      }
      setHeartRate('N/A')
      setRestingHR('N/A')
    }
  }

  const fetchSteps = async () => {
    try {
      const data = await fitbitService.getSteps()
      setSteps((data?.summary?.steps || data?.activities?.[0]?.steps) ?? 'N/A')
    } catch {
      setSteps('N/A')
    }
  }

  const fetchSleep = async () => {
    try {
      const data = await fitbitService.getSleep()
      const minutes = data?.sleep?.[0]?.minutesAsleep
      if (!minutes) { setSleep('N/A'); return }
      setSleep(`${Math.floor(minutes / 60)}h ${minutes % 60}m`)
    } catch {
      setSleep('N/A')
    }
  }

  const fetchActivityMinutes = async () => {
    try {
      const data = await fitbitService.getSteps()
      const minutes = data?.summary?.veryActiveMinutes ?? data?.summary?.fairlyActiveMinutes ?? 'N/A'
      setActivityMinutes(minutes)
    } catch {
      setActivityMinutes('N/A')
    }
  }

  // Alert logic 

  const startAlert = (alertId) => {
    confirmedRef.current = false
    const alert = { alertId }
    activeAlertRef.current = alert
    setActiveAlert(alert)
    setCountdown(COUNTDOWN_SECONDS)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setAlertLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setAlertLocation(null)
      )
    }
  }

  const checkForAlerts = async () => {
    if (activeAlertRef.current) return  // ref - never stale
    try {
      const data = await alertService.getLatestPending()
      if (data.pending) startAlert(data.alertId)
    } catch { }
  }

  const checkCaregiverResponse = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/alerts/user/latest", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (!data.active) return

      if (data.status === "CAREGIVER_ON_THE_WAY" && !data.seenByUser && !messageShown) {
        setCaregiverMessage("Your caregiver is on the way.")
        setMessageShown(true)
        fetch(`http://localhost:8080/api/alerts/user/${data.alertId}/mark-seen`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      }

      if (data.status === "EMERGENCY_SERVICES_CALLED" && !data.seenByUser) {
        setCaregiverMessage("Emergency services have been contacted.")
        fetch(`http://localhost:8080/api/alerts/user/${data.alertId}/mark-seen`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      }
    } catch { }
  }

  const handleCancel = async () => {
    clearInterval(countdownRef.current)
    const alert = activeAlertRef.current
    activeAlertRef.current = null
    setActiveAlert(null)
    if (alert) {
      try { await alertService.cancelAlert(alert.alertId) } catch { }
    }
  }

  const handleConfirm = async () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    clearInterval(countdownRef.current)
    const alert = activeAlertRef.current
    activeAlertRef.current = null
    setActiveAlert(null)
    if (alert) {
      try {
        await alertService.confirmAlert(alert.alertId, {
          latitude: alertLocation?.latitude ?? null,
          longitude: alertLocation?.longitude ?? null,
          heartRate: typeof heartRate === 'number' ? heartRate : null,
          steps: typeof steps === 'number' ? steps : null
        })
      } catch { }
    }
  }

  const handleSOS = () => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          await alertService.createManualAlert({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            heartRate: typeof heartRate === 'number' ? heartRate : null,
            steps: typeof steps === 'number' ? steps : null
          })
        } catch { }
      },
      async () => {
        try { await alertService.createManualAlert({}) } catch { }
      }
    )
  }

  // countdown - keyed on alertId to avoid restart on re-render
  useEffect(() => {
    if (!activeAlert) return
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          handleConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [activeAlert?.alertId])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const fitbitRef = setInterval(() => {
      fetchActivityMinutes(); fetchHeartRate(); fetchSteps(); fetchSleep()
    }, FITBIT_REFRESH_INTERVAL)
    return () => clearInterval(fitbitRef)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("fitbit") === "connected") {
      window.history.replaceState({}, document.title, "/dashboard")
    }

    const token = localStorage.getItem("token")
    if (!token) return

    fetchActivityMinutes(); fetchHeartRate(); fetchSteps(); fetchSleep()

    pollRef.current = setInterval(() => {
      checkForAlerts()
      checkCaregiverResponse()
    }, ALERT_POLL_INTERVAL)

    let startY = 0
    const onTouchStart = (e) => { startY = e.touches[0].clientY }
    const onTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY
      if (endY - startY > 120) {
        const token = localStorage.getItem("token")
        if (heartRate === "Pull to connect") {
          window.location.href = "http://localhost:8080/api/auth/fitbit/connect?token=" + token
        } else {
          fetchHeartRate(); fetchSteps(); fetchSleep(); fetchActivityMinutes()
        }
      }
    }

    window.addEventListener("touchstart", onTouchStart)
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      clearInterval(pollRef.current)
      clearInterval(countdownRef.current)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  return (
    <div className="dashboard">

      {caregiverMessage && !activeAlert && (
        <div className="caregiver-banner">
          <div className="caregiver-banner-text">
            Caregiver has acknowledged your alert
            <br />
            {caregiverMessage}
          </div>
          <button className="caregiver-dismiss-btn" onClick={() => setCaregiverMessage(null)}>
            OK
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/Logo.png" alt="SmartGuardian Logo" className="logo" />
            <div>
              <h1>SmartGuardian</h1>
              <p>Your Personal Health Companion</p>
            </div>
          </div>
          <div className="header-right">
            <button className="profile-button" title="Profile" onClick={onNavigateToSettings}>
              <FaUser className="button-icon" />
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="health-metrics">
          <h2>Today's Health Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-info">
                <FaHeartbeat className="metric-icon" />
                <span className="metric-value">{activityMinutes ?? '--'}</span>
                <span className="metric-unit">min</span>
                <span className="metric-label">Activity Minutes</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-info">
                <FaWalking className="metric-icon" />
                <span className="metric-value">{steps ?? '--'}</span>
                <span className="metric-unit">steps</span>
                <span className="metric-label">Daily Steps</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-info">
                <FaMoon className="metric-icon" />
                <span className="metric-value">{sleep ?? '--'}</span>
                <span className="metric-unit">last night</span>
                <span className="metric-label">Sleep</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-info">
                <FaHeartbeat className="metric-icon" />
                <span className="metric-value">{restingHR ?? '--'}</span>
                <span className="metric-unit">BPM</span>
                <span className="metric-label">Resting Heart Rate</span>
              </div>
            </div>
          </div>
        </div>

        <button className="sos-button" onClick={handleSOS} title="Send Emergency Alert">
          SOS
        </button>
      </main>

      <footer className="dashboard-footer">
        <button className="footer-button" title="Appointments" onClick={onNavigateToAppointments}>
          <FaCalendarAlt className="button-icon" />
        </button>
        <button className="footer-button" title="Medications" onClick={onNavigateToMedications}>
          <FaPills className="button-icon" />
        </button>
      </footer>

      {/* modal overlay — appears centred over the whole screen, no scrolling needed */}
      {activeAlert && (
        <div className="fall-modal-overlay">
          <div className="fall-modal">
            <div className="fall-modal-icon">!</div>
            <h2 className="fall-modal-title">Fall Detected</h2>
            <p className="fall-modal-body">
              A fall was detected by your device. Do you need help?
            </p>
            <div className="fall-modal-bar-wrap">
              <div
                className="fall-modal-bar"
                style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
              />
            </div>
            <p className="fall-modal-countdown">
              Help sent automatically in <strong>{countdown}s</strong>
            </p>
            <div className="fall-modal-buttons">
              <button className="fall-btn-okay" onClick={handleCancel}>I'm Okay</button>
              <button className="fall-btn-help" onClick={handleConfirm}>Send Help</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard