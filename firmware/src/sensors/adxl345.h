#pragma once

#include <Arduino.h>
#include <Wire.h>

/**
 * ADXL345 3-Axis Digital Accelerometer Driver
 * Supports configurable I2C address (0x53 or 0x54) and full resolution ±2g to ±16g range.
 */
class ADXL345Sensor {
public:
    struct RawReading {
        float x;
        float y;
        float z;
        float magnitude;
        uint32_t timestamp;
    };

    ADXL345Sensor(uint8_t i2cAddress = 0x53);

    bool begin(TwoWire &wire = Wire, int sdaPin = 21, int sclPin = 22, uint32_t frequency = 400000);
    bool isConnected();
    RawReading readSample();
    void setRange(uint8_t range); // 0: 2g, 1: 4g, 2: 8g, 3: 16g
    void setRate(uint8_t rate);   // e.g., 0x0A for 100Hz

private:
    uint8_t _address;
    TwoWire *_wire;
    float _scaleFactor;

    void writeRegister(uint8_t reg, uint8_t value);
    uint8_t readRegister(uint8_t reg);
    void readRegisters(uint8_t reg, uint8_t count, uint8_t *dest);
};
