import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar1 from "./Sidebar";
import "./worker.css";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getAvatarColor = (str = "") => {
  const colors = ["green", "teal", "amber", "blue", "coral", "purple"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const getApplicantInitials = (firstName = "", lastName = "") =>
  ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "??";

const getTag = (category = "", title = "") => {
  const src = (category || title).toLowerCase();
  if (src.includes("harvest"))  return { label: "Harvesting",  color: "green"  };
  if (src.includes("plant"))    return { label: "Planting",    color: "teal"   };
  if (src.includes("irrigat"))  return { label: "Irrigation",  color: "orange" };
  if (src.includes("spray"))    return { label: "Spraying",    color: "blue"   };
  if (src.includes("weed"))     return { label: "Weeding",     color: "red"    };
  if (src.includes("sort"))     return { label: "Sorting",     color: "purple" };
  if (src.includes("tractor"))  return { label: "Machinery",   color: "orange" };
  if (src.includes("driver"))   return { label: "Transport",   color: "blue"   };
  return { label: category || "General", color: "green" };
};

const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills.split(",").map((s) => s.trim()).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────
// FALLBACK JOBS
// ─────────────────────────────────────────────────────────────

const fallbackJobs = [
  { _id:"fb1", title:"Harvesting – Wheat Field", farmName:"Green Valley Farms", city:"Nashik", state:"Maharashtra", experienceRequired:"No experience required", jobCategory:"Harvesting", salary:"₹500", payType:"Per Day", duration:"2 Days", employmentType:"Full-day", startDate:null, endDate:null, deadline:null, farmAddress:"Survey No. 45, Green Valley Road", workersNeeded:8, description:"Seasonal harvesting work on wheat fields. Tasks include manual cutting, bundling, and loading. Tools and gloves will be provided.", status:"open" },
  { _id:"fb2", title:"Planting – Paddy Field", farmName:"Sunrise Agro Farms", city:"Kolhapur", state:"Maharashtra", experienceRequired:"Beginner-friendly", jobCategory:"Planting", salary:"₹450", payType:"Per Day", duration:"3 Days", employmentType:"Part-time", startDate:null, endDate:null, deadline:null, farmAddress:"Plot 12, Sunrise Road, Hatkanangle", workersNeeded:12, description:"Help with rice seedling transplantation in flooded paddy fields. Training provided on-site.", status:"open" },
  { _id:"fb3", title:"Irrigation – Sugarcane", farmName:"Bhumi Farm Co.", city:"Solapur", state:"Maharashtra", experienceRequired:"1 yr preferred", jobCategory:"Irrigation", salary:"₹550", payType:"Per Day", duration:"1 Day", employmentType:"Full-day", startDate:null, endDate:null, deadline:null, farmAddress:"Village Borgaon, Tal. Barshi", workersNeeded:4, description:"Operate irrigation channels and pumps across sugarcane sections. Knowledge of drip irrigation is a plus.", status:"open" },
  { _id:"fb4", title:"Spraying – Cotton Farm", farmName:"AgroTech Fields", city:"Akola", state:"Maharashtra", experienceRequired:"Experience required", jobCategory:"Spraying", salary:"₹600", payType:"Per Day", duration:"2 Days", employmentType:"Part-time", startDate:null, endDate:null, deadline:null, farmAddress:"Field Block D, AgroTech Complex", workersNeeded:6, description:"Apply pesticides and fertilizers using backpack sprayers. Safety gear mandatory and provided.", status:"open" },
  { _id:"fb5", title:"Weeding – Vegetable Farm", farmName:"Fresh Root Farms", city:"Pune", state:"Maharashtra", experienceRequired:"No experience required", jobCategory:"Weeding", salary:"₹400", payType:"Per Day", duration:"4 Days", employmentType:"Full-day", startDate:null, endDate:null, deadline:null, farmAddress:"Gat No. 88, Urse Road, Maval", workersNeeded:10, description:"Manual weeding between vegetable rows. Light physical work, suitable for all ages.", status:"open" },
  { _id:"fb6", title:"Sorting – Fruit Orchard", farmName:"Golden Harvest Ltd", city:"Satara", state:"Maharashtra", experienceRequired:"Beginner-friendly", jobCategory:"Sorting", salary:"₹480", payType:"Per Day", duration:"2 Days", employmentType:"Part-time", startDate:null, endDate:null, deadline:null, farmAddress:"Orchard Zone B, Panchgani-Mahabaleshwar Road", workersNeeded:7, description:"Sort and grade freshly picked fruits by size, color, and quality. Clean indoor/shed environment.", status:"open" },
];

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────

const stats = [
  { title:"Active Job Applications", value:"5", sub:"↑ +2 applied today", color:"green", icon:<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { title:"Ongoing Work", value:"2", sub:"↑ +1 started today", color:"teal", icon:<svg viewBox="0 0 24 24"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg> },
  { title:"Total Earnings", value:"₹6,500", sub:"↑ +₹850 today", color:"gold", icon:<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
];

// ─────────────────────────────────────────────────────────────
// JOB CARD  — styled to match wra-card (Recent Applicants)
// ─────────────────────────────────────────────────────────────

function JobCard({ job, onClick }) {
  const tag          = getTag(job.jobCategory, job.title);
  const initials     = getInitials(job.farmName);
  const avatarColor  = getAvatarColor(job.farmName);
  const locationText = [job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "Location N/A";

  // build a "skills-like" chip list from tag + employmentType
  const chips = [tag.label, job.employmentType, job.payType].filter(Boolean);

  return (
    <div className="wja-card" onClick={() => onClick(job)}>
      {/* accent bar via ::before in CSS */}

      {/* Top: avatar + name */}
      <div className="wja-card__top">
        <div className={`wja-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="wja-card__identity">
          <h4 className="wja-card__name">{job.title}</h4>
          <p className="wja-card__role">{job.farmName}</p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="wja-card__details">
        <div className="wja-card__detail-row">
          <span className="wja-card__detail-item">
            <span className="wja-card__detail-icon">📍</span>
            {locationText}
          </span>
          <span className="wja-card__detail-item">
            <span className="wja-card__detail-icon">🧑‍🌾</span>
            {job.experienceRequired || "Open to all"}
          </span>
        </div>
        {job.salary && (
          <div className="wja-card__detail-row">
            <span className="wja-card__detail-item">
              <span className="wja-card__detail-icon">💰</span>
              {job.salary}{job.payType ? ` / ${job.payType}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="wja-card__divider" />

      {/* Chips (mirror skill tags) */}
      <div className="wja-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="wja-card__chip-tag">{chip}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// JOB DETAIL MODAL — styled to match wra-modal (Applicant Modal)
// ─────────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }) {
  if (!job) return null;
  const tag         = getTag(job.jobCategory, job.title);
  const initials    = getInitials(job.farmName);
  const avatarColor = getAvatarColor(job.farmName);
  const locationText = [job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "—";

  return (
    <div className="wja-modal-overlay" onClick={(e) => e.target.classList.contains("wja-modal-overlay") && onClose()}>
      <div className="wja-modal">

        {/* Banner — mirrors wra-modal__banner */}
        <div className="wja-modal__banner">
          <div className="wja-modal__banner-left">
            <div className={`wja-modal__avatar avatar--${avatarColor}`}>{initials}</div>
            <div>
              <h2 className="wja-modal__name">{job.title}</h2>
              <span className="wja-modal__role-label">{job.farmName}</span>
              <div className="wja-modal__banner-meta">
                {locationText && locationText !== "—" && <span>📍 {locationText}</span>}
                {job.jobCategory && <span>🌾 {job.jobCategory}</span>}
                {job.status && <span>✅ {job.status}</span>}
              </div>
            </div>
          </div>
          <button className="wja-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable body */}
        <div className="wja-modal__scroll">

          {/* Row 1: Role Overview + Pay side by side */}
          <div className="wja-modal__row">

            {/* Role Overview */}
            <div className="wja-modal__section">
              <div className="wja-modal__section-heading"><span>💼</span> Role Overview</div>
              <div className="wja-modal__section-divider" />
              <div className="wja-modal__fields-grid">
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">CATEGORY</span>
                  <span className="wja-modal__field-val">{job.jobCategory || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">EMPLOYMENT TYPE</span>
                  <span className="wja-modal__field-val">{job.employmentType || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">WORKERS NEEDED</span>
                  <span className="wja-modal__field-val">{job.workersNeeded ?? "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">EXPERIENCE</span>
                  <span className="wja-modal__field-val">{job.experienceRequired || "Open to all"}</span>
                  <div className="wja-modal__field-line" />
                </div>
              </div>
            </div>

            {/* Pay & Schedule */}
            <div className="wja-modal__section">
              <div className="wja-modal__section-heading"><span>💰</span> Pay &amp; Schedule</div>
              <div className="wja-modal__section-divider" />
              <div className="wja-modal__fields-single">
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">SALARY</span>
                  <span className="wja-modal__field-val"><span className="wja-modal__field-icon">💰</span>{job.salary || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">PAY TYPE</span>
                  <span className="wja-modal__field-val">{job.payType || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">DURATION</span>
                  <span className="wja-modal__field-val"><span className="wja-modal__field-icon">⏱️</span>{job.duration || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Dates — full width */}
          <div className="wja-modal__section wja-modal__section--full">
            <div className="wja-modal__section-heading"><span>📍</span> Location &amp; Dates</div>
            <div className="wja-modal__section-divider" />

            <div className="wja-modal__fields-grid">
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">CITY / VILLAGE</span>
                <span className="wja-modal__field-val"><span className="wja-modal__field-icon">📍</span>{job.city || "—"}</span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">STATE</span>
                <span className="wja-modal__field-val">{job.state || "—"}</span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">START DATE</span>
                <span className="wja-modal__field-val"><span className="wja-modal__field-icon">📅</span>{formatDate(job.startDate)}</span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">END DATE</span>
                <span className="wja-modal__field-val"><span className="wja-modal__field-icon">📅</span>{formatDate(job.endDate)}</span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">APPLICATION DEADLINE</span>
                <span className="wja-modal__field-val">
                  <span className="wja-modal__field-icon">⏰</span>
                  {job.deadline ? formatDate(job.deadline) : <em className="wja-modal__not-provided">Not specified</em>}
                </span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">STATUS</span>
                <span className="wja-modal__field-val">{job.status || "—"}</span>
                <div className="wja-modal__field-line" />
              </div>
            </div>

            <div className="wja-modal__field wja-modal__field--fullw" style={{ marginTop: 4 }}>
              <span className="wja-modal__field-label">FARM ADDRESS</span>
              <span className="wja-modal__field-val">{job.farmAddress || "—"}</span>
              <div className="wja-modal__field-line" />
            </div>

            {/* Tag chips — mirrors skill pills */}
            <div className="wja-modal__field wja-modal__field--fullw" style={{ marginTop: 8 }}>
              <span className="wja-modal__field-label">JOB TYPE</span>
              <div className="wja-modal__chips-row">
                {[getTag(job.jobCategory, job.title).label, job.employmentType, job.payType]
                  .filter(Boolean)
                  .map((chip, i) => (
                    <span key={i} className="wja-modal__chip-pill">{chip}</span>
                  ))}
              </div>
              <div className="wja-modal__field-line" />
            </div>
          </div>

          {/* About the Role */}
          {job.description && (
            <div className="wja-modal__section wja-modal__section--full">
              <div className="wja-modal__section-heading"><span>📝</span> About the Role</div>
              <div className="wja-modal__section-divider" />
              <p className="wja-modal__bio">{job.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wja-modal__footer">
          <button className="wja-modal__btn-light" onClick={onClose}>Close</button>
          <button className="wja-modal__btn-primary">Apply Now</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APPLICANT CARD (unchanged)
// ─────────────────────────────────────────────────────────────

function ApplicantCard({ applicant, onView, openDotMenu, setOpenDotMenu, dotMenuRef }) {
  const { firstName, lastName, jobTitle, location, experienceRequired, createdAt, skills, email } = applicant;
  const fullName    = `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";
  const initials    = getApplicantInitials(firstName, lastName);
  const avatarColor = getAvatarColor(firstName + lastName);
  const parsedSkills = parseSkills(skills);
  const isOpen = openDotMenu === applicant._id;

  return (
    <div className="wra-card" onClick={() => onView(applicant)}>

      {/* 3-dot menu */}
      <div
        className="wra-card__dot-wrap"
        ref={isOpen ? dotMenuRef : null}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="wra-card__dot-btn"
          title="More options"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDotMenu((prev) => (prev === applicant._id ? null : applicant._id));
          }}
        >
          ⋮
        </button>
        {isOpen && (
          <div className="wra-card__dot-menu">
            <button onClick={() => { onView(applicant); setOpenDotMenu(null); }}>👁 View Profile</button>
            <button onClick={() => setOpenDotMenu(null)}>💬 Message</button>
            <button onClick={() => setOpenDotMenu(null)}>📅 Schedule</button>
            <button className="wra-card__dot-menu--danger" onClick={() => setOpenDotMenu(null)}>✕ Remove</button>
          </div>
        )}
      </div>

      {/* Top: avatar + name */}
      <div className="wra-card__top">
        <div className={`wra-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="wra-card__identity">
          <h4 className="wra-card__name">{fullName}</h4>
          <p className="wra-card__role">{jobTitle || "—"}</p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="wra-card__details">
        <div className="wra-card__detail-row">
          <span className="wra-card__detail-item">
            <span className="wra-card__detail-icon">📍</span>
            {location || "—"}
          </span>
          <span className="wra-card__detail-item">
            <span className="wra-card__detail-icon">🧑‍🌾</span>
            {experienceRequired || "—"}
          </span>
        </div>
        {email && email !== "—" && (
          <div className="wra-card__detail-row">
            <span className="wra-card__detail-item">
              <span className="wra-card__detail-icon">📧</span>
              {email}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="wra-card__divider" />

      {/* Skills */}
      <div className="wra-card__skills">
        {parsedSkills.slice(0, 3).map((skill, i) => (
          <span key={i} className="wra-card__skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APPLICANT MODAL (unchanged)
// ─────────────────────────────────────────────────────────────

function ApplicantModal({ applicant, onClose }) {
  if (!applicant) return null;

  const {
    firstName, lastName, jobTitle, location, experienceRequired, createdAt,
    jobDuration, employmentType, numberOfWorkers, salaryRange, availableFrom, skills,
    dateOfBirth, gender, nationality,
    email, phone, emergencyContact,
    description,
  } = applicant;

  const fullName     = `${firstName || ""} ${lastName || ""}`.trim() || "Unknown";
  const initials     = getApplicantInitials(firstName, lastName);
  const avatarColor  = getAvatarColor(firstName + lastName);
  const parsedSkills = parseSkills(skills);

  return (
    <div className="wra-modal-overlay" onClick={(e) => e.target.classList.contains("wra-modal-overlay") && onClose()}>
      <div className="wra-modal">
        {/* Banner */}
        <div className="wra-modal__banner">
          <div className="wra-modal__banner-left">
            <div className={`wra-modal__avatar avatar--${avatarColor}`}>{initials}</div>
            <div>
              <h2 className="wra-modal__name">{fullName}</h2>
              <span className="wra-modal__role-label">{jobTitle || "Applicant"}</span>
              <div className="wra-modal__banner-meta">
                {location && location !== "—" && <span>📍 {location}</span>}
                {experienceRequired && experienceRequired !== "—" && <span>🧑‍🌾 {experienceRequired} exp</span>}
                {createdAt && <span>📅 Applied {formatDate(createdAt)}</span>}
              </div>
            </div>
          </div>
          <button className="wra-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable body */}
        <div className="wra-modal__scroll">

          {/* Row 1: Personal + Contact side by side */}
          <div className="wra-modal__row">

            {/* Personal Details */}
            <div className="wra-modal__section">
              <div className="wra-modal__section-heading"><span>🪪</span> Personal Details</div>
              <div className="wra-modal__section-divider" />
              <div className="wra-modal__fields-grid">
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">FIRST NAME</span>
                  <span className="wra-modal__field-val">{firstName || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">LAST NAME</span>
                  <span className="wra-modal__field-val">{lastName || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">DATE OF BIRTH</span>
                  <span className="wra-modal__field-val">{dateOfBirth ? formatDate(dateOfBirth) : "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">GENDER</span>
                  <span className="wra-modal__field-val">{gender || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">NATIONALITY</span>
                  <span className="wra-modal__field-val">{nationality || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">LOCATION</span>
                  <span className="wra-modal__field-val"><span className="wra-modal__field-icon">📍</span>{location || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="wra-modal__section">
              <div className="wra-modal__section-heading"><span>📞</span> Contact Information</div>
              <div className="wra-modal__section-divider" />
              <div className="wra-modal__fields-single">
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">EMAIL ADDRESS</span>
                  <span className="wra-modal__field-val"><span className="wra-modal__field-icon">📧</span>{email || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">PHONE NUMBER</span>
                  <span className="wra-modal__field-val"><span className="wra-modal__field-icon">📱</span>{phone || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
                <div className="wra-modal__field">
                  <span className="wra-modal__field-label">EMERGENCY CONTACT</span>
                  <span className="wra-modal__field-val"><span className="wra-modal__field-icon">🚨</span>{emergencyContact || "—"}</span>
                  <div className="wra-modal__field-line" />
                </div>
              </div>
            </div>
          </div>

          {/* Work Details — full width */}
          <div className="wra-modal__section wra-modal__section--full">
            <div className="wra-modal__section-heading"><span>💼</span> Work Details</div>
            <div className="wra-modal__section-divider" />

            <div className="wra-modal__field wra-modal__field--fullw">
              <span className="wra-modal__field-label">JOB TITLE</span>
              <span className="wra-modal__field-val"><span className="wra-modal__field-icon">🧑‍🌾</span>{jobTitle || "—"}</span>
              <div className="wra-modal__field-line" />
            </div>

            <div className="wra-modal__fields-grid">
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">JOB DURATION</span>
                <span className="wra-modal__field-val"><span className="wra-modal__field-icon">⏱️</span>{jobDuration || "—"}</span>
                <div className="wra-modal__field-line" />
              </div>
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">EMPLOYMENT TYPE</span>
                <span className="wra-modal__field-val"><span className="wra-modal__field-icon">👥</span>{employmentType || "—"}</span>
                <div className="wra-modal__field-line" />
              </div>
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">WORKERS AVAILABLE</span>
                <span className="wra-modal__field-val"><span className="wra-modal__field-icon">🔢</span>{numberOfWorkers ?? "—"}</span>
                <div className="wra-modal__field-line" />
              </div>
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">EXPECTED SALARY</span>
                <span className="wra-modal__field-val">
                  <span className="wra-modal__field-icon">💰</span>
                  {salaryRange || <em className="wra-modal__not-provided">Not provided</em>}
                </span>
                <div className="wra-modal__field-line" />
              </div>
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">YEARS OF EXPERIENCE</span>
                <span className="wra-modal__field-val"><span className="wra-modal__field-icon">📅</span>{experienceRequired || "—"}</span>
                <div className="wra-modal__field-line" />
              </div>
              <div className="wra-modal__field">
                <span className="wra-modal__field-label">AVAILABLE FROM</span>
                <span className="wra-modal__field-val">
                  <span className="wra-modal__field-icon">📅</span>
                  {availableFrom ? formatDate(availableFrom) : <em className="wra-modal__not-provided">Not provided</em>}
                </span>
                <div className="wra-modal__field-line" />
              </div>
            </div>

            {parsedSkills.length > 0 && (
              <div className="wra-modal__field wra-modal__field--fullw" style={{ marginTop: 8 }}>
                <span className="wra-modal__field-label">SKILLS</span>
                <div className="wra-modal__skills-row">
                  {parsedSkills.map((skill, i) => (
                    <span key={i} className="wra-modal__skill-pill">{skill}</span>
                  ))}
                </div>
                <div className="wra-modal__field-line" />
              </div>
            )}
          </div>

          {/* About Me */}
          {description && (
            <div className="wra-modal__section wra-modal__section--full">
              <div className="wra-modal__section-heading"><span>📝</span> About Me</div>
              <div className="wra-modal__section-divider" />
              <p className="wra-modal__bio">{description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wra-modal__footer">
          <button className="wra-modal__btn-light" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────

function JobSkeleton() {
  return (
    <div className="wja-card wja-card--skeleton">
      <div className="wja-card__top">
        <div className="skel skel--avatar" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skel skel--line skel--lg" />
          <div className="skel skel--line skel--md" />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        <div className="skel skel--line skel--sm" />
        <div className="skel skel--line skel--sm" />
      </div>
      <div className="wja-card__divider" />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skel skel--pill" />
        <div className="skel skel--pill" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function WorkerHome() {
  // Jobs state
  const [jobPostings, setJobPostings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // Applicants state
  const [applicants,        setApplicants]        = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // 3-dot menu state
  const [openDotMenu, setOpenDotMenu] = useState(null);
  const dotMenuRef = useRef(null);

  // Close dot menu on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target)) {
        setOpenDotMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Fetch jobs
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/active/ActiveJobPosting", { withCredentials: true })
      .then((res) => setJobPostings(res.data))
      .catch((err) => console.error("Failed to load jobs:", err))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Fetch applicants
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/Workercard", { withCredentials: true })
      .then((res) => {
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setApplicants(sorted);
      })
      .catch((err) => console.error("Failed to load applicants:", err))
      .finally(() => setLoadingApplicants(false));
  }, []);

  const displayJobs = jobPostings.length > 0 ? jobPostings.slice(0, 6) : [];
  const useFallback = !loadingJobs && jobPostings.length === 0;

  return (
    <div className="worker-layout">

      <Sidebar1 />

      <div className="wk-page">

        {/* ── HERO ── */}
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
              <p className="hero__greeting">Welcome back, Aayush🌾</p>
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

        {/* ── STATS ── */}
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

        {/* ── JOBS NEAR YOU ── */}
        <section className="section">
          <div className="wra-header">
            <div className="wra-header__left">
              <span className="wra-header__icon">🌾</span>
              <span className="wra-header__title">
                Jobs Available Near You
                {useFallback && <span className="wjd-fallback-badge">Sample listings</span>}
              </span>
            </div>
            <div className="wra-header__right">
              <span>View All</span>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,8 12,8 9,5"/><polyline points="9,11 12,8"/></svg>
            </div>
          </div>

          {/* Loading */}
          {loadingJobs && (
            <div className="wra-cards">
              <JobSkeleton /><JobSkeleton /><JobSkeleton />
            </div>
          )}

          {/* Cards grid — same grid class as applicants */}
          {!loadingJobs && (displayJobs.length > 0 || useFallback) && (
            <div className="wra-cards">
              {displayJobs.map((job) => (
                <JobCard key={job._id} job={job} onClick={setSelectedJob} />
              ))}
              {useFallback && fallbackJobs.map((job) => (
                <JobCard key={job._id} job={job} onClick={setSelectedJob} />
              ))}
            </div>
          )}
        </section>

        {/* ── RECENT APPLICANTS ── */}
        <section className="section">
          <div className="wra-header">
            <div className="wra-header__left">
              <span className="wra-header__icon">👥</span>
              <span className="wra-header__title">Recent Applicants</span>
            </div>
            <div className="wra-header__right">
              <span>View All</span>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,8 12,8 9,5"/><polyline points="9,11 12,8"/></svg>
            </div>
          </div>

          {loadingApplicants && (
            <div className="wra-loading">
              <div className="wra-spinner" />
              <p className="wra-loading__text">Loading applicants…</p>
            </div>
          )}

          {!loadingApplicants && applicants.length === 0 && (
            <div className="wra-empty">
              <div className="wra-empty__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="wra-empty__title">No applicants yet</p>
              <p className="wra-empty__sub">Applicants will appear here once they register.</p>
            </div>
          )}

          {!loadingApplicants && applicants.length > 0 && (
            <div className="wra-cards">
              {applicants.slice(0, 4).map((applicant, i) => (
                <ApplicantCard
                  key={applicant._id || i}
                  applicant={applicant}
                  onView={setSelectedApplicant}
                  openDotMenu={openDotMenu}
                  setOpenDotMenu={setOpenDotMenu}
                  dotMenuRef={dotMenuRef}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── JOB DETAIL MODAL ── */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* ── APPLICANT DETAIL MODAL ── */}
      {selectedApplicant && (
        <ApplicantModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
      )}
    </div>
  );
}