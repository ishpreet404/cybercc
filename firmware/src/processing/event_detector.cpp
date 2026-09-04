#include "event_detector.h"

EventDetector::EventDetector(Config config)
    : _config(config), _sta(0.01f), _lta(0.01f), _triggered(false) {
    // Continuous exponential smoothing factors
    // Sampling at 100 Hz dt = 0.01s
    float dt = 0.01f;
    _staAlpha = dt / _config.staLengthSeconds;
    _ltaAlpha = dt / _config.ltaLengthSeconds;
}

void EventDetector::reset() {
    _sta = 0.01f;
    _lta = 0.01f;
    _triggered = false;
}

bool EventDetector::update(float vibrationEnergy) {
    float absEnergy = fabsf(vibrationEnergy);

    // Update STA and LTA
    _sta = (1.0f - _staAlpha) * _sta + _staAlpha * absEnergy;
    _lta = (1.0f - _ltaAlpha) * _lta + _ltaAlpha * absEnergy;

    if (_lta < 0.0001f) _lta = 0.0001f; // Prevent division by zero

    float ratio = _sta / _lta;

    if (!_triggered && ratio > _config.triggerThreshold) {
        _triggered = true;
    } else if (_triggered && ratio < _config.detrendThreshold) {
        _triggered = false;
    }

    return _triggered;
}

float EventDetector::getStaLtaRatio() {
    return _lta > 0.0001f ? (_sta / _lta) : 1.0f;
}

bool EventDetector::isTriggered() {
    return _triggered;
}
