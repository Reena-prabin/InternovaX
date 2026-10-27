import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { SearchIcon, BellIcon, MenuIcon } from './Icons.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { api } from '../services/api.js';

export default function Topbar({ activeTab, onSearchChange, searchTerm, sidebarOpen, onToggleSidebar }) {
  const { user, role, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
  }, [user]);

  async function fetchNotificationCount() {
    try {
      const res = await api.getNotifications();
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  }

  const roleTitles = {
    student: 'STUDENT PORTAL',
    company: 'COMPANY PORTAL',
    mentor: 'MENTOR PORTAL',
    admin: 'ADMINISTRATOR PORTAL'
  };

  const pageTitles = {
    dashboard: 'Dashboard',
    internships: 'Explore Internships',
    applications: 'My Applications',
    progress: 'Internship Progress',
    mentor: 'My Mentor',
    messages: 'Direct Messages',
    profile: 'Student Profile',
    settings: 'Account Settings',
    verify_certificate: 'Certificate Registry Verification',
    company_dashboard: 'Company Portal Dashboard',
    manage_internships: 'Internship Postings',
    review_applications: 'Candidate Applications',
    mentor_dashboard: 'Mentor Supervision Dashboard',
    review_reports: 'Review Weekly Reports',
    evaluations: 'Internship Evaluations',
    admin_dashboard: 'Administrator Console',
    mentor_allocation: 'Mentor Allocation Matrix',
    all_applications: 'System Applications',
    certificate_manager: 'Issued Certificates',
    manage_users: 'User Management'
  };

  return (
    <header className="topbar">
      {/* Left side: Toggle button (Open / Close) + Portal breadcrumb and Page title */}
      <div className="topbar-left-group">
        <button
          type="button"
          className={`sidebar-toggle-btn ${!sidebarOpen ? 'is-collapsed' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <MenuIcon />
        </button>

        <div className="topbar-left">
          <span className="portal-breadcrumb">{roleTitles[role] || 'STUDENT PORTAL'}</span>
          <h1 className="page-main-title">{pageTitles[activeTab] || 'Dashboard'}</h1>
        </div>
      </div>

      {/* Right Tools: Search, Role Switcher, Notification Bell, Avatar */}
      <div className="topbar-right">
        {/* Search Bar */}
        <div className="topbar-search-box">
          <span className="search-icon-pos">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search internships, skills..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <BellIcon />
            {unreadCount > 0 && <span className="notif-badge-indicator" />}
          </button>

          {showNotifications && (
            <NotificationDropdown
              onClose={() => {
                setShowNotifications(false);
                fetchNotificationCount();
              }}
            />
          )}
        </div>

        {/* User Avatar Circle */}
        <div className="user-avatar-circle" title={`${user?.name} (${role})`}>
          {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'U')}
        </div>

        {/* Quick Sign Out button to return to HomePage */}
        <button
          type="button"
          className="topbar-signout-btn"
          onClick={logout}
          title="Sign out and return to HomePage"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
