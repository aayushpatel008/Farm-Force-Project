import React from 'react';
import './hero.css';
import trector from "./assets/trector.jpg";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="farm-force-text">Farm Force</span>
          </h1>
          <p className="hero-subtitle">
            Connecting agricultural talent with farming opportunities
          </p>
          <p className="hero-description">
            Farm Force is your premier platform for agricultural employment. 
            Find skilled workers, secure reliable jobs, and grow the future 
            of farming together.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              Find Farm Work
            </button>
            <button className="btn-secondary">
              Hire Talent
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Farmers Connected</p>
            </div>
            <div className="stat">
              <h3>1,200+</h3>
              <p>Jobs Filled</p>
            </div>
            <div className="stat">
              <h3>45+</h3>
              <p>Regions Covered</p>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            {/* <div className="farm-icon">🚜</div> */}
            <div className="hero-image-container">
              <img src={trector} alt="Modern Farming" className="hero-image"/>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;