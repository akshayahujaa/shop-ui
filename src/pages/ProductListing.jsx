import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { productService } from '../services/product.service';
import { ProductCard } from '../components/ui/ProductCard';
import { formatCurrency } from '../utils/format.util';

const INITIAL_FILTERS = {
  page: 1,
  limit: 20,
  sort: 'createdAt',
};

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, hasNextPage: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'createdAt');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
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

  const queryOptions = useMemo(() => {
    const query = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: searchParams.get('sort') || 'createdAt',
      category: searchParams.get('category') || undefined,
      query: searchParams.get('search') || undefined,
    };
    return query;
  }, [searchParams]);

  const fetchProducts = useCallback(async (append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: queryOptions.page,
        limit: queryOptions.limit,
        sort: queryOptions.sort === 'price_asc' ? 'price_asc' : queryOptions.sort === 'price_desc' ? 'price_desc' : queryOptions.sort,
        category: queryOptions.category,
      };

      const response = queryOptions.query
        ? await productService.searchProducts(queryOptions.query, params)
        : await productService.getProducts(params);

      const results = response.data || [];
      setProducts((current) => (append ? [...current, ...results] : results));
      setPagination((prev) => ({
        currentPage: response.pagination.currentPage,
        hasNextPage: response.pagination.hasNextPage,
      }));
    } catch (err) {
      setError('Unable to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [queryOptions]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const categoryResponse = await productService.getCategories();
        setCategories(categoryResponse.data || []);
      } catch (err) {
        console.error('Category load failed', err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  useEffect(() => {
    if (!sentinelRef.current || !pagination.hasNextPage || loading) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pagination.hasNextPage && !loading) {
        setSearchParams((current) => {
          const nextPage = Number(current.get('page') || 1) + 1;
          current.set('page', String(nextPage));
          return current;
        });
      }
    });

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [pagination.hasNextPage, loading, setSearchParams]);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSortOrder(searchParams.get('sort') || 'createdAt');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      nextParams.set('search', searchTerm.trim());
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (selectedCategory === categoryId) {
      nextParams.delete('category');
    } else {
      nextParams.set('category', categoryId);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSort = (event) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('sort', event.target.value);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const activeCategoryName = categories.find((category) => category._id === selectedCategory)?.name;

  return (
    <>
      <Helmet>
        <title>Shop - E-Shop</title>
        <meta name="description" content="Browse the catalog with smart filters, category chips and infinite scroll." />
      </Helmet>

      <section className="page-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Shop the collection</h2>
              <p>
                Browse thousands of products with smart search, premium sorting and category selections.
              </p>
            </div>
            <div className="action-chips">
              <Link to="/" className="btn btn-outline">
                Back to home
              </Link>
            </div>
          </div>

          <form className="search-form" onSubmit={handleSearch} style={{ display: 'grid', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.5fr 0.8fr' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                placeholder="Search for products, brands or styles"
              />
              <select value={sortOrder} onChange={handleSort} className="input-field" style={{ minWidth: '180px' }}>
                <option value="createdAt">Newest arrivals</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="rating">Best rated</option>
              </select>
            </div>
          </form>

          <div className="category-chip-list" style={{ marginBottom: '26px' }}>
            <span className="filter-pill">Filters:</span>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                className={`category-chip ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => handleCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
            {selectedCategory && (
              <button
                type="button"
                className="category-chip"
                style={{ background: 'var(--bg-secondary)' }}
                onClick={() => handleCategory(selectedCategory)}
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="section-heading" style={{ marginBottom: '18px' }}>
            <div>
              <h2>{activeCategoryName || 'All products'}</h2>
              <p>{queryOptions.query ? `Search results for "${queryOptions.query}"` : 'Premium collection ready for fast checkout.'}</p>
            </div>
            <div className="status-pill">{pagination.currentPage} / {Math.max(1, pagination.currentPage + (pagination.hasNextPage ? 1 : 0))}</div>
          </div>

          {error && <div className="loading-state">{error}</div>}

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
              />
            ))}
          </div>

          {(loading || pagination.hasNextPage) && (
            <div ref={sentinelRef} className="loading-sentinel">
              {loading ? 'Loading more products…' : 'Scroll for more products.'}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="page-empty">
              <h3>No products found</h3>
              <p>Try using a broader search term or browse through categories.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductListing;
