import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorImage from '../images/doctor.png';

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    doctorName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Add your signup logic here
    try {
      // API call for signup
      navigate('/doctor');
    } catch (error) {
      setError('Error creating account');
    }
  };

  return (
    <div className="d-flex align-items-center py-4 bg-dark min-vh-100">
      <main className="form-signin w-100 m-auto" style={{ maxWidth: '330px', padding: '15px' }}>
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <img 
              src={doctorImage} 
              alt="Doctor Icon" 
              className="mb-4 icon"
            />
            <h1 className="h3 mb-3 fw-normal text-white">Create Doctor Account</h1>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-dark text-white"
              name="doctorName"
              placeholder="Doctor Name"
              value={formData.doctorName}
              onChange={handleChange}
              required
            />
            <label>Doctor Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="tel"
              className="form-control bg-dark text-white"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label>Phone Number</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control bg-dark text-white"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Create Password</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control bg-dark text-white"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <label>Confirm Password</label>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button className="btn btn-primary w-100 py-2" type="submit">
            Create Account
          </button>

          <p className="mt-5 mb-3 text-center text-white-50">© 2024 Pneumonia Detection</p>
        </form>
      </main>
    </div>
  );
};

export default DoctorSignup;



/*
                        <div className="mt-4 text-center" style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '15px',
                        borderRadius: '10px',
                        backdropFilter: 'blur(5px)',
                        maxWidth: '300px',
                        margin: '20px auto'
                        }}>
                            <p style={{ 
                                color: 'white', 
                                fontSize: '1.1rem',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                marginBottom: '10px'
                            }}>
                                Don't have an account?
                            </p>
                            <button 
                                className="btn btn-outline-light"
                                onClick={() => navigate('/signup')}
                                style={{
                                    border: '2px solid white',
                                    padding: '8px 20px',
                                    fontWeight: '500',
                                    boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                                }}
                            >
                            Create Account
                            </button>
                        </div>

*/