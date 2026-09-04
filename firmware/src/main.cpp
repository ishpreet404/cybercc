/**
 * CYBER CHAUKIDAAR - ESP32 DISTRIBUTED SENTRY FIRMWARE
 * 
 * Target: ESP32-WROOM-32 / ESP32-S3
 * Peripherals:
 *   - 24GHz mmWave Radar (HLK-LD2410 / LD1115H) on UART (GPIO 16/17) + OUT (GPIO 18)
 *   - ADXL345 #1 (Ground Probe A) on I2C 0x53 (SDA: 21, SCL: 22)
 *   - ADXL345 #2 (Ground Probe B) on I2C 0x54 (SDA: 21, SCL: 22)
 *   - Battery Voltage Divider on ADC (GPIO 34)
 *   - Transport: Hot-swappable WiFi / LoRa / BLE
 */

#include <Arduino.h>
#include "sensors/adxl345.h"
#include "sensors/radar.h"
#include "processing/vibration_filter.h"
#include "processing/event_detector.h"
#include "power/power_manager.h"
#include "telemetry/telemetry.h"
#include "communication/wifi_transport.h"
#include "communication/lora_transport.h"
#include "communication/ble_transport.h"

// Configuration constants
#define NODE_ID "NODE-001"
#define SAMPLE_INTERVAL_MS 10 // 100 Hz sampling for seismic geophysics
#define HEARTBEAT_INTERVAL_MS 8000 // 8 seconds idle heartbeat
#define EVENT_INTERVAL_MS 500 // 500 ms active event reporting rate

// Peripherals
ADXL345Sensor sensor1(0x53); // SDO/ALT to GND
ADXL345Sensor sensor2(0x54); // SDO/ALT to VCC
RadarSensor radar(Serial2, 16, 17, 18);
PowerManager power(34, 2.0f); // GPIO 34, 1:1 resistor divider

// Digital Filtering & Event Detection Pipelines
VibrationFilter filter1({ 100.0f, 32, 0.95f });
VibrationFilter filter2({ 100.0f, 32, 0.95f });
EventDetector staLta1({ 0.2f, 2.0f, 2.6f, 1.4f });
EventDetector staLta2({ 0.2f, 2.0f, 2.6f, 1.4f });

// Communication Transports
WiFiTransport wifi("CyberChaukidaar_Net", "SentryGrid2026", "http://192.168.1.100:8787/api/telemetry");
LoRaTransport lora(868E6, 5, 14, 2);
BLETransport ble("CHAUKIDAAR-NODE-01");

// Active Transport Pointer (Switchable dynamically)
TransportManager *activeTransport = &wifi;

// Execution state
uint32_t lastSampleTime = 0;
uint32_t lastTransmissionTime = 0;
uint32_t sequenceNumber = 0;
bool eventActive = false;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n=======================================================");
    Serial.println("🛡️  CYBER CHAUKIDAAR - DISTRIBUTED PERIMETER SENTRY NODE");
    Serial.println("   FIRMWARE v1.2.0 | ESP32 DUAL-SEISMIC + RADAR FUSION");
    Serial.println("=======================================================");

    // 1. Initialize Power & Battery Monitoring
    power.begin();
    PowerManager::BatteryStatus bat = power.readBattery();
    Serial.printf("[PWR] Battery: %.2fV (%d%%)\n", bat.voltage, bat.percentage);

    // 2. Initialize Dual Ground Accelerometers
    Wire.begin(21, 22, 400000);
    if (sensor1.begin(Wire)) {
        Serial.println("[OK] ADXL345 #1 (Probe A, 0x53) connected and calibrated");
    } else {
        Serial.println("[WARN] ADXL345 #1 (0x53) not responding on I2C bus");
    }

    if (sensor2.begin(Wire)) {
        Serial.println("[OK] ADXL345 #2 (Probe B, 0x54) connected and calibrated");
    } else {
        Serial.println("[WARN] ADXL345 #2 (0x54) not responding on I2C bus");
    }

    // 3. Initialize mmWave Radar
    radar.begin(256000);
    Serial.println("[OK] 24GHz mmWave Radar initialized on UART2");

    // 4. Connect Transport Gateway
    Serial.println("[NET] Initializing active transport interface...");
    if (activeTransport->connect()) {
        Serial.printf("[NET] Connected via %s (RSSI: %d dBm)\n", activeTransport->getTransportName(), activeTransport->getSignalStrength());
    } else {
        Serial.println("[NET] WiFi unavailable, falling back to LoRa/BLE transport...");
        activeTransport = &lora;
        activeTransport->connect();
    }
}

