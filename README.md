# EvoxxLaunch — Amazon India Product Automation Web App

**EvoxxLaunch** automates the creation, validation, bulk export, and direct SP-API publishing of Evoxx T-shirt listings on **Amazon India** (`A21TJRUUN4KGV`).

## Quick Start

### 1. Start the FastAPI Backend (Port 8000)

```powershell
cd d:\DELL\DataVeda\evoxxlaunch
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 2. Start the React + Vite Frontend (Port 5173)

```powershell
cd d:\DELL\DataVeda\evoxxlaunch\frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.
