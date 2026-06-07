import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Users, Activity, BarChart3, Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#00FFB4', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card p-8 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-orange-400" />
    </div>
  );

  if (error) return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-red-400"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>
    </div>
  );

  const conditions = stats?.conditionsBreakdown || {};
  const conditionEntries = Object.entries(conditions).sort((a, b) => b[1] - a[1]);
  const totalConditions = conditionEntries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalPatients ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Activity size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Total Sessions</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalSessions ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Condition Distribution</h3>
          </div>
        </div>

        {conditionEntries.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No session data yet</p>
        ) : (
          <div className="space-y-3">
            <div className="flex h-3 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
              {conditionEntries.map(([cond, count], i) => (
                <div key={cond} style={{ width: `${(count / totalConditions) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} title={`${cond}: ${count}`} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conditionEntries.map(([cond, count], i) => (
                <div key={cond} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-[var(--text-primary)]">{cond}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
