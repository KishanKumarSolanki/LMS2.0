// Small fetch wrapper for talking to the Express/MongoDB backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  try {
    const stored = localStorage.getItem('lms_user');
    return stored ? JSON.parse(stored).token : null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// ---- Auth ----
export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
};

// ---- Courses ----
export const courseApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/courses${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/courses/${id}`, { auth: false }),
  create: (payload) => request('/courses', { method: 'POST', body: payload }),
  update: (id, payload) => request(`/courses/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
};

// ---- Enrollments ----
export const enrollmentApi = {
  enroll: (courseId) => request('/enrollments', { method: 'POST', body: { courseId } }),
  mine: () => request('/enrollments/me'),
  updateProgress: (id, payload) => request(`/enrollments/${id}/progress`, { method: 'PATCH', body: payload }),
  courseStudents: (courseId) => request(`/enrollments/course/${courseId}`),
  all: () => request('/enrollments'),
};

// ---- Users (admin) ----
export const userApi = {
  list: (role) => request(`/users${role ? `?role=${role}` : ''}`),
  addTeacher: (payload) => request('/users/teachers', { method: 'POST', body: payload }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
