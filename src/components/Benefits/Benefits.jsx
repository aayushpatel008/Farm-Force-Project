import React from 'react';
import './Benefits.css';
import { FaClipboardList, FaCalendarAlt, FaCoins, FaGraduationCap, FaShieldAlt, FaUsers } from 'react-icons/fa';

const Benefits = () => {
  const benefitsData = [
    {
      id: 1,
      title: "Streamlined Hiring",
      description: "Reduce time and effort spent finding suitable candidates with our efficient matching system.",
      icon: <FaClipboardList />
    },
    {
      id: 2,
      title: "Seasonal Flexibility",
      description: "Cater to the fluctuating demands of agriculture with easy seasonal worker hiring.",
      icon: <FaCalendarAlt />
    },
    {
      id: 3,
      title: "Cost-Efficient",
      description: "Save money on recruitment services with access to a wide pool of skilled and semi-skilled labor.",
      icon: <FaCoins />
    },
    {
      id: 4,
      title: "Skill Development",
      description: "Workers can enhance skills and gain certifications to improve employability and career advancement.",
      icon: <FaGraduationCap />
    },
    {
      id: 5,
      title: "Security & Transparency",
      description: "Secure payment system ensures fair and timely payments with transparent interactions through reviews.",
      icon: <FaShieldAlt />
    },
    {
      id: 6,
      title: "Reliable Workforce",
      description: "Agricultural businesses gain access to a vetted, reliable workforce for all their staffing needs.",
      icon: <FaUsers />
    }
  ];

  return (
    <section id="Benefits" className="benefits-section">
      <div className="benefits-rule" />
      
      <div className="benefits-container">
        {/* Header */}
        <div className="benefits-header">
          <span className="benefits-label">Why Choose Us</span>
          <h2>
            Benefits that <em>empower</em><br />
            your agricultural journey
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid">
          {benefitsData.map((benefit, index) => (
            <div className="benefit-card" key={benefit.id}>
              <span className="benefit-index">0{index + 1}</span>
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <div className="benefit-glow" />
            </div>
          ))}
        </div>
      </div>

      {/* Background Effects */}
      <div className="benefits-bg-glow" />
      <div className="benefits-dot-pattern" />
    </section>
  );
};

export default Benefits;