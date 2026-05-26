import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';

export const Profile = () => {
  const { user, isLoading, updateProfileState } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await userService.updateProfile({ name: data.name });
      updateProfileState(response.data?.data || user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Unable to update profile.');
    }
  };

  if (isLoading || !user) {
    return <div className="loading-state">Loading profile…</div>;
  }

  return (
    <section className="container page-section" style={{ maxWidth: '650px' }}>
      <Helmet>
        <title>My Profile – E-Shop</title>
        <meta name="description" content="Manage your account details and profile information." />
      </Helmet>
      <div className="section-heading">
        <div>
          <h2>My profile</h2>
          <p>Update your account details and keep your information fresh.</p>
        </div>
      </div>
      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full name</label>
          <input id="name" className="input-field" {...register('name', { required: 'Name is required' })} />
          {errors.name && <div className="error-message">{errors.name.message}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email address</label>
          <input id="email" className="input-field" disabled {...register('email')} />
        </div>
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </form>
    </section>
  );
};

export default Profile;
