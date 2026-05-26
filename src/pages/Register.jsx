import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const password = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created successfully.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading-state">Setting up your account…</div>;
  }

  return (
    <section className="container page-section">
      <Helmet>
        <title>Register – E-Shop</title>
        <meta name="description" content="Create a new account and start shopping with a premium frontend experience." />
      </Helmet>
      <div className="form-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="section-heading">
          <div>
            <h2>Create your account</h2>
            <p>Register now to unlock wishlist, checkout and order tracking.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="form-card">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name"
              placeholder="John Doe"
              className="input-field"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <div className="error-message">{errors.name.message}</div>}
          </div>
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
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
            />
            {errors.password && <div className="error-message">{errors.password.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="input-field"
              {...register('confirmPassword', {
                required: 'Password confirmation is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Register'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
