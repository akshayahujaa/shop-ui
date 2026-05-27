import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { formatCurrency } from '../../utils/format.util';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const { isAuthenticated } = useAuth();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const price = product.discountPrice ? product.discountPrice : product.price;
  const savings = product.discountPrice ? product.price - product.discountPrice : 0;
  const image = product.images?.[0] || '/placeholder-product.png';

  // Find if product is already in cart
  const cartItem = items.find((item) => item.product?._id === product._id || item.product === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      return toast.error('Login to add items to cart.');
    }
    try {
      await addToCart(product._id, 1, price);
      toast.success('Added to cart.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add to cart.');
    }
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateQuantity(product._id, quantityInCart + 1);
      toast.success('Quantity updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update quantity.');
    }
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (quantityInCart > 1) {
        await updateQuantity(product._id, quantityInCart - 1);
        toast.success('Quantity updated.');
      } else {
        await removeFromCart(product._id);
        toast.success('Removed from cart.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update quantity.');
    }
  };

  return (
    <article className="product-card glass-panel">
      <Link to={`/products/${product._id}`} className="product-image-link">
        <div className="product-image-wrap">
          <img src={image} alt={product.name} className="product-image" />
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-card-title">
          {product.name}
        </Link>
        <div className="product-meta">
          <span className="product-category">{product.category?.name || 'Fashion'}</span>
          <RatingStars value={product.ratings || 0} reviews={product.numReviews || 0} />
        </div>
        <div className="product-price-row">
          <span className="product-price">{formatCurrency(price)}</span>
          {product.discountPrice && (
            <span className="product-original-price">{formatCurrency(product.price)}</span>
          )}
        </div>
        {savings > 0 && <div className="product-savings">Save {formatCurrency(savings)}</div>}
      </div>
      <div className="product-card-actions">
        {quantityInCart > 0 ? (
          <div className="quantity-controller">
            <button type="button" className="btn-quantity" onClick={handleDecrease}>
              -
            </button>
            <span className="quantity-display">{quantityInCart}</span>
            <button type="button" className="btn-quantity" onClick={handleIncrease}>
              +
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={onAddToWishlist}>
          Wishlist
        </button>
      </div>
    </article>
  );
};
