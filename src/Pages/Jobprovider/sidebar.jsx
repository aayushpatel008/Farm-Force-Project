import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaCalendarCheck,FaFileAlt,FaUsers} from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import "./sidebar.css";


const Sidebar = () => {
  const [open, setopen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const togglesidebar = () => {
    setopen(!open);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    // existing logout logic — navigates to "/"
    navigate('/');
    
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className={`Side-bar ${open ? 'expanded' : ''}`}>
        {/* LOGO ROW */}
        <div className="farm-force-name">
          <span className="logo-full">FarmForce</span>
          <button className="sidebar-toggle" onClick={togglesidebar}>
            <FaBars className='sidebar-icon' />
          </button>
        </div>

        <Link to="/jobprovider/jobpDashboard" className='Dashboard'>
          <FaHome className="sidebar-icon" />
          <span className='text'>Dashboard</span>
        </Link>
        <Link to="/jobprovider/jobposting" className='Dashboard'>
          <FaFileAlt className="sidebar-icon" />
          <span className='text'>Job Posting</span>
        </Link>
        <Link to="/jobprovider/attendance" className='Dashboard'>
          <FaCalendarCheck className="sidebar-icon" />
          <span className='text'>Attendance</span>
        </Link>
       <Link to="/jobprovider/Browse" className='Dashboard'>
          <FaUsers className="sidebar-icon" />
          <span className='text'>Browse Workers</span>
        </Link>
          <Link to="/jobprovider/Applicationprovider" className='Dashboard'>
          <FaBriefcase className="sidebar-icon" />
          <span className='text'>Applications</span>
        </Link>
        {/* Logout button — unchanged visually, now opens modal */}
        <button className='logout' onClick={handleLogoutClick}>
          <FiLogOut className="logout-icon" />
          <span className='text'>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="logout-modal-title">Confirm Logout</h2>
            <p className="logout-modal-message">Are you sure you want to logout?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-btn logout-modal-btn--cancel" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button className="logout-modal-btn logout-modal-btn--confirm" onClick={handleConfirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;