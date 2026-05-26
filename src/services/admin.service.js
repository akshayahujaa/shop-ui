import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await api.put(`/users/${userId}/status`, { isActive });
    return response.data;
  },
};

export default adminService;
