import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import doctorImage from '../images/doctor.png';
import patientImage from '../images/patient.png';

const HomePage = () => {
    const navigate = useNavigate();  // Initialize useNavigate hook

    return (
        <div className="w-100 min-vh-100 home-background">
            <div className="row justify-content-center m-0">
                <div className="col-md-8 text-center my-5">
                    <div className="header-section p-4 mb-5">
                        <h1 className="text-white mb-3 main-title">
                            Welcome to Pneumonia Detection
                        </h1>
                        <p className="lead text-white mb-0 subtitle">
                            Our tool helps in detecting pneumonia from X-ray images. Please select your role to proceed:
                        </p>
                    </div>

                    <div className="d-flex justify-content-center gap-5 mt-5">
                        <Link to="/patient" className="role-button text-decoration-none">
                            <div className="circular-button d-flex flex-column align-items-center">
                                <img src={patientImage} alt="Patient" className="role-icon mb-3" />
                                <span className="role-text">Patient</span>
                            </div>
                        </Link>

                        <Link to="/doctor" className="role-button text-decoration-none">
                            <div className="circular-button d-flex flex-column align-items-center">
                                <img src={doctorImage} alt="Doctor" className="role-icon mb-3" />
                                <span className="role-text">Doctor</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;