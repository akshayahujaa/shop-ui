import { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, price) => {
    setIsLoading(true);
    try {
      const res = await cartService.addToCart(productId, quantity, price);
      if (res.success) {
        await fetchCart();
        return res;
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    setIsLoading(true);
    try {
      const res = await cartService.updateCartItem(productId, quantity);
      if (res.success) {
        await fetchCart();
        return res;
      }
    } catch (error) {
      console.error('Update quantity failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success) {
        await fetchCart();
        return res;
      }
    } catch (error) {
      console.error('Remove from cart failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartState = () => {
    setCart(null);
  };

  // Derived Values
  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalAmount,
        totalItems,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart: clearCartState,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
