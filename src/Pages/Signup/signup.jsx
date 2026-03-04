import React, { useState } from 'react';
import './signup.css';
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';


const FarmForceSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'worker'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEmailexist,SetIsEmailexist]=useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%&!$*])[A-Za-z\d@#%&!$*]{8,15}$/;

      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
        "Password must be 8-15 characters and include uppercase, lowercase, number, and special character (@, #, %, &, !, $, *)";
      }
    }

    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
       // ✅ POST REQUEST GOES HERE
      
        try {

          const response = await axios.post(
              "http://localhost:5000/api/auth/signup",
              formData,
              {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
              }
          );

          // ✅ SHOW SUCCESS UI
          setIsSubmitted(true);


        } catch (error) {

          if (error.response?.status === 409) {
              toast.error("Email already exists");
          }
          else if (!error.response) {
              toast.error("Server not responding");
          }

        }
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'worker'
        });
        setIsSubmitted(false);
      }, 10000);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <i className="fas fa-tractor"></i>
          <h1>FarmForce</h1>
        </div>
        
        <h2>Create Your Account</h2>
        <p className="subtitle">Start your journey to smarter farming today</p>
        
        {isSubmitted ? (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h3>Account Created!</h3>
            <p>Welcome to FarmForce, {formData.name}!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Role Selection */}
            <div className="role-selection">
              <label>I am a:</label>
              <div className="role-options">
                <label className={`role-option ${formData.role === 'worker' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="worker"
                    checked={formData.role === 'worker'}
                    onChange={handleChange}
                  />
                  <i className="fas fa-user-tie"></i>
                  <span>Worker</span>
                </label>
                
                <label className={`role-option ${formData.role === 'provider' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={formData.role === 'provider'}
                    onChange={handleChange}
                  />
                  <i className="fas fa-business-time"></i>
                  <span>Job Provider</span>
                </label>
              </div>
            </div>
            
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address
                <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
           

              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password
                <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password
                <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            
            {/* Terms Checkbox */}
            <div className="terms-group">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to FarmForce's Terms of Service and Privacy Policy
              </label>
            </div>
            
            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              Create Account
            </button>
            
            <div className="login-link">
              Already have an account? <Link to="/Login">Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FarmForceSignup;