//frontend/utils/apiClient.js
const API_BASE = 'http://localhost:5000';

// helper function
async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMessage = data.error || "Request failed";
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// export object with methods
export const api = {
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyToken: (token) =>
  request("/api/auth/verify-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  }),

  logout: () =>
    request("/api/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (body) =>
  request("/api/auth/reset-password/request", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  resetPasswordConfirm: (body) =>
  request("/api/auth/reset-password/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  getAllUsers: () =>
  request('/api/admin/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  getAdminProfile: () =>
  request('/api/admin/me', {
    method: 'GET',
  }),

  get: (path) =>
  request(path, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  getUser: (userId) =>
  request(`/api/auth/user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  post: (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  put: (path, body) =>
  request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  delete: (path) =>
  request(path, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  getUserChats: (userId) =>
  request(`/api/auth/user/${userId}/chats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  getUserFeedback: (userId) =>
  request(`/api/auth/user/${userId}/feedback`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

  submitFeedback: (userId, body) =>
  request(`/api/auth/user/${userId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
    },
  }),

};
