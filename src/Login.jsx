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
        "http://localhost:5000/login", // ← also fix endpoint
          { email, password },
          {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
        
      );
      console.log("FULL RESPONSE:", res);
 
      if(res.data.role=="worker"){
        navigate("/worker",{state:{name:res.data.name}})
        
      }
      else {
        navigate("/jobprovider",{state:{name:res.data.name}})
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
      <div className="ff-form-card">
        <h2>Login to FarmForce</h2>
        <p className="ff-subtitle">Access your FarmForce account</p>

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
