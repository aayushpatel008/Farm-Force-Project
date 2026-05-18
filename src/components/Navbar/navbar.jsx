import React from 'react';
import './navbar.css';
import { Link } from "react-router-dom";


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <a href="#home" className="navbar-logo">
          Farm<span className="logo-accent">Force</span>
        </a>

        {/* Navigation links */}
        <div className="nav-links">
          <a href="#home" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#Benefits" id="benefits" className="nav-link">Benefits</a>
          <Link to="/Signup" className="nav-link">Get Started</Link>
        </div>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <Link to="/Login"><button className="login-btn" >Login</button></Link>
          <Link to="/Signup">
          <button className="signup-btn">Sign Up</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;