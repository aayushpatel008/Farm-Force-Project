import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import "./jobpDashboard.css";
import Sidebar from './sidebar';
import { FiBell } from "react-icons/fi";
import { FaBriefcase, FaUsers, FaHardHat, FaLeaf, FaArrowRight } from "react-icons/fa";
import { FaEdit, FaPause, FaEye } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";

// ── Static fallback data ──────────────────────────────────────────────────────
const STATIC_JOBS = [
  { _id: "s1", title: "Fruit Pickers [10]", postedDate: "2024-10-01", workersNeeded: 12, status: "Active" },
  { _id: "s2", title: "Tractor Operator",   postedDate: "2024-10-03", workersNeeded: 5,  status: "Active" },
  { _id: "s3", title: "Livestock Handler",  postedDate: "2024-10-05", workersNeeded: 3,  status: "Active" },
  { _id: "s4", title: "Irrigation Specialist", postedDate: "2024-09-28", workersNeeded: 8, status: "Filled" },
];

const STATIC_STATS = {
  activeJobs:      8,
  totalApplicants: 28,
  hiredWorkers:    6,
};

const STATIC_APPLICANTS = [
  {
    _id: "a1",
    // personal
    firstName: "Juan", lastName: "Martinez",
    dateOfBirth: "March 10, 1992", gender: "Male", nationality: "American",
    // contact
    email: "juan.martinez@email.com", phone: "+1 234 567 8901", emergencyContact: "Maria Martinez — +1 234 000 0001",
    // job
    jobTitle: "Fruit Picker", jobDuration: "3 Months", employmentType: "Full-time",
    numberOfWorkers: 1, location: "California, USA", salaryRange: "$18/hr",
    experienceRequired: "5+ years", availableFrom: null,
    // description & skills
    description: "Experienced agricultural worker with a focus on fruit harvesting and crop management.",
    skills: ["Harvesting", "Pruning", "5+ years exp"],
    // helpers
    role: "Fruit Picker", appliedDate: "Oct 5, 2024",
  },
  {
    _id: "a2",
    firstName: "Sarah", lastName: "Chen",
    dateOfBirth: "July 22, 1996", gender: "Female", nationality: "American",
    email: "sarah.chen@email.com", phone: "+1 234 567 8902", emergencyContact: "Tom Chen — +1 234 000 0002",
    jobTitle: "Tractor Operator", jobDuration: "6 Months", employmentType: "Full-time",
    numberOfWorkers: 1, location: "Texas, USA", salaryRange: "$22/hr",
    experienceRequired: "3 years", availableFrom: "Nov 1, 2024",
    description: "Certified tractor operator with CDL license and strong equipment maintenance background.",
    skills: ["Tractor License", "Maintenance", "CDL"],
    role: "Tractor Operator", appliedDate: "Oct 7, 2024",
  },
  {
    _id: "a3",
    firstName: "Michael", lastName: "Okafor",
    dateOfBirth: "January 5, 1989", gender: "Male", nationality: "American",
    email: "michael.okafor@email.com", phone: "+1 234 567 8903", emergencyContact: "—",
    jobTitle: "Livestock Handler", jobDuration: "Seasonal", employmentType: "Seasonal",
    numberOfWorkers: 1, location: "Iowa, USA", salaryRange: null,
    experienceRequired: "3+ years", availableFrom: null,
    description: "Dedicated livestock handler skilled in daily feeding routines and animal health monitoring.",
    skills: ["Animal Care", "Feeding", "3+ years exp"],
    role: "Livestock Handler", appliedDate: "Oct 9, 2024",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const jobpDashboard = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const navigate = useNavigate();

  const name      = localStorage.getItem("name") || "";
  const Firstname = name?.split(" ")[0];
  const initials  = name.split(" ").filter(Boolean).map(word => word[0]).join("");

  // ── Job postings ────────────────────────────────────────────────────────────
  const [jobPostings,  setJobPostings]  = useState([]);
  const [loadingJobs,  setLoadingJobs]  = useState(true);
  const [jobsIsStatic, setJobsIsStatic] = useState(false);

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  const [stats,         setStats]         = useState(null);
  const [statsIsStatic, setStatsIsStatic] = useState(false);

  // ── Recent applicants ───────────────────────────────────────────────────────
  const [applicants,         setApplicants]         = useState([]);
  const [applicantsIsStatic, setApplicantsIsStatic] = useState(false);

  // ── Modal / action state ────────────────────────────────────────────────────
  const [viewJob,       setViewJob]       = useState(null);
  const [editJob,       setEditJob]       = useState(null);
  const [editForm,      setEditForm]      = useState(null);
  const [pausingId,     setPausingId]     = useState(null);

  // ── Applicant detail modal ──────────────────────────────────────────────────
  const [viewApplicant, setViewApplicant] = useState(null);
  const [applicantTab,  setApplicantTab]  = useState("personal"); // "personal" | "work"

  // ── 3-dot dropdown ─────────────────────────────────────────────────────────
  const [openDotMenu,   setOpenDotMenu]   = useState(null); // stores applicant _id
  const dotMenuRef                        = useRef(null);

  // close dot menu when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target)) {
        setOpenDotMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Fetch: job postings ─────────────────────────────────────────────────────
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/Active/ActiveJobPosting",
        { withCredentials: true }
      );
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) throw new Error("empty");
      setJobPostings(data);
      setJobsIsStatic(false);
    } catch {
      setJobPostings(STATIC_JOBS);
      setJobsIsStatic(true);
    } finally {
      setLoadingJobs(false);
    }
  };

  // ── Fetch: dashboard stats ──────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/stats",
        { withCredentials: true }
      );
      setStats(res.data);
      setStatsIsStatic(false);
    } catch {
      setStats(STATIC_STATS);
      setStatsIsStatic(true);
    }
  };

  // ── Fetch: recent applicants ────────────────────────────────────────────────
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/Workercard",
        { withCredentials: true }
      );
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) throw new Error("empty");

      const normalised = data.map((a) => {
        const fullName = a.name || a.fullName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "Unknown";
        const parts    = fullName.split(" ").filter(Boolean);
        const inits    = parts.map(p => p[0].toUpperCase()).join("").slice(0, 2);
        return {
          _id:              a._id,
          initials:         inits,
          // ── Personal Details ──
          firstName:        a.firstName  || parts[0] || "—",
          lastName:         a.lastName   || parts.slice(1).join(" ") || "—",
          name:             fullName,
          dateOfBirth:      a.dateOfBirth
                              ? new Date(a.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                              : "—",
          gender:           a.gender       || "—",
          nationality:      a.nationality  || "—",
          // ── Contact Information ──
          email:            a.email            || "—",
          phone:            a.phone            || "—",
          emergencyContact: a.emergencyContact || "—",
          // ── Job Details ──
          jobTitle:         a.jobTitle         || "—",
          jobDuration:      a.jobDuration      || "—",
          employmentType:   a.employmentType   || "—",
          numberOfWorkers:  a.numberOfWorkers  ?? 1,
          location:         a.location         || "—",
          salaryRange:      a.salaryRange      || null,
          experienceRequired: a.experienceRequired || "—",
          availableFrom:    a.availableFrom
                              ? new Date(a.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : null,
          // ── Description & Skills ──
          description:      a.description  || "",
          skills:           Array.isArray(a.skills) ? a.skills : [],
          // ── Card display helpers ──
          role:             a.jobTitle     || "Applicant",
          appliedDate:      a.createdAt
                              ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "—",
        };
      });

      setApplicants(normalised);
      setApplicantsIsStatic(false);
    } catch {
      setApplicants(STATIC_APPLICANTS);
      setApplicantsIsStatic(true);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
    fetchApplicants();
  }, []);

  // ── Profile popup — shows once per session ──────────────────────────────────
  useEffect(() => {
    const hasShown = sessionStorage.getItem("profilePopupShown");
    if (!hasShown) {
      setShowProfilePopup(true);
      sessionStorage.setItem("profilePopupShown", "true");
    }
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return iso; }
  };

  const statusClass = (status = "") =>
    ({ Active: "active", Filled: "filled", Paused: "paused", Closed: "closed" }[status] || "active");

  // ── Edit handlers ───────────────────────────────────────────────────────────
  const handleEdit = (job) => {
    setEditJob(job);
    setEditForm({
      title:               job.title               || "",
      duration:            job.duration            || "",
      employmentType:      job.employmentType      || "Full-time",
      workersNeeded:       job.workersNeeded       || "",
      location:            job.location            || "",
      salaryRange:         job.salaryRange         || "",
      experienceRequired:  job.experienceRequired  || "",
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : "",
      description:         job.description         || "",
      status:              job.status              || "Active",
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/jobs/${editJob._id}`,
        editForm,
        { withCredentials: true }
      );
      setEditJob(null);
      setEditForm(null);
      fetchJobs();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePause = async (jobId) => {
    setPausingId(jobId);
    try {
      await axios.patch(
        `http://localhost:5000/api/jobs/${jobId}/pause`,
        {},
        { withCredentials: true }
      );
      fetchJobs();
    } catch (error) {
      console.error(error);
    } finally {
      setPausingId(null);
    }
  };

  // ── Derived stat values ─────────────────────────────────────────────────────
  const activeJobsCount = stats?.activeJobs      ?? STATIC_STATS.activeJobs;
  const totalApplicants = stats?.totalApplicants ?? STATIC_STATS.totalApplicants;
  const hiredWorkers    = stats?.hiredWorkers    ?? STATIC_STATS.hiredWorkers;

  return (
    <div className="dashboard-page">
      <Sidebar />

      {/* ── PROFILE POPUP ── */}
      {showProfilePopup && (
        <div className="profile-popup-overlay" onClick={() => setShowProfilePopup(false)}>
          <div className="profile-popup" onClick={e => e.stopPropagation()}>
            <div className="profile-popup-icon">🌾</div>
            <h3 className="profile-popup-title">Complete Your Profile</h3>
            <p className="profile-popup-msg">
              Please complete your profile first to get the best experience and attract the right workers.
            </p>
            <div className="profile-popup-actions">
              <button className="profile-popup-cancel" onClick={() => setShowProfilePopup(false)}>
                Cancel
              </button>
              <button
                className="profile-popup-ok"
                onClick={() => { setShowProfilePopup(false); navigate('/jobprovider/jobposting'); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW JOB MODAL ── */}
      {viewJob && (
        <div className="modal-overlay" onClick={() => setViewJob(null)}>
          <div className="modal-card modal-card-view" onClick={e => e.stopPropagation()}>
            <div className="modal-view-banner">
              <div className="modal-view-banner-left">
                <div className="modal-view-icon">💼</div>
                <div>
                  <h2 className="modal-view-title">{viewJob.title}</h2>
                  <span className={`status-badge ${statusClass(viewJob.status || "Active")}`}>
                    {viewJob.status || "Active"}
                  </span>
                </div>
              </div>
              <button className="modal-close modal-close-white" onClick={() => setViewJob(null)}>✕</button>
            </div>

            <div className="modal-body modal-view-body">
              <div className="modal-chips modal-field-full">
                <div className="modal-chip">
                  <span className="modal-chip-icon">📅</span>
                  <div>
                    <span className="modal-chip-label">Posted</span>
                    <span className="modal-chip-val">{formatDate(viewJob.postedDate || viewJob.createdAt)}</span>
                  </div>
                </div>
                <div className="modal-chip">
                  <span className="modal-chip-icon">👷</span>
                  <div>
                    <span className="modal-chip-label">Workers Needed</span>
                    <span className="modal-chip-val">{viewJob.workersNeeded || "—"}</span>
                  </div>
                </div>
                <div className="modal-chip">
                  <span className="modal-chip-icon">💰</span>
                  <div>
                    <span className="modal-chip-label">Salary Range</span>
                    <span className="modal-chip-val">{viewJob.salaryRange || "—"}</span>
                  </div>
                </div>
                <div className="modal-chip">
                  <span className="modal-chip-icon">📍</span>
                  <div>
                    <span className="modal-chip-label">Location</span>
                    <span className="modal-chip-val">{viewJob.location || "—"}</span>
                  </div>
                </div>
              </div>
              {viewJob.employmentType && (
                <div className="modal-field">
                  <span className="modal-label">Employment Type</span>
                  <span>{viewJob.employmentType}</span>
                </div>
              )}
              {viewJob.duration && (
                <div className="modal-field">
                  <span className="modal-label">Job Duration</span>
                  <span>{viewJob.duration}</span>
                </div>
              )}
              {viewJob.experienceRequired && (
                <div className="modal-field">
                  <span className="modal-label">Experience Required</span>
                  <span>{viewJob.experienceRequired}</span>
                </div>
              )}
              {viewJob.applicationDeadline && (
                <div className="modal-field">
                  <span className="modal-label">Application Deadline</span>
                  <span>{formatDate(viewJob.applicationDeadline)}</span>
                </div>
              )}
              <div className="modal-field modal-field-full">
                <span className="modal-label">Short Description & Skills Required</span>
                <p className="modal-text-block">{viewJob.description || "No description provided."}</p>
              </div>
              <div className="modal-field">
                <span className="modal-label">Posted On</span>
                <span className="modal-muted">{formatDate(viewJob.createdAt || viewJob.postedDate)}</span>
              </div>
              {viewJob.updatedAt && (
                <div className="modal-field">
                  <span className="modal-label">Last Updated</span>
                  <span className="modal-muted">{formatDate(viewJob.updatedAt)}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-view" onClick={() => setViewJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT JOB MODAL ── */}
      {editJob && editForm && (
        <div className="modal-overlay" onClick={() => { setEditJob(null); setEditForm(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Job Posting</h2>
              <button className="modal-close" onClick={() => { setEditJob(null); setEditForm(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Job Title</label>
                <input className="modal-input" type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Job Duration</label>
                <input className="modal-input" type="text"
                  value={editForm.duration}
                  onChange={e => setEditForm(prev => ({ ...prev, duration: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Employment Type</label>
                <select className="modal-input"
                  value={editForm.employmentType}
                  onChange={e => setEditForm(prev => ({ ...prev, employmentType: e.target.value }))}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Workers Needed</label>
                <input className="modal-input" type="number"
                  value={editForm.workersNeeded}
                  onChange={e => setEditForm(prev => ({ ...prev, workersNeeded: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input className="modal-input" type="text"
                  value={editForm.location}
                  onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Salary Range</label>
                <input className="modal-input" type="text"
                  value={editForm.salaryRange}
                  onChange={e => setEditForm(prev => ({ ...prev, salaryRange: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Experience Required</label>
                <input className="modal-input" type="text"
                  value={editForm.experienceRequired}
                  onChange={e => setEditForm(prev => ({ ...prev, experienceRequired: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Application Deadline</label>
                <input className="modal-input" type="date"
                  value={editForm.applicationDeadline}
                  onChange={e => setEditForm(prev => ({ ...prev, applicationDeadline: e.target.value }))} />
              </div>
              <div className="modal-field modal-field-full">
                <label className="modal-label">Short Description & Skills Required</label>
                <textarea className="modal-input modal-textarea"
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={5} placeholder="Describe the job role and required skills..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-light" onClick={() => { setEditJob(null); setEditForm(null); }}>Cancel</button>
              <button className="btn-view" onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICANT DETAIL MODAL ── */}
      {viewApplicant && (
        <div className="modal-overlay" onClick={() => setViewApplicant(null)}>
          <div className="modal-card modal-card-view appl-detail-card" onClick={e => e.stopPropagation()}>

            {/* ── Banner ── */}
            <div className="modal-view-banner appl-detail-banner">
              <div className="modal-view-banner-left">
                <div className="applicant-modal-avatar">{viewApplicant.initials}</div>
                <div>
                  <h2 className="modal-view-title">{viewApplicant.firstName} {viewApplicant.lastName}</h2>
                  <span className="applicant-modal-role">{viewApplicant.jobTitle}</span>
                  <div className="appl-banner-meta">
                    {viewApplicant.location && viewApplicant.location !== "—" && (
                      <span>📍 {viewApplicant.location}</span>
                    )}
                    {viewApplicant.experienceRequired && viewApplicant.experienceRequired !== "—" && (
                      <span>🧑‍🌾 {viewApplicant.experienceRequired} exp</span>
                    )}
                    {viewApplicant.appliedDate && (
                      <span>📅 Applied {viewApplicant.appliedDate}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="applicant-modal-banner-right">
                <button className="modal-close modal-close-white" onClick={() => setViewApplicant(null)}>✕</button>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="appl-detail-scroll">

              {/* ══ ROW 1: Personal Details + Contact Information side by side ══ */}
              <div className="appl-section-row">

                {/* Personal Details */}
                <div className="appl-section-card">
                  <div className="appl-section-heading"><span>🪪</span> Personal Details</div>
                  <div className="appl-divider" />
                  <div className="appl-fields-grid">
                    <div className="appl-field">
                      <span className="appl-field-label">FIRST NAME</span>
                      <span className="appl-field-val">{viewApplicant.firstName || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">LAST NAME</span>
                      <span className="appl-field-val">{viewApplicant.lastName || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">DATE OF BIRTH</span>
                      <span className="appl-field-val">{viewApplicant.dateOfBirth || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">GENDER</span>
                      <span className="appl-field-val">{viewApplicant.gender || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">NATIONALITY</span>
                      <span className="appl-field-val">{viewApplicant.nationality || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">LOCATION</span>
                      <span className="appl-field-val"><span className="appl-field-icon">📍</span>{viewApplicant.location || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="appl-section-card">
                  <div className="appl-section-heading"><span>📞</span> Contact Information</div>
                  <div className="appl-divider" />
                  <div className="appl-fields-single">
                    <div className="appl-field">
                      <span className="appl-field-label">EMAIL ADDRESS</span>
                      <span className="appl-field-val"><span className="appl-field-icon">📧</span>{viewApplicant.email || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">PHONE NUMBER</span>
                      <span className="appl-field-val"><span className="appl-field-icon">📱</span>{viewApplicant.phone || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                    <div className="appl-field">
                      <span className="appl-field-label">EMERGENCY CONTACT</span>
                      <span className="appl-field-val"><span className="appl-field-icon">🚨</span>{viewApplicant.emergencyContact || "—"}</span>
                      <div className="appl-field-divider" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ Work Details — full width ══ */}
              <div className="appl-section-card appl-section-card-full">
                <div className="appl-section-heading"><span>💼</span> Work Details</div>
                <div className="appl-divider" />

                {/* Job Title — full width */}
                <div className="appl-field appl-field-full-w">
                  <span className="appl-field-label">JOB TITLE</span>
                  <span className="appl-field-val"><span className="appl-field-icon">🧑‍🌾</span>{viewApplicant.jobTitle || "—"}</span>
                  <div className="appl-field-divider" />
                </div>

                {/* 2-col grid */}
                <div className="appl-fields-grid">
                  <div className="appl-field">
                    <span className="appl-field-label">JOB DURATION</span>
                    <span className="appl-field-val"><span className="appl-field-icon">⏱️</span>{viewApplicant.jobDuration || "—"}</span>
                    <div className="appl-field-divider" />
                  </div>
                  <div className="appl-field">
                    <span className="appl-field-label">EMPLOYMENT TYPE</span>
                    <span className="appl-field-val"><span className="appl-field-icon">👥</span>{viewApplicant.employmentType || "—"}</span>
                    <div className="appl-field-divider" />
                  </div>
                  <div className="appl-field">
                    <span className="appl-field-label">WORKERS AVAILABLE</span>
                    <span className="appl-field-val"><span className="appl-field-icon">🔢</span>{viewApplicant.numberOfWorkers ?? "—"}</span>
                    <div className="appl-field-divider" />
                  </div>
                  <div className="appl-field">
                    <span className="appl-field-label">EXPECTED SALARY</span>
                    <span className="appl-field-val">
                      <span className="appl-field-icon">💰</span>
                      {viewApplicant.salaryRange || <em className="appl-not-provided">Not provided</em>}
                    </span>
                    <div className="appl-field-divider" />
                  </div>
                  <div className="appl-field">
                    <span className="appl-field-label">YEARS OF EXPERIENCE</span>
                    <span className="appl-field-val"><span className="appl-field-icon">📅</span>{viewApplicant.experienceRequired || "—"}</span>
                    <div className="appl-field-divider" />
                  </div>
                  <div className="appl-field">
                    <span className="appl-field-label">AVAILABLE FROM</span>
                    <span className="appl-field-val">
                      <span className="appl-field-icon">📅</span>
                      {viewApplicant.availableFrom || <em className="appl-not-provided">Not provided</em>}
                    </span>
                    <div className="appl-field-divider" />
                  </div>
                </div>

                {/* Skills */}
                {viewApplicant.skills && viewApplicant.skills.length > 0 && (
                  <div className="appl-field appl-field-full-w" style={{ marginTop: 8 }}>
                    <span className="appl-field-label">SKILLS</span>
                    <div className="appl-skills-row">
                      {viewApplicant.skills.map((skill, i) => (
                        <span className="appl-skill-tag" key={i}>{skill}</span>
                      ))}
                    </div>
                    <div className="appl-field-divider" />
                  </div>
                )}
              </div>

              {/* ══ About Me — full width ══ */}
              {viewApplicant.description && (
                <div className="appl-section-card appl-section-card-full">
                  <div className="appl-section-heading"><span>📝</span> About Me</div>
                  <div className="appl-divider" />
                  <p className="appl-bio-text">{viewApplicant.description}</p>
                </div>
              )}

            </div>

            {/* ── Footer ── */}
            <div className="modal-footer">
              <button className="btn-light" onClick={() => setViewApplicant(null)}>Close</button>
              <button className="btn-light">💬 Message</button>
              <button className="btn-view">📅 Interview</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH BAR ── */}
      <div className="search-bar">
        <div className="search-bar-input-wrap">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search jobs, applicants, or workers..." />
        </div>
        <div className="search-bar-spacer" />
        <div className="topbar-actions">
          <button className="topbar-bell">
            <FiBell />
            <span className="notif-dot"></span>
          </button>
          <div className="topbar-avatar">{initials}</div>
        </div>
      </div>

      <div className="container">

        {/* ── GREETING BANNER ── */}
        <div className="greeting">
          <div className="greeting-sp">
            <div className="greeting-tag">
              <FaLeaf /> Jobprovider Dashboard
            </div>
            <div className="greeting-header">
              Welcome back, {Firstname} 🌾
            </div>
            <div className="greeting-text">
              Your harvest season is approaching. We've found <strong>12 new qualified workers</strong> for your fruit picking positions.
            </div>
            <div className="greeting-cta-row">
              <button className="greeting-btn-primary">
                Browse New Worker <FaArrowRight />
              </button>
              <button className="greeting-btn-secondary">
                My Applications
              </button>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="card-row">
          <div className="state-card">
            <div className="state-header">Active Job Postings</div>
            <div className="state-icon"><FaBriefcase className="icon" /></div>
            <div className="state-number">{activeJobsCount}</div>
            <p className="stat-growth"><span className="growth-up">↑ +2</span> this week</p>
          </div>
          <div className="state-card">
            <div className="state-header">Total Applicants</div>
            <div className="state-icon"><FaUsers className="icon" /></div>
            <div className="state-number">{totalApplicants}</div>
            <p className="stat-growth"><span className="growth-up">↑ +12</span> new today</p>
          </div>
          <div className="state-card">
            <div className="state-header">Hired Workers</div>
            <div className="state-icon"><FaHardHat className="icon" /></div>
            <div className="state-number">{hiredWorkers}</div>
            <p className="stat-growth"><span className="growth-up">↑ +1</span> this week</p>
          </div>
        </div>

        {/* ── ACTIVE JOB POSTINGS TABLE ── */}
        <div className="job-heading">
          <div className="job-heading-left">
            <FaClipboardList className="job-icon" />
            <span>Active Job Postings</span>
          </div>
          <div className="job-heading-right">
            <span>View All</span>
            <FaArrowRight />
          </div>
        </div>

        <table className="job-table">
          <thead>
            <tr>
              <td>Job Title</td>
              <td>Posted Date</td>
              <td>Applications</td>
              <td>Status</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {jobPostings.slice(0, 4).map((job) => {
              const jobId     = job._id;
              const isPausing = pausingId === jobId;
              const isPaused  = (job.status || "").toLowerCase() === "paused";
              const isStatic  = jobsIsStatic;
              return (
                <tr key={jobId}>
                  <td><strong>{job.title}</strong></td>
                  <td>{formatDate(job.postedDate || job.createdAt)}</td>
                  <td>{job.workersNeeded} applicants</td>
                  <td>
                    <span className={`status-badge ${statusClass(job.status || "Active")}`}>
                      {job.status || "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => !isStatic && handleEdit(job)}
                        disabled={isStatic}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`icon-btn ${isPaused ? "icon-btn-paused" : ""}`}
                        title={isPaused ? "Already paused" : "Pause"}
                        disabled={isPausing || isPaused || isStatic}
                        onClick={() => !isStatic && handlePause(jobId)}
                      >
                        {isPausing ? "…" : <FaPause />}
                      </button>
                      <button
                        className="icon-btn"
                        title="View"
                        onClick={() => setViewJob(job)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── RECENT APPLICANTS ── */}
        <div className="rapplication-header">
          <div className="rapplication-header-left">
            <FaUsers className="recent-icon" />
            <span>Recent Applicants</span>
          </div>
          <div className="rapplication-header-right">
            <span>View All</span>
            <FaArrowRight className="view-icon-a" />
          </div>
        </div>

        <div className="recent-cards">
          {applicants.slice(0, 4).map((applicant) => (
            <div
              className="recent-card"
              key={applicant._id}
              onClick={() => { setViewApplicant(applicant); setApplicantTab("personal"); }}
            >
              {/* ── 3-dot menu — top right of card ── */}
              <div
                className="applicant-card-dot-wrap"
                ref={openDotMenu === applicant._id ? dotMenuRef : null}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="applicant-card-dot-btn"
                  title="More options"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenDotMenu(prev => prev === applicant._id ? null : applicant._id);
                  }}
                >
                  ⋮
                </button>
                {openDotMenu === applicant._id && (
                  <div className="applicant-card-dot-menu">
                    <button onClick={() => { setViewApplicant(applicant); setOpenDotMenu(null); }}>
                      👁 View Profile
                    </button>
                    <button onClick={() => setOpenDotMenu(null)}>
                      💬 Message
                    </button>
                    <button onClick={() => setOpenDotMenu(null)}>
                      📅 Interview
                    </button>
                    <button
                      className="applicant-dot-menu-danger"
                      onClick={() => setOpenDotMenu(null)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>

              {/* card content */}
              <div className="recent-top">
                <div className="avatar">{applicant.initials}</div>
                <div>
                  <h4>{applicant.firstName} {applicant.lastName}</h4>
                  <p className="role">{applicant.jobTitle}</p>
                </div>
              </div>

              {/* ── detail rows ── */}
              <div className="applicant-card-details">
                <div className="applicant-card-detail-row">
                  <span className="applicant-card-detail-item">
                    <span className="applicant-card-detail-icon">📍</span>
                    {applicant.location || "—"}
                  </span>
                  <span className="applicant-card-detail-item">
                    <span className="applicant-card-detail-icon">🧑‍🌾</span>
                    {applicant.experienceRequired || "—"}
                  </span>
                </div>
                {applicant.email && applicant.email !== "—" && (
                  <div className="applicant-card-detail-row">
                    <span className="applicant-card-detail-item">
                      <span className="applicant-card-detail-icon">📧</span>
                      {applicant.email}
                    </span>
                  </div>
                )}
              </div>

              {/* divider */}
              <div className="applicant-card-divider" />

              <div className="skills">
                {applicant.skills.map((skill, i) => (
                  <span key={i}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default jobpDashboard;