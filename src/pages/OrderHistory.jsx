import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../services/order.service';
import { formatCurrency, formatDate } from '../utils/format.util';

const statusClasses = {
  pending: 'status-pill pending',
  processing: 'status-pill processing',
  shipped: 'status-pill shipped',
  delivered: 'status-pill delivered',
  cancelled: 'status-pill cancelled',
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrders({ page: 1, limit: 12 });
        setOrders(response.data || []);
      } catch (err) {
        console.error('Unable to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <section className="container page-section">
      <Helmet>
        <title>My Orders – E-Shop</title>
        <meta name="description" content="View your past orders, statuses and order summaries." />
      </Helmet>
      <div className="section-heading">
        <div>
          <h2>Order history</h2>
          <p>Track your past purchases and review delivery progress for each order.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading your orders…</div>
      ) : orders.length === 0 ? (
        <div className="page-empty">
          <h3>No orders yet</h3>
          <p>Place your first order and track it from this page.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '18px' }}>
            Shop products
          </Link>
        </div>
      ) : (
        <div className="order-card">
          {orders.map((order) => (
            <div key={order._id} className="summary-card" style={{ marginBottom: '18px' }}>
              <div className="summary-row">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</p>
                </div>
                <span className={statusClasses[order.status] || 'status-pill'}>{order.status}</span>
              </div>
              <div className="summary-row">
                <div style={{ color: 'var(--text-secondary)' }}>
                  {order.items.length} items • {order.paymentMethod.toUpperCase()}
                </div>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
              <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ width: 'fit-content' }}>
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderHistory;