void loop() {
    uint32_t now = millis();

    // 1. 100 Hz Seismic Sampling Task
    if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
        lastSampleTime = now;

        // Sample both ground sensors
        ADXL345Sensor::RawReading s1Raw = sensor1.readSample();
        ADXL345Sensor::RawReading s2Raw = sensor2.readSample();

        // Process through DC removal & IIR bandpass
        float s1Filt = filter1.processSample(s1Raw.magnitude);
        float s2Filt = filter2.processSample(s2Raw.magnitude);

        // Update STA/LTA seismic trigger engines
        bool s1Trigger = staLta1.update(s1Filt);
        bool s2Trigger = staLta2.update(s2Filt);

        // Sample radar
        RadarSensor::RadarReading radReading = radar.read();

        // 3-Point Event Corroboration
        bool seismicActive = (s1Trigger && s2Trigger) || (filter1.getCurrentRms() > 0.15f);
        bool radarActive = radReading.presence;

        if (seismicActive || radarActive) {
            eventActive = true;
        } else {
            eventActive = false;
        }
    }

    // 2. Battery-Efficient Telemetry Transmission Task
    uint32_t txInterval = eventActive ? EVENT_INTERVAL_MS : HEARTBEAT_INTERVAL_MS;
    if (now - lastTransmissionTime >= txInterval) {
        lastTransmissionTime = now;
        sequenceNumber++;

        // Read instantaneous state
        PowerManager::BatteryStatus bat = power.readBattery();
        RadarSensor::RadarReading radReading = radar.read();
        ADXL345Sensor::RawReading s1Raw = sensor1.readSample();
        ADXL345Sensor::RawReading s2Raw = sensor2.readSample();

        float s1Rms = filter1.getCurrentRms();
        float s2Rms = filter2.getCurrentRms();
        SeismicFeatures s1Features = filter1.extractFeatures();

        const char *eventState = eventActive ? (radReading.presence && s1Rms > 0.15f ? "ALERT" : "SUSPICIOUS") : "NORMAL";

        // Serialize standardized JSON telemetry packet
        String jsonPayload = TelemetrySerializer::serialize(
            NODE_ID,
            sequenceNumber,
            activeTransport->getTransportName(),
            activeTransport->getSignalStrength(),
            bat,
            radReading,
            s1Raw,
            s1Rms,
            s1Features,
            s2Raw,
            s2Rms,
            eventState
        );

        // Transmit packet
        bool sent = activeTransport->sendTelemetry(jsonPayload.c_str());
        if (eventActive) {
            Serial.printf("[ALERT TX] Seq #%d: Radar=%s (%.1fm), RMS1=%.3fg, RMS2=%.3fg (Success: %d)\n",
                sequenceNumber, radReading.presence ? "YES" : "NO", radReading.distance, s1Rms, s2Rms, sent);
        } else {
            Serial.printf("[HEARTBEAT] Seq #%d: Bat=%.2fV (%d%%), Comms=%s (Sent: %d)\n",
                sequenceNumber, bat.voltage, bat.percentage, activeTransport->getTransportName(), sent);
        }

        // Power Optimization: Light sleep when idle between sample windows
        if (!eventActive && !radar.isTargetPresent()) {
            power.enterLightSleep(4); // 4ms light sleep between 10ms sampling ticks
        }
    }
}
