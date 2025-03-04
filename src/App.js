// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RetentionCampaignsPage from './components/RetentionCampaignsPage';
import Customers from './components/Customers';
import Feedback from './components/Feedback'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content" style={{ display: 'flex' }}>
          <Sidebar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/campaigns" element={<RetentionCampaignsPage />} />
              <Route path="/customers" element={<Customers />} />
              {/* Add additional routes as needed */}
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
