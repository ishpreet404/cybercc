/**
 * Cyber Chaukidaar - Seismic Vibration Feature Extractor
 * Extracts 8 critical time & frequency domain features from raw accelerometer signals:
 * 1. RMS (Root Mean Square)
 * 2. Peak (Maximum absolute amplitude)
 * 3. Peak-to-Peak (Span between max and min)
 * 4. Variance (Statistical spread / dispersion)
 * 5. Dominant Frequency (Hz of peak spectral magnitude)
 * 6. Spectral Energy (Sum of squared FFT magnitudes)
 * 7. Spectral Centroid (Center of gravity of frequency spectrum)
 * 8. Inter-Peak Interval (Average ms between prominent local peaks)
 */

class FeatureExtractor {
  /**
   * @param {Object} options
   * @param {number} options.samplingRate - Accelerometer sampling frequency in Hz (e.g., 100 Hz)
   * @param {number} options.peakThresholdRatio - Threshold multiplier for peak detection in IPI
   */
  constructor(options = {}) {
    this.samplingRate = options.samplingRate || 100; // default 100Hz for ADXL345
    this.peakThresholdRatio = options.peakThresholdRatio || 0.4;
  }

  /**
   * Compute magnitude array from 3-axis readings or 1D stream
   * magnitude = sqrt(x² + y² + z²)
   */
  computeMagnitudes(samples) {
    if (!Array.isArray(samples) || samples.length === 0) return [];
    
    // If samples are already numbers
    if (typeof samples[0] === 'number') {
      return samples;
    }

    // If samples are objects {x, y, z}
    return samples.map(s => {
      const x = s.x || 0;
      const y = s.y || 0;
      const z = s.z || 0;
      return Math.sqrt(x * x + y * y + z * z);
    });
  }

  /**
   * Remove DC offset / baseline gravity component (High-pass filter approximation)
   */
  removeDcOffset(signal) {
    if (signal.length === 0) return [];
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    return signal.map(v => v - mean);
  }

  /**
   * Extract all 8 features from a signal window
   * @param {number[]|Object[]} samples - Array of acceleration samples
   * @returns {Object} 8 extracted features
   */
  extract(samples) {
    const rawMagnitudes = this.computeMagnitudes(samples);
    if (rawMagnitudes.length === 0) {
      return this.getDefaultFeatures();
    }

    // High-pass filter / remove DC gravity component
    const signal = this.removeDcOffset(rawMagnitudes);
    const N = signal.length;
    if (N < 4) return this.getDefaultFeatures();

    // 1. RMS
    const sumSquares = signal.reduce((acc, v) => acc + v * v, 0);
    const rms = Math.sqrt(sumSquares / N);

    // 2. Peak & 3. Peak-to-Peak
    let minVal = signal[0];
    let maxVal = signal[0];
    let maxAbs = Math.abs(signal[0]);
    for (let i = 1; i < N; i++) {
      const v = signal[i];
      const absV = Math.abs(v);
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
      if (absV > maxAbs) maxAbs = absV;
    }
    const peak = maxAbs;
    const peakToPeak = maxVal - minVal;

    // 4. Variance
    const mean = signal.reduce((acc, v) => acc + v, 0) / N;
    const variance = signal.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / N;

    // 5, 6, 7. Frequency Domain via Real Discrete Fourier Transform (DFT)
    const { dominantFrequency, spectralEnergy, spectralCentroid } = this.computeSpectralFeatures(signal, this.samplingRate);

    // 8. Inter-Peak Interval (IPI)
    const interPeakInterval = this.computeInterPeakInterval(signal, maxAbs, this.samplingRate);

    return {
      rms: Number(rms.toFixed(4)),
      peak: Number(peak.toFixed(4)),
      peakToPeak: Number(peakToPeak.toFixed(4)),
      variance: Number(variance.toFixed(6)),
      dominantFrequency: Number(dominantFrequency.toFixed(2)),
      spectralEnergy: Number(spectralEnergy.toFixed(4)),
      spectralCentroid: Number(spectralCentroid.toFixed(2)),
      interPeakInterval: Number(interPeakInterval.toFixed(2))
    };
  }

  /**
   * Spectral feature computation (DFT for frequency domain)
   */
  computeSpectralFeatures(signal, Fs) {
    const N = signal.length;
    const halfN = Math.floor(N / 2);
    let maxMag = -1;
    let domFreq = 0;
    let totalEnergy = 0;
    let weightedFreqSum = 0;
    let magSum = 0;

    // Compute DFT up to Nyquist frequency
    for (let k = 1; k < halfN; k++) {
      let real = 0;
      let imag = 0;
      const angle = (2 * Math.PI * k) / N;
      for (let n = 0; n < N; n++) {
        real += signal[n] * Math.cos(angle * n);
        imag -= signal[n] * Math.sin(angle * n);
      }
      const mag = Math.sqrt(real * real + imag * imag) / N;
      const freq = (k * Fs) / N;
      const energy = mag * mag;

      totalEnergy += energy;
      weightedFreqSum += freq * mag;
      magSum += mag;

      if (mag > maxMag) {
        maxMag = mag;
        domFreq = freq;
      }
    }

    const spectralCentroid = magSum > 0 ? weightedFreqSum / magSum : 0;

    return {
      dominantFrequency: domFreq,
      spectralEnergy: totalEnergy,
      spectralCentroid: spectralCentroid
    };
  }

  /**
   * Inter-Peak Interval (ms between prominent local shockwave peaks)
   */
  computeInterPeakInterval(signal, maxAbs, Fs) {
    const N = signal.length;
    const threshold = maxAbs * this.peakThresholdRatio;
    const peakIndices = [];

    for (let i = 1; i < N - 1; i++) {
      if (signal[i] > threshold && signal[i] > signal[i - 1] && signal[i] >= signal[i + 1]) {
        // Enforce minimum refractory period (e.g. 5 samples = 50ms)
        if (peakIndices.length === 0 || (i - peakIndices[peakIndices.length - 1]) >= 5) {
          peakIndices.push(i);
        }
      }
    }

    if (peakIndices.length < 2) {
      return 0; // Not enough peaks to establish rhythm
    }

    let totalIntervalMs = 0;
    for (let j = 1; j < peakIndices.length; j++) {
      const sampleDiff = peakIndices[j] - peakIndices[j - 1];
      const intervalMs = (sampleDiff / Fs) * 1000;
      totalIntervalMs += intervalMs;
    }

    return totalIntervalMs / (peakIndices.length - 1);
  }

  getDefaultFeatures() {
    return {
      rms: 0,
      peak: 0,
      peakToPeak: 0,
      variance: 0,
      dominantFrequency: 0,
      spectralEnergy: 0,
      spectralCentroid: 0,
      interPeakInterval: 0
    };
  }
}

module.exports = FeatureExtractor;
