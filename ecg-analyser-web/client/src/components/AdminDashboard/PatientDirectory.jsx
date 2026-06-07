import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Users, Loader2, AlertCircle, Activity, Edit3, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PatientDirectory({ onViewSessions }) {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', age: '', weight_kg: '', bp_systolic: '', bp_diastolic: '', comorbidities: '' });
  const [creating, setCreating] = useState(false);
  const [newCreds, setNewCreds] = useState(null);

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    loadPatients();
  }, [page]);

  const loadPatients = async (query) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getPatients(query || search, page, pageSize);
      setPatients(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPatients(search);
  };

  const openEdit = (patient) => {
    setEditingPatient(patient.id);
    setEditForm({
      age: patient.age || '',
      weight_kg: patient.weight_kg || '',
      bp_systolic: patient.bp_systolic || '',
      bp_diastolic: patient.bp_diastolic || '',
      comorbidities: patient.comorbidities || '',
    });
  };

  const saveEdit = async (patientId) => {
    setSaving(true);
    try {
      const updated = await adminService.updatePatient(patientId, editForm);
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updated } : p));
      setEditingPatient(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    setError('');
    setNewCreds(null);
    try {
      const data = await adminService.createPatient(createForm);
      const { _credentials, ...patient } = data;
      if (page === 1) {
        setPatients(prev => [patient, ...prev]);
        setTotal(t => t + 1);
      } else {
        setPage(1);
      }
      setNewCreds({ name: patient.name, ..._credentials });
      setShowCreate(false);
      setCreateForm({ name: '', age: '', weight_kg: '', bp_systolic: '', bp_diastolic: '', comorbidities: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (patientId, patientName) => {
    if (!confirm(`Delete patient "${patientName}" and all their sessions? This cannot be undone.`)) return;
    setError('');
    try {
      await adminService.deletePatient(patientId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      setTotal(t => t - 1);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading && patients.length === 0) return (
    <div className="card p-8 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-orange-400" />
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Users size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Patient Directory</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{total} patient{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-medium whitespace-nowrap">
            <Plus size={15} />
            Add Patient
          </button>
          <form onSubmit={handleSearch} className="flex gap-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="input-field text-sm max-w-[180px]"
            />
            <button type="submit" className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 mb-3 text-sm"><AlertCircle size={14} />{error}</div>
      )}

      {newCreds && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-sm font-medium text-green-400 mb-2">Patient "{newCreds.name}" created</p>
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <p>Password: <strong className="text-[var(--text-primary)] font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{newCreds.password}</strong></p>
            <p>Passcode: <strong className="text-[var(--text-primary)] font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{newCreds.passcode}</strong></p>
          </div>
          <button onClick={() => setNewCreds(null)} className="mt-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Dismiss</button>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Add Patient</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Name *</label>
                <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} className="input-field text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Age</label>
                  <input type="number" value={createForm.age} onChange={e => setCreateForm(f => ({ ...f, age: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={createForm.weight_kg} onChange={e => setCreateForm(f => ({ ...f, weight_kg: e.target.value }))} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">BP Systolic</label>
                  <input type="number" value={createForm.bp_systolic} onChange={e => setCreateForm(f => ({ ...f, bp_systolic: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">BP Diastolic</label>
                  <input type="number" value={createForm.bp_diastolic} onChange={e => setCreateForm(f => ({ ...f, bp_diastolic: e.target.value }))} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Comorbidities</label>
                <input type="text" value={createForm.comorbidities} onChange={e => setCreateForm(f => ({ ...f, comorbidities: e.target.value }))} className="input-field text-sm" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Secure credentials will be generated automatically</p>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all">Cancel</button>
                <button type="submit" disabled={creating || !createForm.name.trim()} className="px-4 py-2 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <Users size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No patients found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {patients.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
              {editingPatient === p.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-[var(--text-tertiary)]">Age</label>
                      <input type="number" value={editForm.age} onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))} className="input-field text-xs py-1.5" />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-tertiary)]">Weight</label>
                      <input type="number" step="0.1" value={editForm.weight_kg} onChange={e => setEditForm(f => ({ ...f, weight_kg: e.target.value }))} className="input-field text-xs py-1.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="text-xs text-[var(--text-tertiary)]">BP S</label>
                        <input type="number" value={editForm.bp_systolic} onChange={e => setEditForm(f => ({ ...f, bp_systolic: e.target.value }))} className="input-field text-xs py-1.5" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-tertiary)]">BP D</label>
                        <input type="number" value={editForm.bp_diastolic} onChange={e => setEditForm(f => ({ ...f, bp_diastolic: e.target.value }))} className="input-field text-xs py-1.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)]">Comorbidities</label>
                    <input type="text" value={editForm.comorbidities} onChange={e => setEditForm(f => ({ ...f, comorbidities: e.target.value }))} className="input-field text-xs py-1.5" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingPatient(null)} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all">Cancel</button>
                    <button onClick={() => saveEdit(p.id)} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {p.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5">
                        {p.age > 0 && <span>{p.age} yrs</span>}
                        {p.bp_systolic > 0 && <span>BP: {p.bp_systolic}/{p.bp_diastolic}</span>}
                        {p.role && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-400">{p.role}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Edit patient">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => onViewSessions && onViewSessions(p.id, p.name)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-orange-400 hover:bg-orange-500/10 transition-all" title="View ECG sessions">
                      <Activity size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete patient">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)]">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded-lg transition-all ${pageNum === page ? 'bg-orange-500/20 text-orange-400 font-medium' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
