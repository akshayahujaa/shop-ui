import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  if (isLoading) {
    return <div className="loading-state">Checking session...</div>;
  }

  return (
    <section className="container page-section">
      <Helmet>
        <title>Login – E-Shop</title>
        <meta name="description" content="Secure login for existing users with instant access to wishlist and checkout." />
      </Helmet>
      <div className="form-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="section-heading">
          <div>
            <h2>Welcome back</h2>
            <p>Login to access your cart, wishlist and order history.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="form-card">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="input-field"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <div className="error-message">{errors.email.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              className="input-field"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <div className="error-message">{errors.password.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
