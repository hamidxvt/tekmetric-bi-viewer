import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// On 401, kick back to the server root — Express will redirect to AI Center
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/'; // Express will redirect to AI Center
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  me: ()           => api.get('/api/auth/me'),
  logout: ()       => api.post('/api/auth/logout'),
};

export const adminApi = {
  stats: ()         => api.get('/api/admin/stats'),
  listUsers: ()     => api.get('/api/admin/users'),
  createUser: (d)   => api.post('/api/admin/users', d),
  updateUser: (id, d) => api.put(`/api/admin/users/${id}`, d),
  deleteUser: (id)  => api.delete(`/api/admin/users/${id}`),
};

export default api;
