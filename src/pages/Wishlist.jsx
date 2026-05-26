import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { userService } from '../services/user.service';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format.util';

export const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await userService.getWishlist();
      const body = response?.data ?? response;
      setItems(body?.data ?? body ?? []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await userService.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (err) {
      toast.error('Unable to remove item.');
    }
  };

  const moveToCart = async (product) => {
    try {
      await addToCart(product._id, 1, product.discountPrice || product.price);
      toast.success('Product moved to cart.');
    } catch (err) {
      toast.error('Unable to add to cart.');
    }
  };

  return (
    <section className="container page-section">
      <Helmet>
        <title>Wishlist – E-Shop</title>
        <meta name="description" content="View your wishlist and move saved items to cart." />
      </Helmet>
      <div className="section-heading">
        <div>
          <h2>Saved items</h2>
          <p>Your wishlist stores products you want to revisit before checkout.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading your wishlist…</div>
      ) : items.length === 0 ? (
        <div className="page-empty">
          <h3>No saved items yet</h3>
          <p>Browse our catalog and save products to revisit later.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '18px' }}>
            Shop products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((item) => (
            <article key={item._id} className="product-card glass-panel">
              <Link to={`/products/${item.product._id}`} className="product-image-link">
                <div className="product-image-wrap">
                  <img src={item.product.images?.[0]} alt={item.product.name} className="product-image" />
                </div>
              </Link>
              <div className="product-card-body">
                <Link to={`/products/${item.product._id}`} className="product-card-title">
                  {item.product.name}
                </Link>
                <p className="product-category">{item.product.category?.name || 'Fashion'}</p>
                <div className="product-price-row">
                  <span className="product-price">{formatCurrency(item.product.discountPrice || item.product.price)}</span>
                  {item.product.discountPrice && <span className="product-original-price">{formatCurrency(item.product.price)}</span>}
                </div>
              </div>
              <div className="product-card-actions">
                <button type="button" className="btn btn-primary" onClick={() => moveToCart(item.product)}>
                  Move to cart
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => removeItem(item.product._id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Wishlist;
