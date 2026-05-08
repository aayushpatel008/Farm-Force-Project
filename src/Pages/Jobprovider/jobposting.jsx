// Complete Jobposting.jsx - Full Component Code with Header + Filter Row + Compact Cards

import Sidebar from './sidebar';
import "./jobposting.css";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatType = (type, duration) => {
  const parts = [type, duration].filter(Boolean);
  return parts.join(" · ");
};

const formatPostedDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return "Posted " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Flexible";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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
───────────────────────────────────────── */
const JobDetailModal = ({ job, onClose }) => {
  if (!job) return null;

  const icon = getJobIcon(job.title);
  const type = formatType(job.employmentType, job.duration);
  const postedDate = formatPostedDate(job.createdAt);
  const deadline = formatDate(job.deadline);
  const status = job.status || "open";

  return (
    <div className="jp-modal-overlay" onClick={onClose}>
      <div className="jp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="jp-modal-close" onClick={onClose}>✕</button>

        <div className="jp-modal-content">
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

        <div className="jp-modal-grid">
          <div className="jp-modal-field">
            <label>🏢 Farm / Company</label>
            <p>{job.farmName || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>🏷️ Job Category</label>
            <p>{job.jobCategory || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>💰 Salary</label>
            <p>{job.salary ? `${job.salary} (${job.payType || "N/A"})` : "N/A"}</p>
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
            <label>🗓️ Start Date</label>
            <p>{formatDate(job.startDate)}</p>
          </div>
          <div className="jp-modal-field">
            <label>🗓️ End Date</label>
            <p>{formatDate(job.endDate)}</p>
          </div>
          <div className="jp-modal-field">
            <label>💼 Employment Type</label>
            <p>{job.employmentType || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>⏳ Duration</label>
            <p>{job.duration || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>🏙️ City / Village</label>
            <p>{job.city || "N/A"}</p>
          </div>
          <div className="jp-modal-field">
            <label>📍 State</label>
            <p>{job.state || "N/A"}</p>
          </div>
        </div>

        {job.farmAddress && (
          <div className="jp-modal-desc" style={{ marginBottom: 16 }}>
            <label>🗺️ Farm Address</label>
            <p>{job.farmAddress}</p>
          </div>
        )}

        {job.description && (
          <div className="jp-modal-desc">
            <label>📝 Description & Skills Required</label>
            <p>{job.description}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   THREE-DOT MENU
───────────────────────────────────────── */
const ThreeDotMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setOpen(false);
    onEdit();
  };

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
   COMPACT JOB CARD - Reference Layout
───────────────────────────────────────── */
const JobCard = ({ job, onDelete, onView, onEdit }) => {
  const icon = getJobIcon(job.title);
  const type = formatType(job.employmentType, job.duration);
  const status = job.status || "open";
  const wage = job.salary || "N/A";
  const location = job.city && job.state ? `${job.city}, ${job.state}` : job.city || job.state || "N/A";

  // Truncate description to 2 lines
  const truncatedDesc = job.description 
    ? job.description.length > 100 
      ? `${job.description.substring(0, 100)}...` 
      : job.description
    : "";

  return (
    <div className="job-card" onClick={() => onView(job)} style={{ cursor: "pointer" }}>
      {/* Header: Title + Apply Button */}
      <div className="job-card-header">
        <div className="job-card-header-left">
          <div className="job-icon-wrap">{icon}</div>
          <h3 className="job-card-title">{job.title}</h3>
        </div>
        <div className="job-card-header-right">
          <button 
            className="btn-apply" 
            onClick={(e) => {
              e.stopPropagation();
              onView(job);
            }}
          >
            Apply
          </button>
          <ThreeDotMenu
            onEdit={() => onEdit(job)}
            onDelete={() => onDelete(job._id)}
          />
        </div>
      </div>

      {/* Meta Row: Location + Status (inline) */}
      <div className="job-card-meta-row">
        <span className="meta-location">
          <i className="fas fa-map-marker-alt"></i> {location}
        </span>
        <span className={`meta-status status-badge status-${status}`}>
          <span className="status-dot"></span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Description (max 2 lines) */}
      {truncatedDesc && (
        <p className="job-card-description">{truncatedDesc}</p>
      )}

      {/* Info Strip: Salary • Duration • Category */}
      <div className="job-card-info-strip">
        <span className="info-item">
          <i className="fas fa-rupee-sign"></i> {wage}
        </span>
        <span className="info-separator">•</span>
        <span className="info-item">
          <i className="fas fa-clock"></i> {job.duration || "Flexible"}
        </span>
        <span className="info-separator">•</span>
        <span className="info-item">
          <i className="fas fa-tag"></i> {job.jobCategory || "General"}
        </span>
      </div>

      {/* Footer: Applicants + Close Button */}
      <div className="job-card-footer">
        <div className="applicant-count">
          <div className="count-bubble">{job.workersNeeded || 0}</div>
          <span>applicants</span>
        </div>
        <button 
          className="btn-close"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job._id);
          }}
          title="Close job posting"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT — Jobposting
───────────────────────────────────────── */
const Jobposting = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState('all');

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit state
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Delete confirmation modal
  const [deleteJobId, setDeleteJobId] = useState(null);

  // New job form state
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    employmentType: "Full-time",
    workersNeeded: 1,
    jobCategory: "",
    farmName: "",
    salary: "",
    payType: "Per Day",
    experienceRequired: "",
    deadline: "",
    startDate: "",
    endDate: "",
    farmAddress: "",
    city: "",
    state: "",
    description: "",
  });

  // Prevent background scroll when create modal is open
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCreateModalOpen]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs/my", {
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      duration: formData.duration,
      employmentType: formData.employmentType,
      workersNeeded: formData.workersNeeded,
      jobCategory: formData.jobCategory,
      farmName: formData.farmName,
      salary: formData.salary,
      payType: formData.payType,
      experienceRequired: formData.experienceRequired,
      deadline: formData.deadline,
      startDate: formData.startDate,
      endDate: formData.endDate,
      farmAddress: formData.farmAddress,
      city: formData.city,
      state: formData.state,
      description: formData.description,
    };

    try {
      await axios.post("http://localhost:5000/api/jobpost", payload, {
        withCredentials: true,
      });                         
      toast.success("Job Published Successfully");
      setFormData({
        title: "",
        duration: "",
        employmentType: "Full-time",
        workersNeeded: 1,
        jobCategory: "",
        farmName: "",
        salary: "",
        payType: "Per Day",
        experienceRequired: "",
        deadline: "",
        startDate: "",
        endDate: "",
        farmAddress: "",
        city: "",
        state: "",
        description: "",
      });
      setIsCreateModalOpen(false);
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Error creating job");
    }
  };

  const handleDelete = (jobId) => {
    setDeleteJobId(jobId);
  };

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
      setDeleteJobId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteJobId(null);
  };

  const handleEditOpen = (job) => {
    setEditJob(job);
    setEditForm({
      title: job.title || "",
      duration: job.duration || "",
      employmentType: job.employmentType || "Full-time",
      workersNeeded: job.workersNeeded || 1,
      jobCategory: job.jobCategory || "",
      farmName: job.farmName || "",
      salary: job.salary || "",
      payType: job.payType || "Per Day",
      experienceRequired: job.experienceRequired || "",
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      startDate: job.startDate ? job.startDate.split("T")[0] : "",
      endDate: job.endDate ? job.endDate.split("T")[0] : "",
      farmAddress: job.farmAddress || "",
      city: job.city || "",
      state: job.state || "",
      description: job.description || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/jobs/${editJob._id}`,
        editForm,
        { withCredentials: true }
      );
      toast.success("Job updated successfully");
      setEditJob(null);
      setEditForm(null);
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    }
  };

  const handleView = (job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  // Filtered jobs based on search query and active filter
  const filteredJobs = jobPostings.filter((job) => {
    // Apply filter tabs
    if (activeFilter === 'active') {
      if (job.status !== 'open') return false;
    }
    if (activeFilter === 'high') {
      const salaryNum = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
      if (salaryNum < 600) return false;
    }
    
    // Apply search query
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (job.title || "").toLowerCase().includes(q) ||
      (job.city || "").toLowerCase().includes(q) ||
      (job.state || "").toLowerCase().includes(q) ||
      (job.jobCategory || "").toLowerCase().includes(q) ||
      (job.farmName || "").toLowerCase().includes(q)
    );
  });

  const activeListings = jobPostings.filter((j) => (j.status || "open") === "open").length;
  const totalApplicants = jobPostings.reduce(
    (sum, j) => sum + (j.applicantsCount ?? j.applicants ?? 0), 0
  );

  return (
    <>
      <Sidebar />
      <ToastContainer />

      {/* ── VIEW MODAL ── */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={handleCloseModal} />
      )}

      {/* ── CREATE JOB MODAL ── */}
      {isCreateModalOpen && (
        <div
          className="jp-modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="jp-modal jp-create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="jp-modal-close"
              onClick={() => setIsCreateModalOpen(false)}
            >
              ✕
            </button>

            <div className="jp-modal-content">
            {/* Modal Header */}
            <div className="jp-modal-header">
              <div className="icon-wrap">🌾</div>
              <div className="jp-card-header-text">
                <h2>Post a New Job</h2>
                <p>Fill in the details to publish a new agricultural position</p>
              </div>
            </div>

            {/* ── SECTION 1: Role Overview ── */}
            <div className="jp-modal-section">
              <div className="jp-section-header">
                <span className="jp-section-icon">💼</span>
                <span className="jp-section-title">Role Overview</span>
              </div>
              <div className="jp-section-divider" />

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
                </div>

                <div className="jp-row">
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
                    <label>Job Category / Tag</label>
                    <input
                      type="text"
                      name="jobCategory"
                      value={formData.jobCategory}
                      onChange={handleChange}
                      placeholder="e.g. Harvesting, Irrigation"
                    />
                  </div>
                  <div className="jp-field">
                    <label>Farm / Company Name</label>
                    <input
                      type="text"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      placeholder="e.g. Green Acres Farm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Pay & Compensation ── */}
            <div className="jp-modal-section">
              <div className="jp-section-header">
                <span className="jp-section-icon">💰</span>
                <span className="jp-section-title">Pay &amp; Compensation</span>
              </div>
              <div className="jp-section-divider" />

              <div className="jp-form">
                <div className="jp-row">
                  <div className="jp-field">
                    <label>Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g. $18–$24"
                    />
                  </div>
                  <div className="jp-field">
                    <label>Pay Type</label>
                    <select
                      name="payType"
                      value={formData.payType}
                      onChange={handleChange}
                    >
                      <option value="Per Day">Per Day</option>
                      <option value="Per Hour">Per Hour</option>
                      <option value="Per Task">Per Task</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Work Schedule ── */}
            <div className="jp-modal-section">
              <div className="jp-section-header">
                <span className="jp-section-icon">📅</span>
                <span className="jp-section-title">Work Schedule</span>
              </div>
              <div className="jp-section-divider" />

              <div className="jp-form">
                <div className="jp-row">
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

                <div className="jp-row">
                  <div className="jp-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="jp-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Work Location ── */}
            <div className="jp-modal-section">
              <div className="jp-section-header">
                <span className="jp-section-icon">📍</span>
                <span className="jp-section-title">Work Location</span>
              </div>
              <div className="jp-section-divider" />

              <div className="jp-form">
                <div className="jp-row">
                  <div className="jp-field">
                    <label>City / Village</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Oakfield"
                    />
                  </div>
                  <div className="jp-field">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Iowa"
                    />
                  </div>
                </div>

                <div className="jp-field jp-full">
                  <label>Farm Address</label>
                  <input
                    type="text"
                    name="farmAddress"
                    value={formData.farmAddress}
                    onChange={handleChange}
                    placeholder="e.g. 1234 County Road 12, Township Name"
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 5: About the Role ── */}
            <div className="jp-modal-section">
              <div className="jp-section-header">
                <span className="jp-section-icon">📝</span>
                <span className="jp-section-title">About the Role</span>
              </div>
              <div className="jp-section-divider" />

              <div className="jp-form">
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
            </div>

            {/* Modal Action Buttons */}
            <div className="jp-buttons">
              <button
                className="jp-btn light"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button className="jp-btn dark" onClick={(e) => handleSubmit(e)}>
                <i className="fas fa-plus-circle"></i> Publish Job
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editJob && editForm && (
        <div className="jp-modal-overlay" onClick={() => setEditJob(null)}>
          <div className="jp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="jp-modal-close" onClick={() => setEditJob(null)}>✕</button>

            <div className="jp-modal-content">
            <div className="jp-modal-header">
              <div className="icon-wrap">✏️</div>
              <div className="jp-card-header-text">
                <h2>Edit Job</h2>
                <p>Update the job details below</p>
              </div>
            </div>

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
              </div>

              <div className="jp-row">
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
                  <label>Job Category</label>
                  <input type="text" name="jobCategory" value={editForm.jobCategory} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Farm / Company Name</label>
                  <input type="text" name="farmName" value={editForm.farmName} onChange={handleEditChange} />
                </div>
              </div>

              <div className="jp-row">
                <div className="jp-field">
                  <label>Salary Range</label>
                  <input type="text" name="salary" value={editForm.salary} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>Pay Type</label>
                  <select name="payType" value={editForm.payType} onChange={handleEditChange}>
                    <option value="Per Day">Per Day</option>
                    <option value="Per Hour">Per Hour</option>
                    <option value="Per Task">Per Task</option>
                  </select>
                </div>
              </div>

              <div className="jp-row">
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

              <div className="jp-row">
                <div className="jp-field">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} />
                </div>
              </div>

              <div className="jp-row">
                <div className="jp-field">
                  <label>City / Village</label>
                  <input type="text" name="city" value={editForm.city} onChange={handleEditChange} />
                </div>
                <div className="jp-field">
                  <label>State</label>
                  <input type="text" name="state" value={editForm.state} onChange={handleEditChange} />
                </div>
              </div>

              <div className="jp-field jp-full">
                <label>Farm Address</label>
                <input type="text" name="farmAddress" value={editForm.farmAddress} onChange={handleEditChange} />
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
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
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
        {/* HEADER SECTION - REFERENCE LAYOUT */}
        <div className="jp-header">
          {/* Left Section - Brand Block */}
          <div className="jp-header-left">
            <div className="jp-brand">
              <div className="jp-brand-icon">🌾</div>
              <h1 className="jp-brand-title">Job Provider</h1>
            </div>
            <p className="jp-brand-subtitle">Manage and add jobs</p>
          </div>

          {/* Right Section - Actions Row */}
          <div className="jp-header-right">
            {/* Stats Pills */}
            <div className="jp-stats-group">
              <div className="jp-stat-pill">
                <span className="jp-stat-value">{jobPostings.length}</span>
                <span className="jp-stat-label">total jobs</span>
              </div>
              <div className="jp-stat-pill">
                <span className="jp-stat-value">{totalApplicants}</span>
                <span className="jp-stat-label">applicants</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="jp-search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                className="jp-header-search"
                placeholder="Search jobs, location, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Primary Button */}
            <button
              className="jp-primary-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="fas fa-plus"></i>✚ Post Job
            </button>
          </div>
        </div>

        {/* FILTER ROW - Below Header */}
        <div className="jp-filter-row">
          <button 
            className={`jp-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Jobs
          </button>
          <button 
            className={`jp-filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Actively Hiring
          </button>
          <button 
            className={`jp-filter-tab ${activeFilter === 'high' ? 'active' : ''}`}
            onClick={() => setActiveFilter('high')}
          >
            High Wage {">"} ₹600/day
          </button>
        </div>

        {/* JOB POSTINGS LIST */}
        <div className="job-postings-section">
          <div className="job-cards-grid">
            {loadingJobs ? (
              <p style={{ color: "var(--jp-green-muted)", fontSize: "14px" }}>
                Loading job postings...
              </p>
            ) : filteredJobs.length === 0 ? (
              <p style={{ color: "var(--jp-green-muted)", fontSize: "14px" }}>
                {searchQuery ? "No jobs match your search." : "No job postings yet. Click 'Post Job' to create one!"}
              </p>
            ) : (
              filteredJobs.map((job) => (
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