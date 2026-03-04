import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';




function Login() {
  const navigate=useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
// Post Request For the server
  async function handleSubmit(e) {
    e.preventDefault();
    try{
          const res = await axios.post(
        "http://localhost:5000/api/auth/login", // ← also fix endpoint
          { email, password },
          {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
        
      );
      // console.log("LOGIN DATA:", res.data);

        // ✅ STORE USER ID HERE
      localStorage.setItem("userId", res.data._id);

    // Optional: store role if needed
      localStorage.setItem("role", res.data.role);
 
      if(res.data.role=="worker"){
        navigate("/worker",{state:{name:res.data.name}})
        
      }
      else {
        navigate("/jobprovider/jobpDashboard")
      }
    }
    catch(error){
      if (error.response?.status === 400) {
            toast.error("Invalid email or password");
      }
      else if (!error.response) {
         toast.error("Invalid email or password");
      }

    }
  

  }

  return (
    <div className="ff-form-page">
      <div className="ff-brand">
      <h1>FarmForce</h1>
        </div>
      <div className="ff-form-card">
        <h2>Welcome to Farmforce</h2>
        <p className="ff-subtitle">Enter your email and password to access your account</p>

        <form onSubmit={handleSubmit}>
          <div className="ff-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="ff-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="ff-forgot-password">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="ff-submit-btn">
            Login
          </button>

          <p className="ff-signup-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
