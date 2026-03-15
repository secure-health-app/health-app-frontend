import './Dashboard.css'
import { FaHeartbeat, FaCalendarAlt, FaPills, FaWalking, FaMoon, FaUser } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import fitbitService from '../services/fitbitService'
import alertService from '../services/alertService'

const ALERT_POLL_INTERVAL = 5000
const COUNTDOWN_SECONDS = 30
const FITBIT_REFRESH_INTERVAL = 1 * 60 * 1000  // 1 minute

function Dashboard({ onLogout, onNavigateToAppointments, onNavigateToMedications, onNavigateToSettings }) {

  const [activityMinutes, setActivityMinutes] = useState(null)
  const [steps, setSteps] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [restingHR, setRestingHR] = useState(null);
  const [heartRate, setHeartRate] = useState(null);
  const [caregiverMessage, setCaregiverMessage] = useState(null)

  // fall alert state
  const [activeAlert, setActiveAlert] = useState(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [alertLocation, setAlertLocation] = useState(null)

  const confirmedRef = useRef(false)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)

  const fetchHeartRate = async () => {
    try {
      const data = await fitbitService.getHeartRate()
      const resting = data?.["activities-heart"]?.[0]?.value?.restingHeartRate
      const current = data?.["activities-heart"]?.[0]?.value?.heartRateZones?.[0]?.max
      setHeartRate(current ?? resting ?? 'N/A')
      setRestingHR(resting ?? 'N/A')
    } catch (error) {
      if (error?.status === 401) {
        console.log("Fitbit not connected yet")
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

  const startAlert = (alertId) => {
    confirmedRef.current = false
    setActiveAlert({ alertId })
    setCountdown(COUNTDOWN_SECONDS)
    // grab GPS right away so it's ready if they confirm
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setAlertLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setAlertLocation(null)
      )
    }
  }

  const checkForAlerts = async () => {
    if (activeAlert) return
    try {
      const data = await alertService.getLatestPending()
      if (data.pending) startAlert(data.alertId)
    } catch {
      // silently ignore poll failures
    }
  }

  const checkCaregiverResponse = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/alerts/user/latest", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      const data = await res.json()

      if (!data.active) return

      if (data.status === "CAREGIVER_ON_THE_WAY") {
        setCaregiverMessage("Your caregiver is on the way.")
      }

      if (data.status === "EMERGENCY_SERVICES_CALLED") {
        setCaregiverMessage("Emergency services have been contacted.")
      }

    } catch { }
  }

  // user tapped "I'm Okay" - false alarm
  const handleCancel = async () => {
    clearInterval(countdownRef.current)
    if (activeAlert) {
      try { await alertService.cancelAlert(activeAlert.alertId) } catch { }
    }
    setActiveAlert(null)
  }

  // user tapped "Send Help" or countdown expired
  const handleConfirm = async () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    clearInterval(countdownRef.current)
    if (activeAlert) {
      try {
        await alertService.confirmAlert(activeAlert.alertId, {
          latitude: alertLocation?.latitude ?? null,
          longitude: alertLocation?.longitude ?? null,
          heartRate: typeof heartRate === 'number' ? heartRate : null,
          steps: typeof steps === 'number' ? steps : null
        })
      } catch { }
    }
    setActiveAlert(null)
  }

  // red SOS button - manual alert, skips countdown entirely
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

  // countdown ticker - auto-confirms when it hits 0
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
  }, [activeAlert])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fitbitRef = setInterval(() => {
      fetchActivityMinutes()
      fetchHeartRate()
      fetchSteps()
      fetchSleep()
    }, FITBIT_REFRESH_INTERVAL)

    return () => clearInterval(fitbitRef)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("fitbit") === "connected") {
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const token = localStorage.getItem("token")
    if (!token) return

    fetchActivityMinutes();
    fetchHeartRate();
    fetchSteps();
    fetchSleep();

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
          fetchHeartRate()
          fetchSteps()
          fetchSleep()
          fetchActivityMinutes()
        }
      }
    }

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      clearInterval(pollRef.current)
      clearInterval(countdownRef.current)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout && onLogout();
    }
  }

  return (
    <div className="dashboard">

      {/* thin red banner when a fall is detected */}
      {activeAlert && (
        <div className="fall-banner">
          <span className="fall-banner-text">Fall detected - scroll down to respond</span>
          <button className="fall-banner-dismiss" onClick={handleCancel}>I'm Okay</button>
        </div>
      )}

      {caregiverMessage && (
        <div className="caregiver-banner">
          ✔ Caregiver has acknowledged your alert
          <br />
          {caregiverMessage}
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

        {/* alert response card - only shown when a fall is pending */}
        {activeAlert && (
          <div className="alert-card">
            <div className="alert-card-header">
              <span className="alert-card-title">Fall Detected</span>
            </div>
            <p className="alert-card-body">
              A fall was detected by your device. Do you need help?
            </p>
            <div className="alert-countdown-bar-wrap">
              <div
                className="alert-countdown-bar"
                style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
              />
            </div>
            <p className="alert-countdown-text">
              Caregiver notified automatically in <strong>{countdown}s</strong> if no response
            </p>
            <div className="alert-card-buttons">
              <button className="alert-btn-okay" onClick={handleCancel}>I'm Okay</button>
              <button className="alert-btn-help" onClick={handleConfirm}>Send Help</button>
            </div>
          </div>
        )}
      </main>

      {/* two-button footer - no more emergency button here */}
      <footer className="dashboard-footer">
        <button className="footer-button" title="Appointments" onClick={onNavigateToAppointments}>
          <FaCalendarAlt className="button-icon" />
        </button>
        <button className="footer-button" title="Medications" onClick={onNavigateToMedications}>
          <FaPills className="button-icon" />
        </button>
      </footer>

    </div>
  )
}

export default Dashboard