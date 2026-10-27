
const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('inx_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('inx_token', token);
  } else {
    localStorage.removeItem('inx_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Safely handle JSON responses and unexpected empty responses.
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const api = {
  // =========================
  // AUTHENTICATION
  // =========================
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  switchRole: (role) =>
    request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // =========================
  // INTERNSHIPS
  // =========================

  // Remove empty and undefined filters before building the URL.
  getInternships: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/internships${query ? `?${query}` : ''}`
    );
  },

  getInternshipById: (id) =>
    request(`/internships/${id}`),

  createInternship: (data) =>
    request('/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInternship: (id, data) =>
    request(`/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteInternship: (id) =>
    request(`/internships/${id}`, {
      method: 'DELETE',
    }),

  // =========================
  // APPLICATIONS
  // =========================
  getApplications: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/applications${query ? `?${query}` : ''}`
    );
  },

  apply: (data) =>
    request('/applications/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplicationStatus: (id, status, notes) =>
    request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  withdrawApplication: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),

  // =========================
  // REPORTS
  // =========================
  getReports: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/reports${query ? `?${query}` : ''}`
    );
  },

  submitReport: (data) =>
    request('/reports/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewReport: (id, data) =>
    request(`/reports/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // =========================
  // MENTORS
  // =========================
  getMentors: () => request('/mentors'),

  getAllocations: () =>
    request('/mentors/allocations'),

  allocateMentor: (data) =>
    request('/mentors/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  autoAllocateMentor: (data) =>
    request('/mentors/auto-allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // =========================
  // EVALUATIONS
  // =========================
  getEvaluations: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/evaluations${query ? `?${query}` : ''}`
    );
  },

  submitEvaluation: (data) =>
    request('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // =========================
  // CERTIFICATES
  // =========================
  getCertificates: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/certificates${query ? `?${query}` : ''}`
    );
  },

  issueCertificate: (data) =>
    request('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyCertificate: (id) =>
    request(`/certificates/verify/${id}`),

  // =========================
  // MESSAGING
  // =========================
  getConversations: () =>
    request('/messages/conversations'),

  getMessagesWithUser: (userId) =>
    request(`/messages/${userId}`),

  sendMessage: (receiverId, content) =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),

  // =========================
  // NOTIFICATIONS
  // =========================
  getNotifications: () =>
    request('/notifications'),

  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // =========================
  // USERS & STATISTICS
  // =========================
  getProfile: () =>
    request('/users/profile'),

  updateProfile: (data) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getDashboardStats: () =>
    request('/users/stats'),

  getAllUsers: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    );

    const query = new URLSearchParams(cleanParams).toString();

    return request(
      `/users/all${query ? `?${query}` : ''}`
    );
  },
};
