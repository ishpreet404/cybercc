#include "adxl345.h"
#include <math.h>

#define ADXL345_REG_DEVID          0x00
#define ADXL345_REG_BW_RATE        0x2C
#define ADXL345_REG_POWER_CTL      0x2D
#define ADXL345_REG_DATA_FORMAT    0x31
#define ADXL345_REG_DATAX0         0x32

ADXL345Sensor::ADXL345Sensor(uint8_t i2cAddress)
    : _address(i2cAddress), _wire(&Wire), _scaleFactor(0.0039f) {}

bool ADXL345Sensor::begin(TwoWire &wire, int sdaPin, int sclPin, uint32_t frequency) {
    _wire = &wire;
    _wire->begin(sdaPin, sclPin, frequency);

    uint8_t devId = readRegister(ADXL345_REG_DEVID);
    if (devId != 0xE5) {
        return false; // Not an ADXL345
    }

    // Set full resolution, ±4g range
    writeRegister(ADXL345_REG_DATA_FORMAT, 0x09);
    _scaleFactor = 0.0039f; // 3.9 mg/LSB in full resolution

    // Set output data rate to 100 Hz (BW_RATE = 0x0A)
    writeRegister(ADXL345_REG_BW_RATE, 0x0A);

    // Measurement mode (POWER_CTL = 0x08)
    writeRegister(ADXL345_REG_POWER_CTL, 0x08);

    return true;
}

bool ADXL345Sensor::isConnected() {
    return readRegister(ADXL345_REG_DEVID) == 0xE5;
}

ADXL345Sensor::RawReading ADXL345Sensor::readSample() {
    uint8_t buf[6];
    readRegisters(ADXL345_REG_DATAX0, 6, buf);

    int16_t rawX = (int16_t)(((uint16_t)buf[1] << 8) | buf[0]);
    int16_t rawY = (int16_t)(((uint16_t)buf[3] << 8) | buf[2]);
    int16_t rawZ = (int16_t)(((uint16_t)buf[5] << 8) | buf[4]);

    RawReading r;
    r.x = rawX * _scaleFactor;
    r.y = rawY * _scaleFactor;
    r.z = rawZ * _scaleFactor;
    r.magnitude = sqrtf(r.x * r.x + r.y * r.y + r.z * r.z);
    r.timestamp = millis();

    return r;
}

void ADXL345Sensor::setRange(uint8_t range) {
    uint8_t format = readRegister(ADXL345_REG_DATA_FORMAT);
    format &= 0xF0;
    format |= (range & 0x03) | 0x08; // Preserve FULL_RES bit
    writeRegister(ADXL345_REG_DATA_FORMAT, format);
}

void ADXL345Sensor::setRate(uint8_t rate) {
    writeRegister(ADXL345_REG_BW_RATE, rate & 0x0F);
}

void ADXL345Sensor::writeRegister(uint8_t reg, uint8_t value) {
    _wire->beginTransmission(_address);
    _wire->write(reg);
    _wire->write(value);
    _wire->endTransmission();
}

uint8_t ADXL345Sensor::readRegister(uint8_t reg) {
    _wire->beginTransmission(_address);
    _wire->write(reg);
    _wire->endTransmission(false);
    _wire->requestFrom(_address, (uint8_t)1);
    return _wire->available() ? _wire->read() : 0;
}

void ADXL345Sensor::readRegisters(uint8_t reg, uint8_t count, uint8_t *dest) {
    _wire->beginTransmission(_address);
    _wire->write(reg);
    _wire->endTransmission(false);
    _wire->requestFrom(_address, count);
    for (uint8_t i = 0; i < count && _wire->available(); i++) {
        dest[i] = _wire->read();
    }
}
