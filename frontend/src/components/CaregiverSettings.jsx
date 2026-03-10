import { useState, useEffect } from 'react'
import './CaregiverSettings.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
})

function CaregiverSettings({ onBack, onLogout }) {

    const [caregiverEmail, setCaregiverEmail] = useState('')
    const [currentLinked, setCurrentLinked] = useState('')
    const [status, setStatus] = useState(null)  // 'success' | 'error' | null
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // load the currently linked caregiver when the screen opens
    useEffect(() => {
        const fetchLinked = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/alerts/caregiver-link`, {
                    headers: getAuthHeader()
                })
                const data = await res.json()
                if (data.linked) {
                    setCurrentLinked(data.caregiverUsername)
                    setCaregiverEmail(data.caregiverUsername)
                }
            } catch {
                // not a dealbreaker if this fails
            }
        }
        fetchLinked()
    }, [])

    const handleSave = async () => {
        if (!caregiverEmail.trim()) {
            setStatus('error')
            setMessage('Please enter an email address.')
            return
        }

        setLoading(true)
        setStatus(null)

        try {
            const res = await fetch(`${API_BASE}/api/alerts/caregiver-link`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ caregiverUsername: caregiverEmail.trim() })
            })
            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setMessage(`Linked to caregiver: ${caregiverEmail.trim()}`)
                setCurrentLinked(caregiverEmail.trim())
            } else {
                setStatus('error')
                // backend returns "No account found with that username" if the email doesn't exist
                setMessage(data.error || 'Something went wrong.')
            }
        } catch {
            setStatus('error')
            setMessage('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="sg-page">
            <div className="cs-header">
                <div className="cs-header-left">
                    <button className="cs-back" onClick={onBack}>&#8592;</button>
                    <img src="/Logo.png" alt="SmartGuardian Logo" />
                    <div>
                        <h1>SmartGuardian</h1>
                        <p>Caregiver Settings</p>
                    </div>
                </div>
            </div>

            <div className="cs-body">
                <p className="cs-description">
                    Enter the email address of the person who will monitor your alerts.
                    They need to have their own SmartGuardian account and log in as a Caregiver.
                </p>

                {currentLinked ? (
                    <div className="cs-current">
                        Currently linked to: <strong>{currentLinked}</strong>
                    </div>
                ) : (
                    <div className="cs-current cs-none">
                        No caregiver linked yet.
                    </div>
                )}

                <label className="cs-label" htmlFor="caregiverInput">
                    Caregiver email address
                </label>
                <input
                    id="caregiverInput"
                    className="cs-input"
                    type="email"
                    placeholder="Enter their email address"
                    value={caregiverEmail}
                    onChange={(e) => {
                        setCaregiverEmail(e.target.value)
                        setStatus(null)
                    }}
                />

                {status && (
                    <div className={`cs-message cs-${status}`}>
                        {message}
                    </div>
                )}

                <button className="cs-save" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </button>

                <button className="cs-logout" onClick={onLogout}>Log out</button>
            </div>
        </div>
    )
}

export default CaregiverSettings