// src/components/ResultsPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl, doctorName, patientInfo } = location.state || {};
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Redirect if no result data
  if (!result) {
    return (
      <div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2>No results available</h2>
          <button 
            className="btn btn-outline-light mt-3"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!remarks.trim()) {
      setError('Please add remarks before saving');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/save-remarks', {
        doctorName,
        patientInfo,
        result,
        remarks
      });

      if (response.data.success) {
        setSaved(true);
      } else {
        setError('Failed to save remarks');
      }
    } catch (err) {
      setError('Error saving remarks');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getBadgeColor = (className) => {
    switch (className) {
      case 'Normal':
        return 'bg-success';
      case 'Bacterial Pneumonia':
        return 'bg-warning text-dark';
      case 'Viral Pneumonia':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="min-vh-100 bg-dark">
      <div className="py-5 row justify-content-center">
        <div className="text-center text-white mb-4">
          <h1 className="display-4 mb-4">Analysis Results</h1>
          {doctorName && (
            <p className="lead">Analysis by Dr. {doctorName}</p>
          )}
        </div>

        <div className="row">
          {/* X-ray Image */}
          <div className="col-md-6 mb-4">
            <div className="card bg-dark text-white border-light h-100">
              <div className="card-header">
                <h3 className="mb-0">X-ray Image</h3>
              </div>
              <div className="card-body text-center">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="X-ray" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '400px' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-md-6 mb-4">
            <div className="card bg-dark text-white border-light h-100">
              <div className="card-header">
                <h3 className="mb-0">Prediction Results</h3>
              </div>
              <div className="card-body">
                {/* Patient Info (Only for doctors) */}
                {doctorName && patientInfo && (
                  <div className="mb-4">
                    <h4>Patient Information</h4>
                    <div className="ps-3">
                      <p className="mb-1"><strong>Name:</strong> {patientInfo.name}</p>
                      <p className="mb-1"><strong>Age:</strong> {patientInfo.age}</p>
                      <p className="mb-1"><strong>Gender:</strong> {patientInfo.gender}</p>
                      <p className="mb-1"><strong>Phone:</strong> {patientInfo.phone}</p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4>Diagnosis</h4>
                  <span className={`badge ${getBadgeColor(result.predicted_class)} px-4 py-2 fs-5`}>
                    {result.predicted_class}
                  </span>
                </div>

                {/* Detailed Results (Only for doctors) */}
                {doctorName && (
                  <>
                    <div className="mb-4">
                      <h4>Confidence</h4>
                      <div className="progress bg-dark border border-light">
                        <div
                          className={`progress-bar ${getBadgeColor(result.predicted_class)}`}
                          style={{ width: `${result.confidence}%` }}
                        >
                          {result.confidence.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4>Class Probabilities</h4>
                      {Object.entries(result.class_probabilities).map(([className, probability]) => (
                        <div key={className} className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>{className}</span>
                            <span>{probability.toFixed(2)}%</span>
                          </div>
                          <div className="progress bg-dark border border-light">
                            <div
                              className={`progress-bar ${getBadgeColor(className)}`}
                              style={{ width: `${probability}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {doctorName && result.heatmap_url && result.predicted_class !== 'Normal' && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card bg-dark text-white border-light">
                <div className="card-header">
                  <h3 className="mb-0">Heatmap Analysis</h3>
                  <small className="text-light opacity-75">
                    Showing affected regions for {result.predicted_class}
                  </small>
                </div>
                <div className="card-body text-center">
                  <img 
                    src={`http://localhost:8000${result.heatmap_url}`}
                    alt="Heatmap" 
                    className="img-fluid rounded"
                  />
                  <p className="text-light mt-3">
                    The highlighted areas indicate regions associated with {result.predicted_class.toLowerCase()} pneumonia patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display message for Normal cases when doctor is viewing */}
        {doctorName && result.predicted_class === 'Normal' && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card bg-dark text-white border-light">
                <div className="card-header">
                  <h3 className="mb-0">Analysis Note</h3>
                </div>
                <div className="card-body text-center">
                  <p className="mb-0">
                    No heatmap is generated for normal X-rays as no pneumonia patterns were detected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor's Remarks Section */}
        {doctorName && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card bg-dark text-white border-light">
                <div className="card-header">
                  <h3 className="mb-0">Doctor's Remarks</h3>
                </div>
                <div className="card-body">
                  <textarea
                    className="form-control bg-dark text-white"
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your remarks about the analysis..."
                    disabled={saving || saved}
                  />
                  
                  {error && (
                    <div className="alert alert-danger mt-3">
                      {error}
                    </div>
                  )}
                  
                  {saved ? (
                    <div className="alert alert-success mt-3">
                      Remarks saved successfully!
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleSave}
                      disabled={saving || !remarks.trim()}
                    >
                      {saving ? 'Saving...' : 'Save Remarks'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-4 mb-5">
          <div className="d-flex justify-content-center gap-3">
            <button 
              className="btn btn-outline-light btn-lg"
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
            
            {doctorName && (
              <>
                <button 
                  className="btn btn-outline-light btn-lg"
                  onClick={() => window.print()}
                >
                  Print Report
                </button>
                
                <button 
                  className="btn btn-outline-light btn-lg"
                  onClick={() => navigate(`/patient-history/${doctorName}`)}
                >
                  View Patient Records
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;