import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import adminService from '../services/admin.service';
import { AdminSidebar } from '../components/common/AdminSidebar/AdminSidebar';
import { formatCurrency } from '../utils/format.util';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard statistics', err);
        toast.error('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container page-section" style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        <div style={{ flexGrow: 1 }} className="loading-state">Loading dashboard stats...</div>
      </div>
    );
  }

  const { kpis = {}, categoryStats = [], monthlySalesTrend = [], recentOrders = [] } = stats || {};

  // Find max sales value to scale custom SVG chart
  const maxSales = monthlySalesTrend.reduce((max, item) => (item.sales > max ? item.sales : max), 0) || 1000;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard – E-Shop</title>
        <meta name="description" content="Manage orders, products, users, and review sales statistics." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2>Admin panel</h2>
          <p>Analyze performance metrics, manage catalog inventory, and process orders.</p>
        </div>

        <div className="admin-layout">
          <AdminSidebar />

          <main className="admin-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* KPI metrics row */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card glass-panel">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total sales</span>
                  <div className="admin-kpi-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{formatCurrency(kpis.totalSales || 0)}</div>
              </div>

              <div className="admin-kpi-card glass-panel">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Orders placed</span>
                  <div className="admin-kpi-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{kpis.totalOrders || 0}</div>
              </div>

              <div className="admin-kpi-card glass-panel">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Registered users</span>
                  <div className="admin-kpi-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{kpis.totalUsers || 0}</div>
              </div>

              <div className="admin-kpi-card glass-panel">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total products</span>
                  <div className="admin-kpi-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{kpis.totalProducts || 0}</div>
              </div>
            </div>

            {/* Charts section */}
            <div className="admin-charts-grid">
              <div className="chart-card glass-panel">
                <div className="chart-header">
                  <h4 className="chart-title">Revenue trend</h4>
                  <p className="chart-subtitle">Monthly sales representation</p>
                </div>
                <div className="sales-trend-chart">
                  {monthlySalesTrend.length === 0 ? (
                    <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No sales history available yet.</div>
                  ) : (
                    monthlySalesTrend.map((item, index) => {
                      const heightPercent = `${Math.max((item.sales / maxSales) * 100, 5)}%`;
                      return (
                        <div key={index} className="trend-bar-wrapper">
                          <div className="trend-bar" style={{ height: heightPercent }}>
                            <div className="trend-tooltip">
                              {formatCurrency(item.sales)} ({item.ordersCount} orders)
                            </div>
                          </div>
                          <span className="trend-label">{item.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="chart-card glass-panel">
                <div className="chart-header">
                  <h4 className="chart-title">Categories distribution</h4>
                  <p className="chart-subtitle">Product count per category</p>
                </div>
                <div className="category-stats-list">
                  {categoryStats.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                      No categories mapped.
                    </div>
                  ) : (
                    categoryStats.map((cat, index) => {
                      const percent = kpis.totalProducts ? (cat.count / kpis.totalProducts) * 100 : 0;
                      return (
                        <div key={index} className="cat-stat-item">
                          <div className="cat-stat-info">
                            <span className="cat-stat-name">{cat.name}</span>
                            <span className="cat-stat-value">{cat.count} products ({Math.round(percent)}%)</span>
                          </div>
                          <div className="cat-stat-progress-bg">
                            <div className="cat-stat-progress-bar" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders section */}
            <div className="chart-card glass-panel" style={{ textAlign: 'left' }}>
              <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 className="chart-title">Recent orders</h4>
                  <p className="chart-subtitle">Overview of the last 5 transactions</p>
                </div>
                <Link to="/admin/orders" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Manage all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No orders placed yet.</p>
              ) : (
                <div className="admin-table-container" style={{ border: 'none', boxShadow: 'none', margin: '0' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
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
                          <td>
                            <span className={`status-pill ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
