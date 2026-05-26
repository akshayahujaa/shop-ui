import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const NotFound = () => (
  <>
    <Helmet>
      <title>404 – Page Not Found</title>
      <meta name="description" content="The page you are looking for does not exist." />
    </Helmet>
    <section className="page-section not-found" style={{ textAlign: 'center' }}>
      <div className="container" style={{ padding: '6rem 0' }}>
        <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Oops! The page you’re looking for doesn’t exist — but your next great purchase is still a click away.
        </p>
        <Link to="/" className="btn btn-primary">
          Return home
        </Link>
      </div>
    </section>
  </>
);

export default NotFound;
