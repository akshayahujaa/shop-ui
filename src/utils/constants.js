export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  THEME: 'theme',
};

export const USER_ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  COD: 'cod',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};
