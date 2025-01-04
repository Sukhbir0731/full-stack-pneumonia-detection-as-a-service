import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import doctorImage from '../images/doctor.png';

const DoctorPage = () => {
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [doctorName, setDoctorName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Patient information state
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: 'select',
    phone: '',
    remarks: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDoctorNameSubmit = (event) => {
    event.preventDefault();
    if (!doctorName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (password !== 'umbc@123') {
      setError('Invalid password');
      return;
    }
    setShowNamePopup(false);
    setError('');
  };

  const handlePatientInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (files[0]) {
        setPatientInfo(prev => ({
          ...prev,
          file: files[0]
        }));
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    } else {
      setPatientInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    
    // Append all patient information
    Object.keys(patientInfo).forEach(key => {
      if (key === 'file') {
        formData.append('file', patientInfo.file);
      } else {
        formData.append(key, patientInfo[key]);
      }
    });
    
    // Add doctor's name and timestamp
    formData.append('doctorName', doctorName);
    formData.append('timestamp', new Date().toISOString());

    try {
      const response = await axios.post('http://localhost:8000/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigate('/results', {
          state: {
            result: response.data.result,
            imageUrl: previewUrl,
            doctorName: doctorName,
            patientInfo: patientInfo
          }
        });
      } else {
        setError(response.data.error || 'Error processing image');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Doctor Sign-in Form
  if (showNamePopup) {
    return (
      <div className="d-flex align-items-center py-4 bg-dark min-vh-100">
        <main className="form-signin w-100 m-auto" style={{ maxWidth: '330px', padding: '15px' }}>
          <form onSubmit={handleDoctorNameSubmit}>
            <div className="text-center mb-4">
              <img 
                src={doctorImage} 
                alt="Doctor Icon" 
                className="mb-4"
                style={{ width: '72px', height: '72px' }}
              />
              <h1 className="h3 mb-3 fw-normal text-white">Doctor Sign In</h1>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className={`form-control bg-dark text-white ${error ? 'is-invalid' : ''}`}
                id="doctorName"
                placeholder="Your Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
              <label htmlFor="doctorName">Doctor Name</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className={`form-control bg-dark text-white ${error ? 'is-invalid' : ''}`}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
              {error && <div className="invalid-feedback">{error}</div>}
            </div>

            <button className="btn btn-primary w-100 py-2" type="submit">
              Sign In
            </button>

            <p className="mt-5 mb-3 text-center text-white-50">© 2024 Pneumonia Detection</p>
          </form>
        </main>
      </div>
    );
  }

  // Patient Information Form
  return (
    <div className="min-vh-100 bg-dark">
      <div className="row justify-content-center py-5">
        <div className="text-center mb-5">
          <img 
            src={doctorImage} 
            alt="Doctor" 
            className="mb-4 icon"
            style={{ 
              width: '120px', 
              height: '120px', 
              objectFit: 'contain',
              borderRadius: '50%',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <h1 className="display-4 text-white mb-4">Welcome, Dr. {doctorName}</h1>
          <button 
            className="btn btn-outline-light btn-lg px-4"
            onClick={() => navigate(`/patient-history/${doctorName}`)}
          >
            View Patient Records
          </button>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card bg-dark text-white border-light">
              <div className="card-header">
                <h3 className="mb-0">Patient Information</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control bg-dark text-white"
                          id="patientName"
                          name="name"
                          placeholder="Patient Name"
                          value={patientInfo.name}
                          onChange={handlePatientInfoChange}
                          required
                        />
                        <label htmlFor="patientName">Patient Name</label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control bg-dark text-white"
                          id="patientAge"
                          name="age"
                          placeholder="Age"
                          value={patientInfo.age}
                          onChange={handlePatientInfoChange}
                          required
                        />
                        <label htmlFor="patientAge">Age</label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <select
                          className="form-select bg-dark text-white"
                          id="patientGender"
                          name="gender"
                          value={patientInfo.gender}
                          onChange={handlePatientInfoChange}
                          required
                          style={{
                            backgroundColor: '#212529',
                            color: 'white',
                            appearance: 'auto'
                          }}
                        >
                          <option value="select" disabled>Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <label htmlFor="patientGender">Gender</label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="tel"
                          className="form-control bg-dark text-white"
                          id="patientPhone"
                          name="phone"
                          placeholder="Phone Number"
                          value={patientInfo.phone}
                          onChange={handlePatientInfoChange}
                          required
                        />
                        <label htmlFor="patientPhone">Phone Number</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">X-ray Image</label>
                        <input
                          type="file"
                          className="form-control bg-dark text-white"
                          accept="image/*"
                          onChange={handlePatientInfoChange}
                          name="file"
                          required
                        />
                      </div>

                      {previewUrl && (
                        <div className="text-center mb-3">
                          <img
                            src={previewUrl}
                            alt="X-ray Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-outline-light btn-lg px-5"
                      disabled={loading || !patientInfo.file}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Analyze X-ray'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;