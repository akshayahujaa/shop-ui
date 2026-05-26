import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { productService } from '../services/product.service';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format.util';
import { RatingStars } from '../components/ui/RatingStars';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(id);
        setProduct(response.data);
        setSelectedImage(response.data.images?.[0] || '');
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product._id, 1, product.discountPrice || product.price);
      toast.success('Added to cart successfully.');
    } catch (err) {
      toast.error('Unable to add product to cart.');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Login to save items to wishlist.');
      navigate('/login');
      return;
    }

    try {
      await userService.addToWishlist(product._id);
      toast.success('Added to wishlist.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add to wishlist.');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading product details…</div>;
  }

  if (!product) {
    return (
      <div className="page-empty">
        <h3>Product not found</h3>
        <p>We couldn’t find the product you were looking for. Try another search.</p>
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const savings = product.discountPrice ? product.price - product.discountPrice : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} – E-Shop</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>{product.name}</h2>
            <p>Find the best styles with fast delivery, curated ratings and secure checkout.</p>
          </div>
        </div>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-gallery-main">
              <img src={selectedImage} alt={product.name} />
            </div>
            <div className="product-gallery-thumbs">
              {product.images.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`product-gallery-thumb ${selectedImage === src ? 'active' : ''}`}
                  onClick={() => setSelectedImage(src)}
                >
                  <img src={src} alt={product.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-copy">
            <span className="product-category">{product.category?.name || 'Featured Collection'}</span>
            <h1>{product.name}</h1>
            <div className="rating-stars">
              <RatingStars value={product.ratings || 0} reviews={product.numReviews || 0} />
            </div>
            <div className="price-block">
              <div className="price-tag">
                <span className="product-price">{formatCurrency(price)}</span>
                {product.discountPrice && (
                  <span className="product-original-price">{formatCurrency(product.price)}</span>
                )}
              </div>
            </div>

            {savings > 0 && <div className="product-savings">Save {formatCurrency(savings)}</div>}

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {product.description}
            </p>

            <div className="product-actions">
              <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                Add to cart
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleWishlist}>
                Save to wishlist
              </button>
            </div>

            <div className="summary-card" style={{ marginTop: '20px' }}>
              <h3>Fast facts</h3>
              <ul className="bullet-list">
                <li>Stock available: {product.stock}</li>
                <li>Category: {product.category?.name || 'General'}</li>
                <li>{product.tags?.slice(0, 3).join(' • ') || 'Premium quality finish'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
