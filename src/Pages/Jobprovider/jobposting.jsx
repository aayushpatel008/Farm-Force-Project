import Sidebar from './sidebar';
import "./jobposting.css";
import React, { useState } from 'react';
import axios from 'axios';

const jobPostings = [
  { icon: "🚜", title: "Tractor Operator",       type: "Full-time · Seasonal",  status: "open",   location: "Oakfield, IA",      wage: "$24/hr",        posted: "Posted May 2",   startDate: "Jun 10, 2025", applicants: 7,  actions: ["Edit", "Duplicate", "Photo"] },
  { icon: "🍎", title: "Fruit Picker (Seasonal)", type: "Seasonal · Part-time",  status: "open",   location: "Sunny Orchard, CA", wage: "$18/hr + bonus", posted: "Posted Apr 28",  startDate: "Jun 1, 2025",  applicants: 14, actions: ["Edit", "Duplicate", "Photo"] },
  { icon: "🔧", title: "Farm Mechanic",           type: "Full-time · Permanent", status: "open",   location: "Green Valley, NE",  wage: "$28–32/hr",     posted: "Posted May 10",  startDate: "Immediate",    applicants: 3,  actions: ["Edit", "Duplicate", "Photo"] },
  { icon: "🚛", title: "Grain Truck Driver",      type: "Full-time · Contract",  status: "filled", location: "Liberty, MO",       wage: "$24/hr",        posted: "Posted Apr 15",  startDate: "May 20, 2025", applicants: 11, actions: ["View", "Photo"] },
  { icon: "🌱", title: "General Farm Hand",       type: "Part-time · Flexible",  status: "open",   location: "Multiple, TX",      wage: "$17–20/hr",     posted: "Posted May 12",  startDate: "Flexible",     applicants: 5,  actions: ["Edit", "Duplicate", "Photo"] },
];

