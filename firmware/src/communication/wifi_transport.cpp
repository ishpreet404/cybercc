#include "wifi_transport.h"

WiFiTransport::WiFiTransport(const char *ssid, const char *password, const char *serverUrl)
    : _ssid(ssid), _password(password), _serverUrl(serverUrl) {}

bool WiFiTransport::connect() {
    if (WiFi.status() == WL_CONNECTED) return true;

    WiFi.mode(WIFI_STA);
    WiFi.begin(_ssid, _password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 15) {
        delay(300);
        attempts++;
    }

    return WiFi.status() == WL_CONNECTED;
}

void WiFiTransport::disconnect() {
    WiFi.disconnect();
}

bool WiFiTransport::sendTelemetry(const char *jsonPayload) {
    if (WiFi.status() != WL_CONNECTED) {
        if (!connect()) return false;
    }

    _http.begin(_serverUrl);
    _http.addHeader("Content-Type", "application/json");

    int httpCode = _http.POST((uint8_t*)jsonPayload, strlen(jsonPayload));
    _http.end();

    return (httpCode >= 200 && httpCode < 300);
}

bool WiFiTransport::sendEvent(const char *jsonPayload) {
    return sendTelemetry(jsonPayload); // Forward event packet to gateway
}

int WiFiTransport::getSignalStrength() {
    return (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : -99;
}

bool WiFiTransport::isConnected() {
    return (WiFi.status() == WL_CONNECTED);
}
