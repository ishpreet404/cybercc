#include "vibration_filter.h"
#include <math.h>

VibrationFilter::VibrationFilter(Config config)
    : _config(config), _prevRaw(0.0f), _prevFiltered(0.0f), _bufferIndex(0), _count(0) {
    _buffer = new float[_config.windowSize];
    reset();
}

void VibrationFilter::reset() {
    _prevRaw = 0.0f;
    _prevFiltered = 0.0f;
    _bufferIndex = 0;
    _count = 0;
    for (uint16_t i = 0; i < _config.windowSize; i++) {
        _buffer[i] = 0.0f;
    }
}

float VibrationFilter::processSample(float rawMagnitude) {
    // 1st order IIR High-pass filter to remove DC gravity bias (1g)
    // y[n] = alpha * (y[n-1] + x[n] - x[n-1])
    float filtered = _config.highPassAlpha * (_prevFiltered + rawMagnitude - _prevRaw);
    _prevRaw = rawMagnitude;
    _prevFiltered = filtered;

    // Buffer sample in circular window
    _buffer[_bufferIndex] = filtered;
    _bufferIndex = (_bufferIndex + 1) % _config.windowSize;
    if (_count < _config.windowSize) _count++;

    return filtered;
}

bool VibrationFilter::isWindowFull() {
    return _count >= _config.windowSize;
}

float VibrationFilter::getCurrentRms() {
    if (_count == 0) return 0.0f;
    float sumSq = 0.0f;
    for (uint16_t i = 0; i < _count; i++) {
        sumSq += _buffer[i] * _buffer[i];
    }
    return sqrtf(sumSq / _count);
}

SeismicFeatures VibrationFilter::extractFeatures() {
    SeismicFeatures f = { 0 };
    if (_count < 4) return f;

    const uint16_t N = _count;
    float sum = 0.0f;
    float sumSq = 0.0f;
    float minVal = _buffer[0];
    float maxVal = _buffer[0];
    float maxAbs = fabsf(_buffer[0]);

    for (uint16_t i = 0; i < N; i++) {
        float v = _buffer[i];
        float absV = fabsf(v);
        sum += v;
        sumSq += v * v;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
        if (absV > maxAbs) maxAbs = absV;
    }

    // 1. RMS
    f.rms = sqrtf(sumSq / N);

    // 2. Peak & 3. Peak-to-Peak
    f.peak = maxAbs;
    f.peakToPeak = maxVal - minVal;

    // 4. Variance
    float mean = sum / N;
    float varSum = 0.0f;
    for (uint16_t i = 0; i < N; i++) {
        varSum += (_buffer[i] - mean) * (_buffer[i] - mean);
    }
    f.variance = varSum / N;

    // 5, 6, 7. Real Spectral Features via Discrete Fourier Transform
    const uint16_t halfN = N / 2;
    float maxMag = -1.0f;
    float domFreq = 0.0f;
    float totalEnergy = 0.0f;
    float weightedFreqSum = 0.0f;
    float magSum = 0.0f;

    for (uint16_t k = 1; k < halfN; k++) {
        float real = 0.0f;
        float imag = 0.0f;
        float angle = (2.0f * M_PI * k) / N;
        for (uint16_t n = 0; n < N; n++) {
            real += _buffer[n] * cosf(angle * n);
            imag -= _buffer[n] * sinf(angle * n);
        }
        float mag = sqrtf(real * real + imag * imag) / N;
        float freq = (k * _config.samplingRate) / N;
        float energy = mag * mag;

        totalEnergy += energy;
        weightedFreqSum += freq * mag;
        magSum += mag;

        if (mag > maxMag) {
            maxMag = mag;
            domFreq = freq;
        }
    }

    f.dominantFrequency = domFreq;
    f.spectralEnergy = totalEnergy;
    f.spectralCentroid = magSum > 0.0f ? (weightedFreqSum / magSum) : 0.0f;

    // 8. Inter-Peak Interval
    float threshold = maxAbs * 0.45f;
    int lastPeakIdx = -100;
    float totalInterval = 0.0f;
    int intervalCount = 0;

    for (uint16_t i = 1; i < N - 1; i++) {
        if (_buffer[i] > threshold && _buffer[i] > _buffer[i - 1] && _buffer[i] >= _buffer[i + 1]) {
            if ((i - lastPeakIdx) >= 4) { // 4 samples refractory (40ms at 100Hz)
                if (lastPeakIdx >= 0) {
                    totalInterval += ((float)(i - lastPeakIdx) / _config.samplingRate) * 1000.0f;
                    intervalCount++;
                }
                lastPeakIdx = i;
            }
        }
    }
    f.interPeakInterval = intervalCount > 0 ? (totalInterval / intervalCount) : 0.0f;

    return f;
}
