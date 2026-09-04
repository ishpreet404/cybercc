# 🛡️ CYBER CHAUKIDAAR
> **Cyber-Physical Perimeter Intelligence & Threat Defense Grid**

Cyber Chaukidaar is an end-to-end cyber-physical sentry platform that unifies:
1. **Physical Ground Perimeter Defense**: Distributed ESP32 sentry nodes with 24GHz mmWave radar, dual ground-spiked ADXL345 accelerometers, seismic feature extraction, local Random Forest machine learning, rough two-sensor localization, optical camera verification, and LoRa / WiFi / BLE communication.
2. **Digital Threat Intelligence**: An integrated OSINT breach exposure search engine scanning 15B+ dark-web and breach records for exposed personnel credentials.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node 24)
- **Python**: 3.9+ (optional for ML retraining)

### 2. Start Central Server
```bash
cd backend
npm install
npm start
```
The central server runs on **`http://localhost:8787`** and opens the real-time WebSocket server.

### 3. Start Tactical Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧭 System Architecture & Dashboard Features

### A. 2D Property / Perimeter Sentry Map
- Real-time blueprint grid showing property boundary, sectors, and deployed sentry nodes.
- Visual 5–8m radar sweep arcs with animated sweep rays.
- Ground seismic ripples radiating from dual spiked probes.
- Triangulated intruder target crosshair labeled **`ESTIMATED POSITION`** with real-time confidence and distance.

### B. Distributed Node Telemetry
- Simultaneous multi-node monitoring (NODE-001 through NODE-004).
- Battery gauge (%) and measured voltage ($V_{\text{bat}}$).
- Signal strength (RSSI dBm), transport mode (LoRa / WiFi / BLE), sensor diagnostics, and uptime.

### C. 24GHz mmWave Radar Panel
- 0m to 8m distance gate visualization bar.
- Presence flag, target distance needle, and micro-Doppler confidence.

### D. Dual ADXL345 Seismic Waveform Oscilloscope & ML
- Smooth dual-channel canvas oscilloscope comparing Probe A & Probe B.
- 8 Extracted Spectral Features: RMS, Peak, Peak-to-Peak, Variance, Dominant Frequency, Spectral Energy, Spectral Centroid, Inter-Peak Interval (IPI).
- Local Random Forest classifier: `NORMAL`, `FOOTSTEP_HUMAN`, `VEHICLE`, `ENVIRONMENTAL`.

### E. Real-Time Alarm & Audio Siren Center
- Synthesizer siren (Web Audio API) with mute toggle.
- Non-linear multi-modal evidence breakdown explaining *why* each alert was generated.
- Acknowledge, Resolve, and Dismiss operator controls.

### F. Digital Threat Intelligence (OSINT Breach Checker)
- Fully preserved `/api/breach-check` API contract.
- Search emails and phone numbers across dark-web and credential dump databases.

---

## 🏆 Hackathon Live Demo Mode
Click the **`[ RUN 7-STEP DEMO ]`** button on the dashboard to execute the sequential live jury demonstration:
- **T+00**: Radar acquires target at 4.8m.
- **T+01**: ADXL #1 (ground probe A) registers first footstep vibration shockwave (RMS 0.22g).
- **T+02**: ADXL #2 captures delayed shockwave (RMS 0.18g), confirming spatial ground wave.
- **T+03**: Local Random Forest classifies `FOOTSTEP_HUMAN` (8-feature cadence 520ms, 8.4Hz).
- **T+04**: Optical Camera verification verifies `HUMAN_PEDESTRIAN` with bounding box.
- **T+05**: Multi-modal fusion confidence surges to 94%.
- **T+06**: Priority transmission packet dispatched over LoRa.
- **T+07**: Tactical siren beeps, property map pulses red, and estimated intruder coordinates are locked!

---

## 🔌 Hardware & Firmware Setup
See [`firmware/README.md`](firmware/README.md) for full schematics, pinouts, and PlatformIO flashing guides.
