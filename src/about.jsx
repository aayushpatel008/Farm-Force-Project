import React, { useState } from 'react';
import './About.css';

const About = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [activeTab, setActiveTab] = useState('mission');

  // Accordion data
  const faqItems = [
    {
      id: 1,
      question: "How does FarmForce help farmers?",
      answer: "FarmForce provides end-to-end solutions including crop monitoring, soil analysis, weather predictions, market prices, and financial management tools. Our mobile app gives real-time insights to make informed decisions."
    },
    {
      id: 2,
      question: "Is FarmForce suitable for small-scale farmers?",
      answer: "Absolutely! We have tiered pricing starting with a free basic plan. Our solutions are designed to scale with your farm, whether you have 1 acre or 1000 acres."
    },
    {
      id: 3,
      question: "What crops does FarmForce support?",
      answer: "We support over 50 major crops including wheat, rice, corn, soybeans, cotton, fruits, vegetables, and specialty crops. Our database is continuously updated with new crop varieties."
    },
    {
      id: 4,
      question: "Do I need technical knowledge to use FarmForce?",
      answer: "No! Our platform is designed with farmers in mind. We have simple interfaces, local language support, and provide free training sessions in farming communities."
    }
  ];

  // Tab content
  const tabContent = {
    mission: {
      title: "Our Mission",
      content: "To democratize agricultural technology, making it accessible and affordable for every farmer worldwide. We believe that empowered farmers lead to food-secure nations.",
      icon: "🎯"
    },
    vision: {
      title: "Our Vision",
      content: "A world where technology eliminates hunger by enabling sustainable, profitable farming for all. We envision connected farm ecosystems that share knowledge and resources.",
      icon: "🌍"
    },
    values: {
      title: "Our Values",
      content: "Sustainability first. Farmers always. Innovation that serves. Community collaboration. Data-driven decisions with a human touch.",
      icon: "❤️"
    }
  };

  const teamMembers = [
    { name: "Sarah Chen", role: "Founder & CEO", bio: "Former agronomist with 15+ years in sustainable farming" },
    { name: "Miguel Rodriguez", role: "Head of Technology", bio: "AI expert focused on agricultural applications" },
    { name: "Amina Bello", role: "Farm Relations Director", bio: "Works directly with farmers across Africa and Asia" },
    { name: "James Wilson", role: "Sustainability Lead", bio: "Environmental scientist specializing in regenerative agriculture" }
  ];

  const achievements = [
    { number: "10,000+", label: "Active Farmers", description: "Using our platform daily" },
    { number: "50+", label: "Countries", description: "Across 6 continents" },
    { number: "30%", label: "Yield Increase", description: "Average improvement reported" },
    { number: "40%", label: "Cost Reduction", description: "In water and fertilizer usage" }
  ];

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About FarmForce</h1>
          <p className="hero-subtitle">Transforming agriculture through technology and innovation</p>
          <p className="hero-description">
            We're not just a tech company – we're farming revolutionaries. Since 2020, 
            we've been bridging the gap between traditional wisdom and digital innovation 
            to create sustainable farming ecosystems.
          </p>
        </div>
        <div className="hero-stats">
          {achievements.map((item, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{item.number}</div>
              <div className="stat-label">{item.label}</div>
              <div className="stat-description">{item.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission/Vision/Values Tabs */}
      <section className="core-values">
        <div className="section-header">
          <h2>What Drives Us</h2>
          <p>The principles that guide every decision we make</p>
        </div>
        
        <div className="tab-buttons">
          {Object.keys(tabContent).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">{tabContent[tab].icon}</span>
              {tabContent[tab].title}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          <div className="tab-panel active">
            <h3>{tabContent[activeTab].title}</h3>
            <p>{tabContent[activeTab].content}</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="our-story">
        <div className="story-content">
          <h2>Our Story</h2>
          <p>
            FarmForce began in a small farming community in Kenya, where our founder Sarah Chen 
            witnessed farmers struggling with unpredictable weather and market prices. She realized 
            that simple technology could make a huge difference.
          </p>
          <p>
            Starting with a basic SMS weather alert system, we've grown into a comprehensive 
            platform serving farmers globally. Every feature we build comes directly from farmer 
            feedback and real field testing.
          </p>
          <div className="story-highlights">
            <div className="highlight">
              <div className="highlight-year">2020</div>
              <div className="highlight-text">Founded with 10 pilot farmers</div>
            </div>
            <div className="highlight">
              <div className="highlight-year">2022</div>
              <div className="highlight-text">Expanded to 5 countries</div>
            </div>
            <div className="highlight">
              <div className="highlight-year">2024</div>
              <div className="highlight-text">1 million acres managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h2>Meet Our Team</h2>
          <p>Agricultural experts, technologists, and farmers working together</p>
        </div>
        
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Common questions from farmers like you</p>
        </div>
        
        <div className="accordion-container">
          {faqItems.map((item) => (
            <div 
              key={item.id} 
              className={`faq-item ${activeAccordion === item.id ? 'open' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleAccordion(item.id)}
              >
                <span>{item.question}</span>
                <span className="faq-icon">
                  {activeAccordion === item.id ? '−' : '+'}
                </span>
              </button>
              
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
};

export default About;