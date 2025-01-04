import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import patientImage from '../images/patient.png';

const PatientPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an X-ray image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      console.log('Sending request to server...');
      const response = await axios.post('http://localhost:8000/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        navigate('/results', { 
          state: { 
            result: response.data.result,
            imageUrl: previewUrl
          } 
        });
      } else {
        setError(response.data.error || 'Error processing image');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error processing the X-ray image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center min-vh-100 bg-dark">
      <div className="container py-5">
        <div className="text-center mb-4">
          <img 
            src={patientImage} 
            alt="Patient" 
            className="mb-4 icon"
            style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'contain',
              borderRadius: '50%',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <h1 className="display-4 text-white mb-4">X-ray Analysis</h1>
          <p className="lead text-light">Please upload your chest X-ray image for analysis</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card bg-dark text-white border-light">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="file"
                      className="form-control bg-dark text-white"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={loading}
                    />
                  </div>

                  {previewUrl && (
                    <div className="mb-4 text-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-outline-light btn-lg px-5"
                      disabled={!selectedFile || loading}
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

export default PatientPage;