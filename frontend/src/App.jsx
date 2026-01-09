import './App.css'
import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Appointments from './components/Appointments'
import Medications from './components/Medications'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard' | 'appointments' | 'medications'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    } else {
      // For development/demo purposes, auto-login
      localStorage.setItem('token', 'demo-token')
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setCurrentPage('dashboard')
  }

  const navigateToAppointments = () => {
    setCurrentPage('appointments')
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
  }

  const navigateToMedications = () => {
    setCurrentPage('medications')
  }

  if (!isLoggedIn) {
    return (
      <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Auth onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}>
      {currentPage === 'dashboard' ? (
        <Dashboard onLogout={handleLogout} onNavigateToAppointments={navigateToAppointments} onNavigateToMedications={navigateToMedications} />
      ) : currentPage === 'appointments' ? (
        <Appointments onBack={navigateToDashboard} />
      ) : (
        <Medications onBack={navigateToDashboard} />
      )}
    </div>
  )
}

export default App
