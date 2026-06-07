import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard/AdminDashboard';
import ThemeToggle from '../components/ThemeToggle';
import PatientProfile from '../components/Dashboard/PatientProfile';
import ProfileEditor from '../components/Dashboard/ProfileEditor';
import FilesList from '../components/Dashboard/FilesList';
import ECGViewer from '../components/Dashboard/ECGViewer';
import { filesService } from '../services/api';
import {
  Activity, User, FileText, Settings, LogOut, Menu, X,
  LayoutDashboard, HeartPulse, ChevronRight, Calendar, Clock,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewingSession, setViewingSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'viewer') {
      setSessionsLoading(true);
      filesService.listFiles()
        .then(files => {
          const csvSessions = files.filter(f => f.type === 'csv');
          setSessions(csvSessions);
        })
        .catch(() => {})
        .finally(() => setSessionsLoading(false));
    }
  }, [activeTab]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleProfileUpdate = () => setRefreshKey(k => k + 1);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: Settings },
    { id: 'files', label: 'ECG Records', icon: FileText },
    { id: 'viewer', label: 'ECG Viewer', icon: HeartPulse },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="text-base font-bold">ECG Analyser</span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">Patient Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border-color)] shrink-0">
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</span>
          </div>
          <ThemeToggle />
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
          {sidebarContent}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary-400" />
              <span className="text-sm font-bold">ECG Analyser</span>
            </div>
            <div className="w-9" />
          </header>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border-color)] flex flex-col max-h-screen overflow-hidden">
                <div className="flex justify-end p-2 shrink-0">
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {sidebarContent}
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
              {viewingSession ? (
                <ECGViewer sessionId={viewingSession} onClose={() => setViewingSession(null)} />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shrink-0">
                      <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                      <p className="text-sm text-[var(--text-secondary)] truncate">Manage your health records and ECG data</p>
                    </div>
                  </div>

                  <div className="md:hidden flex gap-1 mb-6 p-1 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setViewingSession(null); }}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                            activeTab === tab.id ? 'bg-[var(--card-bg)] shadow-sm text-primary-400' : 'text-[var(--text-secondary)]'
                          }`}>
                          <Icon size={14} />
                          {tab.label === 'Edit Profile' ? 'Edit' : tab.label === 'ECG Records' ? 'Records' : tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {activeTab === 'viewer' ? (
                    <div className="card p-4 md:p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
                          <HeartPulse size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">ECG Viewer</h3>
                          <p className="text-sm text-[var(--text-secondary)]">Select a session to view its ECG waveform</p>
                        </div>
                      </div>

                      {sessionsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 size={20} className="animate-spin text-primary-400" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <div className="text-center py-12">
                          <HeartPulse size={36} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                          <p className="text-sm text-[var(--text-secondary)]">No ECG sessions available</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">Capture an ECG from the desktop app first</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sessions.map((s, i) => (
                            <button key={s.id} onClick={() => setViewingSession(s.sessionId)}
                              className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all group text-left">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 flex items-center justify-center shrink-0">
                                  <HeartPulse size={18} className="text-cyan-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Session #{s.sessionId}
                                    {s.prediction && <span className="ml-2 text-xs text-[var(--text-tertiary)]">— {s.prediction}</span>}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
                                    <span className="flex items-center gap-1"><Calendar size={10} />{s.startedAt ? new Date(s.startedAt).toLocaleDateString() : 'N/A'}</span>
                                    <span className="flex items-center gap-1"><Clock size={10} />{s.startedAt ? new Date(s.startedAt).toLocaleTimeString() : ''}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="hidden sm:inline text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                                <ChevronRight size={16} className="text-[var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid lg:grid-cols-5 gap-6">
                      <div className="lg:col-span-2">
                        {activeTab === 'profile' && <PatientProfile user={user} />}
                        {activeTab === 'edit' && <ProfileEditor onUpdate={handleProfileUpdate} />}
                        {activeTab === 'files' && (
                          <div className="card p-4 md:p-6">
                            <FilesList key={refreshKey} onViewECG={setViewingSession} />
                          </div>
                        )}
                      </div>
                      <div className="lg:col-span-3">
                        {activeTab === 'profile' && <FilesList key={refreshKey} onViewECG={setViewingSession} />}
                        {activeTab === 'edit' && <PatientProfile user={user} />}
                        {activeTab === 'files' && <ProfileEditor onUpdate={handleProfileUpdate} />}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
