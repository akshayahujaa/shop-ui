import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '60px 0 30px 0',
      marginTop: 'auto',
      transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-header)', marginBottom: '20px', fontSize: '1.2rem' }}>E-Shop<span>.</span></h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Your premium e-commerce destination for fashion, electronics, cosmetics, and everyday essentials. Styled with rich aesthetics and high performance.
          </p>
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-header)', marginBottom: '20px', fontSize: '1rem', color: 'var(--text-primary)' }}>Quick Links</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/products" style={{ transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = ''}>All Products</Link></li>
            <li><Link to="/cart" style={{ transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = ''}>Shopping Cart</Link></li>
            <li><Link to="/wishlist" style={{ transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = ''}>My Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-header)', marginBottom: '20px', fontSize: '1rem', color: 'var(--text-primary)' }}>Customer Service</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/profile" style={{ transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = ''}>My Account</Link></li>
            <li><Link to="/orders" style={{ transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = ''}>Order Tracking</Link></li>
            <li><span style={{ cursor: 'pointer' }}>FAQ & Support</span></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-header)', marginBottom: '20px', fontSize: '1rem', color: 'var(--text-primary)' }}>Contact Us</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
            📍 123 E-Commerce Way, Tech City, India
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            📧 support@eshop.com
          </p>
        </div>
      </div>
      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        © {new Date().getFullYear()} E-Shop. Designed with ❤️ by Akshay Ahuja. All rights reserved.
      </div>
    </footer>
  );
};
