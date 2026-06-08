import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Shield, ShieldOff, Loader2, AlertCircle, Plus, X, Search, Ban, ChevronLeft, ChevronRight } from 'lucide-react';

export default function IpBlockManager() {
  const [blocked, setBlocked] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBlock, setShowBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({ ip_address: '', reason: '' });
  const [blocking, setBlocking] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    loadBlocked();
  }, [page]);

  const loadBlocked = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getBlockedIps(page, pageSize);
      setBlocked(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!blockForm.ip_address.trim()) return;
    setBlocking(true);
    setError('');
    try {
      await adminService.blockIp(blockForm.ip_address.trim(), blockForm.reason.trim());
      setBlockForm({ ip_address: '', reason: '' });
      setShowBlock(false);
      setPage(1);
      loadBlocked();
    } catch (e) {
      setError(e.message);
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (id, ip) => {
    if (!confirm(`Unblock IP ${ip}?`)) return;
    setError('');
    try {
      await adminService.unblockIp(id);
      setBlocked(prev => prev.filter(b => b.id !== id));
      setTotal(t => t - 1);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading && blocked.length === 0) return (
    <div className="card p-8 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-orange-400" />
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <ShieldOff size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">IP Block Manager</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{total} blocked IP{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => setShowBlock(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium whitespace-nowrap">
          <Ban size={15} />
          Block IP
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 mb-3 text-sm p-3 rounded-xl bg-red-500/10"><AlertCircle size={14} />{error}</div>
      )}

      {showBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowBlock(false)}>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Block IP Address</h3>
              <button onClick={() => setShowBlock(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBlock} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">IP Address *</label>
                <input type="text" value={blockForm.ip_address} onChange={e => setBlockForm(f => ({ ...f, ip_address: e.target.value }))} placeholder="e.g. 192.168.1.1" className="input-field text-sm font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Reason (optional)</label>
                <textarea value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} rows="2" placeholder="Why is this IP being blocked?" className="input-field text-sm resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowBlock(false)} className="px-4 py-2 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all">Cancel</button>
                <button type="submit" disabled={blocking || !blockForm.ip_address.trim()} className="px-4 py-2 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
                  {blocking ? 'Blocking...' : 'Block IP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {blocked.length === 0 ? (
        <div className="text-center py-12">
          <Shield size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No blocked IPs</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocked.map((b) => (
            <div key={b.id} className="p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <ShieldOff size={16} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-[var(--text-primary)]">{b.ip_address}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5">
                      {b.reason && <span>Reason: {b.reason}</span>}
                      {b.blocked_by && <span>&middot; Blocked by {b.blocked_by}</span>}
                      <span>&middot; {b.created_at ? new Date(b.created_at).toLocaleString() : ''}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleUnblock(b.id, b.ip_address)} className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-all shrink-0" title="Unblock IP">
                  <Shield size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)]">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) { pageNum = i + 1; }
              else if (page <= 3) { pageNum = i + 1; }
              else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
              else { pageNum = page - 2 + i; }
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded-lg transition-all ${pageNum === page ? 'bg-orange-500/20 text-orange-400 font-medium' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
