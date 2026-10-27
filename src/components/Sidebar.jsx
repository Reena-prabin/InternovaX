
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DashboardIcon,
  InternshipsIcon,
  ApplicationsIcon,
  ProgressIcon,
  MentorIcon,
  MessagesIcon,
  ProfileIcon,
  SettingsIcon,
  LogoutIcon,
  CertificateIcon
} from './Icons.jsx';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) {
  const { user, role, logout } = useAuth();

  const studentMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'internships', label: 'Internships', icon: InternshipsIcon },
    { id: 'applications', label: 'Applications', icon: ApplicationsIcon },
    { id: 'progress', label: 'Progress', icon: ProgressIcon },
    { id: 'mentor', label: 'Mentor', icon: MentorIcon },
    { id: 'messages', label: 'Messages', icon: MessagesIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
  ];

  const companyMenu = [
    { id: 'company_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'manage_internships', label: 'My Listings', icon: InternshipsIcon },
    { id: 'review_applications', label: 'Applicants', icon: ApplicationsIcon },
    { id: 'messages', label: 'Messages', icon: MessagesIcon },
  ];

  const mentorMenu = [
    { id: 'mentor_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'review_reports', label: 'Weekly Reports', icon: ProgressIcon },
    { id: 'evaluations', label: 'Evaluations', icon: CertificateIcon },
    { id: 'messages', label: 'Messages', icon: MessagesIcon },
  ];

  const adminMenu = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'mentor_allocation', label: 'Mentor Allocation', icon: MentorIcon },
    { id: 'all_applications', label: 'Applications', icon: ApplicationsIcon },
    { id: 'certificate_manager', label: 'Certificates', icon: CertificateIcon },
    { id: 'manage_users', label: 'Users & Roles', icon: ProfileIcon },
  ];

  let currentMenu = studentMenu;

  if (role === 'company') currentMenu = companyMenu;
  if (role === 'mentor') currentMenu = mentorMenu;
  if (role === 'admin') currentMenu = adminMenu;

  const handleItemClick = (id) => {
    setActiveTab(id);

    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Brand Header */}
      <div className="brand-section">
        <div className="brand-logo-row">
          <img
            src="/internovax-logo.png"
            alt="InternovaX Logo"
            className="brand-logo"
          />

          <div className="brand-name">
            InternovaX<span className="brand-accent-dot">.</span>
          </div>
        </div>

        <div className="brand-subtitle">
          INTERNSHIP PLATFORM
        </div>
      </div>

      {/* Main Menu Group */}
      <div className="sidebar-nav-group">
        <div className="sidebar-group-title">MAIN MENU</div>

        <ul className="sidebar-menu">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="sidebar-icon" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Credentials */}
      <div className="sidebar-nav-group">
        <div className="sidebar-group-title">CREDENTIALS</div>

        <ul className="sidebar-menu">
          <li>
            <button
              type="button"
              className={`sidebar-link ${
                activeTab === 'verify_certificate' ? 'active' : ''
              }`}
              onClick={() => handleItemClick('verify_certificate')}
            >
              <CertificateIcon className="sidebar-icon" />
              <span>Verify Certificate</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="sidebar-spacer" />

      {/* Account Section */}
      <div
        className="sidebar-nav-group"
        style={{ marginBottom: 12 }}
      >
        <div className="sidebar-group-title">ACCOUNT</div>

        <ul className="sidebar-menu">
          <li>
            <button
              type="button"
              className={`sidebar-link ${
                activeTab === 'settings' ? 'active' : ''
              }`}
              onClick={() => handleItemClick('settings')}
            >
              <SettingsIcon className="sidebar-icon" />
              <span>Settings</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                if (window.innerWidth <= 768 && onClose) {
                  onClose();
                }

                logout();
              }}
            >
              <LogoutIcon className="sidebar-icon" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-user-footer">
        <div className="user-profile-summary">
          <div className="user-avatar-circle lime-avatar">
            {user?.avatar ||
              (user?.name
                ? user.name.substring(0, 2).toUpperCase()
                : 'S')}
          </div>

          <div className="user-meta-text">
            <div className="user-display-name">
              {user?.name || 'Student'}
            </div>

            <div className="user-display-email">
              {user?.email || 'student@internovax.com'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
