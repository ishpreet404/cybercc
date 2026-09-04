"""
Cyber Chaukidaar - Python Seismic Vibration Feature Extractor
Extracts 8 critical features matching the JS extractor:
1. RMS
2. Peak
3. Peak-to-Peak
4. Variance
5. Dominant Frequency
6. Spectral Energy
7. Spectral Centroid
8. Inter-Peak Interval
"""

import numpy as np

class FeatureExtractor:
    def __init__(self, sampling_rate=100, peak_threshold_ratio=0.4):
        self.sampling_rate = sampling_rate
        self.peak_threshold_ratio = peak_threshold_ratio

    def compute_magnitudes(self, samples):
        arr = np.array(samples)
        if arr.ndim == 2 and arr.shape[1] >= 3:
            return np.sqrt(arr[:, 0]**2 + arr[:, 1]**2 + arr[:, 2]**2)
        return arr.flatten()

    def remove_dc_offset(self, signal):
        return signal - np.mean(signal)

    def extract(self, samples):
        raw = self.compute_magnitudes(samples)
        if len(raw) < 4:
            return self.get_default_features()

        signal = self.remove_dc_offset(raw)
        N = len(signal)

        # 1. RMS
        rms = float(np.sqrt(np.mean(signal**2)))

        # 2. Peak & 3. Peak-to-Peak
        peak = float(np.max(np.abs(signal)))
        peak_to_peak = float(np.max(signal) - np.min(signal))

        # 4. Variance
        variance = float(np.var(signal))

        # 5, 6, 7. Spectral features
        fft_vals = np.fft.rfft(signal)
        fft_mags = np.abs(fft_vals) / N
        freqs = np.fft.rfftfreq(N, 1.0 / self.sampling_rate)

        # Skip DC component at index 0
        mags_no_dc = fft_mags[1:]
        freqs_no_dc = freqs[1:]

        if len(mags_no_dc) > 0 and np.sum(mags_no_dc) > 0:
            dom_idx = np.argmax(mags_no_dc)
            dom_freq = float(freqs_no_dc[dom_idx])
            spec_energy = float(np.sum(mags_no_dc**2))
            spec_centroid = float(np.sum(freqs_no_dc * mags_no_dc) / np.sum(mags_no_dc))
        else:
            dom_freq = 0.0
            spec_energy = 0.0
            spec_centroid = 0.0

        # 8. Inter-Peak Interval
        ipi = self.compute_ipi(signal, peak, self.sampling_rate)

        return {
            "rms": round(rms, 4),
            "peak": round(peak, 4),
            "peakToPeak": round(peak_to_peak, 4),
            "variance": round(variance, 6),
            "dominantFrequency": round(dom_freq, 2),
            "spectralEnergy": round(spec_energy, 4),
            "spectralCentroid": round(spec_centroid, 2),
            "interPeakInterval": round(ipi, 2)
        }

    def compute_ipi(self, signal, max_abs, Fs):
        thresh = max_abs * self.peak_threshold_ratio
        peaks = []
        for i in range(1, len(signal) - 1):
            if signal[i] > thresh and signal[i] > signal[i-1] and signal[i] >= signal[i+1]:
                if len(peaks) == 0 or (i - peaks[-1]) >= 5:
                    peaks.append(i)
        if len(peaks) < 2:
            return 0.0
        intervals_ms = [(peaks[j] - peaks[j-1]) / Fs * 1000.0 for j in range(1, len(peaks))]
        return float(np.mean(intervals_ms))

    def get_default_features(self):
        return {
            "rms": 0.0, "peak": 0.0, "peakToPeak": 0.0, "variance": 0.0,
            "dominantFrequency": 0.0, "spectralEnergy": 0.0, "spectralCentroid": 0.0,
            "interPeakInterval": 0.0
        }
