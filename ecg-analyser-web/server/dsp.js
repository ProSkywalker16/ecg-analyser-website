export function medfilt(signal, k) {
  const half = Math.floor(k / 2);
  const result = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(signal.length, i + half + 1);
    const window = [];
    for (let j = start; j < end; j++) window.push(signal[j]);
    window.sort((a, b) => a - b);
    result[i] = window[Math.floor(window.length / 2)];
  }
  return result;
}

export function baselineWanderRemoval(signal, fs) {
  const k1 = Math.floor(0.2 * fs) % 2 === 0 ? Math.floor(0.2 * fs) + 1 : Math.floor(0.2 * fs);
  const k2 = Math.floor(0.6 * fs) % 2 === 0 ? Math.floor(0.6 * fs) + 1 : Math.floor(0.6 * fs);
  const baseline1 = medfilt(signal, k1);
  const baseline2 = medfilt(baseline1, k2);
  const meanBaseline = baseline2.reduce((a, b) => a + b, 0) / baseline2.length;
  const result = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    result[i] = signal[i] - baseline2[i] + meanBaseline;
  }
  return result;
}

export function lowpassFilter(signal, fs, cutoff = 40, order = 2) {
  const nyquist = fs / 2;
  if (cutoff >= nyquist) return signal;
  const wc = cutoff / nyquist;
  const n = 2 * order + 1;
  const half = Math.floor(n / 2);
  const result = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0, count = 0;
    for (let j = -half; j <= half; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < signal.length) {
        const weight = j === 0 ? wc : Math.sin(Math.PI * wc * j) / (Math.PI * j);
        sum += weight * signal[idx];
        count += Math.abs(weight);
      }
    }
    result[i] = count > 0 ? sum / count : 0;
  }
  return result;
}

export function notchFilter(signal, fs, f0 = 50, Q = 30) {
  const nyquist = fs / 2;
  if (f0 >= nyquist) return signal;
  const w0 = f0 / nyquist;
  const alpha = Math.sin(w0) / (2 * Q);
  const b0 = 1 + alpha;
  const b1 = -2 * Math.cos(w0);
  const b2 = 1 - alpha;
  const a0 = b0;
  const a1 = b1;
  const a2 = b2;
  const result = new Float64Array(signal.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < signal.length; i++) {
    const y = (b0 * signal[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    result[i] = y;
    x2 = x1; x1 = signal[i];
    y2 = y1; y1 = y;
  }
  return result;
}

export function normalize(signal) {
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  let std = 0;
  for (let i = 0; i < signal.length; i++) std += (signal[i] - mean) ** 2;
  std = Math.sqrt(std / signal.length);
  const s = std < 1e-6 ? 1.0 : std;
  const result = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) result[i] = (signal[i] - mean) / s;
  return result;
}

export function extractCentralWindow(signal, timestamps, targetDur = 5.0) {
  const startCutoff = 5.0;
  let startIdx = 0;
  for (let i = 0; i < timestamps.length; i++) {
    if (timestamps[i] >= startCutoff) { startIdx = i; break; }
  }
  const trimmedSignal = signal.slice(startIdx);
  if (trimmedSignal.length === 0) return { signal: new Float64Array(0), timestamps: [] };

  const duration = timestamps[timestamps.length - 1] - timestamps[startIdx];
  const actualFs = duration > 0.1 ? trimmedSignal.length / duration : 360;
  const targetSamples = Math.round(actualFs * targetDur);

  if (trimmedSignal.length <= targetSamples) return { signal: trimmedSignal, timestamps: timestamps.slice(startIdx) };

  const center = Math.floor(trimmedSignal.length / 2);
  const half = Math.floor(targetSamples / 2);
  const si = Math.max(0, center - half);
  const ei = Math.min(trimmedSignal.length, si + targetSamples);
  const ts = timestamps.slice(startIdx + si, startIdx + ei);
  return { signal: trimmedSignal.slice(si, ei), timestamps: ts };
}

export function resampleTo(signal, targetLen = 1800) {
  if (signal.length === targetLen) return signal;
  if (signal.length === 0) return new Float64Array(targetLen);
  const result = new Float64Array(targetLen);
  for (let i = 0; i < targetLen; i++) {
    const pos = (i / (targetLen - 1)) * (signal.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, signal.length - 1);
    const frac = pos - lo;
    result[i] = signal[lo] + frac * (signal[hi] - signal[lo]);
  }
  return result;
}

export function findRPeaks(signal, fs) {
  const squared = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) squared[i] = signal[i] * signal[i];
  const minDist = Math.round(0.27 * fs);
  const height = 1.0;
  const prom = 1.5;
  const peaks = [];
  const normSq = normalize(squared);
  const threshold = normSq.reduce((a, b) => a + b, 0) / normSq.length + prom;
  let i = 0;
  while (i < normSq.length) {
    if (normSq[i] > height && normSq[i] > threshold) {
      let maxIdx = i;
      for (let j = i + 1; j < Math.min(i + minDist, normSq.length); j++) {
        if (normSq[j] > normSq[maxIdx]) maxIdx = j;
      }
      peaks.push(maxIdx);
      i = maxIdx + minDist;
    } else {
      i++;
    }
  }
  return peaks;
}

export const CLASS_MAP = [
  'Normal Sinus Rhythm (NSR)',
  'Atrial Fibrillation (AFib)',
  'Ventricular Tachycardia (VT)',
  'Bradycardia',
  'ST Elevation',
  'Other / Unclassified',
];

export const CLINICAL_GUIDANCE = [
  { text: 'Normal heart rhythm detected. No immediate action required. Continue routine monitoring.', severity: 'normal', color: '#00FFB4' },
  { text: 'Irregular rhythm detected. May indicate Atrial Fibrillation (AFib) — clinical evaluation is recommended.', severity: 'moderate', color: '#ffaa00' },
  { text: 'Ventricular Tachycardia detected — potential emergency. Immediate cardiology review advised.', severity: 'critical', color: '#ff4444' },
  { text: 'Bradycardia detected. If symptomatic (e.g. dizziness, fatigue), seek medical evaluation.', severity: 'moderate', color: '#ffaa00' },
  { text: 'ST Elevation observed — possible myocardial infarction. Urgent medical action needed.', severity: 'critical', color: '#ff4444' },
  { text: 'Unclassified beat pattern detected. Signal quality may be low or rhythm is ambiguous — repeat capture recommended.', severity: 'unknown', color: '#c8d8e8' },
];

export const SEVERITY_LABEL = { normal: 'Normal', moderate: 'Moderate', critical: 'Critical', unknown: 'Unknown' };
