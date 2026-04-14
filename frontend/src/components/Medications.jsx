import { useState } from 'react'
import './Medications.css'
import { FaPills, FaClock, FaPlus, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa'


/* ===================== MEDICATIONS COMPONENT ===================== */

function Medications({ onBack }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    instructions: ''
  })

  // Mock medication data
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      time: 'Morning',
      instructions: 'Take with food to prevent stomach upset',
      nextDose: '2026-01-10T08:00',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'As needed',
      time: 'As needed for pain',
      instructions: 'Take with food. Maximum 6 tablets per day',
      nextDose: '2026-01-10T08:00',
      status: 'active'
    },
    {
      id: 3,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      time: 'Morning',
      instructions: 'Take with fatty meal for better absorption',
      nextDose: '2026-01-09T20:00',
      status: 'taken'
    }
  ])

  const handleAddMedication = () => {
    setShowAddForm(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const newId = Math.max(...medications.map(m => m.id)) + 1
    const medication = {
      id: newId,
      ...newMedication,
      nextDose: '2026-01-10T08:00', // Default next dose
      status: 'active'
    }
    setMedications([...medications, medication])
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      instructions: ''
    })
    setShowAddForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMedication(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const markAsTaken = (id) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, status: 'taken' } : med
    ))
  }

  const deleteMedication = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      setMedications(medications.filter(med => med.id !== id))
    }
  }

  const getStatusIcon = (status) => {
    const getStatusInfo = (status) => {
      switch (status) {
        case 'taken':
          return { icon: <FaCheckCircle />, label: 'Taken', className: 'taken' }
        case 'active':
          return { icon: <FaExclamationTriangle />, label: 'Due', className: 'due' }
        case 'overdue':
          return { icon: <FaExclamationTriangle />, label: 'Overdue', className: 'overdue' }
        default:
          return { icon: <FaExclamationTriangle />, label: 'Due', className: 'due' }
      }
    }

    const { icon, label, className } = getStatusInfo(status)
    return (
      <span className={`status ${className}`}>
        {icon}
        <span className="status-text">{label}</span>
      </span>
    )
  }

  const formatTime = (timeString) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
              <h1>My Medications</h1>
              <p>Track your medication schedule</p>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main" style={{ paddingBottom: '20px' }}>
        <div className="medications-container">
          {/* Medications List */}
          <div className="medications-list">
            {medications.length === 0 ? (
              <div className="no-medications">
                <FaPills className="no-medications-icon" />
                <h3>No medications</h3>
                <p>Add your medications to start tracking</p>
              </div>
            ) : (
              medications.map(medication => (
                <div key={medication.id} className="medication-card">
                  <div className="medication-header">
                    <div className="medication-name">
                      <FaPills className="medication-icon" />
                      <h4>{medication.name}</h4>
                      {getStatusIcon(medication.status)}
                    </div>
                    <div className="medication-header-right">
                      <div className="medication-dosage">
                        <span className="dosage-badge">{medication.dosage}</span>
                      </div>
                      <button className="delete-btn" onClick={() => deleteMedication(medication.id)} title="Delete medication">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="medication-details">
                    <div className="medication-next-dose card-section">
                      <p><strong>Next dose:</strong> {formatTime(medication.nextDose)}</p>
                    </div>

                    {medication.instructions && (
                      <div className="medication-instructions card-section">
                        <p>{medication.instructions}</p>
                      </div>
                    )}

                    <div className="medication-info card-section">
                      <div className="info-item">
                        <FaClock className="info-icon" />
                        <span>{medication.frequency} - {medication.time}</span>
                      </div>
                    </div>

                    {medication.status === 'active' && (
                      <div className="medication-actions card-section">
                        <button className="action-btn primary" onClick={() => markAsTaken(medication.id)}>
                          Mark as Taken
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Medication Form */}
          {showAddForm && (
            <div className="schedule-form">
              <h3>Add New Medication</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Medication Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newMedication.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Lisinopril"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dosage">Dosage</label>
                    <input
                      type="text"
                      id="dosage"
                      name="dosage"
                      value={newMedication.dosage}
                      onChange={handleInputChange}
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="frequency">Frequency</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={newMedication.frequency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Time</label>
                    <input
                      type="text"
                      id="time"
                      name="time"
                      value={newMedication.time}
                      onChange={handleInputChange}
                      placeholder="e.g., Morning, Evening"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="instructions">Instructions (optional)</label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    value={newMedication.instructions}
                    onChange={handleInputChange}
                    placeholder="Special instructions..."
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Medication
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Medication Button */}
          <div className="schedule-new">
            <button className="schedule-btn" onClick={handleAddMedication}>
              <FaPlus className="plus-icon" />
              Add Medication
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Medications