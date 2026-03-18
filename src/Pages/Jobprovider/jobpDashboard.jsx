import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "./jobpDashboard.css";
import Sidebar from './sidebar';
import { FiBell } from "react-icons/fi";
import { FaBriefcase, FaUsers, FaHardHat, FaLeaf, FaArrowRight } from "react-icons/fa";
import { FaEdit, FaPause, FaEye } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";

const jobpDashboard = () => {
  const name = localStorage.getItem("name") || "";
  const Firstname = name?.split(" ")[0];
  const initials = name.split(" ")
                  .filter(Boolean)
                  .map(word => word[0])
                  .join("");

  const [jobPostings, setJobPostings] = useState([]);
  const [viewJob,     setViewJob]     = useState(null);
  const [editJob,     setEditJob]     = useState(null);
  const [editForm,    setEditForm]    = useState(null);
  const [pausingId,   setPausingId]   = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/Active/ActiveJobPosting",
        { withCredentials: true }
      );
      setJobPostings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return iso; }
  };

  const statusClass = (status = "") =>
    ({ Active: "active", Filled: "filled", Paused: "paused", Closed: "closed" }[status] || "active");

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
      toast.success("Job updated successfully");
      setEditJob(null);
      setEditForm(null);
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
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
      toast.success("Job paused successfully");
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to pause job");
    } finally {
      setPausingId(null);
    }
  };

  return (
    <div className="dashboard-page">  
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── VIEW MODAL ── */}
      {viewJob && (
        <div className="modal-overlay" onClick={() => setViewJob(null)}>
          <div className="modal-card modal-card-view" onClick={e => e.stopPropagation()}>

            {/* coloured top banner */}
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

              {/* ── row 1: quick-stat chips ── */}
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

              {/* ── Employment Type + Duration ── */}
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

              {/* ── Experience + Deadline ── */}
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

              {/* ── Description (Short Description & Skills) ── */}
              <div className="modal-field modal-field-full">
                <span className="modal-label">Short Description & Skills Required</span>
                <p className="modal-text-block">{viewJob.description || "No description provided."}</p>
              </div>

              {/* ── timestamps ── */}
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

      {/* ── EDIT MODAL ── */}
      {editJob && editForm && (
        <div className="modal-overlay" onClick={() => { setEditJob(null); setEditForm(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Job Posting</h2>
              <button className="modal-close" onClick={() => { setEditJob(null); setEditForm(null); }}>✕</button>
            </div>
            <div className="modal-body">

              {/* Row 1: Job Title + Job Duration */}
              <div className="modal-field">
                <label className="modal-label">Job Title</label>
                <input className="modal-input" type="text" name="title"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Job Duration</label>
                <input className="modal-input" type="text" name="duration"
                  value={editForm.duration}
                  onChange={e => setEditForm(prev => ({ ...prev, duration: e.target.value }))} />
              </div>

              {/* Row 2: Employment Type + Workers Needed */}
              <div className="modal-field">
                <label className="modal-label">Employment Type</label>
                <select className="modal-input" name="employmentType"
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
                <input className="modal-input" type="number" name="workersNeeded"
                  value={editForm.workersNeeded}
                  onChange={e => setEditForm(prev => ({ ...prev, workersNeeded: e.target.value }))} />
              </div>

              {/* Row 3: Location + Salary Range */}
              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input className="modal-input" type="text" name="location"
                  value={editForm.location}
                  onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Salary Range</label>
                <input className="modal-input" type="text" name="salaryRange"
                  value={editForm.salaryRange}
                  onChange={e => setEditForm(prev => ({ ...prev, salaryRange: e.target.value }))} />
              </div>

              {/* Row 4: Experience Required + Application Deadline */}
              <div className="modal-field">
                <label className="modal-label">Experience Required</label>
                <input className="modal-input" type="text" name="experienceRequired"
                  value={editForm.experienceRequired}
                  onChange={e => setEditForm(prev => ({ ...prev, experienceRequired: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Application Deadline</label>
                <input className="modal-input" type="date" name="applicationDeadline"
                  value={editForm.applicationDeadline}
                  onChange={e => setEditForm(prev => ({ ...prev, applicationDeadline: e.target.value }))} />
              </div>

              {/* Row 5: Short Description & Skills — full width */}
              <div className="modal-field modal-field-full">
                <label className="modal-label">Short Description & Skills Required</label>
                <textarea className="modal-input modal-textarea" name="description"
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

      {/* ── SEARCH BAR — with bell + avatar ── */}
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
              Welcome back, {Firstname}🌾
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
            <div className="state-number">8</div>
            <p className="stat-growth"><span className="growth-up">↑ +2</span> this week</p>
          </div>

          <div className="state-card">
            <div className="state-header">Total Applicants</div>
            <div className="state-icon"><FaUsers className="icon" /></div>
            <div className="state-number">28</div>
            <p className="stat-growth"><span className="growth-up">↑ +12</span> new today</p>
          </div>

          <div className="state-card">
            <div className="state-header">Hired Workers</div>
            <div className="state-icon"><FaHardHat className="icon" /></div>
            <div className="state-number">6</div>
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
            {jobPostings.length === 0 ? (
              <>
                <tr>
                  <td><strong>Fruit Pickers [10]</strong></td>
                  <td>Oct 1, 2024</td>
                  <td>12 applicants</td>
                  <td><span className="status-badge active">Active</span></td>
                  <td><div className="action-buttons">
                    <button className="icon-btn"><FaEdit /></button>
                    <button className="icon-btn"><FaPause /></button>
                    <button className="icon-btn"><FaEye /></button>
                  </div></td>
                </tr>
                <tr>
                  <td><strong>Tractor Operator</strong></td>
                  <td>Oct 3, 2024</td>
                  <td>5 applicants</td>
                  <td><span className="status-badge active">Active</span></td>
                  <td><div className="action-buttons">
                    <button className="icon-btn"><FaEdit /></button>
                    <button className="icon-btn"><FaPause /></button>
                    <button className="icon-btn"><FaEye /></button>
                  </div></td>
                </tr>
                <tr>
                  <td><strong>Livestock Handler</strong></td>
                  <td>Oct 5, 2024</td>
                  <td>3 applicants</td>
                  <td><span className="status-badge active">Active</span></td>
                  <td><div className="action-buttons">
                    <button className="icon-btn"><FaEdit /></button>
                    <button className="icon-btn"><FaPause /></button>
                    <button className="icon-btn"><FaEye /></button>
                  </div></td>
                </tr>
                <tr>
                  <td><strong>Irrigation Specialist</strong></td>
                  <td>Sep 28, 2024</td>
                  <td>8 applicants</td>
                  <td><span className="status-badge filled">Filled</span></td>
                  <td><div className="action-buttons">
                    <button className="icon-btn"><FaEdit /></button>
                    <button className="icon-btn"><FaPause /></button>
                    <button className="icon-btn"><FaEye /></button>
                  </div></td>
                </tr>
              </>
            ) : (
              jobPostings.slice(0, 4).map((job) => {
                const jobId     = job._id;
                const isPausing = pausingId === jobId;
                const isPaused  = (job.status || "").toLowerCase() === "paused";
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
                          onClick={() => handleEdit(job)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`icon-btn ${isPaused ? "icon-btn-paused" : ""}`}
                          title={isPaused ? "Already paused" : "Pause"}
                          disabled={isPausing || isPaused}
                          onClick={() => handlePause(jobId)}
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
              })
            )}
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

          <div className="recent-card">
            <div className="recent-top">
              <div className="avatar">JM</div>
              <div>
                <h4>Juan Martinez</h4>
                <p className="role">Fruit Picker</p>
                <span className="match">92% Match</span>
              </div>
            </div>
            <div className="skills">
              <span>Harvesting</span>
              <span>Pruning</span>
              <span>5+ years exp</span>
            </div>
            <div className="recent-actions">
              <button className="btn-view">View</button>
              <button className="btn-light">Message</button>
              <button className="btn-light">Interview</button>
            </div>
          </div>

          <div className="recent-card">
            <div className="recent-top">
              <div className="avatar">SC</div>
              <div>
                <h4>Sarah Chen</h4>
                <p className="role">Tractor Operator</p>
                <span className="match">88% Match</span>
              </div>
            </div>
            <div className="skills">
              <span>Tractor License</span>
              <span>Maintenance</span>
              <span>CDL</span>
            </div>
            <div className="recent-actions">
              <button className="btn-view">View</button>
              <button className="btn-light">Message</button>
              <button className="btn-light">Interview</button>
            </div>
          </div>

          <div className="recent-card">
            <div className="recent-top">
              <div className="avatar">MO</div>
              <div>
                <h4>Michael Okafor</h4>
                <p className="role">Livestock Handler</p>
                <span className="match">85% Match</span>
              </div>
            </div>
            <div className="skills">
              <span>Animal Care</span>
              <span>Feeding</span>
              <span>3+ years exp</span>
            </div>
            <div className="recent-actions">
              <button className="btn-view">View</button>
              <button className="btn-light">Message</button>
              <button className="btn-light">Interview</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default jobpDashboard;