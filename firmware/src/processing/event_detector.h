#pragma once

#include <Arduino.h>

/**
 * STA / LTA (Short-Term Average / Long-Term Average) Seismic Event Detector
 * Standard geophysics trigger for detecting footsteps & vehicle shockwaves above noise floor.
 */
class EventDetector {
public:
    struct Config {
        float staLengthSeconds; // e.g. 0.2s
        float ltaLengthSeconds; // e.g. 2.0s
        float triggerThreshold; // e.g. 2.5
        float detrendThreshold; // e.g. 1.5
    };

    EventDetector(Config config = { 0.2f, 2.0f, 2.5f, 1.4f });

    void reset();
    bool update(float vibrationEnergy);
    float getStaLtaRatio();
    bool isTriggered();

private:
    Config _config;
    float _sta;
    float _lta;
    float _staAlpha;
    float _ltaAlpha;
    bool _triggered;
};
