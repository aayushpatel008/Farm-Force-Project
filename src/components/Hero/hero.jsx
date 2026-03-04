import React from 'react';
import './Hero.css';
import { FaArrowRight, FaUsers, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      {/* Top rule */}
      <div className="hero-rule" />
      
      {/* Background Effects */}
      <div className="hero-bg-glow" />
      <div className="hero-dot-pattern" />

      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-label">Agricultural Employment Platform</span>
          
          <h1 className="hero-title">
            Cultivating <em>connections</em><br />
            between talent & harvest
          </h1>
          
          <p className="hero-description">
            Farm Force is your premier platform for agricultural employment. 
            Find skilled workers, secure reliable jobs, and grow the future 
            of farming together.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary">
              Find Farm Work
              <FaArrowRight className="btn-icon" />
            </button>
            <button className="btn-secondary">
              Hire Talent
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>500+</h3>
                <p>Farmers Connected</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FaBriefcase />
              </div>
              <div className="stat-content">
                <h3>1,200+</h3>
                <p>Jobs Filled</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="stat-content">
                <h3>45+</h3>
                <p>Regions Covered</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <div className="hero-image-container">
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;