import React, { useState } from "react";
import Sidebar1 from "./Sidebar";
import "./worker.css";

const stats = [
  {
    title: "Active Job Applications", value: "5", sub: "↑ +2 applied today", color: "green",
    icon: <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    title: "Ongoing Work", value: "2", sub: "↑ +1 started today", color: "teal",
    icon: <svg viewBox="0 0 24 24"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>,
  },
  {
    title: "Total Earnings", value: "₹6,500", sub: "↑ +₹850 today", color: "gold",
    icon: <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
];

const jobs = [
  {
    initials: "GV", avatarColor: "green",
    title: "Harvesting – Wheat Field", farm: "Green Valley Farms", sub: "Agriculture Work",
    location: "2.5 km away", experience: "No experience required",
    tag: "Harvesting", tagColor: "green",
    pay: "₹500/day", duration: "2 Days", type: "Full-day",
    description: "Seasonal harvesting work on wheat fields. Tasks include manual cutting, bundling, and loading. Tools and gloves will be provided by the farm.",
    skills: ["Physical fitness", "Outdoor work", "Teamwork"],
    contact: "Farm Manager – Ramesh Patel · Report at 8:00 AM",
  },
  {
    initials: "SA", avatarColor: "teal",
    title: "Planting – Paddy Field", farm: "Sunrise Agro Farms", sub: "Agriculture Work",
    location: "1.2 km away", experience: "Beginner-friendly",
    tag: "Planting", tagColor: "teal",
    pay: "₹450/day", duration: "3 Days", type: "Part-time",
    description: "Help with rice seedling transplantation in flooded paddy fields. Training provided on-site. Rubber boots will be supplied.",
    skills: ["Willingness to learn", "Stamina"],
    contact: "Supervisor – Kavita Mehta · Report at 7:30 AM",
  },
  {
    initials: "BF", avatarColor: "amber",
    title: "Irrigation – Sugarcane", farm: "Bhumi Farm Co.", sub: "Agriculture Work",
    location: "3.8 km away", experience: "1 yr preferred",
    tag: "Irrigation", tagColor: "orange",
    pay: "₹550/day", duration: "1 Day", type: "Full-day",
    description: "Operate irrigation channels and pumps across sugarcane sections. Knowledge of drip irrigation is a plus.",
    skills: ["Irrigation basics", "Equipment handling"],
    contact: "Owner – Suresh Bhumi · Report at 9:00 AM",
  },
  {
    initials: "AT", avatarColor: "blue",
    title: "Spraying – Cotton Farm", farm: "AgroTech Fields", sub: "Agriculture Work",
    location: "5.0 km away", experience: "Experience required",
    tag: "Spraying", tagColor: "blue",
    pay: "₹600/day", duration: "2 Days", type: "Part-time",
    description: "Apply pesticides and fertilizers using backpack sprayers. Safety gear mandatory and provided. Must have prior spraying experience.",
    skills: ["Sprayer operation", "Safety protocols", "Pest awareness"],
    contact: "Field Lead – Arjun Desai · Report at 8:30 AM",
  },
  {
    initials: "FR", avatarColor: "coral",
    title: "Weeding – Vegetable Farm", farm: "Fresh Root Farms", sub: "Agriculture Work",
    location: "0.8 km away", experience: "No experience required",
    tag: "Weeding", tagColor: "red",
    pay: "₹400/day", duration: "4 Days", type: "Full-day",
    description: "Manual weeding between vegetable rows. Light physical work, suitable for all ages. Comfortable outdoor setting.",
    skills: ["Attention to detail", "Physical endurance"],
    contact: "Manager – Priya Sharma · Report at 7:00 AM",
  },
  {
    initials: "GH", avatarColor: "purple",
    title: "Sorting – Fruit Orchard", farm: "Golden Harvest Ltd", sub: "Agriculture Work",
    location: "4.2 km away", experience: "Beginner-friendly",
    tag: "Sorting", tagColor: "purple",
    pay: "₹480/day", duration: "2 Days", type: "Part-time",
    description: "Sort and grade freshly picked fruits by size, color, and quality. Clean indoor/shed environment. Good for detail-oriented workers.",
    skills: ["Quality checking", "Sorting", "Basic counting"],
    contact: "Supervisor – Meena Joshi · Report at 10:00 AM",
  },
];

const applications = [
  { title: "Planting – Rice Field",     farm: "Sunrise Agro Farms",  applied: "2 hours ago",  status: "pending",  statusLabel: "Under Review",           message: "Your application is being reviewed by the farm owner." },
  { title: "Harvesting – Wheat Field",  farm: "Green Valley Farms",  applied: "1 day ago",    status: "accepted", statusLabel: "Selected – Join Tomorrow", message: "You have been selected. Please report at 8 AM." },
  { title: "Irrigation – Cotton Farm",  farm: "AgroTech Fields",     applied: "3 days ago",   status: "rejected", statusLabel: "Not Selected",            message: "Thank you for applying. This position has been filled." },
  { title: "Weeding – Vegetable Plot",  farm: "Fresh Root Farms",    applied: "5 hours ago",  status: "pending",  statusLabel: "Under Review",           message: "Your application is being reviewed by the farm owner." },
];

export default function WorkerHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="wk-root">
      <Sidebar1 isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`wk-page ${sidebarOpen ? "" : "wk-page--wide"}`}>

        {/* ── HERO ───────────────────────────────── */}
        <section className="hero">
          <div className="hero__geo">
            <div className="hero__circle-lg" />
            <div className="hero__circle-md" />
            <div className="hero__circle-sm" />
          </div>

          <div className="hero__content">
            <div className="hero__left">
              <div className="hero__badge">
                <div className="hero__badge-dot" />
                <span>Worker Dashboard</span>
              </div>

              <p className="hero__greeting">Welcome back, Aayush 🌾</p>
              <p className="hero__sub">
                You have <strong>3 new job matches</strong> near you. Start applying today.
              </p>

              <div className="hero__btns">
                <button className="hero__cta-primary">
                  Browse New Jobs
                  <span className="hero__cta-arrow">
                    <svg viewBox="0 0 12 12"><polyline points="2,6 10,6 7,3"/><polyline points="7,9 10,6"/></svg>
                  </span>
                </button>
                <button className="hero__cta-secondary">My Applications</button>
              </div>
            </div>

            
          </div>
        </section>

        {/* ── STATS ──────────────────────────────── */}
        <section className="stats">
          {stats.map((s, i) => (
            <div className={`stat-card stat-card--${s.color}`} key={i}>
              <div className="stat-card__body">
                <p className="stat-card__title">{s.title}</p>
                <p className="stat-card__value">{s.value}</p>
                <p className="stat-card__sub">{s.sub}</p>
              </div>
              <div className="stat-card__icon-wrap">{s.icon}</div>
            </div>
          ))}
        </section>

        {/* ── AVAILABLE JOBS ─────────────────────── */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Jobs Available Near You</h2>
            <a href="#" className="section__link">View all</a>
          </div>
          <div className="jobs-grid">
            {jobs.map((j, i) => (
              <div className="job-card" key={i} onClick={() => setSelectedJob(j)}>
                <div className="job-card__top">
                  <div className={`job-card__avatar avatar--${j.avatarColor}`}>
                    {j.initials}
                  </div>
                  <div className="job-card__info">
                    <p className="job-card__title">{j.title}</p>
                    <p className="job-card__farm">{j.farm}</p>
                    <p className="job-card__sub">{j.sub}</p>
                  </div>
                </div>

                <div className="job-card__meta">
                  <div className="job-meta__row">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {j.location}
                  </div>
                  <div className="job-meta__row">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {j.experience}
                  </div>
                </div>

                <div className="job-card__footer">
                  <span className={`tag tag--${j.tagColor}`}>{j.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RECENT APPLICATIONS ────────────────── */}
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Recent Applications</h2>
            <a href="#" className="section__link">View all</a>
          </div>
          <div className="apps-grid">
            {applications.map((a, i) => (
              <div className="app-card" key={i}>
                <div className="app-card__top">
                  <div>
                    <p className="app-card__title">{a.title}</p>
                    <p className="app-card__farm">{a.farm}</p>
                  </div>
                  <span className={`status-badge status-badge--${a.status}`}>{a.statusLabel}</span>
                </div>
                <p className="app-card__msg">{a.message}</p>
                <div className="app-card__footer">
                  <span className="app-card__date">Applied {a.applied}</span>
                  <button className="btn-details">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── JOB DETAIL MODAL ───────────────────── */}
      {selectedJob && (
        <div className="modal-overlay open" onClick={(e) => e.target.classList.contains("modal-overlay") && setSelectedJob(null)}>
          <div className="modal">
            <div className="modal__header">
              <div className="modal__header-geo">
                <div className="modal__hcircle modal__hcircle--lg" />
                <div className="modal__hcircle modal__hcircle--sm" />
              </div>
              <button className="modal__close" onClick={() => setSelectedJob(null)}>✕</button>
              <div className="modal__header-badge">
                <span>{selectedJob.tag}</span>
              </div>
              <p className="modal__title">{selectedJob.title}</p>
              <p className="modal__farm">{selectedJob.farm}</p>
            </div>

            <div className="modal__body">
              <div className="modal__meta-grid">
                <div className="modal__meta-item">
                  <p className="modal__meta-label">Pay</p>
                  <p className="modal__meta-val">{selectedJob.pay}</p>
                </div>
                <div className="modal__meta-item">
                  <p className="modal__meta-label">Duration</p>
                  <p className="modal__meta-val">{selectedJob.duration}</p>
                </div>
                <div className="modal__meta-item">
                  <p className="modal__meta-label">Location</p>
                  <p className="modal__meta-val">{selectedJob.location}</p>
                </div>
                <div className="modal__meta-item">
                  <p className="modal__meta-label">Type</p>
                  <p className="modal__meta-val">{selectedJob.type}</p>
                </div>
              </div>

              <div>
                <p className="modal__section-label">About this job</p>
                <p className="modal__desc">{selectedJob.description}</p>
              </div>

              <div>
                <p className="modal__section-label">Skills required</p>
                <div className="modal__skills">
                  {selectedJob.skills.map((s, i) => (
                    <span key={i} className="modal__skill-pill">{s}</span>
                  ))}
                </div>
              </div>

              <div className="modal__contact">
                <div className="modal__contact-icon">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className="modal__contact-label">Report to</p>
                  <p className="modal__contact-val">{selectedJob.contact}</p>
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button className="btn-apply-modal">Apply Now</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}