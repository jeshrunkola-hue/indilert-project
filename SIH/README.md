# IndiLert — Landslide Early Warning & Disaster Response System

**IndiLert** is an advanced IoT, AI, and GIS-powered early warning and disaster response system designed to predict landslides, monitor terrain stability in real time, and swiftly broadcast emergency alerts to vulnerable populations.

It features a full-stack architecture with a scalable backend API, an administrative command center dashboard, and a mobile-responsive citizen application for receiving life-saving alerts.

---

## 🌟 Key Features
- **Predictive AI Modeling**: Utilizes terrain and meteorological data to forecast landslide risks.
- **Real-Time IoT Sensor Integration**: Monitors soil moisture, ground movement, and rainfall.
- **Admin Command Center**: Visualizes predictive data, manages alerts, and tracks citizen reports.
- **Citizen Safety Application**: Receives localized alerts, safe-zone navigation, and enables reporting of ground conditions to authorities.
- **Automated Alerting**: Zero-latency emergency push notifications via WebSocket integration.

---

## 🛠 Tech Stack
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Scikit-Learn (ML Models), SQLite
- **Admin Dashboard**: React, Vite, Tailwind CSS, Leaflet Maps, TypeScript
- **Citizen App**: Next.js (React), Tailwind CSS, Leaflet Maps, TypeScript

---

## 🚀 Getting Started (Automated Installation)

We have provided a cross-platform, automated startup script that handles all dependency installations and launches all three services concurrently. It runs flawlessly on **Windows**, **macOS**, and **Ubuntu**.

### Prerequisites
1. **Python 3.10+**
2. **Node.js (v20+)** and **npm**

### Quick Start
1. Clone the repository and navigate to the root directory:
   ```bash
   git clone <repository_url>
   cd SIH
   ```
2. Run the automated startup script:
   ```bash
   # On Windows, macOS, or Ubuntu
   python start_indilert.py
   # Or if your environment defaults to python3:
   python3 start_indilert.py
   ```

The script will automatically:
- Check for required tools (`npm`, `python`).
- Create an isolated Python Virtual Environment (`venv`) for the backend.
- Install backend dependencies from `requirements.txt`.
- Install frontend dependencies for both the Admin and Citizen apps via `npm install`.
- Boot all 3 services concurrently and display their access URLs.

Press `Ctrl+C` in the terminal to cleanly shut down all services.

---

## 🏗 System Architecture & Manual Execution

If you prefer to run the components manually in separate terminals, follow these instructions:

### 1. Backend API (FastAPI)
The backend manages data processing, AI inference, and database interactions.
```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
**Access**: `http://127.0.0.1:8000`

### 2. Admin Dashboard (React + Vite)
The command center for emergency operators.
```bash
cd indilert-admin
npm install
npm run dev
```
**Access**: `http://localhost:5173`

### 3. Citizen Application (Next.js)
The mobile-first portal for end-users and residents.
```bash
cd indilert
npm install
npm run dev
```
**Access**: `http://localhost:3000`

---

## 🧪 Running Tests
The backend includes a comprehensive `pytest` suite ensuring API and model stability.
```bash
cd backend
source venv/bin/activate    # On Windows: venv\Scripts\activate
pytest
```

---

## 📄 License
This project was developed for the Smart India Hackathon (SIH). All rights reserved by the respective authors and contributors.
