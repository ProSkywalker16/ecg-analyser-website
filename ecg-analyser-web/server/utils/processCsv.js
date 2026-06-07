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

export async function processCsvSession(supabase, sessionId) {
  const { data: sessions, error: sessError } = await supabase
    .from('sessions')
    .select('id, csv_url, prediction, confidence, started_at')
    .eq('id', sessionId);

  if (sessError) throw new Error('Failed to fetch session data');
  if (!sessions || sessions.length === 0) throw new Error('Session not found');
  const session = sessions[0];
  if (!session.csv_url) throw new Error('No CSV file for this session');

  if (!isAllowedStorageUrl(session.csv_url)) {
    throw new Error('Invalid file URL');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let resp;
  try {
    resp = await fetch(session.csv_url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!resp.ok) throw new Error('Failed to fetch CSV from storage');
  const csvText = await resp.text();

  const records = parse(csvText, { skip_empty_lines: true, relax_column_count: true });
  if (records.length < 2) throw new Error('CSV has insufficient data');

  const headers = records[0].map(h => h.trim().toLowerCase());
  const tsIdx = headers.indexOf('timestamp');
  const ecgIdx = headers.indexOf('ecg value');
  if (tsIdx === -1 || ecgIdx === -1) throw new Error('CSV missing Timestamp or ECG Value columns');

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
  if (rawSignal.length < 10) throw new Error('Not enough valid data points');

  const fs = timestamps.length / (timestamps[timestamps.length - 1] - timestamps[0]);
  const sig = new Float64Array(rawSignal);

  const fullFiltered = baselineWanderRemoval(sig, fs);
  const fullLp = lowpassFilter(fullFiltered, fs, 40, 2);
  const fullNotched = notchFilter(fullLp, fs, 50, 30);

  const fullNorm = normalize(fullNotched);
  const rPeaks = findRPeaks(fullNorm, fs);

  const predClass = session.prediction ? CLASS_MAP.indexOf(session.prediction) : -1;
  const guidance = predClass >= 0 && predClass < CLINICAL_GUIDANCE.length
    ? { ...CLINICAL_GUIDANCE[predClass], class: session.prediction, confidence: session.confidence, severityLabel: SEVERITY_LABEL[CLINICAL_GUIDANCE[predClass].severity] }
    : null;

  const rawExport = [];
  for (let i = 0; i < sig.length; i++) {
    rawExport.push({ t: parseFloat(timestamps[i].toFixed(3)), v: parseFloat(sig[i].toFixed(2)) });
  }
  const processedExport = [];
  for (let i = 0; i < fullNotched.length; i++) {
    processedExport.push({ t: parseFloat(timestamps[i].toFixed(3)), v: parseFloat(fullNotched[i].toFixed(2)) });
  }

  return {
    sessionId: session.id,
    startedAt: session.started_at,
    fs: parseFloat(fs.toFixed(1)),
    raw: rawExport,
    processed: processedExport,
    rPeaks,
    prediction: guidance,
  };
}
