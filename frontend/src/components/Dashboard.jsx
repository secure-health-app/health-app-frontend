import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Welcome to Your Health Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card">
          <h3>Health Metrics</h3>
          <p>Track your vital signs, BMI, and more.</p>
        </div>
        <div className="card">
          <h3>Appointments</h3>
          <p>View and schedule your medical appointments.</p>
        </div>
        <div className="card">
          <h3>Medications</h3>
          <p>Manage your prescriptions and reminders.</p>
        </div>
        <div className="card">
          <h3>Reports</h3>
          <p>Access your medical reports and history.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard