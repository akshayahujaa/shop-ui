import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { AdminSidebar } from '../components/common/AdminSidebar/AdminSidebar';
import { formatCurrency } from '../utils/format.util';

export const AdminManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setOrders(response.data || []);
      setPagination(response.pagination || { currentPage: page, totalPages: 1, totalItems: 0, limit: 10 });
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error('Unable to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully.');
      setOrders((curr) =>
        curr.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order? This will cancel the order.')) {
      return;
    }
    try {
      const res = await paymentService.refundPayment(orderId);
      if (res.success || res.data?.refunded) {
        toast.success(`Successfully refunded ${formatCurrency(res.data?.amount || 0)}.`);
        // Reload order list
        fetchOrders();
      } else {
        toast.error('Refund could not be initiated.');
      }
    } catch (err) {
      console.error('Failed to refund order', err);
      toast.error(err.response?.data?.message || 'Refund processing failed.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Orders – Admin</title>
        <meta name="description" content="Manage client orders, track delivery status and trigger refunds." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2>Manage Orders</h2>
          <p>Track purchase transactions, update dispatch states, and process payment refunds.</p>
        </div>

        <div className="admin-layout">
          <AdminSidebar />

          <main className="admin-main-content">
            {/* Filters panel */}
            <div className="admin-filters-panel">
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Filter by status</span>
              <div className="filters-actions">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="role-select"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders list table */}
            {loading ? (
              <div className="loading-state" style={{ padding: '60px 0' }}>Fetching orders...</div>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                No orders found.
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Info</th>
                        <th>Order Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
                            <Link to={`/orders/${order._id}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td>
                            <div className="user-meta-details">
                              <span className="user-meta-name">{order.user?.name || 'Guest User'}</span>
                              <span className="user-meta-email">{order.user?.email || ''}</span>
                            </div>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600' }}>
                                {order.paymentMethod}
                              </span>
                              <span className={`status-pill ${order.paymentInfo?.status || 'pending'}`} style={{ width: 'fit-content' }}>
                                {order.paymentInfo?.status || 'pending'}
                              </span>
                            </div>
                          </td>
                          <td>
                            {order.status === 'cancelled' || order.status === 'delivered' ? (
                              <span className={`status-pill ${order.status}`}>
                                {order.status}
                              </span>
                            ) : (
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className="role-select"
                                style={{ fontSize: '0.85rem' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                          <td>
                            {order.paymentInfo?.status === 'paid' && order.status !== 'delivered' && (
                              <button
                                type="button"
                                onClick={() => handleRefund(order._id)}
                                className="status-toggle-btn btn-inactive"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                Refund & Cancel
                              </button>
                            )}
                            {(order.status === 'cancelled' || order.status === 'delivered') && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No Actions</span>
                            )}
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
                      Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} orders)
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
          </main>
        </div>
      </section>
    </>
  );
};

export default AdminManageOrders;
