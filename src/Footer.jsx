import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Top Message */}
        <div className="footer-message">
          <p>Join us in building the future of agricultural employment.</p>
        </div>

        {/* Main Footer Content */}
        <div className="footer-content">
          
          {/* Brand */}
          <div className="footer-brand">
            <h3>🚜 Farm Force</h3>
            <p>Connecting farmers with skilled workers</p>
          </div>

          {/* Links */}
          <div className="footer-links-grid">

            <div className="links-section">
              <h4>Company</h4>
              <ul>
                <li>About us</li>
                <li>Blog</li>
                <li>We're hiring</li>
                <li>Our Services</li>
              </ul>
            </div>

            <div className="links-section">
              <h4>For Employers</h4>
              <ul>
                <li>Post a Job</li>
                <li>Hire interns</li>
                <li>List of Companies</li>
              </ul>
            </div>

            <div className="links-section">
              <h4>For Workers</h4>
              <ul>
                <li>Find Jobs</li>
                <li>College TPO registration</li>
                <li>Team Diary</li>
              </ul>
            </div>

            <div className="links-section">
              <h4>Legal</h4>
              <ul>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
                <li>Contact us</li>
                <li>Sitemap</li>
              </ul>
            </div>

          </div>
        </div>   {/* ✅ FIXED */}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="contact-info">
            <span>📧 support@farmforce.com</span>
            <span>📞 +1 (555) 123-4567</span>
          </div>

          <div className="copyright">
            <p>© {new Date().getFullYear()} Farm Force. All rights reserved.</p>
          </div>
        </div>

      </div>
  </footer>

  );
};

export default Footer;