#pragma once

#include <Arduino.h>

/**
 * 24GHz mmWave Human Detection Radar Driver
 * Supports UART frame parsing (e.g. HLK-LD2410 / LD1115H) and Digital Out pin.
 */
class RadarSensor {
public:
    struct RadarReading {
        bool presence;
        float distance; // meters (0.0 to 8.0)
        float confidence; // 0.0 to 1.0
        uint32_t timestamp;
    };

    RadarSensor(HardwareSerial &serialPort = Serial2, int rxPin = 16, int txPin = 17, int outPin = 18);

    bool begin(uint32_t baudRate = 256000);
    RadarReading read();
    bool isTargetPresent();
    float getTargetDistance();

private:
    HardwareSerial *_serial;
    int _rxPin;
    int _txPin;
    int _outPin;
    bool _hasOutPin;
    RadarReading _lastReading;

    void parseUartPacket();
};
