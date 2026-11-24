# H2S — Smart Crisis Management System (`PROJECT_GUIDE.md`)

## 1. What Is This Project About?

**H2S (Smart Crisis Management System)** is a full-stack emergency response and disaster coordination web platform built with **React + Vite** (frontend), **Node.js + Express (ES Modules)** (backend), and **MongoDB + Mongoose** (database).

During natural disasters, floods, medical emergencies, or large-scale shortages, help requests are often scattered, unverified, or duplicated. H2S turns noisy emergency reports into a **trust-verified, accountable relief pipeline** connecting four tiers of participants:

| Role | Responsibility |
| :--- | :--- |
| **1. Public Citizens** | Report crises using live GPS or an interactive Leaflet map pin, specify category, urgency, affected people, and exact supplies needed — and track live fulfillment status using their Request ID. |
| **2. Field Volunteers** | Aadhaar-identified ground responders who verify public SOS alerts, boost urgency priority ("Hype"), submit auto-validated field reports with manpower roles, join skill-gated response teams, confirm supply deliveries, and earn dynamic **Trust Score XP**. |
| **3. Verified NGOs** | Organizations approved by Admins that pledge partial or full supply quantities to validated crises, mark dispatches, certify volunteer skills (e.g., Medical Assistant, Search & Rescue), and track verified impact statistics. |
| **4. Platform Admins** | Governance authority at `/admin` who verifies or suspends NGOs, oversees volunteer accounts, and monitors all live crisis requests and system KPIs. |

---

## 2. End-to-End Crisis Workflow

1. **SOS Submitted (`pending`)** — A citizen opens `/request-help`, pins their GPS location on the map, lists needed supplies, and receives a 24-character **Tracking Request ID**.
2. **Field Validation (`validated`)** — A logged-in Volunteer inspects the SOS queue, verifies legitimacy (or raises a field report directly), adds priority hype, and optionally defines needed manpower roles.
3. **NGO Supply Allocation (`in-progress`)** — Admin-verified NGOs browse prioritized validated crises on their dashboard, pledge supply units (supporting multi-NGO partial fulfillment), and mark shipments as dispatched.
4. **Skill-Verified Team Deployment** — NGOs certify volunteer skills; certified volunteers join matching manpower roles in **Join Field Teams**.
5. **Delivery Confirmation & Resolution (`resolved`)** — Field volunteers confirm receipt of delivered supplies. Once all required supplies are received (or the lead volunteer resolves the mission), the request automatically marks as **Resolved**, awarding Trust Score XP and updating the public **Track Request** page (`/track-request/:id`).

---

## 3. Architecture & Technology Stack

- **Architecture Pattern**: Strict Layered Clean Architecture (`Route → Controller → Pure Service + Single-Model Repository → MongoDB`).
- **Frontend**: React 19, Vite 8, React Router 7, Leaflet / React-Leaflet interactive maps, 100% isolated CSS Modules.
- **Backend**: Node.js (ESM), Express 5, Mongoose 9, JWT Authentication, Bcrypt password hashing, Morgan HTTP logging.
- **Admin Command Center**: Standalone zero-build governance portal served directly by the backend at `http://localhost:3000/admin`.

---

## 4. How to Run the Project

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or a custom `MONGO_URI` configured in `backend/config/.env`)

---

### Option A: One-Click / Paste-in-Terminal Launcher (Recommended on Windows)

Paste and run the batch file in **CMD** or **PowerShell** (or double-click `run_h2s.bat` in File Explorer):

```bat
D:\Projects\H2S\run_h2s.bat
```

Or if you are already inside `D:\Projects\H2S`:

```powershell
.\run_h2s.bat
```

**What `run_h2s.bat` does automatically:**
1. Checks that Node.js is installed and ensures the Windows MongoDB service is running.
2. Creates `backend\config\.env` and `frontend\.env` automatically if missing.
3. Installs npm dependencies in `backend\` and `frontend\` if `node_modules` is missing.
4. Seeds demo accounts & sample crisis requests safely (idempotent — won't duplicate data).
5. Launches the **Backend API** (`http://localhost:3000`) and **Frontend SPA** (`http://localhost:5173`) in separate labeled terminal windows and opens the app in your browser.

