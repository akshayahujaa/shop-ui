import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format.util';

export const Cart = () => {
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const cartTotal = useMemo(() => totalAmount || 0, [totalAmount]);

  const handleQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      toast.error('Failed to update quantity.');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error('Unable to remove item.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Cart – E-Shop</title>
        <meta name="description" content="Review items in your cart and proceed to secure checkout." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Shopping cart</h2>
            <p>Review your selected items, update quantities, and complete checkout with confidence.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="page-empty">
            <h3>Your cart is currently empty</h3>
            <p>Browse through our collection to add products to your cart.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '18px' }}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product._id}>
                      <td>
                        <div className="cart-item">
                          <img src={item.product.images?.[0]} alt={item.product.name} />
                          <div>
                            <Link to={`/products/${item.product._id}`} className="product-card-title">
                              {item.product.name}
                            </Link>
                            <p style={{ color: 'var(--text-secondary)' }}>
                              {formatCurrency(item.product.discountPrice || item.product.price)} each
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-control">
                          <button type="button" onClick={() => handleQuantity(item.product._id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => handleQuantity(item.product._id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td>{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}</td>
                      <td>
                        <button type="button" className="btn btn-secondary" onClick={() => handleRemove(item.product._id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="summary-card">
              <h3>Order summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(cartTotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{formatCurrency(cartTotal >= 500 ? 0 : 50)}</strong>
              </div>
              <div className="summary-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <span>Total</span>
                <strong>{formatCurrency(cartTotal >= 500 ? cartTotal : cartTotal + 50)}</strong>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/checkout')}>
                Continue to checkout
              </button>
            </aside>
          </div>
        )}
      </section>
    </>
  );
};

export default Cart;
