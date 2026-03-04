import React from 'react';
import './Howitworks.css';
import { FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    number: "1",
    title: "Create Your Profile",
    description: "Employers post detailed job listings or workers build profiles showcasing skills, certifications, location, and availability — all in minutes."
  },
  {
    number: "2",
    title: "Search & Match",
    description: "Advanced filters narrow results by location, crop type, wage range, and seasonal availability — surfacing the right fit fast."
  },
  {
    number: "3",
    title: "Connect & Communicate",
    description: "Apply in one click, message directly through the platform, and coordinate interviews or negotiations — all in one place."
  },
  {
    number: "4",
    title: "Hire & Manage",
    description: "Sign contracts digitally, track hours, process payments securely, and leave reviews that build lasting trust on both sides."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="hiw-rule" />

      <div className="hiw-container">

        {/* ── Simple centered header ── */}
        <div className="hiw-header">
          <span className="hiw-label">How It Works</span>
          <h2>
            Four steps to your <em>next</em><br />
            harvest season.
          </h2>
        </div>

        {/* ── Steps Grid ── */}
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <span className="step-index">0{index + 1}</span>
              <div className="step-badge">
                <span>{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="step-arrow">
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;