---

### Option B: Manual Terminal Setup

#### 1. Start MongoDB
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/h2s`).

#### 2. Configure & Start Backend
```bash
cd backend
npm install
npm run seed
npm start
```
*(In PowerShell with script execution restricted, use `npm.cmd install`, `npm.cmd run seed`, `npm.cmd start`.)*

#### 3. Start Frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Local URLs & Demo Login Credentials

After seeding (`npm run seed` or `run_h2s.bat`), use these ready-to-test accounts:

| Portal | URL | Email | Password | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Main Web App** | http://localhost:5173 | — | — | Public SOS, Tracker, NGO & Volunteer Login |
| **Admin Command Center** | http://localhost:3000/admin | `admin@h2s.com` | `admin123` | Verify NGOs, oversee volunteers & crises |
| **Verified NGO** | http://localhost:5173/ngo/login | `admin@ngo.com` | `password123` | Active & verified (`Red Cross Response Team A`) |
| **Pending NGO** | http://localhost:5173/ngo/login | `help@ngo.com` | `password123` | Pending Admin approval (`Crisis Relief Foundation`) |
| **Volunteer (Medical)** | http://localhost:5173/volunteer/login | `jane_doe@gmail.com` | `password123` | Verified Medical Assistant & First Aid |
| **Volunteer (Logistics)** | http://localhost:5173/volunteer/login | `john_smith@gmail.com` | `password123` | Verified Logistics Coordinator |
| **API Health Check** | http://localhost:3000/health | — | — | Returns server status JSON |

---

## 6. Key API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/health` | API health check |
| `GET` | `/help-request/stats` | Live platform KPIs (crises, NGOs, volunteers, supplies) |
| `GET` | `/help-request/track/:id` | Public-safe live status & delivery tracker for a Request ID |
| `POST` | `/help-request/create` | Create public SOS or auto-validated volunteer crisis report |
| `GET` | `/help-request/unapproved` | List unvalidated SOS alerts for volunteers |
| `GET` | `/help-request/approved` | List validated crisis missions for NGOs & field teams |
| `PUT` | `/help-request/:id/approve` | Volunteer validates a public SOS (+10 Trust XP) |
| `PUT` | `/help-request/:id/resolve` | Mark a mission resolved (+20 Trust XP) |
| `POST` | `/help-request/:id/hype` | Upsert priority hype boost (1–5) |
| `POST` | `/help-request/:id/assign/:roleId` | Skill-verified volunteer joins a mission role |
| `POST` | `/grant-help` | Verified NGO pledges supply units (+15 Trust XP) |
| `PATCH` | `/grant-help/:id/status` | Update grant status (`pending` / `fulfilled` / `cancelled`) |
| `POST` | `/grant-help/:id/received` | Confirm field delivery (+10 NGO XP & auto-resolve check) |
| `POST` | `/ngo/register`, `/ngo/login` | NGO auth |
| `GET` | `/ngo/:id/stats` | Live NGO impact telemetry |
| `POST` | `/volunteer/register`, `/volunteer/login` | Volunteer auth |
| `POST` | `/volunteer/verify-skill` | Verified NGO certifies a volunteer skill |
| `GET` | `/admin/api/overview`, `/ngos`, `/volunteers`, `/requests` | Admin Command Center governance APIs |

---

## 7. Quick Troubleshooting

- **PowerShell says `npm.ps1 cannot be loaded`**: Run `.\run_h2s.bat` (uses CMD cleanly) OR use `npm.cmd` instead of `npm` inside PowerShell.
- **MongoDB connection failed**: Start the MongoDB service (`net start MongoDB` in an elevated prompt) or update `MONGO_URI` in `backend\config\.env` to your MongoDB Atlas URI.
- **Port 3000 or 5173 already in use**: Close any old H2S terminal windows before running `run_h2s.bat` again.
