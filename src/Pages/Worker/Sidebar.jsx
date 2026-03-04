import React from 'react'
import { Link } from 'react-router-dom';
import { FaHome, FaClipboardList } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
const Sidebar1 = () => {
  return (
    <div className='Side-bar'>
      <div className="farm-force-name">FarmForce</div>

      <Link to="/worker"className='Dashboard'>
        <FaHome className="sidebar-icon" />
        Home
      </Link>

      <Link to="/Worker/Profile/profile" className='Dashboard'>
        <FaClipboardList className="sidebar-icon" />
        Job Application
      </Link>

      <Link to="/" className='Dashboard'>
        <FaClipboardList className="sidebar-icon" />
        Attendance
      </Link>

      <Link to='/'className='logout'>
        <FiLogOut className="logout-icon" />
        Logout
      </Link>
    </div>
  )
}

export default Sidebar1;