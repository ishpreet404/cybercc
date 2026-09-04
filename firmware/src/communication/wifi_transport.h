#pragma once

#include "transport.h"
#include <WiFi.h>
#include <HTTPClient.h>

class WiFiTransport : public TransportManager {
public:
    WiFiTransport(const char *ssid = "CyberChaukidaar_Net", 
                  const char *password = "SentryGrid2026", 
                  const char *serverUrl = "http://192.168.1.100:8787/api/telemetry");

    bool connect() override;
    void disconnect() override;
    bool sendTelemetry(const char *jsonPayload) override;
    bool sendEvent(const char *jsonPayload) override;
    int getSignalStrength() override;
    bool isConnected() override;
    const char* getTransportName() override { return "wifi"; }

private:
    const char *_ssid;
    const char *_password;
    const char *_serverUrl;
    HTTPClient _http;
};
