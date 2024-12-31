import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientHistory = () => {
  const { doctorName } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        console.log('Fetching records for:', doctorName);
        const response = await axios.get(`http://localhost:8000/api/doctor/patients/${doctorName}`);
        console.log('Response from server:', response.data);

        if (response.data.success) {
          setRecords(response.data.patients);
          console.log('Set records:', response.data.patients);
        } else {
          setError('Failed to fetch records');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error fetching patient records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [doctorName]);

  if (loading) {
    return (
      <div className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-white py-5 ">
      <div className="row justify-content-center">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>     Patient Records - Dr. {doctorName}</h1>
          <button 
            className="btn btn-outline-light"
            onClick={() => navigate('/doctor')}
          >
            Back to Patient Form
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {records.length === 0 ? (
          <div className="text-center py-5">
            <h3>No patient records found</h3>
          </div>
        ) : (
          <div className="row">
            {records.map((record, index) => (
              <div key={index} className="col-md-6 mb-4">
                <div className="card bg-dark text-white border-light">
                  <div className="card-header">
                    <h5 className="mb-0">
                      {record.patient_info?.name || 'Unknown Patient'}
                    </h5>
                    <small className="text-light opacity-75">
                      {new Date(record.timestamp).toLocaleString()}
                    </small>
                  </div>
                  <div className="card-body">
                    <p><strong>Age:</strong> {record.patient_info?.age}</p>
                    <p><strong>Gender:</strong> {record.patient_info?.gender}</p>
                    <p><strong>Phone:</strong> {record.patient_info?.phone}</p>
                    <p><strong>Diagnosis:</strong> {record.diagnosis?.predicted_class}</p>
                    {record.diagnosis?.confidence && (
                      <p><strong>Confidence:</strong> {record.diagnosis.confidence.toFixed(2)}%</p>
                    )}
                    {record.remarks && (
                      <p><strong>Remarks:</strong> {record.remarks}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;