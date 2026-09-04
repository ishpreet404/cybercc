# Cyber Chaukidaar - Seismic Machine Learning Pipeline

## Overview
This directory houses the local, lightweight machine learning subsystem for **Cyber Chaukidaar**.
It processes ground vibration signatures captured by dual ADXL345 accelerometers mechanically spiked into the soil.

## Core Design Principles
1. **Ultra-Fast & CPU-Friendly**: Sub-millisecond (< 1ms) inference latency. No GPU or external cloud APIs required.
2. **Deterministic & Portable**: Features are extracted identically in both JavaScript and Python. Decision trees are serialized to portable JSON weights.
3. **Transparent & Explainable**: Every prediction produces a breakdown of the 8 features and a clear explanation of *why* the classification was made.
4. **Honest Labeling**: Strictly separates `REAL_MODEL` predictions from `DEMO_MODE` simulations.

## The 8 Extracted Features
1. **RMS (Root Mean Square)**: Total vibration energy in the time window.
2. **Peak**: Maximum absolute peak amplitude (g).
3. **Peak-to-Peak**: Dynamic range span between extremes.
4. **Variance**: Statistical dispersion of ground acceleration.
5. **Dominant Frequency (Hz)**: Peak spectral frequency obtained via Discrete Fourier Transform (DFT).
6. **Spectral Energy**: Integrated power across the vibration frequency spectrum.
7. **Spectral Centroid (Hz)**: Frequency center-of-mass distinguishing low-frequency foot thuds from high-frequency vehicular harmonics.
8. **Inter-Peak Interval (ms)**: Average time between successive shockwaves (e.g. human walking cadence ~400–750ms).

## Target Classes
- `NORMAL`: Ambient ground noise floor (RMS < 0.08g).
- `FOOTSTEP_HUMAN`: Human walking/running (1–15 Hz, rhythmic cadence, moderate amplitude).
- `VEHICLE`: Engine and chassis ground rumble (15–50 Hz, high continuous spectral energy).
- `ENVIRONMENTAL`: Wind, rain, distant lightning, aperiodic non-biological noise.

## Retraining the Model (Optional)
```bash
python ml/train_rf.py
```
This fits a 5-tree scikit-learn ensemble and generates `ml/classifier/model_weights.json`.
