import { useState, useEffect } from 'react';
import { filesService, getFileUrl } from '../../services/api';
import { FileText, Download, Eye, FileSpreadsheet, Loader2, AlertCircle, Calendar, Activity, HeartPulse } from 'lucide-react';

export default function FilesList({ onViewECG }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await filesService.listFiles();
      setFiles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = filter === 'all' ? files : files.filter(f => f.type === filter);

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-primary-400" />
          <p className="text-sm text-[var(--text-secondary)]">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
        <button onClick={loadFiles} className="mt-3 text-sm text-primary-400 hover:text-primary-300">Try again</button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">ECG Records</h3>
            <p className="text-sm text-[var(--text-secondary)]">{files.length} file{files.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {['all', 'csv', 'pdf'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === type
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {type === 'all' ? 'All' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No ECG records found yet</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Records will appear here after ECG sessions</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors group gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  file.type === 'csv' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {file.type === 'csv' ? (
                    <FileSpreadsheet size={18} className="text-green-400" />
                  ) : (
                    <FileText size={18} className="text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px] sm:max-w-[260px]">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {file.startedAt ? new Date(file.startedAt).toLocaleDateString() : 'N/A'}
                    </span>
                    {file.prediction && (
                      <span className="flex items-center gap-1">
                        <Activity size={10} />
                        {file.prediction}
                        {file.confidence && ` (${file.confidence.toFixed(1)}%)`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {file.type === 'csv' && onViewECG && (
                  <button
                    onClick={() => onViewECG(file.sessionId)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 text-white hover:from-primary-600 hover:to-cyan-600 transition-all whitespace-nowrap flex items-center gap-1.5"
                  >
                    <HeartPulse size={14} />
                    View More Details
                  </button>
                )}
                <a
                  href={getFileUrl(file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                  title="View"
                >
                  <Eye size={16} />
                </a>
                <a
                  href={getFileUrl(file.url)}
                  download={file.name}
                  className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-green-400 hover:bg-green-500/10 transition-all"
                  title="Download"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
