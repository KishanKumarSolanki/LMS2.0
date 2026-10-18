const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('lms_token');
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
}

export const loginRequest = (email, password) => apiRequest('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
});

export const registerRequest = (payload) => apiRequest('/auth/register', {
    method: 'POST', body: JSON.stringify(payload),
});

export const googleLoginRequest = (credential) => apiRequest('/auth/google', {
    method: 'POST', body: JSON.stringify({ credential }),
});

export const getCourses = () => apiRequest('/courses');

export const courseApi = {
    list: (all = false) => apiRequest(`/courses${all ? '?all=true' : ''}`),
    get: (id) => apiRequest(`/courses/${id}`),
    mine: () => apiRequest('/courses/mine'),
    create: (payload) => apiRequest('/courses', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    uploadThumbnail: (file) => {
        const body = new FormData();
        body.append('thumbnail', file);
        return apiRequest('/courses/thumbnail', { method: 'POST', body });
    },
    remove: (id) => apiRequest(`/courses/${id}`, { method: 'DELETE' }),
};

export const enrollmentApi = {
    enroll: (courseId) => apiRequest('/enrollments', { method: 'POST', body: JSON.stringify({ courseId }) }),
    mine: () => apiRequest('/enrollments/me'),
    updateProgress: (id, payload) => apiRequest(`/enrollments/${id}/progress`, { method: 'PATCH', body: JSON.stringify(payload) }),
    certificate: (id) => apiRequest(`/enrollments/${id}/certificate`),
    verifyCertificate: (code) => apiRequest(`/enrollments/certificates/verify/${encodeURIComponent(code)}`),
    courseStudents: (courseId) => apiRequest(`/enrollments/course/${courseId}`),
    all: () => apiRequest('/enrollments'),
};

export const paymentApi = {
    createOrder: (courseId) => apiRequest('/payments/orders', { method: 'POST', body: JSON.stringify({ courseId }) }),
    verify: (payload) => apiRequest('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
};

export const contactApi = {
    send: (payload) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(payload) }),
    subscribe: (email) => apiRequest('/contact/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const userApi = {
    list: (role) => apiRequest(`/users${role ? `?role=${role}` : ''}`),
    addTeacher: (payload) => apiRequest('/users/teachers', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

export const courseId = (course) => String(course?._id || course?.id || '');
export const instructorName = (course) => course?.teacher?.name || course?.teacher || 'Unknown instructor';
