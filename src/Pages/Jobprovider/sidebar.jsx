import React from 'react'
import { Link } from 'react-router-dom';
import { FaHome, FaClipboardList } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import "./sidebar.css";   // ✅ sidebar has its own CSS

const Sidebar = () => {
  return (
    <div className='Side-bar'>
      <div className="farm-force-name">FarmForce</div>

      <Link to="/jobprovider/jobpDashboard" className='Dashboard'>
        <FaHome className="sidebar-icon" />
        Home
      </Link>

      <Link to="/jobprovider/jobposting" className='Dashboard'>
        <FaClipboardList className="sidebar-icon" />
        Job Posting
      </Link>

      <Link to="/jobprovider/attendance" className='Dashboard'>
        <FaClipboardList className="sidebar-icon" />
        Attendance
      </Link>

      <Link to='/' className='logout'>
        <FiLogOut className="logout-icon" />
        Logout
      </Link>
    </div>
  )
}

export default Sidebar;