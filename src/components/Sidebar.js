// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M3 13h8V3H3v10zm10 8h8v-8h-8v8zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      {/* Example icon for Feedback; adjust the path as needed */}
      <path d="M12 3C7.03 3 3 6.58 3 11c0 1.84.73 3.53 1.93 4.84L3 21l5.34-2.82C9.46 19.93 10.71 20 12 20c4.97 0 9-3.58 9-9s-4.03-9-9-9z" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h14v-2c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-1 .05 1.23.84 2 1.94 2 3.45v2h6v-2c0-2.66-5.33-4-7-4z" />
    </svg>
  );
}

function CampaignsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M22 4H2v16h20V4zm-2 14H4V6h16v12zM9 8h2v5H9V8zm4 0h2v5h-2V8z" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="nav">
        <ul>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-link"
              activeClassName="nav-link-active"
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/feedback"
              className="nav-link"
              activeClassName="nav-link-active"
            >
              <FeedbackIcon />
              <span>Feedback</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/customers"
              className="nav-link"
              activeClassName="nav-link-active"
            >
              <CustomersIcon />
              <span>Customers</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/campaigns"
              className="nav-link"
              activeClassName="nav-link-active"
            >
              <CampaignsIcon />
              <span>Campaigns</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
