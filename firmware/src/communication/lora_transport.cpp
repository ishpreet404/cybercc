#include "lora_transport.h"

LoRaTransport::LoRaTransport(long frequency, int csPin, int resetPin, int irqPin)
    : _frequency(frequency), _csPin(csPin), _resetPin(resetPin), _irqPin(irqPin), _initialized(false), _lastRssi(-75) {}

bool LoRaTransport::connect() {
    LoRa.setPins(_csPin, _resetPin, _irqPin);
    if (!LoRa.begin(_frequency)) {
        return false;
    }

    // Configure standard LoRa parameters for perimeter telemetry
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    LoRa.setTxPower(17);
    LoRa.enableCrc();

    _initialized = true;
    return true;
}

void LoRaTransport::disconnect() {
    LoRa.sleep();
    _initialized = false;
}

bool LoRaTransport::sendTelemetry(const char *jsonPayload) {
    if (!_initialized) {
        if (!connect()) return false;
    }

    LoRa.beginPacket();
    LoRa.print(jsonPayload);
    int res = LoRa.endPacket();

    return (res == 1);
}

bool LoRaTransport::sendEvent(const char *jsonPayload) {
    // Re-send critical events twice for RF redundancy
    bool sent1 = sendTelemetry(jsonPayload);
    delay(40);
    bool sent2 = sendTelemetry(jsonPayload);
    return (sent1 || sent2);
}

int LoRaTransport::getSignalStrength() {
    return _initialized ? LoRa.packetRssi() : -95;
}

bool LoRaTransport::isConnected() {
    return _initialized;
}
