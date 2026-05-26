import api from './api';

export const paymentService = {
  createPayment: async (orderId) => {
    const response = await api.post('/payments/create', { orderId });
    return response.data;
  },

  verifyPayment: async (paymentDetails) => {
    const response = await api.post('/payments/verify', paymentDetails);
    return response.data;
  },

  refundPayment: async (orderId) => {
    const response = await api.post(`/payments/refund/${orderId}`);
    return response.data;
  },
};
