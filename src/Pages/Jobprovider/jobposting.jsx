import Sidebar from './sidebar';
import "./jobposting.css";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Combines employment type and duration into one string e.g. "Full-time · 3 months"
const formatType = (type, duration) => {
  const parts = [type, duration].filter(Boolean);
  return parts.join(" · ");
};

// Formats a date string into "Posted Jun 5"
const formatPostedDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return "Posted " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Formats a date string into "Jun 5, 2025" — used for deadline display
const formatDate = (dateStr) => {
  if (!dateStr) return "Flexible";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Returns an emoji icon based on keywords in the job title
const getJobIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("tractor")) return "🚜";
  if (t.includes("fruit") || t.includes("picker") || t.includes("apple")) return "🍎";
  if (t.includes("mechanic")) return "🔧";
  if (t.includes("truck") || t.includes("driver")) return "🚛";
  if (t.includes("hand") || t.includes("general") || t.includes("farm")) return "🌱";
  return "🌾";
};

/* ─────────────────────────────────────────
   JOB DETAIL MODAL
   Read-only popup shown when a job card is clicked
───────────────────────────────────────── */
const JobDetailModal = ({ job, onClose }) => {
  if (!job) return null;

  const icon = getJobIcon(job.title);
  const type = formatType(job.employmentType, job.duration);
  const postedDate = formatPostedDate(job.createdAt);
  const deadline = formatDate(job.deadline);
  const status = job.status || "open";

  return (
    // Clicking the overlay background closes the modal
    <div className="jp-modal-overlay" onClick={onClose}>
      <div className="jp-modal" onClick={(e) => e.stopPropagation()}>

        <button className="jp-modal-close" onClick={onClose}>✕</button>

        <div className="jp-modal-header">
          <div className="job-icon-wrap" style={{ width: 56, height: 56, fontSize: 26 }}>
            {icon}
          </div>
          <div className="jp-modal-title">
            <strong>{job.title}</strong>
            <span>{type}</span>
            <span
              className={`status ${status}`}
              style={{ marginTop: 6, display: "inline-flex" }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        {/* Grid of job details */}
        <div className="jp-modal-grid">
          <div className="jp-modal-field">
            <label>📍 Location</label>
            <p>{job.location || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>💰 Salary</label>
            <p>{job.salary || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>👥 Workers Needed</label>
            <p>{job.workersNeeded || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>🎓 Experience Required</label>
            <p>{job.experienceRequired || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>📅 Posted On</label>
            <p>{postedDate}</p>
          </div>
          <div className="jp-modal-field">
            <label>⏰ Application Deadline</label>
            <p>{deadline}</p>
          </div>
          <div className="jp-modal-field">
            <label>💼 Employment Type</label>
            <p>{job.employmentType || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>⏳ Duration</label>
            <p>{job.duration || "N/A"}</p>
          </div>
        </div>

        {/* Only shows description section if description exists */}
        {job.description && (
          <div className="jp-modal-desc">
            <label>📝 Description & Skills Required</label>
            <p>{job.description}</p>
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   THREE-DOT MENU (⋮)
   Dropdown on each job card with Edit and Delete options
───────────────────────────────────────── */
const ThreeDotMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Closes dropdown if user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Toggles dropdown open/closed — stopPropagation prevents card click (view modal) from firing
  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // Closes dropdown then fires the edit handler passed from parent
  const handleEdit = (e) => {
    e.stopPropagation();
    setOpen(false);
    onEdit();
  };

  // Closes dropdown then fires the delete handler passed from parent
  const handleDelete = (e) => {
    e.stopPropagation();
    setOpen(false);
    onDelete();
  };

  return (
    <div className="jp-three-dot-wrapper" ref={menuRef}>
      <button className="jp-three-dot-btn" onClick={handleToggle} title="More options">
        ⋮
      </button>
      {open && (
        <div className="jp-three-dot-dropdown">
          <button onClick={handleEdit}>✏️ Edit</button>
          <button onClick={handleDelete} className="jp-dropdown-delete">🗑️ Delete</button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   JOB CARD
   Displays a single job posting in the grid.
   Clicking the card opens the view modal.
   The ⋮ menu handles edit and delete.
───────────────────────────────────────── */
const JobCard = ({ job, onDelete, onView, onEdit }) => {
  const icon = getJobIcon(job.title);
  const type = formatType(job.employmentType, job.duration);
  const postedDate = formatPostedDate(job.createdAt);
  const startDate = formatDate(job.deadline);
  const status = job.status || "open";
  const applicants = job.applicantsCount ?? job.applicants ?? 0;
  const wage = job.salary || "N/A";
  const location = job.location || "N/A";

  return (
    <div className="job-card" onClick={() => onView(job)} style={{ cursor: "pointer" }}>
      <div className="job-card-top">
        <div className="job-card-title-row">
          <div className="job-icon-wrap">{icon}</div>
          <div className="job-card-title">
            <strong>{job.title}</strong>
            <span>{type}</span>
          </div>
        </div>
        <div className="jp-card-top-right">
          <span className={`status ${status}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {/* Pass the full job object to onEdit, and just the id to onDelete */}
          <ThreeDotMenu
            onEdit={() => onEdit(job)}
            onDelete={() => onDelete(job._id)}
          />
        </div>
      </div>

      <div className="job-card-meta">
        <div className="meta-item"><i className="fas fa-map-marker-alt"></i> {location}</div>
        <div className="meta-item"><i className="fas fa-dollar-sign"></i> {wage}</div>
        <div className="meta-item"><i className="fas fa-calendar-plus"></i> {postedDate}</div>
        <div className="meta-item"><i className="fas fa-play-circle"></i> {startDate}</div>
      </div>

      <div className="job-card-divider"></div>

      <div className="job-card-footer">
        <div className="applicant-count">
          <div className="count-bubble">{job.workersNeeded}</div> Applicants
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT — Jobposting
   Manages all state, API calls, and renders
   the full dashboard page
───────────────────────────────────────── */
const Jobposting = () => {
  const [jobPostings, setJobPostings] = useState([]);   // All fetched job listings
  const [loadingJobs, setLoadingJobs] = useState(true); // Loading state for job list
  const [selectedJob, setSelectedJob] = useState(null); // Job open in the view modal

  // Edit state — editJob holds the original job, editForm holds the live form values
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Delete confirmation modal — holds the jobId pending deletion, null when closed
  const [deleteJobId, setDeleteJobId] = useState(null);

  // Form state for creating a new job
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    employmentType: "Full-time",
    workersNeeded: 1,
    location: "",
    salary: "",
    experienceRequired: "",
    deadline: "",
    description: "",
  });

  // Fetches all active job postings from the backend
  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/active/ActiveJobPosting", {
        withCredentials: true,
      });
      setJobPostings(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job postings");
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch jobs on initial page load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Updates the new-job form fields as the user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submits the new job form — POST /api/jobpost
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      duration: formData.duration,
      employmentType: formData.employmentType,
      workersNeeded: formData.workersNeeded,
      location: formData.location,
      salary: formData.salary,
      experienceRequired: formData.experienceRequired,
      deadline: formData.deadline,
      description: formData.description,
    };

    try {
      await axios.post("http://localhost:5000/api/jobpost", payload, {
        withCredentials: true,
      });
      toast.success("Job Published Successfully");
      // Reset form after successful publish
      setFormData({
        title: "",
        duration: "",
        employmentType: "Full-time",
        workersNeeded: 1,
        location: "",
        salary: "",
        experienceRequired: "",
        deadline: "",
        description: "",
      });
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error(error);
      toast.error("Error creating job");
    }
  };

  // Opens the delete confirmation modal for the given jobId
  const handleDelete = (jobId) => {
    setDeleteJobId(jobId);
  };

  // Confirmed delete — called when user clicks "Delete" in the modal
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${deleteJobId}`, {
        withCredentials: true,
      });
      toast.success("Job deleted successfully");
      setJobPostings((prev) => prev.filter((j) => j._id !== deleteJobId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
    } finally {
      setDeleteJobId(null); // Close modal regardless of outcome
    }
  };

  // Cancels the delete — closes modal without doing anything
  const handleCancelDelete = () => {
    setDeleteJobId(null);
  };

  // Opens the edit modal and pre-fills the form with the selected job's current data
  const handleEditOpen = (job) => {
    setEditJob(job);
    setEditForm({
      title: job.title || "",
      duration: job.duration || "",
      employmentType: job.employmentType || "Full-time",
      workersNeeded: job.workersNeeded || 1,
      location: job.location || "",
      salary: job.salary || "",
      experienceRequired: job.experienceRequired || "",
      // Strip time from ISO date string so the date input works correctly
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      description: job.description || "",
    });
  };

  // Updates edit form fields as the user types
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Saves the edited job — PATCH /api/jobs/:id
  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/jobs/${editJob._id}`,
        editForm,
        { withCredentials: true }
      );
      toast.success("Job updated successfully");
      setEditJob(null);   // Close modal
      setEditForm(null);
      fetchJobs();        // Refresh job list with updated data
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    }
  };

  // Opens the view (read-only) modal for a job card click
  const handleView = (job) => {
    setSelectedJob(job);
  };

  // Closes the view modal
  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  // Derived stats shown in the header and postings section
  const activeListings = jobPostings.filter((j) => (j.status || "open") === "open").length;
  const totalApplicants = jobPostings.reduce(
    (sum, j) => sum + (j.applicantsCount ?? j.applicants ?? 0), 0
  );

  return (
    <>
      <Sidebar />
      <ToastContainer />

      {/* View Modal — opens when a job card is clicked */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={handleCloseModal} />
      )}

      {/* Edit Modal — opens when ✏️ Edit is clicked in the three-dot menu */}
      {editJob && editForm && (
        <div className="jp-modal-overlay" onClick={() => setEditJob(null)}>
          <div className="jp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="jp-modal-close" onClick={() => setEditJob(null)}>✕</button>

            <div className="jp-modal-header">
              <div className="icon-wrap">✏️</div>
              <div className="jp-card-header-text">
                <h2>Edit Job</h2>
                <p>Update the job details below</p>
              </div>
            </div>

            {/* Edit form — 2-column layout to prevent horizontal scroll */}
            <div className="jp-form">
              <div className="jp-row">
                <div className="jp-field">
                  <label>Job Title</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Job Duration</label>
                  <input type="text" name="duration" value={editForm.duration} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Employment Type</label>
                  <select name="employmentType" value={editForm.employmentType} onChange={handleEditChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>
                <div className="jp-field">
                  <label>Workers Needed</label>
                  <input type="number" name="workersNeeded" value={editForm.workersNeeded} onChange={handleEditChange} min="1" />
                </div>
              </div>
              <div className="jp-row">
                <div className="jp-field">
                  <label>Location</label>
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Salary Range</label>
                  <input type="text" name="salary" value={editForm.salary} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Experience Required</label>
                  <input type="text" name="experienceRequired" value={editForm.experienceRequired} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={editForm.deadline}
                    onChange={handleEditChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="jp-field jp-full">
                <label>Short Description &amp; Skills Required</label>
                <textarea rows="4" name="description" value={editForm.description} onChange={handleEditChange}></textarea>
              </div>
            </div>

            <div className="jp-buttons">
              <button className="jp-btn light" onClick={() => setEditJob(null)}>Cancel</button>
              <button className="jp-btn dark" onClick={handleEditSubmit}>
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal — opens when 🗑️ Delete is clicked in the three-dot menu */}
      {deleteJobId && (
        <div className="logout-overlay" onClick={handleCancelDelete}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="logout-modal-title">Confirm Delete</h2>
            <p className="logout-modal-message">Are you sure you want to delete this job posting?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-btn logout-modal-btn--cancel" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="logout-modal-btn logout-modal-btn--confirm" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="jobposting-page">

        {/* ── PAGE HEADER ── */}
        <div className="header-box">
          <div className="header-left">
            <h1>Job Provider Dashboard</h1>
            <p>Farm overview — Oakfield, Iowa</p>
          </div>
          <div className="header-right">
            <div className="badge-pill">
              <i className="fas fa-circle" style={{ fontSize: "8px" }}></i>{" "}
              {activeListings} Active Listings
            </div>
            <button className="photo-btn">
              <i className="fas fa-camera"></i> Agri Photo +
            </button>
          </div>
        </div>

        {/* ── CREATE NEW JOB FORM ── */}
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
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Tractor Operator"
                />
              </div>
              <div className="jp-field">
                <label>Job Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 months"
                />
              </div>
              <div className="jp-field">
                <label>Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>
              <div className="jp-field">
                <label>Workers Needed</label>
                <input
                  type="number"
                  name="workersNeeded"
                  value={formData.workersNeeded}
                  onChange={handleChange}
                  placeholder="Number of workers"
                  min="1"
                />
              </div>
            </div>

            <div className="jp-row">
              <div className="jp-field">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                />
              </div>
              <div className="jp-field">
                <label>Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $18–$24/hr"
                />
              </div>
              <div className="jp-field">
                <label>Experience Required</label>
                <input
                  type="text"
                  name="experienceRequired"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  placeholder="e.g. 2+ years"
                />
              </div>
              <div className="jp-field">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline || ""}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="jp-field jp-full">
              <label>Short Description &amp; Skills Required</label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and required skills..."
              ></textarea>
            </div>
          </div>

          <div className="jp-buttons">
            <button className="jp-btn light">
              <i className="fas fa-camera"></i> Add Photo
            </button>
            <button className="jp-btn dark" onClick={(e) => handleSubmit(e)}>
              <i className="fas fa-plus-circle"></i> Publish Job
            </button>
          </div>
        </div>

        {/* ── JOB POSTINGS LIST ── */}
        <div className="job-postings-section">
          <div className="job-postings-header">
            <h2 className="page-title">Your Job Postings</h2>
            <div className="job-stats">
              <div className="stat-item">👥 <strong>{totalApplicants} applicants</strong></div>
              <div className="stat-item">👁 <strong>168 views</strong></div>
              <div className="stat-item">📷 <strong>6 with photo</strong></div>
            </div>
          </div>

          {/* Renders up to 4 job cards; shows loading/empty states as needed */}
          <div className="job-cards-grid">
            {loadingJobs ? (
              <p style={{ color: "var(--jp-green-muted)", fontSize: "14px" }}>
                Loading job postings...
              </p>
            ) : jobPostings.length === 0 ? (
              <p style={{ color: "var(--jp-green-muted)", fontSize: "14px" }}>
                No job postings yet. Create your first one above!
              </p>
            ) : (
              jobPostings.slice(0, 4).map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onDelete={handleDelete}
                  onView={handleView}
                  onEdit={handleEditOpen}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Jobposting;