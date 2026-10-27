import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import {
  ApplicationsIcon,
  InternshipsIcon,
  ProgressIcon,
  ProfileIcon,
  CheckIcon,
  ArrowRightIcon
} from '../../components/Icons.jsx';

export default function StudentDashboard({ setActiveTab, onOpenCertificate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 12,
    shortlisted: 4,
    activeInternship: 1,
    profileCompletion: 85,
    weeklyProgress: 78,
    reportsSubmitted: '4/5',
    mentorReviews: '3/4',
    studentSections: {
      personalInfo: true,
      education: true,
      skills: true,
      resume: false
    }
  });

  const [recommended, setRecommended] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    try {
      const [statsRes, internRes, appsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getInternships(),
        api.getApplications()
      ]);

      if (statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (internRes.internships) {
        // Top 3 recommended
        setRecommended(internRes.internships.slice(0, 3));
      }
      if (appsRes.applications) {
        setRecentApplications(appsRes.applications.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate circular SVG progress stroke
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.weeklyProgress / 100) * circumference;

  return (
    <div className="content-area">
      {/* 1. Welcome Section */}
      <section className="welcome-banner">
        <div>
          <h2 className="welcome-title">
            WELCOME BACK, {user?.name ? user.name.toUpperCase() : 'STUDENT'}
          </h2>
          <p className="welcome-description">
            Here's your internship overview. Track applications, monitor progress and discover new opportunities.
          </p>
        </div>
        <button
          type="button"
          className="btn-lime"
          onClick={() => setActiveTab('internships')}
        >
          Find Internships
        </button>
      </section>

      {/* 2. Four Statistic Cards */}
      <section className="stats-grid-4">
        {/* Applications */}
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Applications</span>
            <div className="stat-icon-wrap">
              <ApplicationsIcon className="sidebar-icon" />
            </div>
          </div>
          <div className="stat-number">{stats.applications}</div>
          <div className="stat-footer-text">
            <span className="stat-trend-lime">+2 submitted</span> this week
          </div>
        </div>

        {/* Shortlisted */}
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Shortlisted</span>
            <div className="stat-icon-wrap">
              <CheckIcon />
            </div>
          </div>
          <div className="stat-number">{stats.shortlisted}</div>
          <div className="stat-footer-text">
            <span className="stat-trend-lime">33%</span> match conversion
          </div>
        </div>

        {/* Active Internship */}
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Active Internship</span>
            <div className="stat-icon-wrap">
              <InternshipsIcon className="sidebar-icon" />
            </div>
          </div>
          <div className="stat-number">{stats.activeInternship}</div>
          <div className="stat-footer-text">
            FinTech Cloud Labs
          </div>
        </div>

        {/* Profile Completion */}
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Profile Completion</span>
            <div className="stat-icon-wrap">
              <ProfileIcon className="sidebar-icon" />
            </div>
          </div>
          <div className="stat-number">{stats.profileCompletion}%</div>
          <div className="stat-footer-text">
            <span className="stat-trend-lime">Optimal</span> for top matches
          </div>
        </div>
      </section>

      {/* 3. Dashboard Split Grid: Profile Completion Card + Weekly Progress Card */}
      <section className="dashboard-split-grid">
        {/* Profile Completion Card (Section 9 of user prompt) */}
        <div className="card-panel">
          <div className="card-tag">PROFILE</div>
          <h3 className="card-heading">Profile Completion</h3>
          <p className="card-subtext">
            Complete your profile to improve internship matches.
          </p>

          <div className="profile-percentage-row">
            <span className="profile-large-pct">{stats.profileCompletion}%</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nearly Complete</span>
          </div>

          <div className="progress-track-horizontal">
            <div
              className="progress-fill-lime"
              style={{ width: `${stats.profileCompletion}%` }}
            />
          </div>

          {/* 4 Checklist Sections */}
          <div className="profile-checklist-grid">
            {/* Personal Info */}
            <div className="checklist-item">
              <div className={`checklist-indicator ${stats.studentSections?.personalInfo ? 'completed' : 'pending'}`}>
                {stats.studentSections?.personalInfo ? <CheckIcon /> : '•'}
              </div>
              <div>
                <div className="checklist-title">Personal Info</div>
                <div className="checklist-status-text">
                  {stats.studentSections?.personalInfo ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="checklist-item">
              <div className={`checklist-indicator ${stats.studentSections?.education ? 'completed' : 'pending'}`}>
                {stats.studentSections?.education ? <CheckIcon /> : '•'}
              </div>
              <div>
                <div className="checklist-title">Education</div>
                <div className="checklist-status-text">
                  {stats.studentSections?.education ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="checklist-item">
              <div className={`checklist-indicator ${stats.studentSections?.skills ? 'completed' : 'pending'}`}>
                {stats.studentSections?.skills ? <CheckIcon /> : '•'}
              </div>
              <div>
                <div className="checklist-title">Skills</div>
                <div className="checklist-status-text">
                  {stats.studentSections?.skills ? '9 Added' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="checklist-item">
              <div className={`checklist-indicator ${stats.studentSections?.resume ? 'completed' : 'pending'}`}>
                {stats.studentSections?.resume ? <CheckIcon /> : '•'}
              </div>
              <div>
                <div className="checklist-title">Resume</div>
                <div className="checklist-status-text">
                  {stats.studentSections?.resume ? 'Uploaded' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="card-action-link"
            onClick={() => setActiveTab('profile')}
          >
            <span>Complete profile</span>
            <ArrowRightIcon />
          </button>
        </div>

        {/* Weekly Progress Card (Section 10 of user prompt) */}
        <div className="card-panel">
          <div className="card-tag">CURRENT</div>
          <h3 className="card-heading">Weekly Progress</h3>
          <p className="card-subtext">Active Milestone Tracking</p>

          <div className="weekly-progress-content">
            <div className="circular-progress-wrap">
              <svg className="circular-progress-svg" viewBox="0 0 140 140">
                <circle
                  className="circle-bg"
                  cx="70"
                  cy="70"
                  r={radius}
                />
                <circle
                  className="circle-bar-lime"
                  cx="70"
                  cy="70"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="circular-inner-text">
                <span className="circular-pct">{stats.weeklyProgress}%</span>
                <span className="circular-sub">COMPLETE</span>
              </div>
            </div>

            <div className="weekly-stats-list">
              <div className="weekly-stat-row">
                <span className="weekly-stat-label">Reports submitted</span>
                <span className="weekly-stat-val">{stats.reportsSubmitted}</span>
              </div>
              <div className="weekly-stat-row">
                <span className="weekly-stat-label">Mentor reviews</span>
                <span className="weekly-stat-val">{stats.mentorReviews}</span>
              </div>
              <div className="weekly-stat-row">
                <span className="weekly-stat-label">Next report due</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>In 3 days</span>
              </div>
            </div>

            <button
              type="button"
              className="card-action-link"
              style={{ marginTop: 14 }}
              onClick={() => setActiveTab('progress')}
            >
              <span>View weekly reports</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Skill-Based Recommended Internships Preview */}
      <section style={{ marginBottom: 28 }}>
        <div className="section-header-row">
          <h3 className="section-title">Skill-Based Recommendations For You</h3>
          <button
            type="button"
            className="card-action-link"
            onClick={() => setActiveTab('internships')}
          >
            <span>View all opportunities</span>
            <ArrowRightIcon />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {recommended.map((item) => (
            <div key={item._id} className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className="badge-match-lime">{item.matchScore}% Match</span>
                <span style={{ fontSize: 12, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {item.stipend}
                </span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                {item.title}
              </h4>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {item.company} • {item.location}
              </div>

              <div className="skill-tags-row" style={{ marginBottom: 16 }}>
                {(item.requiredSkills || []).map((skill) => (
                  <span key={skill} className="skill-tag matched">
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Duration: {item.duration}
                </span>
                <button
                  type="button"
                  className="btn-lime"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={() => setActiveTab('internships')}
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Applications Table */}
      <section>
        <div className="section-header-row">
          <h3 className="section-title">Recent Applications</h3>
          <button
            type="button"
            className="card-action-link"
            onClick={() => setActiveTab('applications')}
          >
            <span>View all 12 applications</span>
            <ArrowRightIcon />
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Internship</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Skill Match</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app._id}>
                  <td style={{ fontWeight: 600 }}>{app.internshipTitle}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.company}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{app.appliedDate}</td>
                  <td>
                    <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>
                      {app.matchScore}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status badge-${app.status.toLowerCase().replace(' ', '')}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
