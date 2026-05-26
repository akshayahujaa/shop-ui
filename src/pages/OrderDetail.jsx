import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrderById(id);
        setOrder(response.data || null);
      } catch (err) {
        console.error('Unable to fetch order details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadOrder();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading order details…</div>;
  }

  if (!order) {
    return (
      <div className="page-empty">
        <h3>Order not found</h3>
        <p>We could not find an order with that reference.</p>
      </div>
    );
  }

  return (
    <section className="container page-section">
      <Helmet>
        <title>Order {order._id} – E-Shop</title>
        <meta name="description" content={`Order details for ${order._id}.`} />
      </Helmet>
      <div className="section-heading">
        <div>
          <h2>Order details</h2>
          <p>Review shipping details, payment information and item summary for your order.</p>
        </div>
        <span className={statusClasses[order.status] || 'status-pill'}>{order.status}</span>
      </div>

      <div className="checkout-grid">
        <div className="summary-card">
          <h3>Shipping address</h3>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
          <p>{order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          <p>{order.shippingAddress.country}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>

        <aside className="order-summary-card">
          <h3>Payment & totals</h3>
          <div className="summary-row">
            <span>Payment method</span>
            <strong>{order.paymentMethod.toUpperCase()}</strong>
          </div>
          <div className="summary-row">
            <span>Items</span>
            <strong>{formatCurrency(order.itemsPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{formatCurrency(order.shippingPrice)}</strong>
          </div>
          <div className="summary-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <span>Total paid</span>
            <strong>{formatCurrency(order.totalAmount)}</strong>
          </div>
          <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            Created {formatDate(order.createdAt)}
          </div>
        </aside>
      </div>

      <div className="section-heading" style={{ marginTop: '28px' }}>
        <h3>Items in this order</h3>
      </div>
      <div className="product-grid">
        {order.items.map((item) => (
          <article key={item.product} className="product-card glass-panel">
            <div className="product-image-wrap">
              <img src={item.image} alt={item.name} className="product-image" />
            </div>
            <div className="product-card-body">
              <h4 className="product-card-title">{item.name}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Quantity: {item.quantity}</p>
              <div className="product-price-row">
                <span className="product-price">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OrderDetail;
