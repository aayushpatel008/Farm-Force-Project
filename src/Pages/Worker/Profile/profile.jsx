import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar1 from "../Sidebar";
import "./profile.css";

function WorkerProfile() {

  // ── Core states for profile management ────────────────────────────
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading,       setLoading]       = useState(true);
  // ─────────────────────────────────────────────────────────────────

  const [isEditing,     setIsEditing]     = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);
  const [submitting,    setSubmitting]    = useState(false); // renamed to avoid clash with §2 `loading`

  // ── Fetch profile on mount with correct API response handling ──────
  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/myWorkercard", 
          { withCredentials: true });

        // API returns: { success: true, data: profile }
        // Check nested data.data for _id before accepting
        if (response.data?.data?._id) {
          setWorkerProfile(response.data.data);   // ✅ Set the nested profile object
        } else {
          // No valid profile data in response
          setWorkerProfile(null);
        }
      } catch (err) {
        // Error or 404 — no profile found
        console.error("Failed to fetch worker profile:", err);
        setWorkerProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerProfile();
  }, []);
  // ─────────────────────────────────────────────────────────────────

  // ── Static fallback defaults (used when no API data available) ───
  const DEFAULTS = {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1992-06-15",
    gender: "Male",
    nationality: "American",
    location: "Sacramento, CA",
    bio: "Experienced farm worker with 6+ years in harvesting, irrigation, and livestock management.",
    email: "john.doe@email.com",
    phone: "+1 (555) 234-5678",
    linkedIn: "",
    emergencyContact: "Jane Doe — +1 (555) 999-0000",
    jobTitle: "Farm Worker",
    jobDuration: "Full-time",
    employmentType: "Individual",
    numberOfWorkers: "1",
    salaryRange: "",
    experienceRequired: "6+ years",
    availableFrom: "",
    skills: ["Harvesting", "Irrigation", "Livestock Management"],
  };

  const [profileData,  setProfileData]  = useState(DEFAULTS);
  const [savedProfile, setSavedProfile] = useState(DEFAULTS);

  // ── NEW §7: Sync profile states when workerProfile is set ─────────
  //    Covers both initial fetch AND post-submit (§6)
  useEffect(() => {
    if (!workerProfile) return;

    const merged = {
      ...DEFAULTS,
      // §7 — direct backend field mapping
      firstName:          workerProfile.firstName          ?? DEFAULTS.firstName,
      lastName:           workerProfile.lastName           ?? DEFAULTS.lastName,
      dateOfBirth:        workerProfile.dateOfBirth        ?? DEFAULTS.dateOfBirth,
      gender:             workerProfile.gender             ?? DEFAULTS.gender,
      nationality:        workerProfile.nationality        ?? DEFAULTS.nationality,
      location:           workerProfile.location           ?? DEFAULTS.location,
      bio:                workerProfile.bio                ?? DEFAULTS.bio,
      email:              workerProfile.email              ?? DEFAULTS.email,
      phone:              workerProfile.phone              ?? DEFAULTS.phone,
      linkedIn:           workerProfile.linkedIn           ?? DEFAULTS.linkedIn,
      emergencyContact:   workerProfile.emergencyContact   ?? DEFAULTS.emergencyContact,
      jobTitle:           workerProfile.jobTitle           ?? DEFAULTS.jobTitle,
      jobDuration:        workerProfile.jobDuration        ?? DEFAULTS.jobDuration,
      employmentType:     workerProfile.employmentType     ?? DEFAULTS.employmentType,
      numberOfWorkers:    workerProfile.numberOfWorkers    ?? DEFAULTS.numberOfWorkers,
      salaryRange:        workerProfile.salaryRange        ?? DEFAULTS.salaryRange,
      experienceRequired: workerProfile.experienceRequired ?? DEFAULTS.experienceRequired,
      availableFrom:      workerProfile.availableFrom      ?? DEFAULTS.availableFrom,
      skills:
        Array.isArray(workerProfile.skills) && workerProfile.skills.length > 0
          ? workerProfile.skills
          : DEFAULTS.skills,
    };

    setProfileData(merged);
    setSavedProfile(merged);
  }, [workerProfile]);
  // ─────────────────────────────────────────────────────────────────

  // ── NEW CROSS-TAB SYNC: Reload on focus to sync login state ─────
  useEffect(() => {
    const handleFocus = () => {
      window.location.reload();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);
  // ─────────────────────────────────────────────────────────────────

  const [jobData, setJobData] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "Male",
    nationality: "", email: "", phone: "", emergencyContact: "",
    jobTitle: "", jobDuration: "Full-time", employmentType: "Individual",
    numberOfWorkers: "1", location: "", salaryRange: "",
    experienceRequired: "", availableFrom: "", description: "", skills: [],
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [profileSkill, setProfileSkill] = useState("");

  const employmentTypes = ["Individual", "Team", "Contractor"];
  const jobDurations    = ["Full-time", "Part-time", "Seasonal", "Temporary", "Project-based"];
  const genders         = ["Male", "Female"];

  // ── Profile handlers ──────────────────────────────────────────────
  const handleProfileChange = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = () => {
    setSavedProfile({ ...profileData, skills: [...profileData.skills] });
    setIsEditing(false);
    setProfileSkill("");
  };

  const handleCancelEdit = () => {
    setProfileData({ ...savedProfile, skills: [...savedProfile.skills] });
    setProfileSkill("");
    setIsEditing(false);
  };

  const handleAddProfileSkill = () => {
    const skill = profileSkill.trim();
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData({ ...profileData, skills: [...profileData.skills, skill] });
      setProfileSkill("");
    }
  };

  const handleRemoveProfileSkill = (skill) =>
    setProfileData({ ...profileData, skills: profileData.skills.filter((s) => s !== skill) });

  const handleProfileSkillKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddProfileSkill(); }
  };

  // ── Job form handlers ─────────────────────────────────────────────
  const handleJobChange = (e) =>
    setJobData({ ...jobData, [e.target.name]: e.target.value });

  const handleAddSkill = () => {
    const skill = currentSkill.trim();
    if (skill && !jobData.skills.includes(skill)) {
      setJobData({ ...jobData, skills: [...jobData.skills, skill] });
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skill) =>
    setJobData({ ...jobData, skills: jobData.skills.filter((s) => s !== skill) });

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }
  };

  // ── SUBMIT ────────────────────────────────────────────────────────
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        firstName: jobData.firstName, lastName: jobData.lastName,
        dateOfBirth: jobData.dateOfBirth, gender: jobData.gender,
        nationality: jobData.nationality, email: jobData.email,
        phone: jobData.phone, emergencyContact: jobData.emergencyContact,
        jobTitle: jobData.jobTitle, jobDuration: jobData.jobDuration,
        employmentType: jobData.employmentType, numberOfWorkers: jobData.numberOfWorkers,
        location: jobData.location, salaryRange: jobData.salaryRange,
        experienceRequired: jobData.experienceRequired, availableFrom: jobData.availableFrom,
        description: jobData.description, skills: jobData.skills,
      };

      const res = await axios.post(
        "http://localhost:5000/api/applicationpost",
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      toast.success("Job application posted successfully!");

      // Use response data if available, otherwise use payload
      const newApplication = res.data?.newapplication ?? res.data?.data ?? payload;

      setWorkerProfile(newApplication); // Updates workerProfile → hasProfile becomes true → UI switches to profile view

      // Reset upload form
      setJobData({
        firstName: "", lastName: "", dateOfBirth: "", gender: "Male",
        nationality: "", email: "", phone: "", emergencyContact: "",
        jobTitle: "", jobDuration: "Full-time", employmentType: "Individual",
        numberOfWorkers: "1", location: "", salaryRange: "",
        experienceRequired: "", availableFrom: "", description: "", skills: [],
      });

    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to post application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────
  const avatarSrc = workerProfile?.avatarUrl       ?? null;
  const yearsExp  = workerProfile?.yearsExperience ?? "6+";
  const jobsDone  = workerProfile?.jobsDone        ?? "10";
  const rating    = workerProfile?.rating          ?? "4.9★";

  const initials =
    `${profileData.firstName?.[0] ?? "J"}${profileData.lastName?.[0] ?? "D"}`.toUpperCase();

  // ── SINGLE SOURCE OF TRUTH: Derive hasProfile from workerProfile ──
  const hasProfile = !!workerProfile;

  // ── NEW §2: Loading gate — block render until fetch resolves ──────
  if (loading) {
    return (
      <div className="wp-container">
        <Sidebar1 />
        <div className="wp-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontFamily: "'DM Sans', sans-serif" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-container">
      <Sidebar1 />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="wp-main">

        {/* ── HERO CARD ── */}
        <div className="wp-hero-card">
          <div className="wp-hero-bg" />
          <div className="wp-hero-content">

            <div className="wp-avatar-wrap">
              <div
                className="wp-avatar"
                onClick={() => isEditing && avatarInputRef.current.click()}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="wp-avatar-img" />
                  : avatarSrc
                    ? <img src={avatarSrc} alt="avatar" className="wp-avatar-img" />
                    : <span className="wp-avatar-initials">{initials}</span>
                }
                {isEditing && (
                  <div className="wp-avatar-overlay">📷<br /><small>Change</small></div>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="wp-hidden-input"
              />
              <div className="wp-online-dot" />
            </div>

            <div className="wp-hero-info">
              <div className="wp-hero-name-row">
                <h1 className="wp-hero-name">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <span className="wp-verified-badge">✓ Verified</span>
              </div>
              <p className="wp-hero-role">🌾 Agricultural Worker</p>
              <p className="wp-hero-location">📍{profileData.location}</p>
              <p className="wp-hero-bio">{profileData.bio}</p>
            </div>

            <div className="wp-hero-stats">
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">{yearsExp}</span>
                <span className="wp-hero-stat-lbl">Years Exp.</span>
              </div>
              <div className="wp-hero-stat-divider" />
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">{jobsDone}</span>
                <span className="wp-hero-stat-lbl">Jobs Done</span>
              </div>
              <div className="wp-hero-stat-divider" />
              <div className="wp-hero-stat">
                <span className="wp-hero-stat-num">{rating}</span>
                <span className="wp-hero-stat-lbl">Rating</span>
              </div>
            </div>

          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* CONDITIONAL RENDERING: Profile OR Upload Form                 */}
        {/* Single source of truth: workerProfile                          */}
        {/* ────────────────────────────────────────────────────────────── */}

        {hasProfile ? (
          // ╔═══════════════════════════════════════════════════════════╗
          // ║ PROFILE VIEW — when workerProfile exists with valid data  ║
          // ╚═══════════════════════════════════════════════════════════╝
          <div className="wp-tab-content">

            <div className="wp-section-topbar">
              <h2 className="wp-section-heading">Personal Information</h2>
              {!isEditing ? (
                <button className="wp-edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
              ) : (
                <div className="wp-edit-actions">
                  <button className="wp-save-btn" onClick={handleSaveProfile}>💾 Save Changes</button>
                  <button className="wp-discard-btn" onClick={handleCancelEdit}>✕ Discard</button>
                </div>
              )}
            </div>

            <div className="wp-profile-grid">

              <div className="wp-card">
                <div className="wp-card-title">🪪 Personal Details</div>
                <div className="wp-field-grid">
                  <div className="wp-field">
                    <label>First Name</label>
                    {isEditing
                      ? <input className="wp-input" name="firstName" value={profileData.firstName} onChange={handleProfileChange} />
                      : <p className="wp-value">{profileData.firstName}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Last Name</label>
                    {isEditing
                      ? <input className="wp-input" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                      : <p className="wp-value">{profileData.lastName}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Date of Birth</label>
                    {isEditing
                      ? <input className="wp-input" type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} />
                      : <p className="wp-value">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : <span className="wp-empty">Not provided</span>}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Gender</label>
                    {isEditing
                      ? <select className="wp-input" name="gender" value={profileData.gender} onChange={handleProfileChange}>
                          {genders.map(g => <option key={g}>{g}</option>)}
                        </select>
                      : <p className="wp-value">{profileData.gender}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Nationality</label>
                    {isEditing
                      ? <input className="wp-input" name="nationality" value={profileData.nationality} onChange={handleProfileChange} />
                      : <p className="wp-value">{profileData.nationality}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Location</label>
                    {isEditing
                      ? <input className="wp-input" name="location" value={profileData.location} onChange={handleProfileChange} placeholder="City, State" />
                      : <p className="wp-value">📍 {profileData.location}</p>}
                  </div>
                </div>
              </div>

              <div className="wp-card">
                <div className="wp-card-title">📞 Contact Information</div>
                <div className="wp-field-grid">
                  <div className="wp-field wp-field-full">
                    <label>Email Address</label>
                    {isEditing
                      ? <input className="wp-input" type="email" name="email" value={profileData.email} onChange={handleProfileChange} />
                      : <p className="wp-value">✉️ {profileData.email}</p>}
                  </div>
                  <div className="wp-field wp-field-full">
                    <label>Phone Number</label>
                    {isEditing
                      ? <input className="wp-input" type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                      : <p className="wp-value">📱 {profileData.phone}</p>}
                  </div>
                  <div className="wp-field wp-field-full">
                    <label>Emergency Contact</label>
                    {isEditing
                      ? <input className="wp-input" name="emergencyContact" value={profileData.emergencyContact} onChange={handleProfileChange} placeholder="Name — Phone" />
                      : <p className="wp-value">🚨 {profileData.emergencyContact}</p>}
                  </div>
                </div>
              </div>

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">💼 Work Details</div>
                <div className="wp-field-grid">
                  <div className="wp-field wp-field-full">
                    <label>Job Title</label>
                    {isEditing
                      ? <input className="wp-input" type="text" name="jobTitle" value={profileData.jobTitle} onChange={handleProfileChange} placeholder="e.g., Farm Worker, Harvester" />
                      : <p className="wp-value">🧑‍🌾 {profileData.jobTitle || <span className="wp-empty">Not provided</span>}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Job Duration</label>
                    {isEditing
                      ? <select className="wp-input wp-select" name="jobDuration" value={profileData.jobDuration} onChange={handleProfileChange}>
                          {jobDurations.map(d => <option key={d}>{d}</option>)}
                        </select>
                      : <p className="wp-value">⏱️ {profileData.jobDuration}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Employment Type</label>
                    {isEditing
                      ? <select className="wp-input wp-select" name="employmentType" value={profileData.employmentType} onChange={handleProfileChange}>
                          {employmentTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                      : <p className="wp-value">👥 {profileData.employmentType}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Workers Available</label>
                    {isEditing
                      ? <input className="wp-input" type="number" min="1" max="100" name="numberOfWorkers" value={profileData.numberOfWorkers} onChange={handleProfileChange} />
                      : <p className="wp-value">🔢 {profileData.numberOfWorkers}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Expected Salary</label>
                    {isEditing
                      ? <div className="wp-salary-wrap">
                          <span className="wp-currency">₹</span>
                          <input className="wp-input wp-salary-input" type="text" name="salaryRange" value={profileData.salaryRange} onChange={handleProfileChange} placeholder="200-300 per day" />
                        </div>
                      : <p className="wp-value">💰 {profileData.salaryRange || <span className="wp-empty">Not provided</span>}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Years of Experience</label>
                    {isEditing
                      ? <input className="wp-input" type="text" name="experienceRequired" value={profileData.experienceRequired} onChange={handleProfileChange} placeholder="e.g., 2–3 years" />
                      : <p className="wp-value">📅 {profileData.experienceRequired || <span className="wp-empty">Not provided</span>}</p>}
                  </div>
                  <div className="wp-field">
                    <label>Available From</label>
                    {isEditing
                      ? <input className="wp-input" type="date" name="availableFrom" value={profileData.availableFrom} onChange={handleProfileChange} />
                      : <p className="wp-value">📆 {profileData.availableFrom ? new Date(profileData.availableFrom).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : <span className="wp-empty">Not provided</span>}</p>}
                  </div>
                  <div className="wp-field wp-field-full">
                    <label>Skills</label>
                    {isEditing
                      ? <div className="wp-skills-box">
                          <div className="wp-skills-tags">
                            {profileData.skills.length === 0
                              ? <span className="wp-skills-placeholder">Your skills will appear here…</span>
                              : profileData.skills.map((skill, i) => (
                                  <span key={i} className="wp-skill-tag">
                                    {skill}
                                    <button type="button" className="wp-skill-remove" onClick={() => handleRemoveProfileSkill(skill)}>×</button>
                                  </span>
                                ))
                            }
                          </div>
                          <div className="wp-skill-input-row">
                            <input className="wp-input wp-skill-input" type="text" value={profileSkill} onChange={(e) => setProfileSkill(e.target.value)} onKeyPress={handleProfileSkillKeyPress} placeholder="Type a skill and press Enter or click Add" />
                            <button type="button" className="wp-add-skill-btn" onClick={handleAddProfileSkill}>+ Add</button>
                          </div>
                          <small className="wp-hint">e.g. Harvesting, Irrigation, Tractor Operation, Pruning</small>
                        </div>
                      : <div className="wp-skills-tags wp-skills-tags--readonly">
                          {profileData.skills.length === 0
                            ? <span className="wp-empty">No skills added yet</span>
                            : profileData.skills.map((skill, i) => (
                                <span key={i} className="wp-skill-tag">{skill}</span>
                              ))
                          }
                        </div>
                    }
                  </div>
                </div>
              </div>

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📝 About Me</div>
                {isEditing
                  ? <textarea className="wp-input wp-textarea" name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} placeholder="Tell employers about yourself..." />
                  : <p className="wp-bio-text">{profileData.bio}</p>}
              </div>

              <div className="wp-card wp-card-full wp-completion-card">
                <div className="wp-card-title">🏆 Profile Completion</div>
                <div className="wp-completion-row">
                  <div className="wp-completion-bar-track">
                    <div className="wp-completion-bar-fill wp-completion-bar-fill--75" />
                  </div>
                  <span className="wp-completion-pct">75%</span>
                </div>
                <div className="wp-completion-items">
                  {[
                    { label: "Basic Info",      done: true },
                    { label: "Contact Details", done: true },
                    { label: "Profile Photo",   done: !!avatarPreview },
                    { label: "Certifications",  done: false },
                    { label: "Work History",    done: false },
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
        ) : (
          // ╔═══════════════════════════════════════════════════════════╗
          // ║ UPLOAD FORM — when workerProfile is null (new user)       ║
          // ╚═══════════════════════════════════════════════════════════╝
          <div className="wp-tab-content">

            <div className="wp-section-topbar">
              <h2 className="wp-section-heading">Upload Job Application</h2>
              <span className="wp-section-sub">Tell employers what work you're looking for</span>
            </div>

            <form onSubmit={handleJobSubmit} className="wp-upload-form">

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">🪪 Personal Details</div>
                <div className="wp-field-grid">
                  <div className="wp-field">
                    <label>First Name <span className="wp-req">*</span></label>
                    <input className="wp-input" type="text" name="firstName" value={jobData.firstName} onChange={handleJobChange} placeholder="e.g., John" required />
                  </div>
                  <div className="wp-field">
                    <label>Last Name <span className="wp-req">*</span></label>
                    <input className="wp-input" type="text" name="lastName" value={jobData.lastName} onChange={handleJobChange} placeholder="e.g., Doe" required />
                  </div>
                  <div className="wp-field">
                    <label>Date of Birth</label>
                    <input className="wp-input" type="date" name="dateOfBirth" value={jobData.dateOfBirth} onChange={handleJobChange} />
                  </div>
                  <div className="wp-field">
                    <label>Gender</label>
                    <select className="wp-input wp-select" name="gender" value={jobData.gender} onChange={handleJobChange}>
                      {genders.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="wp-field">
                    <label>Nationality</label>
                    <input className="wp-input" type="text" name="nationality" value={jobData.nationality} onChange={handleJobChange} placeholder="e.g., American" />
                  </div>
                </div>
              </div>

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📞 Contact Information</div>
                <div className="wp-field-grid">
                  <div className="wp-field wp-field-full">
                    <label>Email Address <span className="wp-req">*</span></label>
                    <input className="wp-input" type="email" name="email" value={jobData.email} onChange={handleJobChange} placeholder="john.doe@email.com" required />
                  </div>
                  <div className="wp-field wp-field-full">
                    <label>Phone Number <span className="wp-req">*</span></label>
                    <input className="wp-input" type="tel" name="phone" value={jobData.phone} onChange={handleJobChange} placeholder="+1 (555) 000-0000" required />
                  </div>
                  <div className="wp-field wp-field-full">
                    <label>Emergency Contact</label>
                    <input className="wp-input" type="text" name="emergencyContact" value={jobData.emergencyContact} onChange={handleJobChange} placeholder="Name — Phone" />
                  </div>
                </div>
              </div>

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">💼 Job Details</div>
                <div className="wp-field-grid">
                  <div className="wp-field wp-field-full">
                    <label>Job Title <span className="wp-req">*</span></label>
                    <input className="wp-input" type="text" name="jobTitle" value={jobData.jobTitle} onChange={handleJobChange} placeholder="e.g., Farm Worker, Harvester, Tractor Operator" required />
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
                  <div className="wp-field">
                    <label>Expected Salary</label>
                    <div className="wp-salary-wrap">
                      <span className="wp-currency">₹</span>
                      <input className="wp-input wp-salary-input" type="text" name="salaryRange" value={jobData.salaryRange} onChange={handleJobChange} placeholder="200-300 per day" />
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

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">🛠️ Your Skills <span className="wp-req">*</span></div>
                <div className="wp-skills-box">
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
                  <div className="wp-skill-input-row">
                    <input className="wp-input wp-skill-input" type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a skill and press Enter or click Add" />
                    <button type="button" className="wp-add-skill-btn" onClick={handleAddSkill}>+ Add</button>
                  </div>
                  <small className="wp-hint">e.g. Harvesting, Irrigation, Tractor Operation, Pruning</small>
                </div>
              </div>

              <div className="wp-card wp-card-full">
                <div className="wp-card-title">📄 Description <span className="wp-req">*</span></div>
                <textarea className="wp-input wp-textarea" name="description" value={jobData.description} onChange={handleJobChange} rows={5} required placeholder="Describe your experience, availability, and what kind of work you're looking for…" />
              </div>

              <div className="wp-form-actions">
                <button type="submit" className="wp-submit-btn" disabled={submitting}>
                  {submitting ? "Posting…" : "📤 Post Job Application"}
                </button>
                <button type="button" className="wp-cancel-btn">
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default WorkerProfile;