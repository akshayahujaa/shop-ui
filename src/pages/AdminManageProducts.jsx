import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { productService } from '../services/product.service';
import { AdminSidebar } from '../components/common/AdminSidebar/AdminSidebar';
import { formatCurrency } from '../utils/format.util';

export const AdminManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form State
  const [formFields, setFormFields] = useState({
    name: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    description: '',
    images: '',
  });
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        page,
        limit: 10,
      });
      setProducts(response.data || []);
      setPagination(response.pagination || { currentPage: page, totalPages: 1, totalItems: 0, limit: 10 });
    } catch (err) {
      console.error('Failed to fetch products', err);
      toast.error('Unable to fetch products list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const handleOpenModal = (product = null) => {
    setErrors({});
    if (product) {
      setEditProduct(product);
      setFormFields({
        name: product.name || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '0',
        category: typeof product.category === 'object' ? product.category._id : product.category || '',
        description: product.description || '',
        images: Array.isArray(product.images) ? product.images.join(', ') : '',
      });
    } else {
      setEditProduct(null);
      setFormFields({
        name: '',
        price: '',
        discountPrice: '',
        stock: '0',
        category: '',
        description: '',
        images: '',
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formFields.name.trim()) errs.name = 'Product name is required.';
    if (!formFields.price || Number(formFields.price) <= 0) errs.price = 'Price must be a positive number.';
    if (formFields.discountPrice && Number(formFields.discountPrice) >= Number(formFields.price)) {
      errs.discountPrice = 'Discount price must be less than regular price.';
    }
    if (formFields.stock === '' || Number(formFields.stock) < 0) errs.stock = 'Stock cannot be negative.';
    if (!formFields.category) errs.category = 'Select a category.';
    if (!formFields.description.trim() || formFields.description.length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }
    if (!formFields.images.trim()) {
      errs.images = 'At least 1 image URL is required.';
    } else {
      const urls = formFields.images.split(',').map((u) => u.trim()).filter(Boolean);
      if (urls.length > 5) {
        errs.images = 'You can add up to 5 images only.';
      }
      for (const u of urls) {
        if (!u.startsWith('http://') && !u.startsWith('https://')) {
          errs.images = 'All images must be valid http/https URLs.';
          break;
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const imageUrls = formFields.images.split(',').map((u) => u.trim()).filter(Boolean);
    const payload = {
      name: formFields.name.trim(),
      price: Number(formFields.price),
      discountPrice: formFields.discountPrice ? Number(formFields.discountPrice) : undefined,
      stock: Number(formFields.stock),
      category: formFields.category,
      description: formFields.description.trim(),
      images: imageUrls,
    };

    try {
      if (editProduct) {
        await productService.updateProduct(editProduct._id, payload);
        toast.success('Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      toast.error(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Products – Admin</title>
        <meta name="description" content="Manage inventory: add, edit, and delete products in the catalog." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2>Manage Products</h2>
          <p>Maintain your product catalog, upload media images, track available stock units.</p>
        </div>

        <div className="admin-layout">
          <AdminSidebar />

          <main className="admin-main-content">
            {/* Filters panel */}
            <div className="admin-filters-panel">
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Products catalog</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                + Add Product
              </button>
            </div>

            {/* Products Table */}
            {loading ? (
              <div className="loading-state" style={{ padding: '60px 0' }}>Fetching catalog...</div>
            ) : products.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No products found in the database.
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Details</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/60'}
                              alt={product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                          </td>
                          <td>
                            <div className="user-meta-details">
                              <span className="user-meta-name">{product.name}</span>
                              <span className="user-meta-email" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {product.description}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontWeight: '700' }}>
                            {product.discountPrice ? (
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--success)' }}>{formatCurrency(product.discountPrice)}</span>
                                <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {formatCurrency(product.price)}
                                </span>
                              </div>
                            ) : (
                              formatCurrency(product.price)
                            )}
                          </td>
                          <td>
                            <span className={`badge badge-${product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td>{product.category?.name || 'Uncategorized'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenModal(product)}
                                className="status-toggle-btn btn-active"
                                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product._id)}
                                className="status-toggle-btn btn-inactive"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <span className="pagination-text">
                      Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} products)
                    </span>
                    <div className="pagination-controls">
                      <button
                        type="button"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setPage((p) => p - 1)}
                        className="pagination-btn"
                      >
                        Prev
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`pagination-btn ${pagination.currentPage === p ? 'active' : ''}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal */}
            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content glass-panel">
                  <div className="modal-header">
                    <h3 className="modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Product Name</label>
                      <input
                        id="name"
                        type="text"
                        className={`input-field ${errors.name ? 'input-error' : ''}`}
                        value={formFields.name}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                      />
                      {errors.name && <span className="field-error-text">{errors.name}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="price">Regular Price (₹)</label>
                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          className={`input-field ${errors.price ? 'input-error' : ''}`}
                          value={formFields.price}
                          onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
                        />
                        {errors.price && <span className="field-error-text">{errors.price}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="discountPrice">Discount Price (₹ - Optional)</label>
                        <input
                          id="discountPrice"
                          type="number"
                          step="0.01"
                          className={`input-field ${errors.discountPrice ? 'input-error' : ''}`}
                          value={formFields.discountPrice}
                          onChange={(e) => setFormFields({ ...formFields, discountPrice: e.target.value })}
                        />
                        {errors.discountPrice && <span className="field-error-text">{errors.discountPrice}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="stock">Available Stock</label>
                        <input
                          id="stock"
                          type="number"
                          className={`input-field ${errors.stock ? 'input-error' : ''}`}
                          value={formFields.stock}
                          onChange={(e) => setFormFields({ ...formFields, stock: e.target.value })}
                        />
                        {errors.stock && <span className="field-error-text">{errors.stock}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="category">Category</label>
                        <select
                          id="category"
                          className={`role-select input-field ${errors.category ? 'input-error' : ''}`}
                          value={formFields.category}
                          onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                          style={{ height: '53px' }}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {errors.category && <span className="field-error-text">{errors.category}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="images">Product Image URLs (Comma-separated, up to 5 URLs)</label>
                      <input
                        id="images"
                        type="text"
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                        className={`input-field ${errors.images ? 'input-error' : ''}`}
                        value={formFields.images}
                        onChange={(e) => setFormFields({ ...formFields, images: e.target.value })}
                      />
                      {errors.images && <span className="field-error-text">{errors.images}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        rows="4"
                        className={`input-field ${errors.description ? 'input-error' : ''}`}
                        value={formFields.description}
                        onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                        style={{ resize: 'vertical' }}
                      />
                      {errors.description && <span className="field-error-text">{errors.description}</span>}
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editProduct ? 'Save Changes' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
};

export default AdminManageProducts;
