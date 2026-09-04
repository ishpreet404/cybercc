# Cyber Chaukidaar - Hackathon Live Demonstration Guide

## How to Run the Live Hackathon Demo

### 1. Launch the System
In Terminal 1 (Central Server):
```bash
cd backend
node src/server.js
```

In Terminal 2 (Tactical Dashboard):
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Live Demo Script (Step-by-Step)
1. **Command Center Overview**:
   - Show the **2D Perimeter Map** in the center: Point out the 4 deployed nodes (North Gate, East Fence, South Forest, West Driveway).
   - Point out the rotating radar sweep arcs and subtle ground seismic noise.
   - Point out the **Node Telemetry Cards**: Battery %, 3.92V, LoRa/WiFi transport modes, RSSI signal.

2. **Triggering the 7-Step Hackathon Demo**:
   - Click the **[ RUN 7-STEP DEMO ]** button on the top banner or navigate to **HACKATHON DEMO**.
   - Watch the sequential execution:
     - **T+00**: Radar acquires target at 4.8m.
     - **T+01**: ADXL #1 (ground probe A) registers first footstep vibration shockwave (RMS 0.22g).
     - **T+02**: ADXL #2 captures delayed wave (RMS 0.18g), confirming dual-seismic ground wave.
     - **T+03**: Local Random Forest classifies `FOOTSTEP_HUMAN` based on 8 features (cadence 520ms, 8.4Hz).
     - **T+04**: Optical Camera verification verifies `HUMAN_PEDESTRIAN` with bounding box.
     - **T+05**: Multi-modal fusion confidence surges to 94%.
     - **T+06**: Priority transmission packet dispatched over LoRa.
     - **T+07**: Tactical siren beeps, property map pulses red, and estimated intruder coordinates are locked!

3. **Digital Threat Intelligence (OSINT)**:
   - Click the **THREAT INTEL (OSINT)** tab.
   - Enter a query (e.g. `test@example.com` or any email/phone).
   - Click **CHECK FOR BREACHES**.
   - Show real-time dark web exposure scanning and itemized database records.
