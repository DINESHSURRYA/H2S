# H2S — Smart Crisis Management System

[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite%208-61DAFB?logo=react)](https://react.dev/)
[![Node](https://img.shields.io/badge/Backend-Node.js%20+%20Express%205-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20+%20Mongoose%209-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Layered%20ESM-6366F1)](#)

**H2S** is a full-stack, trust-verified **Smart Crisis Management System** connecting **Citizens**, **Field Volunteers**, **Verified NGOs**, and **Platform Administrators** to coordinate emergency relief from initial SOS report through verified supply delivery.

> For the complete system walkthrough, workflows, API reference, and demo accounts, see **[PROJECT_GUIDE.md](./PROJECT_GUIDE.md)**.

---

## Key Capabilities

- **Public Emergency Portal (`/request-help`)**: GPS & interactive Leaflet map pin reporting with crisis category, urgency severity, affected headcount, and itemized supply needs.
- **Live Public Request Tracker (`/track-request`)**: Real-time 4-stage status timeline (`Pending → Validated → In Progress → Resolved`), NGO supply pledge progress bars, delivery confirmations, and field team overview.
- **Volunteer Field Interface (`/volunteer/dashboard`)**: Incoming public SOS verification queue, priority hype boosting, auto-validated field reporting with manpower roles, skill-gated team deployment, delivery confirmation, and dynamic **Trust Score XP**.
- **NGO Command Hub (`/ngo/dashboard`)**: Urgency-sorted validated crisis feed, multi-NGO partial/full supply allocations, dispatch tracking, volunteer skill certification, and real-time impact statistics.
- **Admin Command Center (`http://localhost:3000/admin`)**: Multi-tab governance portal with platform KPIs, NGO verification/suspension, volunteer oversight, and live crisis monitoring.

---

## Quick Start (Windows One-Click)

Paste into your terminal (CMD or PowerShell) or double-click:

```bat
.\run_h2s.bat
```

Or start manually:

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm install
npm run seed
npm start

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

---

## Project Layout

```text
H2S/
├── run_h2s.bat          # One-click Windows setup, seed & run script
├── PROJECT_GUIDE.md     # Full overview, workflows, credentials & run guide
├── coreidea.txt         # Original 15-pillar system vision
├── documentation.txt    # Architecture notes & change log
├── verify_missions.js   # Live backend smoke-test script
├── backend/             # Node.js + Express 5 + Mongoose 9 (Clean Layered ESM)
│   ├── admin/           # Admin Command Center web portal (/admin)
│   ├── config/          # Environment & MongoDB connection
│   ├── controllers/     # Request orchestration layer
│   ├── services/        # Pure business logic & calculations
│   ├── repository/      # Single-model MongoDB repositories
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── middlewares/     # JWT auth, logging & centralized error handling
│   └── initialiser_helpers/  # Idempotent admin & demo seeders
└── frontend/            # React 19 + Vite 8 + Leaflet + CSS Modules
    └── src/
        ├── components/  # Reusable UI (Navbar, MapPicker, Button, InputField)
        ├── pages/       # Home, RequestHelp, TrackRequest, NGO & Volunteer Hubs
        └── services/    # Centralized apiClient & apiService
```
