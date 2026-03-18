
import React from "react";
import Sidebar1 from "./Sidebar";
import "./worker.css";
import WorkerProfile from "./Profile/profile";
// icons
import { FaBriefcase } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaHourglassHalf } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaLeaf } from "react-icons/fa";
import { FaFireAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

function WorkerDashboard() {
  const name = localStorage.getItem("name");
  const Firstname=name?.split(" ")[0];
  const initials = name.split(" ")
                  .map(word => word[0])
                  .join("");
                  
  return (
    <div className="worker-dashboard-container">

      {/* Sidebar */}
      <Sidebar1 />

      {/* Main Content */}
      <div className="worker-dashboard-main">

        {/* Top Bar */}
        <div className="worker-topbar">
          <div className="worker-topbar-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, farms, locations..."
              className="worker-dashboard-search-input"
            />
          </div>
          <div className="worker-topbar-actions">
            <div className="notif-btn">
              <FaBell />
              <span className="notif-dot"></span>
            </div>
            <div className="worker-avatar">
              <span>{initials}</span>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="worker-dashboard-welcome">
          <div className="welcome-text-block">
            <div className="welcome-tag"><FaLeaf /> Farmworker Dashboard</div>
            <h2 className="worker-dashboard-welcome-title">
              Good Morning, {Firstname}👋
            </h2>
            <p className="worker-dashboard-welcome-subtext">
              You have <strong>2 active jobs</strong> and <strong>1 pending application</strong> awaiting review.
            </p>
            <div className="welcome-cta-row">
              <button className="welcome-cta-primary">Browse New Jobs <FaArrowRight /></button>
              <Link to="/Worker/Profile/profile">
                  <button className="welcome-cta-secondary">My Applications</button>
              </Link>
            </div>
          </div>
          <div className="welcome-illustration">
            <div className="welcome-illustration-inner">
              <div className="illus-circle c1"></div>
              <div className="illus-circle c2"></div>
              <div className="illus-circle c3"></div>
              <span className="illus-emoji">🌾</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="worker-dashboard-stats">
          <div className="worker-dashboard-stat-card card-accent-1">
            <div className="worker-dashboard-stat-content">
              <h3 className="worker-dashboard-stat-number">2</h3>
              <p className="worker-dashboard-stat-label">Active Jobs</p>
              <span className="stat-trend up">↑ 1 this week</span>
            </div>
            <div className="worker-dashboard-stat-icon">
              <FaBriefcase />
            </div>
          </div>

          <div className="worker-dashboard-stat-card card-accent-2">
            <div className="worker-dashboard-stat-content">
              <h3 className="worker-dashboard-stat-number">10</h3>
              <p className="worker-dashboard-stat-label">Completed Jobs</p>
              <span className="stat-trend up">↑ 2 this month</span>
            </div>
            <div className="worker-dashboard-stat-icon">
              <FaCheckCircle />
            </div>
          </div>

          <div className="worker-dashboard-stat-card card-accent-3">
            <div className="worker-dashboard-stat-content">
              <h3 className="worker-dashboard-stat-number">1</h3>
              <p className="worker-dashboard-stat-label">Pending Applications</p>
              <span className="stat-trend neutral">→ Under review</span>
            </div>
            <div className="worker-dashboard-stat-icon">
              <FaHourglassHalf />
            </div>
          </div>

          <div className="worker-dashboard-stat-card card-accent-4">
            <div className="worker-dashboard-stat-content">
              <h3 className="worker-dashboard-stat-number">15</h3>
              <p className="worker-dashboard-stat-label">Total Applications</p>
              <span className="stat-trend up">↑ 5 this season</span>
            </div>
            <div className="worker-dashboard-stat-icon">
              <FaClipboardList />
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="worker-dashboard-columns">

          {/* Left: Active Jobs Table */}
          <div className="worker-dashboard-table-section">
            <div className="section-header">
              <h3 className="worker-dashboard-section-title">Active Job Postings</h3>
              <button className="see-all-btn">See All <FaArrowRight /></button>
            </div>

            <div className="worker-dashboard-table-container">
              <table className="worker-dashboard-jobs-table">
                <thead>
                  <tr>
                    <th>Farm</th>
                    <th>Role</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="farm-cell">
                        <div className="farm-avatar av1">GV</div>
                        <span>Green Valley Farm</span>
                      </div>
                    </td>
                    <td>Fruit Picker <span className="job-count">[10]</span></td>
                    <td><span className="date-badge"><FaCalendarAlt /> Oct 1, 2024</span></td>
                    <td><span className="status-badge active">Active</span></td>
                    <td><button className="action-btn view-details">Details</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="farm-cell">
                        <div className="farm-avatar av2">SF</div>
                        <span>Sunrise Fields</span>
                      </div>
                    </td>
                    <td>Tractor Operator <span className="job-count">[5]</span></td>
                    <td><span className="date-badge"><FaCalendarAlt /> Oct 3, 2024</span></td>
                    <td><span className="status-badge active">Active</span></td>
                    <td><button className="action-btn view-details">Details</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="farm-cell">
                        <div className="farm-avatar av3">MB</div>
                        <span>Meadow Brook</span>
                      </div>
                    </td>
                    <td>Livestock Handler <span className="job-count">[3]</span></td>
                    <td><span className="date-badge"><FaCalendarAlt /> Oct 5, 2024</span></td>
                    <td><span className="status-badge active">Active</span></td>
                    <td><button className="action-btn view-details">Details</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="farm-cell">
                        <div className="farm-avatar av4">HF</div>
                        <span>Happy Fields</span>
                      </div>
                    </td>
                    <td>Irrigation Specialist <span className="job-count">[8]</span></td>
                    <td><span className="date-badge"><FaCalendarAlt /> Sep 28, 2024</span></td>
                    <td><span className="status-badge filled">Filled</span></td>
                    <td><button className="action-btn view-details">Details</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="worker-right-column">

            {/* Profile Completion */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h4>Profile Strength</h4>
                <span className="profile-pct">75%</span>
              </div>
              <div className="profile-bar-track">
                <div className="profile-bar-fill" style={{width: '75%'}}></div>
              </div>
              <p className="profile-tip">Add your certifications to reach <strong>100%</strong> and get more job offers!</p>
              <button className="profile-complete-btn">Complete Profile →</button>
            </div>

            {/* Recommended Jobs */}
            <div className="recommended-section">
              <div className="section-header">
                <h3 className="worker-dashboard-section-title">Recommended For You</h3>
              </div>
              <div className="rec-jobs-list">
                <div className="rec-job-card">
                  <div className="rec-job-top">
                    <div className="rec-job-icon">🌿</div>
                    <div className="rec-job-info">
                      <p className="rec-job-title">Vineyard Pruner</p>
                      <p className="rec-job-farm"><FaMapMarkerAlt /> Orchard Hills Farm</p>
                    </div>
                    <span className="rec-job-pay">$18/hr</span>
                  </div>
                  <div className="rec-job-tags">
                    <span className="rec-tag">Outdoor</span>
                    <span className="rec-tag">Full-time</span>
                    <span className="rec-tag hot"><FaFireAlt /> Hot</span>
                  </div>
                </div>
                <div className="rec-job-card">
                  <div className="rec-job-top">
                    <div className="rec-job-icon">🐄</div>
                    <div className="rec-job-info">
                      <p className="rec-job-title">Dairy Farm Assistant</p>
                      <p className="rec-job-farm"><FaMapMarkerAlt /> Clover Meadows</p>
                    </div>
                    <span className="rec-job-pay">$16/hr</span>
                  </div>
                  <div className="rec-job-tags">
                    <span className="rec-tag">Livestock</span>
                    <span className="rec-tag">Part-time</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Application Updates */}
        <div className="worker-dashboard-updates-section">
          <div className="section-header">
            <h3 className="worker-dashboard-section-title">Application Updates</h3>
            <button className="see-all-btn">View All <FaArrowRight /></button>
          </div>

          <div className="updates-grid">
            <div className="update-card update-approved">
              <div className="update-icon-wrap">✅</div>
              <div className="update-content">
                <p className="update-title">Application Approved</p>
                <p className="update-desc">Green Valley Farm approved your application for <strong>Fruit Picker</strong>.</p>
                <span className="update-time">2 hours ago</span>
              </div>
              <button className="update-action-btn">View →</button>
            </div>
            <div className="update-card update-review">
              <div className="update-icon-wrap">📋</div>
              <div className="update-content">
                <p className="update-title">Under Review</p>
                <p className="update-desc">Happy Fields is currently reviewing your <strong>Irrigation Specialist</strong> application.</p>
                <span className="update-time">1 day ago</span>
              </div>
              <button className="update-action-btn">View →</button>
            </div>
            <div className="update-card update-new">
              <div className="update-icon-wrap">⭐</div>
              <div className="update-content">
                <p className="update-title">New Match Found</p>
                <p className="update-desc">A new job matching your skills was posted at <strong>Sunrise Fields</strong>.</p>
                <span className="update-time">Just now</span>
              </div>
              <button className="update-action-btn">Apply →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkerDashboard;