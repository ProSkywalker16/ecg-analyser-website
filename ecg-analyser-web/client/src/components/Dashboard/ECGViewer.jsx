import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, AlertTriangle, Loader2, AlertCircle,
  ZoomIn, ZoomOut,
} from 'lucide-react';
import { filesService } from '../../services/api';

// ── constants ──────────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  normal: '#00FFB4',
  moderate: '#ffaa00',
  critical: '#ff4444',
  unknown: '#c8d8e8',
};

const CLINICAL_EVIDENCE = {
  'Atrial Fibrillation (AFib)': 'Irregularity is consistent with Atrial Fibrillation.',
  'Ventricular Tachycardia (VT)': 'High rate and morphology suggest Ventricular Tachycardia.',
  'Bradycardia': 'Heart rate is significantly below normal (60 BPM).',
  'ST Elevation': 'Elevation in ST-segment detected relative to baseline.',
};

const CANVAS_HEIGHT = 320;   // px (CSS)
const PAD_L = 54, PAD_R = 16, PAD_T = 22, PAD_B = 34;

// Default pixels per second — matches a comfortable "desktop app" view
const DEFAULT_PX_PER_SEC = 60;
const MIN_PX_PER_SEC = 10;
const MAX_PX_PER_SEC = 400;

// ── component ──────────────────────────────────────────────────────────────
export default function ECGViewer({ sessionId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [viewMode, setViewMode] = useState('processed');
  const [pxPerSec, setPxPerSec] = useState(DEFAULT_PX_PER_SEC);

  const canvasRef    = useRef(null);
  const containerRef = useRef(null); // the scrollable div

  // ── fetch data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    filesService.fetchProcessedCSV(sessionId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── derive signal array ────────────────────────────────────────────────
  const getSignal = useCallback(() => {
    if (!data) return [];
    if (viewMode === 'raw') return data.raw;
    if (viewMode === 'normalized') return data.normalized;
    return data.processed;
  }, [data, viewMode]);

  // ── draw full signal on a wide canvas ────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const signal = getSignal();
    if (!signal || signal.length === 0) return;

    const fs      = data.fs || 360;
    const totalSec = signal.length / fs;

    // Total canvas width = pxPerSec × totalSec + padding
    const totalPxW = Math.round(pxPerSec * totalSec) + PAD_L + PAD_R;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = totalPxW * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width  = `${totalPxW}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const plotW = totalPxW - PAD_L - PAD_R;
    const plotH = CANVAS_HEIGHT - PAD_T - PAD_B;

    // Background
    ctx.clearRect(0, 0, totalPxW, CANVAS_HEIGHT);
    ctx.fillStyle = '#060e1a';
    ctx.fillRect(PAD_L, PAD_T, plotW, plotH);

    // Grid — vertical lines every 1 s, minor every 0.2 s
    const drawVLine = (x, color, dash) => {
      ctx.strokeStyle = color;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(PAD_L + x, PAD_T);
      ctx.lineTo(PAD_L + x, PAD_T + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // minor grid every 0.2 s
    const minorStep = 0.2;
    for (let t = 0; t <= totalSec; t += minorStep) {
      drawVLine(t * pxPerSec, '#122030', [2, 4]);
    }
    // major grid every 1 s
    for (let t = 0; t <= totalSec; t += 1) {
      drawVLine(t * pxPerSec, '#1a3a55', [4, 4]);
    }
    // horizontal grid lines
    const gridY = 8;
    for (let i = 1; i < gridY; i++) {
      const y = PAD_T + (plotH / gridY) * i;
      ctx.strokeStyle = '#1a3a55';
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(PAD_L + plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Value range (global, so the scale stays fixed while scrolling)
    let minV = Infinity, maxV = -Infinity;
    for (const p of signal) {
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    const range  = maxV - minV || 1;
    const margin = range * 0.1;
    minV -= margin;
    maxV += margin;

    const toX = (idx) => PAD_L + (idx / fs) * pxPerSec;
    const toY = (v)   => PAD_T + plotH - ((v - minV) / (maxV - minV)) * plotH;

    // ECG signal line
    ctx.strokeStyle = viewMode === 'raw' ? '#5a8aaa' : '#00FFB4';
    ctx.lineWidth   = 1.4;
    ctx.beginPath();
    for (let i = 0; i < signal.length; i++) {
      const x = toX(i);
      const y = toY(signal[i].v);
      if (i === 0) ctx.moveTo(x, y);
      else         ctx.lineTo(x, y);
    }
    ctx.stroke();

    // R-peak markers
    if (viewMode !== 'raw' && data.rPeaks && data.rPeaks.length > 0) {
      ctx.fillStyle = '#ff4444';
      for (const peakIdx of data.rPeaks) {
        const x = toX(peakIdx);
        const y = toY(signal[peakIdx]?.v ?? 0);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // X-axis labels (every 1 s, or every 5 s if zoomed out)
    ctx.fillStyle  = '#5a8aaa';
    ctx.font       = '10px JetBrains Mono, monospace';
    ctx.textAlign  = 'center';
    const labelStep = pxPerSec < 20 ? 5 : 1;
    for (let t = 0; t <= totalSec; t += labelStep) {
      const x = PAD_L + t * pxPerSec;
      ctx.fillText(t.toFixed(0) + 's', x, PAD_T + plotH + 20);
    }

    // Y-axis labels (left side, fixed)
    ctx.textAlign = 'right';
    const vSteps  = 5;
    for (let i = 0; i <= vSteps; i++) {
      const v = minV + ((maxV - minV) / vSteps) * i;
      const y = toY(v);
      ctx.fillText(v.toFixed(1), PAD_L - 6, y + 3);
    }

    // Border
    ctx.strokeStyle = '#1a3a55';
    ctx.lineWidth   = 1;
    ctx.strokeRect(PAD_L, PAD_T, plotW, plotH);

    // Axis titles
    ctx.fillStyle  = '#5a8aaa';
    ctx.font       = '9px Inter, sans-serif';
    ctx.textAlign  = 'left';
    ctx.fillText('Time (s)', PAD_L + plotW / 2 - 20, CANVAS_HEIGHT - 2);
    ctx.save();
    ctx.translate(10, PAD_T + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(
      viewMode === 'raw' ? 'Raw ECG'
      : viewMode === 'normalized' ? 'Normalized'
      : 'Processed ECG',
      0, 0
    );
    ctx.restore();
  }, [data, viewMode, pxPerSec, getSignal]);

  useEffect(() => { draw(); }, [draw]);

  // ── wheel zoom — keeps the point under cursor in place ────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container || !data) return;

    const signal = getSignal();
    if (!signal || signal.length === 0) return;

    const rect      = container.getBoundingClientRect();
    const mouseX    = e.clientX - rect.left;                      // px in container
    const scrolledX = container.scrollLeft + mouseX - PAD_L;     // px in plot area
    const timeSec   = scrolledX / pxPerSec;                       // seconds under cursor

    const factor     = e.deltaY < 0 ? 1.25 : 0.8;
    const newPxPerSec = Math.max(MIN_PX_PER_SEC, Math.min(MAX_PX_PER_SEC, pxPerSec * factor));

    // After zoom, scroll so the same second stays under cursor
    const newScrolledX = timeSec * newPxPerSec;
    const newScrollLeft = newScrolledX + PAD_L - mouseX;

    setPxPerSec(newPxPerSec);

    // Apply scroll position AFTER state update & repaint
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
      }
    });
  }, [pxPerSec, data, getSignal]);

  // Attach wheel with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── loading / error states ─────────────────────────────────────────────
  if (loading) return (
    <div className="card p-8 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-primary-400" />
    </div>
  );
  if (error) return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    </div>
  );
  if (!data) return null;

  const pred          = data.prediction;
  const severityColor = SEVERITY_COLORS[pred?.severity] || '#c8d8e8';
  const evidence      = pred ? CLINICAL_EVIDENCE[pred.class] : null;
  const signal        = getSignal();
  const fs            = data.fs || 360;
  const totalDur      = signal.length / fs;

  const zoomIn  = () => {
    const c = containerRef.current;
    const midTime = c ? ((c.scrollLeft + c.clientWidth / 2 - PAD_L) / pxPerSec) : 0;
    const newPps  = Math.min(MAX_PX_PER_SEC, pxPerSec * 1.5);
    setPxPerSec(newPps);
    requestAnimationFrame(() => {
      if (containerRef.current)
        containerRef.current.scrollLeft = midTime * newPps + PAD_L - containerRef.current.clientWidth / 2;
    });
  };

  const zoomOut = () => {
    const c = containerRef.current;
    const midTime = c ? ((c.scrollLeft + c.clientWidth / 2 - PAD_L) / pxPerSec) : 0;
    const newPps  = Math.max(MIN_PX_PER_SEC, pxPerSec / 1.5);
    setPxPerSec(newPps);
    requestAnimationFrame(() => {
      if (containerRef.current)
        containerRef.current.scrollLeft = midTime * newPps + PAD_L - containerRef.current.clientWidth / 2;
    });
  };

  const fitAll = () => {
    const c = containerRef.current;
    if (!c) return;
    // choose pxPerSec so the whole signal fills the container width
    const availW = c.clientWidth - PAD_L - PAD_R;
    const fit    = Math.max(MIN_PX_PER_SEC, availW / totalDur);
    setPxPerSec(fit);
    requestAnimationFrame(() => { if (containerRef.current) containerRef.current.scrollLeft = 0; });
  };

  return (
    <div className="card p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">ECG Viewer</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Session #{data.sessionId}&nbsp;&middot;&nbsp;
              {data.startedAt ? new Date(data.startedAt).toLocaleString() : ''}&nbsp;&middot;&nbsp;
              ~{data.fs} Hz&nbsp;&middot;&nbsp;{totalDur.toFixed(1)}s total
            </p>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <button onClick={zoomIn}  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]" title="Zoom in"><ZoomIn  size={16} /></button>
          <button onClick={zoomOut} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]" title="Zoom out"><ZoomOut size={16} /></button>
          <button onClick={fitAll}  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs font-medium" title="Fit all">Fit</button>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 text-xs">Close</button>
          )}
        </div>
      </div>

      {/* ── Prediction banner ── */}
      {pred && (
        <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: severityColor + '15', borderColor: severityColor + '30', borderWidth: 1 }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: severityColor + '20' }}>
              <AlertTriangle size={20} style={{ color: severityColor }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: severityColor }}>{pred.class}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: severityColor + '20', color: severityColor }}>{pred.severityLabel}</span>
                {pred.confidence != null && <span className="text-xs text-[var(--text-tertiary)]">{pred.confidence.toFixed(1)}% confidence</span>}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{pred.text}</p>
              {evidence && <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">{evidence}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── View mode tabs ── */}
      <div className="flex gap-1 mb-3 p-1 rounded-lg bg-[var(--bg-tertiary)] w-fit">
        {[
          { key: 'raw',        label: 'Raw' },
          { key: 'processed',  label: 'Processed' },
          { key: 'normalized', label: 'AI Input' },
        ].map(m => (
          <button key={m.key}
            onClick={() => setViewMode(m.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === m.key ? 'bg-[var(--card-bg)] shadow-sm text-primary-400' : 'text-[var(--text-secondary)]'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Zoom hint ── */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-xs text-[var(--text-tertiary)]">
          {pxPerSec.toFixed(0)} px/s &middot; scroll horizontally or drag scrollbar to pan
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">
          Scroll&nbsp;wheel&nbsp;=&nbsp;zoom &middot; Red dots&nbsp;=&nbsp;R-peaks
        </span>
      </div>

      {/* ── Scrollable canvas container ── */}
      <div
        ref={containerRef}
        className="rounded-xl border border-[var(--border-color)] overflow-x-auto overflow-y-hidden"
        style={{
          background:    '#060e1a',
          height:        `${CANVAS_HEIGHT}px`,
          cursor:        'default',
          WebkitOverflowScrolling: 'touch',   // smooth on iOS
          scrollbarWidth: 'thin',             // Firefox
          scrollbarColor: '#00FFB460 #0a1828',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'Sample Rate', value: `~${data.fs} Hz` },
          { label: 'Duration',    value: `${totalDur.toFixed(1)}s` },
          { label: 'R-Peaks',     value: data.rPeaks?.length || 0 },
          { label: 'Heart Rate',  value: data.rPeaks?.length > 0
              ? Math.round(data.rPeaks.length / totalDur * 60) + ' BPM'
              : 'N/A' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] text-center">
            <div className="text-xs text-[var(--text-tertiary)]">{s.label}</div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
