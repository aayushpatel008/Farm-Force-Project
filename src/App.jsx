import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* ---------- Components ---------- */
import Navbar from "./components/Navbar/navbar";
import Hero from "./components/Hero/hero";
import Footer from "./components/Footer/Footer";
import Features from "./components/Feature/Feature";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Benefits from "./components/Benefits/Benefits";

import { useState } from 'react'

/* ---------- Pages ---------- */
import Login from "./Pages/Login/Login";
import FarmForceSignup from "./Pages/Signup/Signup";
import  WorkerHome from "./Pages/Worker/worker";

/* ---------- Job Provider Pages ---------- */
import JobpDashboard from "./Pages/Jobprovider/jobpDashboard";
import Jobposting from './Pages/Jobprovider/jobposting';
import Attendance from "./Pages/Jobprovider/attendance";
import BrowseWorkers from "./Pages/Jobprovider/Browse";
// Worker
import WorkerProfile from "./Pages/Worker/Profile/profile";
import WorkerAttendance from "./Pages/Worker/Attendance/Attendance";
import Browsejob from "./Pages/Worker/Browse/BrowseWorker";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* Tostify Notification */}
    <ToastContainer
         position="top-right"
          autoClose={7000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
      />

      {/* Routes */}
    <Routes>
      {/* Home Page */}
      <Route path ="/" 
      element={
         <>
        <Navbar/>
        <Hero/>
        <Features/>
        <HowItWorks/>
        <Benefits/>
        <Footer/>
        </>
        }
       
        />
        {/* Signup */}
        <Route  path="/Signup"
        element={<FarmForceSignup/>}
        />

        
   
        {/* Login*/}
        <Route path='/Login' element={<Login />}/>
        <Route path="/worker" element={<WorkerHome/>} />
        <Route path="/jobprovider/jobpDashboard" element={<JobpDashboard />} />
        <Route path="/jobprovider/jobposting" element={<Jobposting/>}/>
        <Route path="/jobprovider/Browse" element={<BrowseWorkers/>}/>
        <Route path='/jobprovider/attendance' element={<Attendance/>}/>
        <Route path='/Worker/Profile/profile' element={<WorkerProfile/>}/>
        <Route path='/Worker/Attendance/Attendance' element={<WorkerAttendance/>}/>
        <Route path="Worker/Browse/BrowseWorker" element={<Browsejob/>}/>


    </Routes>
    
    </>
  )
}

export default App
