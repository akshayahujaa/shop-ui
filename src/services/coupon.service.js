import api from './api';

export const couponService = {
  validateCoupon: async (code, orderAmount) => {
    const response = await api.post('/coupons/validate', { code, orderAmount });
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },
};
