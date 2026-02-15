import React from 'react';
import './Features.css';
import { 
  FaListAlt, 
  FaUserTie, 
  FaSearch, 
  FaComments, 
  FaCreditCard, 
  FaGraduationCap 
} from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaListAlt />,
      title: "Job Listing Module",
      description: "Agricultural businesses can create job listings for various roles including farm hands, harvesters, machine operators, livestock managers and more. Post seasonal or permanent jobs across all agricultural sectors."
    },
    {
      icon: <FaUserTie />,
      title: "Worker Profiles",
      description: "Workers can create detailed profiles highlighting skills, experience, certifications, and location. Set availability, preferred hours, and provide references from past employers."
    },
    {
      icon: <FaSearch />,
      title: "Search & Filter Options",
      description: "Advanced search with location-based filtering, job type sorting, and criteria like hourly wage, type of crops or livestock involved, and seasonal availability."
    },
    {
      icon: <FaComments />,
      title: "Application & Communication",
      description: "One-click applications with instant notifications. In-app messaging for interviews, wage negotiation, and job discussions. Real-time updates for both employers and workers."
    },
    {
      icon: <FaCreditCard />,
      title: "Payment & Payroll System",
      description: "Secure payment integration with direct bank transfers or digital wallets. Wage tracking, contract signing, and payment history access for both employers and workers."
    },
    {
      icon: <FaGraduationCap />,
      title: "Skill Development & Training",
      description: "Access to agricultural training materials, courses, and certifications. Skill verification programs to enhance employability and meet specific employer training needs."
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-title">
          <h2>Platform Features</h2>
          <p>AgriHire offers a comprehensive set of tools designed specifically for the agricultural industry</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="icon-circle">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;