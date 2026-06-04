import { User, Calendar, Weight, Heart, Activity, AlertTriangle, Droplets } from 'lucide-react';

export default function PatientProfile({ user }) {
  const fields = [
    { icon: User, label: 'Name', value: user?.name || '-' },
    { icon: Calendar, label: 'Age', value: user?.age || '-' },
    { icon: Weight, label: 'Weight', value: user?.weight_kg ? `${user.weight_kg} kg` : '-' },
    { icon: Droplets, label: 'Blood Pressure', value: user?.bp_systolic ? `${user.bp_systolic}/${user.bp_diastolic} mmHg` : '-' },
    { icon: AlertTriangle, label: 'Comorbidities', value: user?.comorbidities || 'None', full: true },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
          <User size={22} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Patient Profile</h3>
          <p className="text-sm text-[var(--text-secondary)]">Your health information</p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, i) => {
          const Icon = field.icon;
          return (
            <div key={i} className={`flex items-start gap-3 ${field.full ? '' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{field.label}</p>
                <p className="text-sm font-medium text-[var(--text-primary)] break-words">{field.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
