import './App.css'
import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Appointments from './components/Appointments'
import Medications from './components/Medications'
import CaregiverDashboard from './components/CaregiverDashboard'
import CaregiverSettings from './components/CaregiverSettings'
import RoleSelect from './components/RoleSelect'


/* ===================== APP COMPONENT ===================== */


// Root app controller for login state, role routing, and page navigation
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState(null)  // null | 'user' | 'caregiver'
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Restore login session and selected role after page refresh
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role')
    if (token) {
      setIsLoggedIn(true)
      if (savedRole) setRole(savedRole)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  // Clear saved session data and reset app state
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setIsLoggedIn(false)
    setRole(null)
    setCurrentPage('dashboard')
  }

  const handleRoleSelect = (selectedRole) => {
    // Persist role choice so user does not reselect after refresh
    localStorage.setItem('role', selectedRole)
    setRole(selectedRole)
  }

  // not logged in yet
  if (!isLoggedIn) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <Auth onLogin={handleLogin} />
      </div>
    )
  }

  // logged in but no role chosen yet - show the role selection screen
  if (!role) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <RoleSelect onSelect={handleRoleSelect} />
      </div>
    )
  }

  // caregiver goes straight to the caregiver dashboard
  if (role === 'caregiver') {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <CaregiverDashboard onLogout={handleLogout} />
      </div>
    )
  }

  // user navigation
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {currentPage === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
          onNavigateToAppointments={() => setCurrentPage('appointments')}
          onNavigateToMedications={() => setCurrentPage('medications')}
          onNavigateToSettings={() => setCurrentPage('settings')}
        />
      )}
      {currentPage === 'appointments' && (
        <Appointments onBack={() => setCurrentPage('dashboard')} />
      )}
      {currentPage === 'medications' && (
        <Medications onBack={() => setCurrentPage('dashboard')} />
      )}
      {currentPage === 'settings' && (
        <CaregiverSettings onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App