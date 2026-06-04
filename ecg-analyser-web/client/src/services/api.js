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

export function getFileUrl(url) {
  return url;
}
