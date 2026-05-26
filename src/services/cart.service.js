import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1, price) => {
    const response = await api.post('/cart', { product: productId, quantity, price });
    return response.data;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await api.put('/cart', { product: productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },
};
