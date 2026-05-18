import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaFileAlt, FaUsers } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaUsersCog } from "react-icons/fa";



const Sidebar1 = () => {
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
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className={`Side-bar ${open ? 'expanded' : ''}`}>
        <div className="farm-force-name">
          <span className="logo-full">FarmForce</span>
          <button className="sidebar-toggle" onClick={togglesidebar}>
            <FaBars className='sidebar-icon' />
          </button>
        </div>

        <Link to="/worker" className='Dashboard'>
          <FaHome className="sidebar-icon" />
          <span className='text'>Home</span>
        </Link>

        <Link to="/Worker/Profile/profile" className='Dashboard'>
          <FaFileAlt className="sidebar-icon" />
          <span className='text'>Job Application</span>
        </Link>

        <Link to="/Worker/Browse/BrowseWorker" className='Dashboard'>
          <FaUsers className="sidebar-icon" />
          <span className='text'>Browse Jobs</span>
        </Link>
        <Link to="/Worker/Application/ApplicationWorker" className='Dashboard'>
          <FaBriefcase className="sidebar-icon" />
          <span className='text'>My Applications</span>
        </Link>

        <Link to="/Worker/Workspace/Workerworkspace" className='Dashboard'>
          <FaUsersCog className="sidebar-icon" />
          <span className='text'>Workspace</span>
        </Link>

        <button className='logout' onClick={handleLogoutClick}>
          <FiLogOut className="logout-icon" />
          <span className='text'>Logout</span>
        </button>
      </div>

      {showLogoutModal && (
        <div className="logout-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <FiLogOut />
            </div>
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

export default Sidebar1;