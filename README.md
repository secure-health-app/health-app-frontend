# SmartGuardian Frontend

## Overview

This frontend provides the user interface for the SmartGuardian system.  
It connects to the Spring Boot backend API to display fall alerts, Fitbit health metrics, and emergency notifications.  
The application is built as a Progressive Web App (PWA) to support mobile devices and offline capability.

---

## Features

- Real-time fall alerts
- Fitbit health data dashboard
- Heart rate and activity monitoring
- Emergency alert notifications
- Caregiver acknowledgement system
- Secure JWT authentication
- Mobile responsive PWA interface

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/secure-health-app/health-app-frontend.git
cd health-app-frontend/frontend
npm install
```

### Development Mode

```bash
npm run dev
```
Runs on:

http://localhost:5173


### Production

```bash
npm run build
```

## Running with Backend

Make sure the backend is running on:

http://localhost:8080

Then start the frontend:
```bash
npm run dev
```

### Tech Stack
- React
- Vite
- JavaScript (JSX)
- CSS
- REST API integration

## Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:8080
```

## Project Structure
```
frontend/
├── src/
├── components/
├── pages/
├── services/
├── App.jsx
└── main.jsx
```

## Author
Louise Deeth

BSc (Hons) Software Development

Atlantic Technological University
