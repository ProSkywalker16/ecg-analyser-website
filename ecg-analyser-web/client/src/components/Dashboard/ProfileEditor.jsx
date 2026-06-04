import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/api';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProfileEditor({ onUpdate }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    weight_kg: user?.weight_kg || '',
    bp_systolic: user?.bp_systolic || '',
    bp_diastolic: user?.bp_diastolic || '',
    comorbidities: user?.comorbidities || '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    const payload = {};
    if (form.name !== user.name) payload.name = form.name;
    if (form.age !== '' && Number(form.age) !== user.age) payload.age = Number(form.age);
    if (form.weight_kg !== '' && Number(form.weight_kg) !== user.weight_kg) payload.weight_kg = Number(form.weight_kg);
    if (form.bp_systolic !== '' && Number(form.bp_systolic) !== user.bp_systolic) payload.bp_systolic = Number(form.bp_systolic);
    if (form.bp_diastolic !== '' && Number(form.bp_diastolic) !== user.bp_diastolic) payload.bp_diastolic = Number(form.bp_diastolic);
    if (form.comorbidities !== user.comorbidities) payload.comorbidities = form.comorbidities;

    if (Object.keys(payload).length === 0) {
      setStatus({ type: 'info', message: 'No changes to save' });
      setSaving(false);
      return;
    }

    try {
      const updated = await patientService.updateProfile(payload);
      updateUser(updated);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Edit Profile</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} min="0" max="150" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Weight (kg)</label>
            <input type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} min="0" step="0.1" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">BP Systolic</label>
              <input type="number" name="bp_systolic" value={form.bp_systolic} onChange={handleChange} min="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">BP Diastolic</label>
              <input type="number" name="bp_diastolic" value={form.bp_diastolic} onChange={handleChange} min="0" className="input-field" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Comorbidities</label>
          <textarea
            name="comorbidities"
            value={form.comorbidities}
            onChange={handleChange}
            rows="2"
            placeholder="e.g., Diabetes, Hypertension, Asthma"
            className="input-field resize-none"
          />
        </div>

        {status.message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
            status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
            'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
