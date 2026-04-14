import { useState } from 'react'
import './Appointments.css'
import { FaCalendarAlt, FaClock, FaUserMd, FaMapMarkerAlt, FaPlus, FaArrowLeft } from 'react-icons/fa'

/* ===================== APPOINTMENTS COMPONENT ===================== */

function Appointments({ onBack }) {
  const [view, setView] = useState('upcoming') // 'upcoming' | 'past'
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    doctor: '',
    specialty: '',
    location: '',
    type: '',
    notes: ''
  })

  // Mock appointment data - now using state
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 1,
      date: '2026-01-15',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      location: 'Heart Center Medical',
      type: 'Follow-up',
      notes: 'Review recent test results'
    },
    {
      id: 2,
      date: '2026-01-22',
      time: '2:30 PM',
      doctor: 'Dr. Michael Chen',
      specialty: 'General Practitioner',
      location: 'Wellness Clinic',
      type: 'Annual Check-up',
      notes: 'Routine health screening'
    }
  ])

  const pastAppointments = [
    {
      id: 3,
      date: '2025-12-10',
      time: '9:00 AM',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      location: 'Heart Center Medical',
      type: 'Consultation',
      notes: 'Initial consultation for heart monitoring',
      status: 'completed'
    },
    {
      id: 4,
      date: '2025-11-15',
      time: '11:30 AM',
      doctor: 'Dr. Emily Davis',
      specialty: 'Endocrinologist',
      location: 'Metabolic Health Center',
      type: 'Follow-up',
      notes: 'Diabetes management review',
      status: 'completed'
    }
  ]

  const handleScheduleNew = () => {
    setShowScheduleForm(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const newId = Math.max(...upcomingAppointments.map(a => a.id)) + 1
    const appointment = {
      id: newId,
      ...newAppointment
    }
    setUpcomingAppointments([...upcomingAppointments, appointment])
    setNewAppointment({
      date: '',
      time: '',
      doctor: '',
      specialty: '',
      location: '',
      type: '',
      notes: ''
    })
    setShowScheduleForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const appointments = view === 'upcoming' ? upcomingAppointments : pastAppointments

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={onBack} title="Back to Dashboard">
              <FaArrowLeft className="button-icon" />
            </button>
            <div>
              <h1>My Appointments</h1>
              <p>Manage your healthcare schedule</p>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main" style={{ paddingBottom: '20px' }}>
        <div className="appointments-container">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'upcoming' ? 'active' : ''}`}
              onClick={() => setView('upcoming')}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              className={`toggle-btn ${view === 'past' ? 'active' : ''}`}
              onClick={() => setView('past')}
            >
              Past ({pastAppointments.length})
            </button>
          </div>

          {/* Appointments List */}
          <div className="appointments-list">
            {appointments.length === 0 ? (
              <div className="no-appointments">
                <FaCalendarAlt className="no-appointments-icon" />
                <h3>No {view} appointments</h3>
                <p>{view === 'upcoming' ? 'Schedule your next appointment' : 'Your appointment history will appear here'}</p>
              </div>
            ) : (
              appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="appointment-date">
                      <FaCalendarAlt className="date-icon" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="appointment-time">
                      <FaClock className="time-icon" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="doctor-info">
                      <h4>{appointment.doctor}</h4>
                      <p className="specialty">{appointment.specialty}</p>
                    </div>

                    <div className="appointment-info">
                      <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{appointment.location}</span>
                      </div>
                      <div className="appointment-type">
                        <span className="type-badge">{appointment.type}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="appointment-notes">
                        <p><strong>Notes:</strong> {appointment.notes}</p>
                      </div>
                    )}

                    {view === 'upcoming' && (
                      <div className="appointment-actions">
                        <button className="action-btn secondary">Reschedule</button>
                        <button className="action-btn danger">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Schedule New Appointment Button */}
          {view === 'upcoming' && (
            <>
              {showScheduleForm && (
                <div className="schedule-form">
                  <h3>Schedule New Appointment</h3>
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={newAppointment.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={newAppointment.time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="doctor">Doctor</label>
                        <input
                          type="text"
                          id="doctor"
                          name="doctor"
                          value={newAppointment.doctor}
                          onChange={handleInputChange}
                          placeholder="Name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="specialty">Specialty</label>
                        <input
                          type="text"
                          id="specialty"
                          name="specialty"
                          value={newAppointment.specialty}
                          onChange={handleInputChange}

                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newAppointment.location}
                        onChange={handleInputChange}
                        placeholder="Medical Center Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="type">Appointment Type</label>
                      <select
                        id="type"
                        name="type"
                        value={newAppointment.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Annual Check-up">Annual Check-up</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="notes">Notes (optional)</label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={newAppointment.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes..."
                        rows="3"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowScheduleForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        Schedule Appointment
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="schedule-new">
                <button className="schedule-btn" onClick={handleScheduleNew}>
                  <FaPlus className="plus-icon" />
                  Schedule New Appointment
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Appointments