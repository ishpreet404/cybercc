#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../sensors/adxl345.h"
#include "../sensors/radar.h"
#include "../processing/vibration_filter.h"
#include "../power/power_manager.h"

class TelemetrySerializer {
public:
    static String serialize(
        const char *nodeId,
        uint32_t sequence,
        const char *transportName,
        int rssi,
        const PowerManager::BatteryStatus &battery,
        const RadarSensor::RadarReading &radar,
        const ADXL345Sensor::RawReading &s1Raw,
        float s1Rms,
        const SeismicFeatures &s1Features,
        const ADXL345Sensor::RawReading &s2Raw,
        float s2Rms,
        const char *eventState
    );
};
