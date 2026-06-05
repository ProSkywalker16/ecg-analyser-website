import { Router } from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { parse } from 'csv-parse/sync';
import { URL } from 'url';
import {
  baselineWanderRemoval, lowpassFilter, notchFilter, normalize,
  findRPeaks, CLASS_MAP, CLINICAL_GUIDANCE, SEVERITY_LABEL,
} from '../dsp.js';

const ALLOWED_STORAGE_HOSTS = [
  'ngezqjpitfvafgkiszat.supabase.co',
  'supabase.co',
  'supabase.in',
];

function isAllowedStorageUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return ALLOWED_STORAGE_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}

const router = Router();

router.use(authenticateToken);

router.get('/list', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, started_at, duration_s, prediction, confidence, csv_url, report_url')
      .eq('patient_id', req.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      if (error.code === '42501') return res.status(500).json({ error: 'Permission denied. See server/setup.sql or set SUPABASE_SERVICE_KEY.', hint: 'Run setup.sql in Supabase SQL Editor' });
      throw error;
    }

    const files = [];
    for (const session of sessions || []) {
      if (session.csv_url) {
        files.push({
          id: `csv-${session.id}`,
          sessionId: session.id,
          type: 'csv',
          name: session.csv_url.split('/').pop(),
          url: session.csv_url,
          startedAt: session.started_at,
          prediction: session.prediction,
          confidence: session.confidence,
        });
      }
      if (session.report_url) {
        files.push({
          id: `report-${session.id}`,
          sessionId: session.id,
          type: 'pdf',
          name: session.report_url.split('/').pop(),
          url: session.report_url,
          startedAt: session.started_at,
          prediction: session.prediction,
          confidence: session.confidence,
        });
      }
    }

    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/csv/:sessionId/processed', async (req, res) => {
  try {
    const { data: sessions, error: sessError } = await supabase
      .from('sessions')
      .select('id, csv_url, prediction, confidence, started_at')
      .eq('id', req.params.sessionId)
      .eq('patient_id', req.user.id);

    if (sessError) {
      console.error('[CSV] Session fetch error:', sessError);
      return res.status(500).json({ error: 'Failed to fetch session data' });
    }
    if (!sessions || sessions.length === 0) return res.status(404).json({ error: 'Session not found' });
    const session = sessions[0];
    if (!session.csv_url) return res.status(404).json({ error: 'No CSV file for this session' });

    if (!isAllowedStorageUrl(session.csv_url)) {
      console.error(`[SSRF] Blocked fetch to disallowed host: ${session.csv_url}`);
      return res.status(400).json({ error: 'Invalid file URL' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let resp;
    try {
      resp = await fetch(session.csv_url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) return res.status(502).json({ error: 'Failed to fetch CSV from storage' });
    const csvText = await resp.text();

    const records = parse(csvText, { skip_empty_lines: true, relax_column_count: true });
    if (records.length < 2) return res.status(400).json({ error: 'CSV has insufficient data' });

    const headers = records[0].map(h => h.trim().toLowerCase());
    const tsIdx = headers.indexOf('timestamp');
    const ecgIdx = headers.indexOf('ecg value');
    if (tsIdx === -1 || ecgIdx === -1) return res.status(400).json({ error: 'CSV missing Timestamp or ECG Value columns' });

    const rawSignal = [];
    const timestamps = [];
    for (let i = 1; i < records.length; i++) {
      const ts = parseFloat(records[i][tsIdx]);
      const val = parseFloat(records[i][ecgIdx]);
      if (!isNaN(ts) && !isNaN(val)) {
        timestamps.push(ts);
        rawSignal.push(val);
      }
    }
    if (rawSignal.length < 10) return res.status(400).json({ error: 'Not enough valid data points' });

    const fs = timestamps.length / (timestamps[timestamps.length - 1] - timestamps[0]);
    const sig = new Float64Array(rawSignal);

    // ── Full-signal processing (raw + processed views use ALL data) ────────
    const fullFiltered   = baselineWanderRemoval(sig, fs);
    const fullLp         = lowpassFilter(fullFiltered, fs, 40, 2);
    const fullNotched    = notchFilter(fullLp, fs, 50, 30);

    // ── R-peaks on full processed signal at real fs ──────────────────────
    const fullNorm = normalize(fullNotched);
    const rPeaks   = findRPeaks(fullNorm, fs);

    const predClass = session.prediction ? CLASS_MAP.indexOf(session.prediction) : -1;
    const guidance  = predClass >= 0 && predClass < CLINICAL_GUIDANCE.length
      ? { ...CLINICAL_GUIDANCE[predClass], class: session.prediction, confidence: session.confidence, severityLabel: SEVERITY_LABEL[CLINICAL_GUIDANCE[predClass].severity] }
      : null;

    // raw  → full original signal
    const rawExport = [];
    for (let i = 0; i < sig.length; i++) {
      rawExport.push({ t: parseFloat(timestamps[i].toFixed(3)), v: parseFloat(sig[i].toFixed(2)) });
    }
    // processed → full filtered signal
    const processedExport = [];
    for (let i = 0; i < fullNotched.length; i++) {
      processedExport.push({ t: parseFloat(timestamps[i].toFixed(3)), v: parseFloat(fullNotched[i].toFixed(2)) });
    }

    res.json({
      sessionId: session.id,
      startedAt: session.started_at,
      fs: parseFloat(fs.toFixed(1)),
      raw: rawExport,
      processed: processedExport,
      rPeaks,
      prediction: guidance,
    });
  } catch (error) {
    console.error('CSV process error:', error);
    res.status(500).json({ error: 'Failed to process ECG data' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, patient_id, started_at, duration_s, prediction, confidence, csv_url, report_url')
      .eq('patient_id', req.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      if (error.code === '42501') return res.status(500).json({ error: 'Permission denied. See server/setup.sql or set SUPABASE_SERVICE_KEY.', hint: 'Run setup.sql in Supabase SQL Editor' });
      throw error;
    }
    res.json(sessions || []);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
