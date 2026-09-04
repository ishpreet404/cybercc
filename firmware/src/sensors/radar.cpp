#include "radar.h"

RadarSensor::RadarSensor(HardwareSerial &serialPort, int rxPin, int txPin, int outPin)
    : _serial(&serialPort), _rxPin(rxPin), _txPin(txPin), _outPin(outPin), _hasOutPin(outPin >= 0) {
    _lastReading = { false, 0.0f, 0.0f, 0 };
}

bool RadarSensor::begin(uint32_t baudRate) {
    if (_hasOutPin) {
        pinMode(_outPin, INPUT_PULLDOWN);
    }
    _serial->begin(baudRate, SERIAL_8N1, _rxPin, _txPin);
    return true;
}

RadarSensor::RadarReading RadarSensor::read() {
    // Check digital OUT pin first if available
    bool digitalActive = false;
    if (_hasOutPin) {
        digitalActive = (digitalRead(_outPin) == HIGH);
    }

    // Parse incoming UART packets from LD2410
    parseUartPacket();

    if (digitalActive && !_lastReading.presence) {
        _lastReading.presence = true;
        _lastReading.distance = 4.0f; // Estimated mid-point if UART not reporting distance yet
        _lastReading.confidence = 0.85f;
    }

    _lastReading.timestamp = millis();
    return _lastReading;
}

bool RadarSensor::isTargetPresent() {
    return _lastReading.presence;
}

float RadarSensor::getTargetDistance() {
    return _lastReading.distance;
}

void RadarSensor::parseUartPacket() {
    // Protocol parser for HLK-LD2410 mmWave module:
    // Header: FD FC FB FA
    // Data Length (2 bytes)
    // Target State (1 byte: 0x00=none, 0x01=moving, 0x02=stationary, 0x03=both)
    // Moving Target Distance (2 bytes, in cm)
    // Moving Target Energy (1 byte)
    // Stationary Target Distance (2 bytes, in cm)
    // Stationary Target Energy (1 byte)
    // Tail: 04 03 02 01
    while (_serial->available() >= 23) {
        if (_serial->read() == 0xFD && _serial->peek() == 0xFC) {
            _serial->read(); // 0xFC
            if (_serial->read() == 0xFB && _serial->read() == 0xFA) {
                // Header matched
                uint8_t lenLow = _serial->read();
                uint8_t lenHigh = _serial->read();
                uint8_t dataType = _serial->read();

                if (dataType == 0x02 || dataType == 0x01) { // Basic target frame
                    uint8_t targetState = _serial->read();
                    uint16_t moveDistCm = _serial->read() | (_serial->read() << 8);
                    uint8_t moveEnergy = _serial->read();
                    uint16_t statDistCm = _serial->read() | (_serial->read() << 8);
                    uint8_t statEnergy = _serial->read();

                    if (targetState > 0) {
                        _lastReading.presence = true;
                        float distMeters = (targetState == 0x01 || targetState == 0x03) 
                            ? (float)moveDistCm / 100.0f 
                            : (float)statDistCm / 100.0f;
                        
                        _lastReading.distance = constrain(distMeters, 0.0f, 8.5f);
                        _lastReading.confidence = constrain((float)moveEnergy / 100.0f + 0.2f, 0.5f, 0.98f);
                    } else {
                        _lastReading.presence = false;
                        _lastReading.distance = 0.0f;
                        _lastReading.confidence = 0.0f;
                    }
                }
            }
        }
    }
}
