import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { userService } from '../services/user.service';
import { formatCurrency } from '../utils/format.util';
import { PAYMENT_METHODS } from '../utils/constants';

const PAYMENT_LABELS = {
  card: 'Credit / Debit Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  wallet: 'Digital Wallet',
  cod: 'Cash on Delivery',
};

export const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const cartTotal = useMemo(() => totalAmount || 0, [totalAmount]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await userService.getAddresses();
        setShippingAddresses(response.data?.data || []);
      } catch (err) {
        console.error('Unable to fetch saved addresses.', err);
      }
    };

    loadAddresses();
  }, []);

  if (items.length === 0) {
    return (
      <div className="page-empty">
        <h3>Your cart is empty</h3>
        <p>Add products to the cart before completing checkout.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/products')}>
          Browse products
        </button>
      </div>
    );
  }

  const shippingFee = cartTotal >= 500 ? 0 : 50;
  const payableAmount = cartTotal + shippingFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedAddressId) {
      if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!shippingAddress.phone.trim()) {
        errors.phone = 'Phone number is required.';
      } else if (!/^[0-9]{10}$/.test(shippingAddress.phone.trim())) {
        errors.phone = 'Phone number must be 10 digits.';
      }
      if (!shippingAddress.street.trim()) errors.street = 'Street address is required.';
      if (!shippingAddress.city.trim()) errors.city = 'City is required.';
      if (!shippingAddress.state.trim()) errors.state = 'State is required.';
      if (!shippingAddress.pincode.trim()) {
        errors.pincode = 'Pincode is required.';
      } else if (!/^[0-9]{6}$/.test(shippingAddress.pincode.trim())) {
        errors.pincode = 'Pincode must be 6 digits.';
      }
      if (!shippingAddress.country.trim()) errors.country = 'Country is required.';
    }

    if (!paymentMethod) {
      errors.paymentMethod = 'Select a payment method.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    const payload = {
      paymentMethod,
      addressId: selectedAddressId || undefined,
      shippingAddress: selectedAddressId ? undefined : shippingAddress,
    };

    setLoading(true);
    try {
      const orderResponse = await orderService.createOrder(payload);
      const orderId = orderResponse.data?._id || orderResponse.data?.id;

      // For COD, order is complete
      if (paymentMethod === PAYMENT_METHODS.COD) {
        clearCart();
        toast.success('Order placed successfully.');
        navigate(`/orders/${orderId}`);
        setLoading(false);
        return;
      }

      // For online payments, initiate Razorpay payment
      try {
        const paymentResponse = await paymentService.createPayment(orderId);
        const paymentData = paymentResponse.data;

        const razorpayOptions = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          order_id: paymentData.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyPayload = {
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              await paymentService.verifyPayment(verifyPayload);
              clearCart();
              toast.success('Payment successful! Order placed.');
              navigate(`/orders/${orderId}`);
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr);
              toast.error('Payment verification failed. Please contact support.');
              try {
                await orderService.cancelOrder(orderId, 'Payment verification failed');
              } catch (cancelErr) {
                console.error('Failed to cancel order after verification failure:', cancelErr);
              }
              navigate('/orders');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: selectedAddressId
              ? shippingAddresses.find((addr) => addr._id === selectedAddressId)?.fullName || ''
              : shippingAddress.fullName,
            email: '',
            contact: selectedAddressId
              ? shippingAddresses.find((addr) => addr._id === selectedAddressId)?.phone || ''
              : shippingAddress.phone,
          },
          theme: {
            color: '#3b82f6',
          },
          modal: {
            ondismiss: async () => {
              try {
                await orderService.cancelOrder(orderId, 'Payment cancelled by user');
              } catch (cancelErr) {
                console.error('Failed to cancel order after payment dismissal:', cancelErr);
              }
              toast.error('Payment cancelled by user.');
              navigate('/orders');
              setLoading(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayInstance.open();
      } catch (paymentErr) {
        console.error('Online payment session creation failed:', paymentErr);
        toast.error('Failed to initiate online payment. Order cancelled.');
        try {
          await orderService.cancelOrder(orderId, 'Failed to initiate online payment session');
        } catch (cancelErr) {
          console.error(cancelErr);
        }
        navigate('/orders');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      const responseErrors = err.response?.data?.errors;
      const message = err.response?.data?.message || err.message || 'Unable to place order. Please try again.';
      if (Array.isArray(responseErrors) && responseErrors.length > 0) {
        toast.error(message || 'Validation errors occurred.');
        responseErrors.forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(message);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout – E-Shop</title>
        <meta name="description" content="Complete checkout by choosing your delivery address and payment method." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Checkout</h2>
            <p>Choose delivery details and payment method before completing your order.</p>
          </div>
        </div>

        <div className="checkout-grid">
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="address-card">
              <h3>Delivery address</h3>
              <div className="radio-group">
                {shippingAddresses.length > 0 && shippingAddresses.map((address) => (
                  <label key={address._id} className="radio-card">
                    <input
                      type="radio"
                      name="savedAddress"
                      value={address._id}
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                    />
                    <div>
                      <strong>{address.fullName}</strong>
                      <p>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                      <p>{address.phone}</p>
                    </div>
                  </label>
                ))}
                <label className="radio-card" style={{ paddingTop: '20px' }}>
                  <input
                    type="radio"
                    name="savedAddress"
                    value="new"
                    checked={!selectedAddressId}
                    onChange={() => setSelectedAddressId('')}
                  />
                  <div>
                    <strong>Add new address</strong>
                    <p>Enter a new shipping address for this order.</p>
                  </div>
                </label>
              </div>
            </div>

            {!selectedAddressId && (
              <div className="form-card">
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full name</label>
                  <input id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleChange} className={`input-field ${fieldErrors.fullName ? 'input-error' : ''}`} />
                  {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone number</label>
                  <input id="phone" name="phone" value={shippingAddress.phone} onChange={handleChange} className={`input-field ${fieldErrors.phone ? 'input-error' : ''}`} />
                  {fieldErrors.phone && <span className="field-error-text">{fieldErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="street">Street address</label>
                  <input id="street" name="street" value={shippingAddress.street} onChange={handleChange} className={`input-field ${fieldErrors.street ? 'input-error' : ''}`} />
                  {fieldErrors.street && <span className="field-error-text">{fieldErrors.street}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City</label>
                  <input id="city" name="city" value={shippingAddress.city} onChange={handleChange} className={`input-field ${fieldErrors.city ? 'input-error' : ''}`} />
                  {fieldErrors.city && <span className="field-error-text">{fieldErrors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State</label>
                  <input id="state" name="state" value={shippingAddress.state} onChange={handleChange} className={`input-field ${fieldErrors.state ? 'input-error' : ''}`} />
                  {fieldErrors.state && <span className="field-error-text">{fieldErrors.state}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" value={shippingAddress.pincode} onChange={handleChange} className={`input-field ${fieldErrors.pincode ? 'input-error' : ''}`} />
                  {fieldErrors.pincode && <span className="field-error-text">{fieldErrors.pincode}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="country">Country</label>
                  <input id="country" name="country" value={shippingAddress.country} onChange={handleChange} className={`input-field ${fieldErrors.country ? 'input-error' : ''}`} />
                  {fieldErrors.country && <span className="field-error-text">{fieldErrors.country}</span>}
                </div>
              </div>
            )}

            <div className="address-card">
              <h3>Payment method</h3>
              <div className="radio-group">
                {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                  <label key={key} className="radio-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={key}
                      checked={paymentMethod === key}
                      onChange={() => setPaymentMethod(key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.paymentMethod && <span className="field-error-text">{fieldErrors.paymentMethod}</span>}
            </div>

            <div className="page-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Placing order…' : `Place order • ${formatCurrency(payableAmount)}`}
              </button>
            </div>
          </form>

          <aside className="order-summary-card">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Items total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{formatCurrency(shippingFee)}</strong>
            </div>
            <div className="summary-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <span>Total payable</span>
              <strong>{formatCurrency(payableAmount)}</strong>
            </div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Orders above ₹500 qualify for free shipping. Cash on delivery is available for selected addresses.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Checkout;
