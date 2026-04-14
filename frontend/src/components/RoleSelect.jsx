import './RoleSelect.css'


/* ===================== ROLE SELECT COMPONENT ===================== */

// shown once after login so the person can choose which view they need
function RoleSelect({ onSelect }) {
  return (
    <div className="sg-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/Logo.png" alt="SmartGuardian Logo" className="logo" />
            <div>
              <h1>SmartGuardian</h1>
              <p>How are you using this app?</p>
            </div>
          </div>
        </div>
      </header>

      <main className="roleselect-main">
        <button className="role-card" onClick={() => onSelect('user')}>
          <span className="role-card-title">I am a User</span>
          <span className="role-card-desc">View your health data, respond to fall alerts, and send emergency alerts.</span>
        </button>

        <button className="role-card" onClick={() => onSelect('caregiver')}>
          <span className="role-card-title">I am a Caregiver</span>
          <span className="role-card-desc">Monitor for alerts and respond when the person you care for needs help.</span>
        </button>
      </main>
    </div>
  )
}

export default RoleSelect