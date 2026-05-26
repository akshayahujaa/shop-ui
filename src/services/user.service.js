import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },

  // Address operations
  getAddresses: async () => {
    const response = await api.get('/users/address');
    return response.data;
  },

  createAddress: async (addressData) => {
    const response = await api.post('/users/address', addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/address/${addressId}`);
    return response.data;
  },

  // Wishlist operations
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
