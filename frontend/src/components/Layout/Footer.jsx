import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div className="site-footer-brand">
            <img src="/realtorhq-logo.png" alt="RealtorHQ" style={{ height: 56, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
          <p className="site-footer-tagline">Philippines&rsquo; trusted property platform</p>
        </div>

        <p className="site-footer-copy">
          &copy; {new Date().getFullYear()} RealtorHQ. All rights reserved.
        </p>

        <div className="site-footer-links">
          <Link to="/properties">Listings</Link>
          <Link to="/map">Map</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Get Started</Link>
        </div>
      </div>
    </footer>
  );
}
