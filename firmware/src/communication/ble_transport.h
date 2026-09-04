#pragma once

#include "transport.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

class BLETransport : public TransportManager {
public:
    BLETransport(const char *nodeName = "CHAUKIDAAR-NODE-01");

    bool connect() override;
    void disconnect() override;
    bool sendTelemetry(const char *jsonPayload) override;
    bool sendEvent(const char *jsonPayload) override;
    int getSignalStrength() override;
    bool isConnected() override;
    const char* getTransportName() override { return "ble"; }

private:
    const char *_nodeName;
    BLEServer *_pServer;
    BLECharacteristic *_pCharacteristic;
    bool _deviceConnected;
};
