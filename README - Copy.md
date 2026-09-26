# Marine AI 🌊
**Agentic Marine Intelligence & Smart Fishing Decision Support Platform**
*Built for ISRO / Department of Space – Problem Statement PS 26176*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0 or later recommended)
- **npm** (v9 or later)

### 2. Installation
Clone the repository and install all dependencies (this installs both backend and React frontend dependencies automatically):

```bash
git clone https://github.com/sec24cs200-Ovi/Marine-AI.git
cd Marine-AI
npm install
```

### 3. Build & Run Full-Stack App
Build the modern React + Vite frontend and start the backend:

```bash
# Build the React production bundle
npm run build

# Start the full-stack server
npm start
```
Now open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 💻 Development Mode

If you are developing the React UI with hot-reloading (Vite HMR):

1. **Start the backend server:**
   ```bash
   npm run dev
   ```
   *(Running on http://localhost:3000 with API endpoints at `/api/*`)*

2. **Start the React client dev server (in another terminal):**
   ```bash
   npm run dev:client
   ```
   *(Running on http://localhost:5173 with automatic API proxying to port 3000)*

---

## 📁 Project Architecture

- **`client/`** – Modern Frontend (React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Leaflet GIS)
  - `src/components/Header.tsx` – Multilingual header, regional coastal selector, live weather & SOS distress trigger
  - `src/components/Sidebar.tsx` – 12 multi-feature navigation controls
  - `src/components/Map/MarineMap.tsx` – Interactive GIS mapping with PFZ zones, bathymetry, and IMBL geofence
  - `src/components/Views/` – Dashboard, ORCA AI Marine Assistant, Sea Safety, Equipment MCU, PFZ Yields, Route Planner, and DBT Govt Schemes
- **`server.js`** – Express.js backend server, static asset distributor, and health monitoring
- **`src/routes/`** – REST API endpoints (`/api/ai`, `/api/telemetry`, `/api/pfz`, `/api/navigation`, `/api/emergency`, `/api/schemes`)
- **`src/db.js`** – In-memory state and query logger
