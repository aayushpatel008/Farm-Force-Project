import React, { useState, useRef } from "react";
import Sidebar1 from "../Sidebar";
import "./profile.css";

function WorkerProfile() {

  // ── Which tab is open: "profile" or "upload" ──
  const [activeTab, setActiveTab] = useState("profile");

  // ── Is the user currently editing their profile? ──
  const [isEditing, setIsEditing] = useState(false);

  // ── Avatar (profile photo) preview URL ──
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null); // points to the hidden file input

  // ── Worker's personal information ──
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1992-06-15",
    gender: "Male",
    nationality: "American",
    location: "Sacramento, CA",
    bio: "Experienced farm worker with 6+ years in harvesting, irrigation, and livestock management.",
    linkedIn: "",
    emergencyContact: "Jane Doe — +1 (555) 999-0000",
  });

  // ── savedProfile holds the last SAVED version (used for Cancel) ──
  const [savedProfile, setSavedProfile] = useState({ ...profileData });

  // ── Job application form data ──
  const [jobData, setJobData] = useState({
    jobTitle: "",
    jobDuration: "Full-time",
    employmentType: "Individual",
    numberOfWorkers: "1",
    location: "",
    salaryRange: "",
    experienceRequired: "",
    availableFrom: "",
    description: "",
    skills: [],
    photos: [],
  });

  // ── Skill being typed right now ──
  const [currentSkill, setCurrentSkill] = useState("");

  // ── Image preview URLs for uploaded photos ──
  const [previewImages, setPreviewImages] = useState([]);

  // Dropdown options
  const employmentTypes = ["Individual", "Team", "Contractor", "Freelance"];
  const jobDurations    = ["Full-time", "Part-time", "Seasonal", "Temporary", "Project-based"];
  const genders         = ["Male", "Female", "Non-binary", "Prefer not to say"];


  // ════════════════════════════════
  //  PROFILE HANDLERS
  // ════════════════════════════════

  // Update profileData when any input changes
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // When user picks a new avatar photo
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file)); // show preview
  };

  // Save: copy current edits into savedProfile, exit edit mode
  const handleSaveProfile = () => {
    setSavedProfile({ ...profileData });
    setIsEditing(false);
  };

  // Cancel: throw away edits, restore savedProfile, exit edit mode
  const handleCancelEdit = () => {
    setProfileData({ ...savedProfile });
    setIsEditing(false);
  };


  // ════════════════════════════════
  //  JOB UPLOAD HANDLERS
  // ════════════════════════════════

  // Update jobData when any field changes
  const handleJobChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  // Add skill tag (only if not empty and not already added)
  const handleAddSkill = () => {
    const skill = currentSkill.trim();
    if (skill && !jobData.skills.includes(skill)) {
      setJobData({ ...jobData, skills: [...jobData.skills, skill] });
      setCurrentSkill(""); // clear the input
    }
  };

  // Remove a skill tag by name
  const handleRemoveSkill = (skill) => {
    setJobData({ ...jobData, skills: jobData.skills.filter((s) => s !== skill) });
  };

  // Allow pressing Enter to add a skill
  const handleKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }
  };

  // When user uploads photos, create preview URLs
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages([...previewImages, ...previews]);
    setJobData({ ...jobData, photos: [...jobData.photos, ...files] });
  };

  // Remove a photo by its index
  const handleRemovePhoto = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setJobData({ ...jobData, photos: jobData.photos.filter((_, i) => i !== index) });
  };

  // Submit the job application form
  const handleJobSubmit = (e) => {
    e.preventDefault();
    alert("Job application posted successfully!");
  };

  // Avatar initials (e.g. "JD") shown when no photo is uploaded
  const initials = `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();


  // ════════════════════════════════
  //  RENDER
  // ════════════════════════════════
  return (
    <div className="wp-container">
      <Sidebar1 />

      <div className="wp-main">

        {/* ── HERO CARD: Always visible at the top ── */}
        <div className="wp-hero-card">
          <div className="wp-hero-bg" />

          <div className="wp-hero-content">

            {/* Avatar circle */}
            <div className="wp-avatar-wrap">
              <div
                className="wp-avatar"
                onClick={() => isEditing && avatarInputRef.current.click()}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="wp-avatar-img" />
                  : <span className="wp-avatar-initials">{initials}</span>
                }
                {isEditing && (
                  <div className="wp-avatar-overlay">📷<br /><small>Change</small></div>
                )}
              </div>
              {/* Hidden file input for avatar */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <div className="wp-online-dot" />
            </div>

            {/* Name, role, bio */}
            <div className="wp-hero-info">
              <div className="wp-hero-name-row">
                <h1 className="wp-hero-name">
                  {savedProfile.firstName} {savedProfile.lastName}
                </h1>
                <span className="wp-verified-badge">✓ Verified</span>
              </div>
              <p className="wp-hero-role">🌾 Agricultural Worker</p>
              <p className="wp-hero-location">📍 {savedProfile.location}</p>
              <p className="wp-hero-bio">{savedProfile.bio}</p>
            </div>

            {/* Quick stats */}
            <div className="wp-hero-stats">
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">6+</span>
                <span className="wp-hero-stat-lbl">Years Exp.</span>
              </div>
              <div className="wp-hero-stat-divider" />
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">10</span>
                <span className="wp-hero-stat-lbl">Jobs Done</span>
              </div>
              <div className="wp-hero-stat-divider" />
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">4.9★</span>
                <span className="wp-hero-stat-lbl">Rating</span>
              </div>
            </div>

          </div>
        </div>


        {/* ── TAB BUTTONS ── */}
        <div className="wp-tabs">
          <button
            className={`wp-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Profile
          </button>
          <button
            className={`wp-tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            📤 Upload Job Application
          </button>
        </div>


        {/* ════════════════════════════════
             TAB 1 — MY PROFILE
            ════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="wp-tab-content">

            {/* Top bar: heading + Edit/Save buttons */}
            <div className="wp-section-topbar">
              <h2 className="wp-section-heading">Personal Information</h2>

              {!isEditing ? (
                <button className="wp-edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="wp-edit-actions">
                  <button className="wp-save-btn" onClick={handleSaveProfile}>💾 Save Changes</button>
                  <button className="wp-discard-btn" onClick={handleCancelEdit}>✕ Discard</button>
                </div>
              )}
            </div>

            <div className="wp-profile-grid">

              {/* Card 1: Personal Details */}
              <div className="wp-card">
                <div className="wp-card-title">🪪 Personal Details</div>
                <div className="wp-field-grid">

                  <div className="wp-field">
                    <label>First Name</label>
                    {isEditing
                      ? <input className="wp-input" name="firstName" value={profileData.firstName} onChange={handleProfileChange} />
                      : <p className="wp-value">{savedProfile.firstName}</p>}
                  </div>

                  <div className="wp-field">
                    <label>Last Name</label>
                    {isEditing
                      ? <input className="wp-input" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                      : <p className="wp-value">{savedProfile.lastName}</p>}
                  </div>

                  <div className="wp-field">
                    <label>Date of Birth</label>
                    {isEditing
                      ? <input className="wp-input" type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} />
                      : <p className="wp-value">{new Date(savedProfile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>}
                  </div>

                  <div className="wp-field">
                    <label>Gender</label>
                    {isEditing
                      ? <select className="wp-input" name="gender" value={profileData.gender} onChange={handleProfileChange}>
                          {genders.map(g => <option key={g}>{g}</option>)}
                        </select>
                      : <p className="wp-value">{savedProfile.gender}</p>}
                  </div>

                  <div className="wp-field">
                    <label>Nationality</label>
                    {isEditing
                      ? <input className="wp-input" name="nationality" value={profileData.nationality} onChange={handleProfileChange} />
                      : <p className="wp-value">{savedProfile.nationality}</p>}
                  </div>

                  <div className="wp-field">
                    <label>Location</label>
                    {isEditing
                      ? <input className="wp-input" name="location" value={profileData.location} onChange={handleProfileChange} placeholder="City, State" />
                      : <p className="wp-value">📍 {savedProfile.location}</p>}
                  </div>

                </div>
              </div>

              {/* Card 2: Contact Information */}
              <div className="wp-card">
                <div className="wp-card-title">📞 Contact Information</div>
                <div className="wp-field-grid">

                  <div className="wp-field wp-field-full">
                    <label>Email Address</label>
                    {isEditing
                      ? <input className="wp-input" type="email" name="email" value={profileData.email} onChange={handleProfileChange} />
                      : <p className="wp-value">✉️ {savedProfile.email}</p>}
                  </div>

                  <div className="wp-field wp-field-full">
                    <label>Phone Number</label>
                    {isEditing
                      ? <input className="wp-input" type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                      : <p className="wp-value">📱 {savedProfile.phone}</p>}
                  </div>

                  <div className="wp-field wp-field-full">
                    <label>LinkedIn (optional)</label>
                    {isEditing
                      ? <input className="wp-input" name="linkedIn" value={profileData.linkedIn} onChange={handleProfileChange} placeholder="linkedin.com/in/yourname" />
                      : <p className="wp-value">{savedProfile.linkedIn || <span className="wp-empty">Not provided</span>}</p>}
                  </div>

                  <div className="wp-field wp-field-full">
                    <label>Emergency Contact</label>
                    {isEditing
                      ? <input className="wp-input" name="emergencyContact" value={profileData.emergencyContact} onChange={handleProfileChange} placeholder="Name — Phone" />
                      : <p className="wp-value">🚨 {savedProfile.emergencyContact}</p>}
                  </div>

                </div>
              </div>

              {/* Card 3: About Me */}
              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📝 About Me</div>
                {isEditing
                  ? <textarea className="wp-input wp-textarea" name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} placeholder="Tell employers about yourself..." />
                  : <p className="wp-bio-text">{savedProfile.bio}</p>}
              </div>

              {/* Card 4: Profile Completion Tracker */}
              <div className="wp-card wp-card-full wp-completion-card">
                <div className="wp-card-title">🏆 Profile Completion</div>

                {/* Progress bar */}
                <div className="wp-completion-row">
                  <div className="wp-completion-bar-track">
                    <div className="wp-completion-bar-fill" style={{ width: "75%" }} />
                  </div>
                  <span className="wp-completion-pct">75%</span>
                </div>

                {/* Checklist items */}
                <div className="wp-completion-items">
                  {[
                    { label: "Basic Info",       done: true },
                    { label: "Contact Details",  done: true },
                    { label: "Profile Photo",    done: !!avatarPreview },
                    { label: "Certifications",   done: false },
                    { label: "Work History",     done: false },
                  ].map((item) => (
                    <div key={item.label} className={`wp-comp-item ${item.done ? "done" : ""}`}>
                      <span className="wp-comp-icon">{item.done ? "✅" : "○"}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ════════════════════════════════
             TAB 2 — UPLOAD JOB APPLICATION
            ════════════════════════════════ */}
        {activeTab === "upload" && (
          <div className="wp-tab-content">

            <div className="wp-section-topbar">
              <h2 className="wp-section-heading">Upload Job Application</h2>
              <span className="wp-section-sub">Tell employers what work you're looking for</span>
            </div>

            <form onSubmit={handleJobSubmit} className="wp-upload-form">

              {/* ── Job Details Card ── */}
              <div className="wp-card wp-card-full">
                <div className="wp-card-title">💼 Job Details</div>
                <div className="wp-field-grid">

                  <div className="wp-field wp-field-full">
                    <label>Job Title <span className="wp-req">*</span></label>
                    <input
                      className="wp-input"
                      type="text"
                      name="jobTitle"
                      value={jobData.jobTitle}
                      onChange={handleJobChange}
                      placeholder="e.g., Farm Worker, Harvester, Tractor Operator"
                      required
                    />
                  </div>

                  <div className="wp-field">
                    <label>Job Duration</label>
                    <select className="wp-input wp-select" name="jobDuration" value={jobData.jobDuration} onChange={handleJobChange}>
                      {jobDurations.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="wp-field">
                    <label>Employment Type</label>
                    <select className="wp-input wp-select" name="employmentType" value={jobData.employmentType} onChange={handleJobChange}>
                      {employmentTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="wp-field">
                    <label>Workers Available</label>
                    <input className="wp-input" type="number" min="1" max="100" name="numberOfWorkers" value={jobData.numberOfWorkers} onChange={handleJobChange} />
                  </div>

                  <div className="wp-field">
                    <label>Preferred Location <span className="wp-req">*</span></label>
                    <input className="wp-input" type="text" name="location" value={jobData.location} onChange={handleJobChange} placeholder="City, State or Remote" required />
                  </div>

                  {/* Salary with $ prefix */}
                  <div className="wp-field">
                    <label>Expected Salary</label>
                    <div className="wp-salary-wrap">
                      <span className="wp-currency">$</span>
                      <input className="wp-input wp-salary-input" type="text" name="salaryRange" value={jobData.salaryRange} onChange={handleJobChange} placeholder="25–35 per hour" />
                    </div>
                  </div>

                  <div className="wp-field">
                    <label>Years of Experience</label>
                    <input className="wp-input" type="text" name="experienceRequired" value={jobData.experienceRequired} onChange={handleJobChange} placeholder="e.g., 2–3 years" />
                  </div>

                  <div className="wp-field">
                    <label>Available From</label>
                    <input className="wp-input" type="date" name="availableFrom" value={jobData.availableFrom} onChange={handleJobChange} />
                  </div>

                </div>
              </div>

              {/* ── Skills Card ── */}
              <div className="wp-card wp-card-full">
                <div className="wp-card-title">🛠️ Your Skills <span className="wp-req">*</span></div>
                <div className="wp-skills-box">

                  {/* Show added skill tags */}
                  <div className="wp-skills-tags">
                    {jobData.skills.length === 0
                      ? <span className="wp-skills-placeholder">Your skills will appear here…</span>
                      : jobData.skills.map((skill, i) => (
                          <span key={i} className="wp-skill-tag">
                            {skill}
                            <button type="button" className="wp-skill-remove" onClick={() => handleRemoveSkill(skill)}>×</button>
                          </span>
                        ))
                    }
                  </div>

                  {/* Input + Add button */}
                  <div className="wp-skill-input-row">
                    <input
                      className="wp-input wp-skill-input"
                      type="text"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a skill and press Enter or click Add"
                    />
                    <button type="button" className="wp-add-skill-btn" onClick={handleAddSkill}>+ Add</button>
                  </div>

                  <small className="wp-hint">e.g. Harvesting, Irrigation, Tractor Operation, Pruning</small>
                </div>
              </div>

              {/* ── Description Card ── */}
              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📄 Description <span className="wp-req">*</span></div>
                <textarea
                  className="wp-input wp-textarea"
                  name="description"
                  value={jobData.description}
                  onChange={handleJobChange}
                  rows={5}
                  required
                  placeholder="Describe your experience, availability, and what kind of work you're looking for…"
                />
              </div>

              {/* ── Photo Upload Card ── */}
              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📷 Add Photos <span className="wp-optional">(Optional)</span></div>

                {/* Hidden file input */}
                <input
                  type="file"
                  id="wpPhotoUpload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />

                {/* Clickable upload zone */}
                <label htmlFor="wpPhotoUpload" className="wp-upload-zone">
                  <span className="wp-upload-icon">🖼️</span>
                  <span className="wp-upload-text">Click to upload photos</span>
                  <small>JPG, PNG — multiple allowed</small>
                </label>

                {/* Photo previews */}
                {previewImages.length > 0 && (
                  <div className="wp-photo-grid">
                    {previewImages.map((img, i) => (
                      <div key={i} className="wp-photo-item">
                        <img src={img} alt={`preview-${i}`} />
                        <button type="button" className="wp-photo-remove" onClick={() => handleRemovePhoto(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Submit / Cancel ── */}
              <div className="wp-form-actions">
                <button type="submit" className="wp-submit-btn">📤 Post Job Application</button>
                <button type="button" className="wp-cancel-btn" onClick={() => setActiveTab("profile")}>Cancel</button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default WorkerProfile;