import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, AlertTriangle, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
} from 'lucide-react';
import { filesService } from '../../services/api';

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

export default function ECGViewer({ sessionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('processed');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    filesService.fetchProcessedCSV(sessionId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const getSignal = useCallback(() => {
    if (!data) return [];
    if (viewMode === 'raw') return data.raw;
    if (viewMode === 'normalized') return data.normalized;
    return data.processed;
  }, [data, viewMode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    const signal = getSignal();
    if (signal.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const viewLen = Math.floor(signal.length / zoom);
    const startIdx = Math.max(0, Math.min(offset, signal.length - viewLen));
    const endIdx = Math.min(signal.length, startIdx + viewLen);
    const visible = signal.slice(startIdx, endIdx);

    const padL = 50, padR = 20, padT = 20, padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#060e1a';
    ctx.fillRect(padL, padT, plotW, plotH);

    ctx.strokeStyle = '#1a3a55';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    const gridX = 10, gridY = 8;
    for (let i = 1; i < gridX; i++) {
      const x = padL + (plotW / gridX) * i;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }
    for (let i = 1; i < gridY; i++) {
      const y = padT + (plotH / gridY) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }
    ctx.setLineDash([]);

    let minV = Infinity, maxV = -Infinity;
    for (const p of visible) {
      if (p.v < minV) minV = p.v;
      if (p.v > maxV) maxV = p.v;
    }
    const range = maxV - minV || 1;
    const margin = range * 0.1;
    minV -= margin;
    maxV += margin;

    const toX = (i) => padL + (i / visible.length) * plotW;
    const toY = (v) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

    ctx.strokeStyle = viewMode === 'raw' ? '#5a8aaa' : '#00FFB4';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < visible.length; i++) {
      const x = toX(i);
      const y = toY(visible[i].v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (viewMode !== 'raw' && data.rPeaks) {
      const localPeaks = data.rPeaks.filter(p => p >= startIdx && p < endIdx);
      ctx.fillStyle = '#ff4444';
      for (const p of localPeaks) {
        const idx = p - startIdx;
        const x = toX(idx);
        const y = toY(visible[idx].v);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#5a8aaa';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    const tStep = Math.max(1, Math.floor(visible.length / 6));
    for (let i = 0; i < visible.length; i += tStep) {
      const x = toX(i);
      ctx.fillText(visible[i].t.toFixed(1) + 's', x, padT + plotH + 18);
    }

    ctx.textAlign = 'right';
    const vStep = 4;
    for (let i = 0; i <= vStep; i++) {
      const v = minV + (range / vStep) * i;
      const y = toY(v);
      ctx.fillText(v.toFixed(1), padL - 5, y + 3);
    }

    ctx.strokeStyle = '#1a3a55';
    ctx.lineWidth = 1;
    ctx.strokeRect(padL, padT, plotW, plotH);

    ctx.fillStyle = '#5a8aaa';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Time (s)', padL + plotW / 2 - 20, h - 2);
    ctx.save();
    ctx.translate(8, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(viewMode === 'raw' ? 'Raw ECG' : viewMode === 'normalized' ? 'Normalized' : 'Processed ECG', 0, 0);
    ctx.restore();
  }, [data, viewMode, zoom, offset, getSignal]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY < 0) setZoom(z => Math.min(10, z + 0.5));
    else setZoom(z => Math.max(1, z - 0.5));
  }, []);

  if (loading) return (
    <div className="card p-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-primary-400" /></div>
  );
  if (error) return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-red-400"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>
    </div>
  );
  if (!data) return null;

  const pred = data.prediction;
  const severityColor = SEVERITY_COLORS[pred?.severity] || '#c8d8e8';
  const evidence = pred ? CLINICAL_EVIDENCE[pred.class] : null;

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">ECG Viewer</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Session #{data.sessionId} &middot; {data.startedAt ? new Date(data.startedAt).toLocaleString() : ''} &middot; ~{data.fs} Hz
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setZoom(z => Math.min(10, z + 0.5))} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]" title="Zoom in"><ZoomIn size={16} /></button>
          <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]" title="Zoom out"><ZoomOut size={16} /></button>
          <button onClick={() => { setOffset(0); setZoom(1); }} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs font-medium" title="Reset view">Fit</button>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 text-xs">Close</button>
          )}
        </div>
      </div>

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

      <div className="flex gap-1 mb-3 p-1 rounded-lg bg-[var(--bg-tertiary)] w-fit">
        {[
          { key: 'raw', label: 'Raw' },
          { key: 'processed', label: 'Processed' },
          { key: 'normalized', label: 'AI Input' },
        ].map(m => (
          <button key={m.key} onClick={() => { setViewMode(m.key); setOffset(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === m.key ? 'bg-[var(--card-bg)] shadow-sm text-primary-400' : 'text-[var(--text-secondary)]'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center gap-1 mb-1">
          <button onClick={() => setOffset(o => Math.max(0, o - Math.floor(300 / zoom)))}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"><ChevronLeft size={14} /></button>
          <span className="text-xs text-[var(--text-tertiary)] flex-1 text-center">
            Scroll · Zoom: {zoom}x · {getSignal().length} pts
          </span>
          <button onClick={() => setOffset(o => Math.min(getSignal().length - Math.floor(getSignal().length / zoom), o + Math.floor(300 / zoom)))}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"><ChevronRight size={14} /></button>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[var(--border-color)] cursor-grab active:cursor-grabbing"
          style={{ height: '320px', background: '#060e1a' }}
          onWheel={handleWheel}
        />
        <div className="text-xs text-[var(--text-tertiary)] text-center mt-1">
          Scroll to zoom &middot; Use arrows to pan &middot; Red dots = R-peaks
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'Sample Rate', value: `~${data.fs} Hz` },
          { label: 'Window', value: `${(getSignal().length / (data.fs || 360)).toFixed(1)}s` },
          { label: 'R-Peaks', value: data.rPeaks?.length || 0 },
          { label: 'Heart Rate', value: data.rPeaks?.length > 0
            ? Math.round(data.rPeaks.length / (getSignal().length / (data.fs || 360)) * 60) + ' BPM'
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