const JobCard = ({ job }) => (
  <div className="job-card">
    <div className="job-card-top">
      <div className="job-card-title-row">
        <div className="job-icon-wrap">{job.icon}</div>
        <div className="job-card-title">
          <strong>{job.title}</strong>
          <span>{job.type}</span>
        </div>
      </div>
      <span className={`status ${job.status}`}>
        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
      </span>
    </div>

    <div className="job-card-meta">
      <div className="meta-item"><i className="fas fa-map-marker-alt"></i> {job.location}</div>
      <div className="meta-item"><i className="fas fa-dollar-sign"></i> {job.wage}</div>
      <div className="meta-item"><i className="fas fa-calendar-plus"></i> {job.posted}</div>
      <div className="meta-item"><i className="fas fa-play-circle"></i> {job.startDate}</div>
    </div>

    <div className="job-card-divider"></div>

    <div className="job-card-footer">
      <div className="applicant-count">
        <div className="count-bubble">{job.applicants}</div> Applicants
      </div>
      <div className="jp-action-buttons">
        {job.actions.map((action, i) => (
          <button key={action} className={i === job.actions.length - 1 ? "btn-primary" : ""}>
            {action}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Jobposting = () => {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    employmentType: "Full-time",
    workersNeeded: 1,
    location: "",
    salary: "",
    experienceRequired: "",
    deadline: "",
    deadlineDay: "",
    deadlineMonth: "",
    deadlineYear: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deadline =
      formData.deadlineDay && formData.deadlineMonth && formData.deadlineYear
        ? `${formData.deadlineYear}-${formData.deadlineMonth}-${formData.deadlineDay}`
        : "";

    const payload = {
      title: formData.title,
      duration: formData.duration,
      employmentType: formData.employmentType,
      workersNeeded: formData.workersNeeded,
      location: formData.location,
      salary: formData.salary,
      experienceRequired: formData.experienceRequired,
      deadline,
      description: formData.description,
    };

    try {
      const loggedInUserId = localStorage.getItem("userId");
      console.log("USER ID:", loggedInUserId);

      const res = await axios.post(
        "http://localhost:5000/api/jobpost",
        payload,
        { withCredentials: true }
      );

      console.log("Saved to Database:", res.data);
      alert("Job Published Successfully");
    } catch (error) {
      console.log(error);
      alert("Error creating job");
    }
  };

  return (
    <>
      <Sidebar />

      {/* ✅ .jobposting-page wrapper — scopes ALL styles so they don't affect dashboard */}
      <div className="jobposting-page">

        {/* HEADER */}
        <div className="header-box">
          <div className="header-left">
            <h1>Job Provider Dashboard</h1>
            <p>Farm overview — Oakfield, Iowa</p>
          </div>
          <div className="header-right">
            <div className="badge-pill">
              <i className="fas fa-circle" style={{ fontSize: "8px" }}></i> 3 Active Listings
            </div>
            <button className="photo-btn">
              <i className="fas fa-camera"></i> Agri Photo +
            </button>
          </div>
        </div>

        {/* UPLOAD JOB CARD */}
        <div className="jp-card">
          <div className="jp-card-header">
            <div className="icon-wrap">🌾</div>
            <div className="jp-card-header-text">
              <h2>Upload New Job</h2>
              <p>Fill in the details to post a new agricultural position</p>
            </div>
          </div>

          <div className="jp-form">
            <div className="jp-row">
              <div className="jp-field">
                <label>Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Tractor Operator" />
              </div>
              <div className="jp-field">
                <label>Job Duration</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 months" />
              </div>
              <div className="jp-field">
                <label>Employment Type</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>
              <div className="jp-field">
                <label>Workers Needed</label>
                <input type="number" name="workersNeeded" value={formData.workersNeeded} onChange={handleChange} placeholder="Number of workers" min="1" />
              </div>
            </div>

            <div className="jp-row">
              <div className="jp-field">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
              </div>
              <div className="jp-field">
                <label>Salary Range</label>
                <input type="text" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $18–$24/hr" />
              </div>
              <div className="jp-field">
                <label>Experience Required</label>
                <input type="text" name="experienceRequired" value={formData.experienceRequired} onChange={handleChange} placeholder="e.g. 2+ years" />
              </div>
              <div className="jp-field">
                <label>Application Deadline</label>
                <div className="date-picker-row">
                  <select name="deadlineDay" value={formData.deadlineDay || ""} onChange={handleChange} className="date-select">
                    <option value="" disabled>DD</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d).padStart(2, "0")}>{String(d).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <span className="date-sep">/</span>
                  <select name="deadlineMonth" value={formData.deadlineMonth || ""} onChange={handleChange} className="date-select">
                    <option value="" disabled>MM</option>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                    ))}
                  </select>
                  <span className="date-sep">/</span>
                  <select name="deadlineYear" value={formData.deadlineYear || ""} onChange={handleChange} className="date-select year-select">
                    <option value="" disabled>YYYY</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="jp-field jp-full">
              <label>Short Description &amp; Skills Required</label>
              <textarea rows="4" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the role, responsibilities, and required skills..."></textarea>
            </div>
          </div>

          <div className="jp-buttons">
            <button className="jp-btn light"><i className="fas fa-camera"></i> Add Photo</button>
            <button className="jp-btn dark" onClick={(e) => handleSubmit(e)}>
              <i className="fas fa-plus-circle"></i> Publish Job
            </button>
          </div>
        </div>

        {/* JOB POSTINGS CARDS */}
        <div className="job-postings-section">
          <div className="job-postings-header">
            <h2 className="page-title">Your Job Postings</h2>
            <div className="job-stats">
              <div className="stat-item">👥 <strong>24 applicants</strong></div>
              <div className="stat-item">👁 <strong>168 views</strong></div>
              <div className="stat-item">📷 <strong>6 with photo</strong></div>
            </div>
          </div>

          <div className="job-cards-grid">
            {jobPostings.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default Jobposting;