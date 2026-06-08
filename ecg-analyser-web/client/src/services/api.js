const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authService = {
  login: (name, password, passcode) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password, passcode }),
    }),

  register: (name, password, passcode) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, password, passcode }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),
};

export const patientService = {
  getProfile: () => request('/patients/me'),

  updateProfile: (data) =>
    request('/patients/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAccount: () =>
    request('/patients/me', {
      method: 'DELETE',
    }),
};

export const filesService = {
  listFiles: () => request('/files/list'),

  listSessions: () => request('/files/sessions'),

  fetchProcessedCSV: (sessionId) => request(`/files/csv/${sessionId}/processed`),
};

export const adminService = {
  getStats: () => request('/admin/stats'),

  getPatients: (search, page = 1, pageSize = 50) => request(`/admin/patients?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  getPatientSessions: (patientId) => request(`/admin/patients/${patientId}/sessions`),

  updatePatient: (patientId, data) =>
    request(`/admin/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createPatient: (data) =>
    request('/admin/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePatient: (patientId) =>
    request(`/admin/patients/${patientId}`, { method: 'DELETE' }),

  verifySession: (sessionId, validatedPrediction, notes) =>
    request(`/admin/sessions/${sessionId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ validatedPrediction, notes }),
    }),

  getSessionEcg: (sessionId) =>
    request(`/admin/sessions/${sessionId}/ecg`),

  getIpActions: (search, page = 1, pageSize = 50) =>
    request(`/admin/ip-actions?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`),

  getBlockedIps: (page = 1, pageSize = 50) =>
    request(`/admin/blocked-ips?page=${page}&pageSize=${pageSize}`),

  blockIp: (ipAddress, reason) =>
    request('/admin/blocked-ips', {
      method: 'POST',
      body: JSON.stringify({ ip_address: ipAddress, reason }),
    }),

  unblockIp: (id) =>
    request(`/admin/blocked-ips/${id}`, { method: 'DELETE' }),

  getLogs: (search, page = 1, pageSize = 50, eventType = '') =>
    request(`/admin/logs?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}${eventType ? `&eventType=${encodeURIComponent(eventType)}` : ''}`),

  exportLogsCsv: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/admin/logs/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Export failed');
    }
    return res.blob();
  },

  clearLogs: () =>
    request('/admin/logs', { method: 'DELETE' }),
};

export function getFileUrl(url) {
  return url;
}
