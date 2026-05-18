import React from 'react';
import './Footer.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top line */}
      <div className="footer-line" />

      <div className="footer-container">
        {/* Main Content */}
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <h3>Farm<span>Force</span></h3>
            <p>Connecting agricultural talent with farming opportunities</p>
            <div className="footer-copyright">
              © {new Date().getFullYear()} FarmForce. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <div className="links-grid">
              <a href="#about">About Us</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#benefits">Benefits</a>
              <a href="#contact">Contact</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-items">
              <span><FaEnvelope className="icon" /> support@farmforce.com</span>
              <span><FaPhone className="icon" /> +91 98765 43210</span>
              <span><FaMapMarkerAlt className="icon" /> Shubh complex, Kalol, Gujarat, India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;