import React from 'react';
import './Benefits.css';

const Benefits = () => {
  const benefitsData = [
    {
      id: 1,
      title: "Streamlined Hiring",
      description: "Reduce time and effort spent finding suitable candidates with our efficient matching system.",
      icon: "📋"
    },
    {
      id: 2,
      title: "Seasonal Flexibility",
      description: "Cater to the fluctuating demands of agriculture with easy seasonal worker hiring.",
      icon: "🌾"
    },
    {
      id: 3,
      title: "Cost-Efficient",
      description: "Save money on recruitment services with access to a wide pool of skilled and semi-skilled labor.",
      icon: "💰"
    },
    {
      id: 4,
      title: "Skill Development",
      description: "Workers can enhance skills and gain certifications to improve employability and career advancement.",
      icon: "🎓"
    },
    {
      id: 5,
      title: "Security & Transparency",
      description: "Secure payment system ensures fair and timely payments with transparent interactions through reviews.",
      icon: "🔒"
    },
    {
      id: 6,
      title: "Reliable Workforce",
      description: "Agricultural businesses gain access to a vetted, reliable workforce for all their staffing needs.",
      icon: "👥"
    }
  ];

  return (
    <div id="Benefits"className="benefits-container">
      <div className="benefits-header">
        <h1>Benefits of AgriHire</h1>
        <p className="subtitle">Why our platform is the best choice for agricultural employment</p>
      </div>
      
      <div className="benefits-grid">
        {benefitsData.map((benefit) => (
          <div className="benefit-card" key={benefit.id}>
            <div className="benefit-icon">{benefit.icon}</div>
            <div className="benefit-content">
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Benefits;