#pragma once

#include <Arduino.h>

/**
 * TransportManager Abstract Base Class
 * Allows hot-swapping between WiFi, BLE, and LoRa without changing application logic.
 */
class TransportManager {
public:
    virtual ~TransportManager() {}

    virtual bool connect() = 0;
    virtual void disconnect() = 0;
    virtual bool sendTelemetry(const char *jsonPayload) = 0;
    virtual bool sendEvent(const char *jsonPayload) = 0;
    virtual int getSignalStrength() = 0; // RSSI in dBm
    virtual bool isConnected() = 0;
    virtual const char* getTransportName() = 0;
};
