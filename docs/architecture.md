# Cyber Chaukidaar - System Architecture

```
                    ┌────────────────────────────────────────┐
                    │      TACTICAL WEB DASHBOARD            │
                    │   React 18 + Vite + Tailwind CSS       │
                    │                                        │
                    │  - 2D Property Perimeter Sentry Map    │
                    │  - Dual ADXL Oscilloscope (X,Y,Z,RMS)  │
                    │  - 24GHz Radar Range Visualizer (0-8m) │
                    │  - Distributed Node Telemetry Cards    │
                    │  - Real-time Alarm Dispatcher & Siren  │
                    │  - Digital Threat Intel (OSINT Breach) │
                    └───────────────────▲────────────────────┘
                                        │ WebSocket / REST
                                        │ (Port 8787)
                    ┌───────────────────▼────────────────────┐
                    │      CENTRAL GATEWAY & SERVER          │
                    │           Express.js + ws              │
                    │                                        │
                    │  - Node Manager & Heartbeat Watchdog   │
                    │  - Multi-Modal Sensor Fusion Engine    │
                    │  - 2-Sensor Localization Estimator     │
                    │  - Local Random Forest ML Engine       │
                    │  - Camera Optical Verification Layer   │
                    │  - Deterministic 7-Step Hackathon Demo │
                    │  - Autonomous Multi-Node Simulator     │
                    │  - OSINT /api/breach-check Proxy       │
                    └───────────────────▲────────────────────┘
                                        │ WiFi / LoRa / BLE
                                        │ (JSON Protocol)
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
    ┌───────▼────────┐          ┌───────▼────────┐          ┌───────▼────────┐
    │    NODE 001    │          │    NODE 002    │          │    NODE 003    │
    │  North Gate    │          │  East Boundary │          │  South Forest  │
    │                │          │                │          │                │
    │ - ESP32 SoC    │          │ - ESP32 SoC    │          │ - ESP32 SoC    │
    │ - 24GHz Radar  │          │ - 24GHz Radar  │          │ - 24GHz Radar  │
    │ - ADXL345 #1   │          │ - ADXL345 #1   │          │ - ADXL345 #1   │
    │ - ADXL345 #2   │          │ - ADXL345 #2   │          │ - ADXL345 #2   │
    │ - Li-ion Bat   │          │ - Li-ion Bat   │          │ - Li-ion Bat   │
    └────────────────┘          └────────────────┘          └────────────────┘
```

## Core Engineering Principles
1. **Local Preprocessing at Node**:
   Raw 100 Hz seismic samples are processed on the ESP32 using IIR high-pass filtering (gravity DC offset removal) and an STA/LTA (Short-Term Average / Long-Term Average) detector. Nodes do not stream massive raw data streams over battery-draining radios.
2. **Transparent Multi-Modal Sensor Fusion**:
   Confidence is not a naive average. The central engine aggregates Bayesian-weighted evidence across 5 modalities:
   - Radar presence and radial distance (0.0 to 8.0m)
   - Cross-sensor corroboration between ADXL345 #1 and ADXL345 #2
   - Local Random Forest machine learning classification on 8 spectral features
   - Secondary optical camera verification
   - Background environmental noise suppression
3. **Rough Relative Localization**:
   By comparing shockwave energy falloff between ADXL345 #1 and #2 and intersecting with the radar distance gate, an approximate coordinate $(x, y)$ inside the 8m sensing zone is generated.
