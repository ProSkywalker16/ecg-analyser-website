import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { ClipboardCheck, Loader2, AlertCircle, CheckCircle2, Activity, ChevronLeft } from 'lucide-react';
import ECGViewer from '../Dashboard/ECGViewer';

export default function ClinicalFeedbackForm({ patientId, patientName, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [ecgData, setEcgData] = useState(null);
  const [ecgLoading, setEcgLoading] = useState(false);
  const [validatedPrediction, setValidatedPrediction] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    adminService.getPatientSessions(patientId)
      .then(data => setSessions(data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    if (!selectedSession) {
      setEcgData(null);
      return;
    }
    setEcgLoading(true);
    setEcgData(null);
    setError('');
    adminService.getSessionEcg(selectedSession)
      .then(setEcgData)
      .catch(e => setError(e.message))
      .finally(() => setEcgLoading(false));
  }, [selectedSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession || !validatedPrediction) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await adminService.verifySession(selectedSession, validatedPrediction, notes);
      setSuccess('Session verified successfully!');
      setValidatedPrediction('');
      setNotes('');
      setSelectedSession(null);
      setEcgData(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
          <ChevronLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-green-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Clinical Review</h3>
          <p className="text-xs text-[var(--text-tertiary)]">{patientName || `Patient #${patientId}`}</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 text-red-400 mb-3 text-sm p-3 rounded-xl bg-red-500/10"><AlertCircle size={14} />{error}</div>}
      {success && <div className="flex items-center gap-2 text-green-400 mb-3 text-sm p-3 rounded-xl bg-green-500/10"><CheckCircle2 size={14} />{success}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-orange-400" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8">
          <Activity size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">No ECG sessions for this patient</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSession(s.id);
                  setValidatedPrediction(s.prediction || '');
                  setSuccess('');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                  selectedSession === s.id ? 'bg-orange-500/20 ring-1 ring-orange-500/30' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Activity size={16} className="text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Session #{s.id}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {s.started_at ? new Date(s.started_at).toLocaleString() : 'N/A'} — {s.prediction || 'No prediction'}
                    </p>
                  </div>
                </div>
                {s.confidence != null && (
                  <span className="text-xs text-[var(--text-tertiary)] shrink-0">{s.confidence.toFixed(1)}%</span>
                )}
              </button>
            ))}
          </div>

          {selectedSession && ecgLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          )}

          {selectedSession && ecgData && (
            <div className="mb-4">
              <ECGViewer sessionId={selectedSession} ecgData={ecgData} onClose={null} />
            </div>
          )}

          {selectedSession && (
            <form onSubmit={handleSubmit} className="space-y-3 border-t border-[var(--border-color)] pt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Validated Diagnosis</label>
                <select
                  value={validatedPrediction}
                  onChange={e => setValidatedPrediction(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">Select diagnosis...</option>
                  {['Normal Sinus Rhythm', 'Atrial Fibrillation (AFib)', 'Ventricular Tachycardia (VT)', 'Bradycardia', 'ST Elevation', 'Sinus Tachycardia', 'Sinus Bradycardia', 'Other'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Add clinical observations, recommendations..."
                  className="input-field text-sm resize-none"
                />
              </div>
              <button type="submit" disabled={submitting || !validatedPrediction} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                {submitting ? 'Submitting...' : 'Verify & Submit'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
