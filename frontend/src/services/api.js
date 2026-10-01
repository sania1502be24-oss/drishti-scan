const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('drishti_token');
export const setAuthToken = (token) => localStorage.setItem('drishti_token', token);
export const removeAuthToken = () => localStorage.removeItem('drishti_token');

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (email, password, full_name) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),

  // Scans
  scanUrl: (url, save_to_history = true) =>
    request('/scans', {
      method: 'POST',
      body: JSON.stringify({ url, save_to_history }),
    }),
  getScans: (q, severity) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (severity) params.append('severity', severity);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/scans${qs}`);
  },
  getScanDetail: (id) => request(`/scans/${id}`),
  deleteScan: (id) => request(`/scans/${id}`, { method: 'DELETE' }),
  getPdfReportBlob: async (id) => {
    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}/scans/${id}/report.pdf`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Could not download PDF report.');
    return res.blob();
  },
  getExportCsvBlob: async () => {
    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}/scans/export/csv`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Could not export CSV.');
    return res.blob();
  },

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Academy
  getModules: () => request('/academy/modules'),
  getModuleDetail: (id) => request(`/academy/modules/${id}`),
  submitQuiz: (module_id, answers) =>
    request('/academy/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ module_id, answers }),
    }),
};
