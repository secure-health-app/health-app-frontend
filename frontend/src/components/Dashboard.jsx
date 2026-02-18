import './Dashboard.css'
import { FaHeartbeat, FaCalendarAlt, FaPills, FaWalking, FaMoon, FaExclamationTriangle, FaUser } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import fitbitService from '../services/fitbitService'

function Dashboard({ onLogout, onNavigateToAppointments, onNavigateToMedications }) {

  const [heartRate, setHeartRate] = useState(null)  
  const [steps, setSteps] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [restingHR, setRestingHR] = useState(null);

  const fetchHeartRate = async () => {
  try {
    const data = await fitbitService.getHeartRate();
    const resting =
      data?.["activities-heart"]?.[0]?.value?.restingHeartRate;

    const current =
      data?.["activities-heart"]?.[0]?.value?.heartRateZones?.[0]?.max; 
    // fallback example if live HR not available

    setHeartRate(current ?? resting ?? 'N/A');
    setRestingHR(resting ?? 'N/A');
  } catch (error) {

 // If Fitbit not connected yet - send user to connect
if (error && (error.status === 500 || error.status === 401)) {
      const token = localStorage.getItem("token");

      window.location.href =
      "http://localhost:8080/api/auth/fitbit/connect?token=" + token;

      return;
    }

    console.error("Failed to fetch heart rate:", error);
    setHeartRate('N/A');
    setRestingHR('N/A');
  }
};

const fetchSteps = async () => {
  try {
    const data = await fitbitService.getSteps();
    const stepsValue =
      data?.summary?.steps ||
      data?.activities?.[0]?.steps;

    setSteps(stepsValue ?? 'N/A');
    console.log("STEPS RAW:", data);

  } catch (error) {
    setSteps('N/A');
  }
};

const fetchSleep = async () => {
  try {
    const data = await fitbitService.getSleep();
    const minutes = data?.sleep?.[0]?.minutesAsleep;

    if (!minutes) {
      setSleep('N/A');
      return;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    setSleep(`${hours}h ${mins}m`);
  } catch {
    setSleep('N/A');
  }
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("fitbit") === "connected") {
    window.history.replaceState({}, document.title, "/dashboard");
  }

  fetchHeartRate();
  fetchSteps();
  fetchSleep();

  let startY = 0;

  const onTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;

    // If user pulled down
    if (endY - startY > 120) {
      fetchHeartRate();
      fetchSteps();
      fetchSleep();
    }
  };

  window.addEventListener("touchstart", onTouchStart);
  window.addEventListener("touchend", onTouchEnd);

  return () => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
  };
}, []);

  const handleEmergency = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `Emergency Alert! Location: https://maps.google.com/?q=${latitude},${longitude}`;
          
          // For demo: open email client with location
          const email = 'emergency-contact@example.com'; // Replace with actual contact
          const subject = 'SmartGuardian Emergency Alert';
          const body = `URGENT: Emergency assistance requested.\n\nLocation: ${latitude}, ${longitude}\n\nGoogle Maps: https://maps.google.com/?q=${latitude},${longitude}`;
          
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          
          // Also show alert for immediate feedback
          alert('Emergency alert sent! Location shared with emergency contact.');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Emergency alert sent without location data.');
          
          // Still send email without location
          const email = 'emergency-contact@example.com';
          const subject = 'SmartGuardian Emergency Alert';
          const body = 'URGENT: Emergency assistance requested. Location unavailable.';
          
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
      );
    } else {
      alert('Geolocation not supported. Emergency alert sent.');
      
      const email = 'emergency-contact@example.com';
      const subject = 'SmartGuardian Emergency Alert';
      const body = 'URGENT: Emergency assistance requested. Geolocation not supported.';
      
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout && onLogout();
    }
  };

  return (
    <div className="dashboard">
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
            <button className="profile-button" title="Profile" onClick={handleLogout}>
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
                <span className="metric-value">{heartRate ?? '--'}</span>
                <span className="metric-unit">BPM</span>
                <span className="metric-label">Heart Rate</span>
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
      </main>
      
      <footer className="dashboard-footer">
        <button className="footer-button" title="Appointments" onClick={onNavigateToAppointments}>
          <FaCalendarAlt className="button-icon" />
        </button>
        <button className="footer-button assistance-button" title="Emergency Assistance" onClick={handleEmergency}>
          <FaExclamationTriangle className="button-icon" />
        </button>
        <button className="footer-button" title="Medications" onClick={onNavigateToMedications}>
          <FaPills className="button-icon" />
        </button>
      </footer>
    </div>
  )
}

export default Dashboard