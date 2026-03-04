import React from 'react';
import './Features.css';
import {
  FaListAlt,
  FaUserTie,
  FaSearch,
  FaComments,
  FaCreditCard,
  FaGraduationCap,
  FaArrowRight
} from 'react-icons/fa';

const features = [
  {
    icon: <FaListAlt />,
    title: "Job Listing Module",
    description: "Agricultural businesses can create job listings for farm hands, harvesters, machine operators, livestock managers and more — seasonal or permanent, across all sectors."
  },
  {
    icon: <FaUserTie />,
    title: "Worker Profiles",
    description: "Workers build detailed profiles highlighting skills, experience, certifications, and location. Set availability, preferred hours, and provide employer references."
  },
  {
    icon: <FaSearch />,
    title: "Search & Filter Options",
    description: "Location-based filtering, job type sorting, and advanced criteria — hourly wage, crop or livestock type, and seasonal availability — all in one intelligent interface."
  },
  {
    icon: <FaComments />,
    title: "Application & Communication",
    description: "One-click applications with instant notifications. In-app messaging for interviews and negotiations. Real-time updates keep both employers and workers aligned."
  },
  {
    icon: <FaCreditCard />,
    title: "Payment & Payroll System",
    description: "Secure payment integration with direct transfers or digital wallets. Wage tracking, contract signing, and full payment history for employers and workers alike."
  },
  {
    icon: <FaGraduationCap />,
    title: "Skill Development & Training",
    description: "Access agricultural training materials, courses, and certifications. Skill verification programs boost employability and meet specific employer requirements."
  }
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="section-rule" />

      <div className="feat-container">

        {/* ── Header ── */}
        <div className="feat-header">
          <div>
            <span className="feat-label">Platform Features</span>
            <h2>
              Built for the <em>fields,</em><br />
              powered by data.
            </h2>
          </div>
          <div className="feat-header-right">
            <p>
              FarmForce offers a comprehensive suite of tools designed specifically 
              for the agricultural industry — connecting the right workers with 
              the right opportunities, every season.
            </p>
            <div className="feat-count">
              <div className="feat-count-item">
                <strong>6</strong>
                <span>Core Modules</span>
              </div>
              <div className="feat-count-item">
                <strong>100%</strong>
                <span>Ag-focused</span>
              </div>
              <div className="feat-count-item">
                <strong>24/7</strong>
                <span>Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="card-number">0{index + 1}</span>
              <div className="icon-wrap">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="card-arrow">
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Strip ── */}
        <div className="feat-cta">
          <div className="feat-cta-text">
            Ready to transform your <span>agricultural workforce?</span>
          </div>
          <a href="#get-started" className="feat-cta-btn">
            Get Started Free <FaArrowRight />
          </a>
        </div>

      </div>
    </section>
  );
};

export default Features;