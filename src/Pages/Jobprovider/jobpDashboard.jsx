import React from 'react'
import { Link } from 'react-router-dom'
import "./jobpDashboard.css";
import Sidebar from './sidebar';
import { FiLogOut } from "react-icons/fi";
import { FaBriefcase, FaUsers, FaHardHat, FaHome } from "react-icons/fa";
import { FaEdit, FaPause, FaEye } from "react-icons/fa";
import { FaClipboardList, FaArrowRight } from "react-icons/fa";

const jobpDashboard = () => {
  return (
    <div className="dashboard-page">
      <Sidebar />

      {/* Search Bar — fixed top, aligned after sidebar */}
      <div className="search-bar">
        <input type="text" placeholder="Search jobs, applicants, or workers..." />
      </div>

      <div className="container">

        {/* ── GREETING BANNER ── */}
        <div className="greeting">
          <div className="greeting-sp">
            <div className="greeting-header">
              Welcome back, Green Valley Farm! 🌾
            </div>
            <div className="greeting-text">
              Your harvest season is approaching. We've found 12 new qualified workers for your fruit picking positions.
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

          {/* Card 1 */}
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

          {/* Card 2 */}
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

          {/* Card 3 */}
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