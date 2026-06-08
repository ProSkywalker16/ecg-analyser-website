import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';
import AdminStats from './AdminStats';
import PatientDirectory from './PatientDirectory';
import ClinicalFeedbackForm from './ClinicalFeedbackForm';
import AuditLogs from './AuditLogs';
import IpActions from './IpActions';
import { adminService } from '../../services/api';
import {
  Activity, User, LogOut, Menu, X,
  LayoutDashboard, Users, ClipboardCheck, Shield, ScrollText, Ban,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviewPatient, setReviewPatient] = useState(null);

  const handleLogout = async () => { await logout(); window.location.href = '/'; };

  const handleViewSessions = (patientId, patientName) => {
    setReviewPatient({ id: patientId, name: patientName });
    setActiveTab('reviewer');
  };

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Database', icon: Users },
    { id: 'reviewer', label: 'Session Reviewer', icon: ClipboardCheck },
    { id: 'logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'ipactions', label: 'IP Actions', icon: Ban },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="text-base font-bold">ECG Analyser</span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); setReviewPatient(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500/20 text-orange-400 shadow-sm'
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
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-[var(--text-primary)] truncate block">{user?.name}</span>
              <span className="text-[10px] text-amber-400 font-medium">Admin</span>
            </div>
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
    <div className="admin-theme min-h-screen bg-[var(--bg-secondary)]">
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
              <Activity size={18} className="text-orange-400" />
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                  <p className="text-sm text-[var(--text-secondary)] truncate">Clinical overview and patient management</p>
                </div>
              </div>

              <div className="md:hidden flex gap-1 mb-6 p-1 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setReviewPatient(null); }}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                         activeTab === tab.id ? 'bg-[var(--card-bg)] shadow-sm text-orange-400' : 'text-[var(--text-secondary)]'
                      }`}>
                      <Icon size={14} />
                      {tab.label === 'Patient Database' ? 'Patients' : tab.label === 'Session Reviewer' ? 'Review' : tab.label === 'Audit Logs' ? 'Logs' : tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'overview' && <AdminStats />}

              {activeTab === 'patients' && <PatientDirectory onViewSessions={handleViewSessions} />}

              {activeTab === 'reviewer' && (
                reviewPatient ? (
                  <ClinicalFeedbackForm
                    patientId={reviewPatient.id}
                    patientName={reviewPatient.name}
                    onBack={() => setReviewPatient(null)}
                  />
                ) : (
                  <PatientDirectory onViewSessions={handleViewSessions} />
                )
              )}

              {activeTab === 'logs' && <AuditLogs />}

              {activeTab === 'ipactions' && <IpActions />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
