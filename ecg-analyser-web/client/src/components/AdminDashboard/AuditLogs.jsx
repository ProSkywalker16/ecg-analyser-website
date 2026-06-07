import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import {
  Search, Download, Loader2, AlertCircle, Activity,
  ChevronLeft, ChevronRight, Monitor, Globe, RefreshCw, Trash2,
  LogIn, LogOut, UserPlus, AlertTriangle,
} from 'lucide-react';

const EVENT_ICONS = {
  login_success: LogIn,
  login_failed: AlertTriangle,
  logout: LogOut,
  register: UserPlus,
};

const EVENT_COLORS = {
  login_success: 'text-green-400 bg-green-500/10',
  login_failed: 'text-red-400 bg-red-500/10',
  logout: 'text-orange-400 bg-orange-500/10',
  register: 'text-blue-400 bg-blue-500/10',
};

const EVENT_LABELS = {
  login_success: 'Login',
  login_failed: 'Failed Login',
  logout: 'Logout',
  register: 'Register',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadLogs();
  }, [page, eventFilter]);

  const loadLogs = async (query) => {
    setLoading(true);
    setError('');
    try {
      const s = query !== undefined ? query : search;
      const data = await adminService.getLogs(s, page, pageSize, eventFilter);
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLogs(search);
  };

  const handleClear = async () => {
    if (!confirm('Delete all audit logs? This cannot be undone.')) return;
    setClearing(true);
    setError('');
    try {
      await adminService.clearLogs();
      setLogs([]);
      setTotal(0);
      setPage(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadLogs(search);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExportCsv = async () => {
    setError('');
    try {
      const blob = await adminService.exportLogsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Activity size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Audit Logs</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{total} log{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search IP, name, URL..."
              className="input-field text-sm max-w-[180px]"
            />
            <button type="submit" className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all">
              <Search size={16} />
            </button>
          </form>
          <select
            value={eventFilter}
            onChange={e => { setEventFilter(e.target.value); setPage(1); }}
            className="input-field text-sm max-w-[140px]"
          >
            <option value="">All events</option>
            <option value="login_success">Login</option>
            <option value="login_failed">Failed Login</option>
            <option value="logout">Logout</option>
            <option value="register">Register</option>
          </select>
          <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleClear} disabled={clearing || total === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50">
            <Trash2 size={15} />
            {clearing ? 'Clearing...' : 'Clear Logs'}
          </button>
          <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-medium whitespace-nowrap">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 mb-3 text-sm p-3 rounded-xl bg-red-500/10"><AlertCircle size={14} />{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-orange-400" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No audit logs found</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Logs appear when API requests are made</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider px-4 py-3 whitespace-nowrap">Event</th>
                  <th className="text-left text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider px-4 py-3 whitespace-nowrap">Time</th>
                  <th className="text-left text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider px-4 py-3 whitespace-nowrap">Patient</th>
                  <th className="text-left text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider px-4 py-3 whitespace-nowrap">IP</th>
                  <th className="text-left text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider px-4 py-3 whitespace-nowrap hidden sm:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const EventIcon = EVENT_ICONS[log.event_type] || Activity;
                  const eventColor = EVENT_COLORS[log.event_type] || 'text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]';
                  const eventLabel = EVENT_LABELS[log.event_type] || log.event_type || 'Request';
                  return (
                    <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${eventColor}`}>
                            <EventIcon size={13} />
                          </div>
                          <span className={`text-xs font-medium ${eventColor.split(' ')[0]}`}>{eventLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--text-primary)]">{log.patients?.name || 'Anonymous'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Globe size={11} className="text-[var(--text-tertiary)] shrink-0" />
                          <span className="text-xs text-[var(--text-primary)] font-mono">{log.ip_address || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell max-w-[200px]">
                        <p className="text-xs text-[var(--text-secondary)] truncate" title={log.details || log.request_url}>{log.details || log.request_url || '-'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-tertiary)]">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
