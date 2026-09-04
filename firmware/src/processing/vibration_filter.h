#pragma once

#include <Arduino.h>

/**
 * 8-Feature Seismic Extraction Container
 */
struct SeismicFeatures {
    float rms;
    float peak;
    float peakToPeak;
    float variance;
    float dominantFrequency;
    float spectralEnergy;
    float spectralCentroid;
    float interPeakInterval;
};

/**
 * Vibration Filter and Feature Extraction Pipeline
 */
class VibrationFilter {
public:
    struct Config {
        float samplingRate; // Hz (e.g. 100 Hz)
        uint16_t windowSize; // e.g. 32 samples
        float highPassAlpha; // IIR DC removal constant
    };

    VibrationFilter(Config config = { 100.0f, 32, 0.95f });

    void reset();
    float processSample(float rawMagnitude);
    bool isWindowFull();
    SeismicFeatures extractFeatures();
    float getCurrentRms();

private:
    Config _config;
    float _prevRaw;
    float _prevFiltered;
    float *_buffer;
    uint16_t _bufferIndex;
    uint16_t _count;
};
