#pragma once

#include <Arduino.h>

class PowerManager {
public:
    struct BatteryStatus {
        float voltage;
        uint8_t percentage;
        bool isLow;
        bool isCritical;
    };

    PowerManager(int adcPin = 34, float dividerRatio = 2.0f);

    void begin();
    BatteryStatus readBattery();
    void enterLightSleep(uint32_t sleepMs);
    void enterDeepSleep(uint32_t sleepMs, gpio_num_t wakePin = GPIO_NUM_4);

private:
    int _adcPin;
    float _dividerRatio;
    uint8_t calculatePercentage(float voltage);
};
