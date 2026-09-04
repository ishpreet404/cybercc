#pragma once

#include "transport.h"
#include <SPI.h>
#include <LoRa.h>

class LoRaTransport : public TransportManager {
public:
    LoRaTransport(long frequency = 868E6, int csPin = 5, int resetPin = 14, int irqPin = 2);

    bool connect() override;
    void disconnect() override;
    bool sendTelemetry(const char *jsonPayload) override;
    bool sendEvent(const char *jsonPayload) override;
    int getSignalStrength() override;
    bool isConnected() override;
    const char* getTransportName() override { return "lora"; }

private:
    long _frequency;
    int _csPin;
    int _resetPin;
    int _irqPin;
    bool _initialized;
    int _lastRssi;
};
