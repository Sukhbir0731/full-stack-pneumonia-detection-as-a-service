import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import DoctorPage from './components/DoctorPage';
import PatientPage from './components/PatientPage';
import ResultsPage from './components/ResultsPage';
import PatientHistory from './components/PatientHistory';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/patient" element={<PatientPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/patient-history/:doctorName" element={<PatientHistory />} />
      </Routes>
    </Router>
  );
}


export default App;
