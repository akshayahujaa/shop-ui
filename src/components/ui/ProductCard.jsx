import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { formatCurrency } from '../../utils/format.util';

export const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const price = product.discountPrice ? product.discountPrice : product.price;
  const savings = product.discountPrice ? product.price - product.discountPrice : 0;
  const image = product.images?.[0] || '/placeholder-product.png';

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
        <button type="button" className="btn btn-primary" onClick={onAddToCart}>
          Add to Cart
        </button>
        <button type="button" className="btn btn-secondary" onClick={onAddToWishlist}>
          Wishlist
        </button>
      </div>
    </article>
  );
};
