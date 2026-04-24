# SmartGuardian Frontend

## Overview

This repository contains the React frontend for **SmartGuardian**, a final-year software development project focused on fall detection, wearable health monitoring, and emergency alerting.

The frontend provides dashboards for users and caregivers, displaying real-time alerts, Fitbit health metrics, and system status through a mobile-friendly Progressive Web App (PWA).

It connects securely to the Spring Boot backend API using JWT-authenticated REST requests.

---

## Application Preview

<img width="1000" alt="dashboard-preview" src="https://github.com/user-attachments/assets/bfd581c6-4119-4a55-b174-e4c4f8ec1bf1" />

---

## Features

- Real-time fall alert notifications  
- Fitbit health dashboard  
- Heart rate, sleep, and activity metrics  
- User and caregiver dashboard roles  
- Alert acknowledgement workflow  
- 30-second false alarm cancel countdown 
- Secure JWT login session  
- Pull-to-refresh health metrics  
- Mobile responsive interface  
- Progressive Web App (PWA) support

---

## Tech Stack

- React
- Vite
- JavaScript (JSX)
- CSS
- REST API Integration  
- Progressive Web App (PWA)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/secure-health-app/health-app-frontend.git
cd health-app-frontend/frontend
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://health-app-backend-icgv.onrender.com
```

The final prototype was connected to the deployed Render backend API.

### 4. Start Development Server

```bash
npm run dev
```
Runs locally on:

`http://localhost:5173`


## Production Build

```bash
npm run build
```

The final prototype frontend was connected to and tested against the deployed Render backend API.

## Running with Backend

Ensure the backend API is running locally or use the deployed backend URL.

Then start the frontend:

```bash
npm run dev
```

---

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

---

## Author
Louise Deeth

BSc (Hons) Software Development

Atlantic Technological University
