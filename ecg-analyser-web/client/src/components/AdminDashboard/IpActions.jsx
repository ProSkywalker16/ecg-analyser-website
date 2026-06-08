import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Shield, ShieldOff, Loader2, AlertCircle, Ban, Search, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function IpActions() {
  const [allIps, setAllIps] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showBlocked, setShowBlocked] = useState(false);

  const totalPages = Math.ceil(total / pageSize);
  const filteredBlocked = allIps.filter(ip => ip.is_blocked);

  useEffect(() => {
    loadAll();
  }, [page]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ipRes, blockedRes] = await Promise.all([
        adminService.getIpActions(search, page, pageSize),
        adminService.getBlockedIps(1, 200),
      ]);
      setAllIps(ipRes.data || []);
      setTotal(ipRes.total || 0);
      setBlockedIps(blockedRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAll();
  };

  const handleBlock = async (ip) => {
    setActionLoading(ip);
    setError('');
    try {
      await adminService.blockIp(ip, '');
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (id) => {
    setActionLoading(id);
    setError('');
    try {
      await adminService.unblockIp(id);
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && allIps.length === 0) return (
    <div className="card p-8 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-orange-400" />
    </div>
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Eye size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">IP Actions</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{total} detected IPs &middot; {filteredBlocked.length} blocked</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex gap-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search IP or patient..." className="input-field text-sm max-w-[180px]" />
          <button type="submit" className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all">
            <Search size={16} />
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 mb-3 text-sm p-3 rounded-xl bg-red-500/10"><AlertCircle size={14} />{error}</div>
      )}

      {allIps.length === 0 ? (
        <div className="text-center py-12">
          <Eye size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No IP data found</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowBlocked(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${!showBlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Detected IPs ({allIps.length})
            </button>
            <button
              onClick={() => setShowBlocked(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${showBlocked ? 'bg-red-500/20 text-red-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Blocked IPs ({filteredBlocked.length})
            </button>
          </div>

          {showBlocked && filteredBlocked.length === 0 && (
            <div className="text-center py-8">
              <Shield size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No blocked IPs</p>
            </div>
          )}

          {showBlocked ? (
            <div className="space-y-2">
              {filteredBlocked.map((ip) => (
                <div key={ip.ip_address} className="p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                        <ShieldOff size={16} className="text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-medium text-[var(--text-primary)]">{ip.ip_address}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5 flex-wrap">
                          <span>{ip.patient_name}</span>
                          <span>&middot; {ip.event_count} events</span>
                          {ip.block_reason && <span>&middot; Reason: {ip.block_reason}</span>}
                          <span>&middot; Blocked by {ip.blocked_by}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(ip.blocked_id)}
                      disabled={actionLoading === ip.blocked_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50 shrink-0"
                    >
                      {actionLoading === ip.blocked_id ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {allIps.map((ip) => (
                <div key={ip.ip_address} className={`p-3 rounded-xl transition-all ${ip.is_blocked ? 'bg-red-500/5 ring-1 ring-red-500/20' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ip.is_blocked ? 'bg-red-500/20' : 'bg-purple-500/20'}`}>
                        {ip.is_blocked ? <ShieldOff size={16} className="text-red-400" /> : <Eye size={16} className="text-purple-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-medium text-[var(--text-primary)]">
                          {ip.ip_address}
                          {ip.is_blocked && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">Blocked</span>}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5 flex-wrap">
                          <span>{ip.patient_name}</span>
                          <span>&middot; {ip.event_count} event{ip.event_count !== 1 ? 's' : ''}</span>
                          <span>&middot; Last seen: {ip.last_seen ? new Date(ip.last_seen).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    {ip.is_blocked ? (
                      <button
                        onClick={() => handleUnblock(ip.blocked_id)}
                        disabled={actionLoading === ip.blocked_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50 shrink-0"
                      >
                        {actionLoading === ip.blocked_id ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlock(ip.ip_address)}
                        disabled={actionLoading === ip.ip_address}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 shrink-0"
                      >
                        {actionLoading === ip.ip_address ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                        Block
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {totalPages > 1 && !showBlocked && (
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
                  className={`w-7 h-7 text-xs rounded-lg transition-all ${pageNum === page ? 'bg-purple-500/20 text-purple-400 font-medium' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}>
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
