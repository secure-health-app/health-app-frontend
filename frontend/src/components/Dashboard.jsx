import './Dashboard.css'
import { FaHeartbeat, FaCalendarAlt, FaPills, FaWalking, FaThermometerHalf, FaMoon, FaLungs, FaTint, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

function Dashboard() {
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/Logo.png" alt="SmartGuardian Logo" className="logo" />
          <div>
            <h1>SmartGuardian</h1>
            <p>Your Personal Health Companion</p>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="health-metrics">
          <h2>Today's Health Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <FaHeartbeat className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">72</span>
                <span className="metric-unit">BPM</span>
                <span className="metric-label">Heart Rate</span>
              </div>
            </div>
            <div className="metric-card">
              <FaWalking className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">8,432</span>
                <span className="metric-unit">steps</span>
                <span className="metric-label">Daily Steps</span>
              </div>
            </div>
            <div className="metric-card">
              <FaMoon className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">8h 30m</span>
                <span className="metric-unit">last night</span>
                <span className="metric-label">Sleep</span>
              </div>
            </div>
            <div className="metric-card">
              <FaLungs className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">16</span>
                <span className="metric-unit">breaths/min</span>
                <span className="metric-label">Breathing Rate</span>
              </div>
            </div>
            <div className="metric-card">
              <FaTint className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">98</span>
                <span className="metric-unit">%</span>
                <span className="metric-label">Blood Oxygen</span>
              </div>
            </div>
            <div className="metric-card">
              <FaHeartbeat className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">65</span>
                <span className="metric-unit">BPM</span>
                <span className="metric-label">Resting Heart Rate</span>
              </div>
            </div>
            <div className="metric-card">
              <FaChartLine className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">45</span>
                <span className="metric-unit">ms</span>
                <span className="metric-label">Heart Rate Variability</span>
              </div>
            </div>
            <div className="metric-card">
              <FaThermometerHalf className="metric-icon" />
              <div className="metric-info">
                <span className="metric-value">±0.3</span>
                <span className="metric-unit">°C</span>
                <span className="metric-label">Skin Temp Variation</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <button className="footer-button" title="Appointments">
          <FaCalendarAlt className="button-icon" />
        </button>
        <button className="footer-button assistance-button" title="Emergency Assistance" onClick={handleEmergency}>
          <FaExclamationTriangle className="button-icon" />
        </button>
        <button className="footer-button" title="Medications">
          <FaPills className="button-icon" />
        </button>
      </footer>
    </div>
  )
}

export default Dashboard