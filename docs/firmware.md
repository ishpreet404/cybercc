# Cyber Chaukidaar - Firmware Technical Manual

## Firmware Module Structure
- `sensors/adxl345.cpp`: Full-resolution I2C driver for ADXL345. Reads raw X, Y, Z and computes acceleration magnitude $\sqrt{x^2 + y^2 + z^2}$.
- `sensors/radar.cpp`: 24GHz FMCW mmWave radar driver. Parses UART frames for target state, moving target distance (cm), and stationary target distance (cm).
- `processing/vibration_filter.cpp`: 1st order IIR DC bias removal filter + 32-sample circular window feature extractor. Computes RMS, Peak, Peak-to-Peak, Variance, Dominant Frequency (via DFT), Spectral Energy, Spectral Centroid, and Inter-Peak Interval (IPI).
- `processing/event_detector.cpp`: STA/LTA continuous geophysics seismic trigger algorithm.
- `communication/transport.cpp`: Abstract transport layer with hot-swappable drivers for `WiFiTransport`, `BLETransport`, and `LoRaTransport`.
- `power/power_manager.cpp`: Battery voltage measurement with piecewise 18650 curve, light sleep duty-cycling, and wake-on-interrupt.

## Power Consumption Benchmarks
- Active sampling (Dual ADXL + Radar): ~75 mA @ 3.3V
- WiFi Burst TX (50ms): ~160 mA
- LoRa Burst TX (80ms): ~90 mA
- Light Sleep between sample ticks: ~2.5 mA
- Deep Sleep (Wake on ADXL INT1 pin): ~15 µA
