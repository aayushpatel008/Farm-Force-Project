import React from 'react';
import './Howitworks.css';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Create Profile",
      description: "Employers post jobs or workers create detailed profiles with skills, experience, and availability."
    },
    {
      number: "2",
      title: "Search & Match",
      description: "Use advanced filters to find the perfect match based on location, skills, job type, and requirements."
    },
    {
      number: "3",
      title: "Connect & Communicate",
      description: "Message directly through the platform, schedule interviews, and negotiate terms seamlessly."
    },
    {
      number: "4",
      title: "Hire & Manage",
      description: "Digitally sign contracts, track work, process payments, and provide feedback for future opportunities."
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <h1>How FarmForce Works</h1>
          <p className="subtitle">Simple steps to connect agricultural talent with opportunities</p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;