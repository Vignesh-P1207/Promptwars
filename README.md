<p align="center">
  <img src="https://img.shields.io/badge/VenueFlow-Command_AI-00c6a7?style=for-the-badge&labelColor=101c2b&logo=google-gemini&logoColor=00c6a7" alt="VenueFlow Command AI" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-ccaa00?style=for-the-badge&labelColor=101c2b&logo=google&logoColor=ccaa00" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/React_Vite-Express-43e2c2?style=for-the-badge&labelColor=101c2b&logo=react&logoColor=43e2c2" alt="React + Node" />
</p>

<h1 align="center">
  🏟️ VenueFlow Command AI
</h1>

<h3 align="center">
  <strong>Autonomous Event Logistics & Crowd Operations Manager</strong><br/>
  <sub>Real-time Telemetry • AI Predictive Routing • Dynamic SQL Gate Control</sub>
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_19_|_Tailwind-00c6a7?style=flat-square&labelColor=1a1a2e" />
  <img src="https://img.shields.io/badge/Backend-Node.js_|_Express-ffc068?style=flat-square&labelColor=1a1a2e" />
  <img src="https://img.shields.io/badge/Database-SQLite3_|_In--Memory-ffb4ab?style=flat-square&labelColor=1a1a2e" />
  <img src="https://img.shields.io/badge/Neural_Engine-Gemini_2.5_Flash-43e2c2?style=flat-square&labelColor=1a1a2e" />
  <img src="https://img.shields.io/badge/Architecture-Cloud_Run_Container-d7e3f8?style=flat-square&labelColor=1a1a2e" />
</p>

---

## 🌌 Overview

**VenueFlow Command AI** represents a state-of-the-art intelligent operational dashboard built for the **Travel & Hospitality / Smart Physical Events** sector. 

Instead of passive dashboards, VenueFlow acts as an **active cybernetic nervous system** for large-scale venues (stadiums, airports, concert halls). It simulates and tracks thousands of assets in real-time, predicting bottlenecks before they happen. Its crown jewel is the newly integrated **Aura AI Optimizer**, powered natively by Google's Gemini 2.5 Flash, capable of directly locking physical gates and re-routing crowds autonomously via dynamic operator prompts.

> **Bridging Neural Compute to Physical Actions** — Our AI doesn't just talk. If the model detects a critical severity event from an operator command, it surgically modifies the SQLite active database state, broadcasting real-time lockdowns to the frontend.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   VENUEFLOW SYSTEM ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🖥️ High-Performance Vite Engine (React / Tailwind)           │
│                                                                 │
│   ┌───────────────┐     ┌──────────────────────────────────┐   │
│   │ UI Layer      │◄────┤  Node.js Command Interface       │   │
│   │ • Live Map    │     │  • Telemetry Simulation Engine   │   │
│   │ • Analytics   │     │  • SQLite Flow Database          │   │
│   │ • Aura AI Chat│────►│  • Physical SQL Action Hooks     │   │
│   │ • Alerts Hub  │     │  • Google Gemini Controller      │   │
│   └───────────────┘     └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Core Mechanics — Technical Deep Dive

### 1. Neural Optimizer: Gemini 2.5 Flash

Our AI endpoint operates on strict JSON schemas to guarantee the frontend receives structured, reliable directives.

| Parameter | Value | Purpose |
|----------|-------|-----------------|
| `temperature` | 0.1 | High-precision logical output for logistics |
| `responseMimeType` | application/json | Enforces parseable strict JSON strings |
| `actions` | Array[String] | Line-by-line procedural steps for the operator |
| `system_action` | Action Enum | Maps conversational intent to SQL executions |

**AI Dynamic Schema Injection:**
The backend maps natural language directly to physical database executions using a rigid schema block.
*Example: `"Operator: Shut down the north gate, we have an emergency"` → `system_action: "EMERGENCY_LOCK"` → triggers `UPDATE zones SET gate_open=0`.*

### 2. Live Telemetry Engine

We've custom-built an in-memory orchestration loop processing 16 live metric nodes and multiple bottleneck queues concurrently.

```
Simulation Loop
─────────────────────────────
1. Heartbeat checks every 8s
2. Real-time capacity fluctuations using bounding offsets
3. Event log polling (telemetry, broadcasts, auth)
4. Instant socket/HTTP propagation to UI dashboard
```

### 3. Cybernetic UI Design

The frontend strictly enforces a premium, dark-mode cybersecurity aesthetic utilizing **TailwindCSS CSS variables**.

| UI Token | Value | Applied To |
|------|--------|----------|
| **Matrix Primary** | `#00c6a7` | Brand text, active selections |
| **Glow Accent** | `#43e2c2` | Terminal buttons, glowing hover states |
| **Midnight Base** | `#101c2b` | Application backgrounds, command centers |
| **Critical Error** | `#ffb4ab` | Emergency Lockdowns, zone overloads |
| **Font Face** | `JetBrains Mono` | Absolute monospaced terminal tracking |

---

## 🛡️ Autonomous Decision Matrix

```
Action Classification
━━━━━━━━━━━━━━━━━━━━━━
🔴 EMERGENCY_LOCK  → AI executes 'UPDATE zones SET gate_open=0'
🟠 SYSTEM_REBOOT   → Injects 'Reboot initiated' into telemetry 
🟢 OPEN_ALL_GATES  → Overrides all SQL gate values to TRUE
🔵 DEPLOY_ASSET    → Dispatches digital twin resources

Decision Cascade
━━━━━━━━━━━━━━━
1. Operator inputs natural language into Aura Terminal
2. Gemini 2.5 calculates safest operational logic
3. Response decoded → Is system_action required?
4. Yes → Execute physical database mutation
5. Push generated directive array back to UI
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Engine runtime / Backend execution |
| npm/yarn | latest | Package management |
| Google Cloud | API Key | Gemini AI Integration |

### Local Dev Build

```bash
# Clone the repository
git clone https://github.com/Vignesh-P1207/Promptwars.git
cd Promptwars

# Add your Gemini Key
echo "GEMINI_API_KEY=your_key_here" > .env

# Install dependencies and launch both UI and Server
npm install
npm run dev
```

### Production Build (Docker Deployment)

We provide a monolithic multi-stage Docker container that builds the optimized React bundle and serves it via an ultra-fast Express proxy port:

```bash
# Build the highly-optimized production image
docker build -t venueflow-app .

# Launch the constellation manager 
docker run -d -p 8080:8080 --env GEMINI_API_KEY=your_key_here --name venueflow-app venueflow-app
```
*Alternatively, you can instantly push this Docker container directly to Google Cloud Run!*

---

## 📁 Project Structure

```
venueflow-app/
├── server/                       # Express Data Layer
│   ├── index.js                  # Engine, Gemini Routes, SQLite
├── src/                          # Pure Client-Side Application
│   ├── components/               # High-Performance UI Layer
│   │   ├── Sidebar.tsx           # Navigation map
│   │   ├── TopBar.tsx            # Global health metrics
│   ├── pages/
│   │   ├── Assistant.tsx         # The Gemini Aura interface
│   │   ├── Dashboard.tsx         # Core real-time hub
│   │   └── Flow.tsx              # Heatmap rendering
│   └── App.tsx                   # Central router logic
├── Dockerfile                    # Production monolithic deployment
└── tailwind.config.ts            # High-end color definitions
```

---

<p align="center">
  <sub>Built with 🚀 neural matrices, ☕ caffeine, and 🧮 data flow</sub><br/>
  <sub>Fully optimized for Promptwars 2026.</sub>
</p>
