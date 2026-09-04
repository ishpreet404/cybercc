#include "ble_transport.h"

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

class ServerCallbacks : public BLEServerCallbacks {
public:
    ServerCallbacks(bool &connectedFlag) : _connected(connectedFlag) {}
    void onConnect(BLEServer* pServer) { _connected = true; }
    void onDisconnect(BLEServer* pServer) { _connected = false; }
private:
    bool &_connected;
};

BLETransport::BLETransport(const char *nodeName)
    : _nodeName(nodeName), _pServer(nullptr), _pCharacteristic(nullptr), _deviceConnected(false) {}

bool BLETransport::connect() {
    BLEDevice::init(_nodeName);
    _pServer = BLEDevice::createServer();
    _pServer->setCallbacks(new ServerCallbacks(_deviceConnected));

    BLEService *pService = _pServer->createService(SERVICE_UUID);
    _pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    _pCharacteristic->addDescriptor(new BLE2902());

    pService->start();
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    BLEDevice::startAdvertising();

    return true;
}

void BLETransport::disconnect() {
    BLEDevice::deinit(true);
    _deviceConnected = false;
}

bool BLETransport::sendTelemetry(const char *jsonPayload) {
    if (!_pCharacteristic) return false;
    _pCharacteristic->setValue((uint8_t*)jsonPayload, strlen(jsonPayload));
    _pCharacteristic->notify();
    return true;
}

bool BLETransport::sendEvent(const char *jsonPayload) {
    return sendTelemetry(jsonPayload);
}

int BLETransport::getSignalStrength() {
    return _deviceConnected ? -68 : -90;
}

bool BLETransport::isConnected() {
    return _deviceConnected;
}
