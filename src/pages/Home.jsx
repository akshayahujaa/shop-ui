import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { productService } from '../services/product.service';
import { formatCurrency } from '../utils/format.util';
import { ProductCard } from '../components/ui/ProductCard';

export const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      return toast.error('Login to add items to cart.');
    }

    try {
      await addToCart(product._id, 1, product.discountPrice || product.price);
      toast.success('Added to cart.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add to cart.');
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) {
      return toast.error('Login to save items to wishlist.');
    }

    try {
      await userService.addToWishlist(product._id);
      toast.success('Added to wishlist.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add to wishlist.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts({ page: 1, limit: 8 }),
          productService.getCategories(),
        ]);

        setFeaturedItems(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Home page load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Customers served', value: '1.2M+' },
      { label: 'Brands available', value: '5,500+' },
      { label: 'Delivered daily', value: '10K+' },
    ],
    []
  );

  return (
    <>
      <Helmet>
        <title>E-Shop • Fashion & Lifestyle</title>
        <meta name="description" content="Shop trending fashion, electronics and home essentials in a premium Myntra/Amazon-inspired frontend." />
      </Helmet>

      <section className="hero-banner">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Discover</span>
            <h1>Shop trendy fashion, tech and everyday essentials in one premium marketplace.</h1>
            <p>
              Experience a sleek frontend with curated categories, fast searches, and smart checkout.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                Start shopping
              </Link>
              <Link to="/wishlist" className="btn btn-secondary">
                Saved items
              </Link>
            </div>
          </div>

          <div className="hero-metrics">
            {heroStats.map((stat) => (
              <div className="metric-card" key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Popular categories</h2>
            <p>Browse shopping categories inspired by premium style marketplaces.</p>
          </div>
          <Link to="/products" className="btn btn-outline">
            View all
          </Link>
        </div>

        <div className="category-chip-list">
          {categories.slice(0, 8).map((category) => (
            <Link key={category._id} to={`/products?category=${category._id}`} className="category-chip">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Trending picks</h2>
            <p>Hand-picked products for the season with bold deals and premium offers.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading featured products…</div>
        ) : (
          <div className="product-grid">
            {featuredItems.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Why shop with E-Shop?</h2>
            <p>Premium UI, seamless navigation, curated collections and fast backend connectivity.</p>
          </div>
        </div>

        <div className="feature-chip-list">
          <div className="category-chip active">Express delivery</div>
          <div className="category-chip active">Secure checkout</div>
          <div className="category-chip active">7-day returns</div>
          <div className="category-chip active">24/7 support</div>
        </div>
      </section>
    </>
  );
};

export default Home;
