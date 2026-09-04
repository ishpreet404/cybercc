#include "power_manager.h"
#include <esp_sleep.h>

PowerManager::PowerManager(int adcPin, float dividerRatio)
    : _adcPin(adcPin), _dividerRatio(dividerRatio) {}

void PowerManager::begin() {
    pinMode(_adcPin, INPUT);
    analogReadResolution(12); // 0-4095
    analogSetAttenuation(ADC_11db); // Up to ~3.6V on pin
}

PowerManager::BatteryStatus PowerManager::readBattery() {
    // Oversample ADC for noise reduction
    uint32_t sum = 0;
    for (int i = 0; i < 16; i++) {
        sum += analogRead(_adcPin);
        delayMicroseconds(50);
    }
    float rawAvg = (float)sum / 16.0f;

    // Convert raw ADC (3.3V reference) to battery voltage via resistor divider
    float pinVoltage = (rawAvg / 4095.0f) * 3.3f;
    float batteryVoltage = pinVoltage * _dividerRatio;

    BatteryStatus status;
    status.voltage = batteryVoltage;
    status.percentage = calculatePercentage(batteryVoltage);
    status.isLow = (status.percentage < 20);
    status.isCritical = (status.percentage < 10);

    return status;
}

uint8_t PowerManager::calculatePercentage(float voltage) {
    // Standard Li-ion 18650 discharge curve approximation
    if (voltage >= 4.20f) return 100;
    if (voltage <= 3.20f) return 0;

    // Linear piecewise approximation:
    // 4.20V = 100%, 4.00V = 85%, 3.80V = 55%, 3.60V = 20%, 3.30V = 5%, 3.20V = 0%
    if (voltage >= 4.00f) {
        return 85 + (uint8_t)(((voltage - 4.00f) / 0.20f) * 15);
    } else if (voltage >= 3.80f) {
        return 55 + (uint8_t)(((voltage - 3.80f) / 0.20f) * 30);
    } else if (voltage >= 3.60f) {
        return 20 + (uint8_t)(((voltage - 3.60f) / 0.20f) * 35);
    } else {
        return (uint8_t)(((voltage - 3.20f) / 0.40f) * 20);
    }
}

void PowerManager::enterLightSleep(uint32_t sleepMs) {
    esp_sleep_enable_timer_wakeup((uint64_t)sleepMs * 1000ULL);
    esp_light_sleep_start();
}

void PowerManager::enterDeepSleep(uint32_t sleepMs, gpio_num_t wakePin) {
    esp_sleep_enable_timer_wakeup((uint64_t)sleepMs * 1000ULL);
    if (wakePin != GPIO_NUM_NC) {
        esp_sleep_enable_ext0_wakeup(wakePin, 1); // Wake on HIGH interrupt (e.g. ADXL INT1 or Radar OUT)
    }
    esp_deep_sleep_start();
}
