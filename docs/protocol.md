# Cyber Chaukidaar - Communication Protocol & JSON Schema

## Telemetry Packet Schema

Sent periodically by each node (Heartbeat: 8s idle, Alert mode: 500ms active):

```json
{
  "nodeId": "NODE-001",
  "timestamp": 1788539758999,
  "sequence": 142,
  "firmware": "1.2.0",
  "transport": "wifi",
  "battery": {
    "voltage": 3.92,
    "percentage": 78
  },
  "signal": {
    "rssi": -61
  },
  "radar": {
    "presence": true,
    "distance": 4.80,
    "confidence": 0.91
  },
  "accelerometer": {
    "sensor1": {
      "x": 0.12,
      "y": 0.04,
      "z": 0.98,
      "vibrationRms": 0.31,
      "features": {
        "rms": 0.31,
        "peak": 0.65,
        "peakToPeak": 0.98,
        "variance": 0.0115,
        "dominantFrequency": 8.4,
        "spectralEnergy": 0.28,
        "spectralCentroid": 11.2,
        "interPeakInterval": 520
      }
    },
    "sensor2": {
      "x": 0.10,
      "y": 0.05,
      "z": 0.97,
      "vibrationRms": 0.27
    }
  },
  "eventState": "ALERT"
}
```

## WebSocket Real-Time Event Types

| Event Type | Payload Description |
|------------|---------------------|
| `NODE_ONLINE` | Full Node object when registered or woken up |
| `NODE_OFFLINE` | Triggered when node misses heartbeats > 60s |
| `TELEMETRY_UPDATE` | Latest telemetry, updated node state, and live fusion result |
| `DETECTION_EVENT` | Fused event assessment with confidence and evidence breakdown |
| `ALERT_CREATED` | New operator alert with siren trigger |
| `ALERT_ACKNOWLEDGED` | Operator acknowledged alert |
| `ALERT_RESOLVED` | Operator cleared / resolved alert |
