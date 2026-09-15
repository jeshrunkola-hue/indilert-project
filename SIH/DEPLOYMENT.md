# Indilert & NER-SAFE Production Deployment Guide

This repository is structured into **three independent, production-ready components**:

```
/home/pal/Documents/SIH/
├── indilert-admin/   → Government/Admin Frontend (Vite + React SPA)
├── indilert/         → Citizen Emergency Alert Frontend (Next.js 16)
└── backend/          → Unified Disaster Early Warning Backend (FastAPI + ML)
```

Each component is completely decoupled and can be deployed to separate hosting platforms (Netlify for frontends, Render/Railway/Fly.io/Docker for the backend).

---

## Component Deployment Summary Table

| Component | Target Host | Build Command | Publish Directory | Primary Environment Variables | Start Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FastAPI Backend** | Render / Railway / Fly.io / VPS | `pip install -r requirements.txt` | N/A | `PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `SECRET_KEY`, `INDILERT_URL`, `BACKEND_PUBLIC_URL` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Indilert Admin** | Netlify | `npm run build` | `dist` | `VITE_API_URL` | N/A (Static SPA) |
| **Indilert Citizen**| Netlify | `npm run build` | `.next` | `NEXT_PUBLIC_API_URL` | Netlify Next.js Runtime |

---

## 1. Deploying the FastAPI Backend

### Option A: Render.com (Recommended - Web Service)
1. Push the `/backend` directory to your GitHub repository.
2. Log in to [Render Dashboard](https://dashboard.render.com) and click **New + > Web Service**.
3. Connect your repository and select the `backend` folder as the Root Directory (or deploy from the backend repo).
4. Configure the service settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   ```bash
   PORT=10000
   DATABASE_URL=sqlite:///./ner_safe.db
   SECRET_KEY=generate-a-strong-random-key-here-32chars
   CORS_ORIGINS=http://localhost:5174,http://localhost:3000
   BACKEND_PUBLIC_URL=https://your-service-name.onrender.com
   INDILERT_URL=https://your-citizen-app.netlify.app
   ```
6. Click **Create Web Service**.

### Option B: Docker Container Deployment
A standalone [Dockerfile](file:///home/pal/Documents/SIH/backend/Dockerfile) is provided in `backend/`:
```bash
docker build -t indilert-backend ./backend
docker run -d -p 8000:8000 \
  -e PORT=8000 \
  -e CORS_ORIGINS="https://admin.netlify.app,https://citizen.netlify.app" \
  indilert-backend
```

---

## 2. Obtaining the Public HTTPS Backend URL
Once deployed on Render, Railway, or Fly.io:
1. Copy the public HTTPS URL assigned to your service:
   - Example: `https://indilert-backend-api.onrender.com`
2. Verify the deployment in your browser by visiting:
   - Health Check: `https://indilert-backend-api.onrender.com/api/health`
   - Swagger Docs: `https://indilert-backend-api.onrender.com/docs`
3. Save this URL: it will be used as the API endpoint for both frontends.

---

## 3. Configuring & Deploying Indilert Admin (Netlify)

### Directory: `/indilert-admin`
1. Push `indilert-admin` to GitHub (or select `indilert-admin` as the base directory).
2. Log in to [Netlify](https://app.netlify.com) and select **Add new site > Import an existing project**.
3. Choose the repository and specify build settings:
   - **Base directory**: `indilert-admin` (if monorepo) or `/` (if dedicated repo)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add the Environment Variable in **Site configuration > Environment variables**:
   ```bash
   VITE_API_URL=https://indilert-backend-api.onrender.com
   ```
   *(Optional: If your citizen app is deployed, you can also set `VITE_INDILERT_URL=https://your-citizen-app.netlify.app`)*
5. Click **Deploy Site**.
6. Note the deployed URL (e.g., `https://indilert-admin-production.netlify.app`).

> [!NOTE]
> The included `netlify.toml` automatically handles Single Page Application (SPA) client-side routing redirects (`/* -> /index.html 200`).

---

## 4. Configuring & Deploying Indilert Citizen (Netlify)

### Directory: `/indilert`
1. Push `indilert` to GitHub (or select `indilert` as the base directory).
2. On Netlify, select **Add new site > Import an existing project**.
3. Specify build settings:
   - **Base directory**: `indilert` (if monorepo) or `/` (if dedicated repo)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Add the Environment Variable:
   ```bash
   NEXT_PUBLIC_API_URL=https://indilert-backend-api.onrender.com
   ```
5. Click **Deploy Site**.
6. Note the deployed URL (e.g., `https://indilert-citizen-production.netlify.app`).

> [!NOTE]
> Netlify automatically detects Next.js using the `@netlify/plugin-nextjs` defined in [netlify.toml](file:///home/pal/Documents/SIH/indilert/netlify.toml).

---

## 5. Updating FastAPI CORS with Production Netlify URLs

Once both Netlify sites are live:
1. Return to your backend host dashboard (e.g., Render Dashboard).
2. Go to **Environment** settings and update `CORS_ORIGINS`:
   ```bash
   CORS_ORIGINS=https://indilert-admin-production.netlify.app,https://indilert-citizen-production.netlify.app,http://localhost:5174,http://localhost:3000
   ```
3. Update `INDILERT_URL`:
   ```bash
   INDILERT_URL=https://indilert-citizen-production.netlify.app
   ```
4. Update `BACKEND_PUBLIC_URL`:
   ```bash
   BACKEND_PUBLIC_URL=https://indilert-backend-api.onrender.com
   ```
5. Save changes. The backend will reload with strict, authorized CORS (no wildcard `*`).

---

## 6. End-to-End Communication Verification

### Test 1: Indilert Admin → FastAPI → Indilert Citizen (Emergency Warning Dispatch)
1. Open the **Indilert Citizen** app in a browser window.
2. Click the bell icon to allow browser notifications.
3. Open **Indilert Admin** in another window.
4. Navigate to the **Emergency Alerts** tab.
5. Click **🚨 SEND EMERGENCY ALERT**, choose a target district (e.g., *East Khasi Hills*), select *Critical*, and click **Confirm & Send Alert**.
6. **Expected Result**:
   - The alert is dispatched via Web Push and WebSockets.
   - The notification pops up on the citizen's device with emergency vibration.
   - Clicking the notification opens the alert in Indilert.
   - Admin alert metrics (Push Sent, Opened, Acknowledged) increment in real-time.

### Test 2: Indilert Citizen → FastAPI → Indilert Admin (Citizen Incident Report)
1. In the **Indilert Citizen** app, navigate to `/report`.
2. Select hazard category, specify risk level (*High Risk* / *Low Risk*), attach optional media, and submit.
3. In **Indilert Admin**, navigate to the **Citizen Reports** tab.
4. **Expected Result**:
   - The report appears immediately in the live reports feed.
   - Use the High / Moderate / Low risk filter pills to view and verify the incident.

---

## Local Development Quick Commands

To run components individually locally:

```bash
# 1. Run only FastAPI Backend:
cd /home/pal/Documents/SIH/backend
PYTHONPATH=. venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Run only Indilert Admin:
cd /home/pal/Documents/SIH/indilert-admin
npm run dev -- --port 5174

# 3. Run only Indilert Citizen:
cd /home/pal/Documents/SIH/indilert
npm run dev -- -p 3000
```
