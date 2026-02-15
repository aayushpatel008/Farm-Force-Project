import { useState } from 'react'
import Navbar from './navbar'
import Hero from './hero'
import About from './about'
import Login from "./Login";
import Footer from './Footer'
import FarmForceSignup from './signup'
import { Routes,Route } from "react-router-dom";
import './App.css'
import Features from './Feature';
import HowItWorks from './Howitworks';
import Benefits from './Benefits';
import Worker from "./worker";
import Jobprovider from "./jobprovider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
        <Route path="/worker" element={<Worker />} />
        <Route path="/jobprovider" element={<Jobprovider/>}/>

    </Routes>
    
    </>
  )
}

export default App
