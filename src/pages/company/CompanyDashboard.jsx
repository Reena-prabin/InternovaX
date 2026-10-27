import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import { PlusIcon, CheckIcon } from '../../components/Icons.jsx';

export default function CompanyDashboard({ activeTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 3,
    totalApplicants: 12,
    shortlisted: 4,
    selectedInterns: 1
  });

  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New internship form state
  const [newInternship, setNewInternship] = useState({
    title: '',
    location: 'Remote',
    type: 'Full-time',
    stipend: '₹35,000 / month',
    duration: '12 Weeks',
    deadline: '2026-03-15',
    description: '',
    requiredSkills: 'React, Node.js, JavaScript, MongoDB',
    eligibility: 'CS / IT students'
  });

  useEffect(() => {
    loadCompanyData();
  }, [user]);

  async function loadCompanyData() {
    setLoading(true);
    try {
      const [sRes, iRes, aRes] = await Promise.all([
        api.getDashboardStats(),
        api.getInternships(),
        api.getApplications()
      ]);
      if (sRes.stats) setStats(sRes.stats);
      if (iRes.internships) setInternships(iRes.internships);
      if (aRes.applications) setApplications(aRes.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInternship(e) {
    e.preventDefault();
    try {
      await api.createInternship(newInternship);
      setCreateModalOpen(false);
      setNewInternship({
        title: '',
        location: 'Remote',
        type: 'Full-time',
        stipend: '₹35,000 / month',
        duration: '12 Weeks',
        deadline: '2026-03-15',
        description: '',
        requiredSkills: 'React, Node.js, JavaScript, MongoDB',
        eligibility: 'CS / IT students'
      });
      loadCompanyData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateStatus(appId, newStatus) {
    try {
      await api.updateApplicationStatus(appId, newStatus, `Updated by ${user?.name || 'Company'}`);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      loadCompanyData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="content-area">
      {/* Banner */}
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">COMPANY RECRUITMENT PORTAL</h2>
          <p className="welcome-description">
            Manage your corporate internship postings, review candidate skill matches, and coordinate candidate shortlisting.
          </p>
        </div>
        <button
          type="button"
          className="btn-lime"
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusIcon />
          <span>Post New Internship</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Active Listings</span>
          </div>
          <div className="stat-number">{stats.activeListings}</div>
          <div className="stat-footer-text">Published positions</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Total Applicants</span>
          </div>
          <div className="stat-number">{stats.totalApplicants}</div>
          <div className="stat-footer-text"><span className="stat-trend-lime">Verified</span> student profiles</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Shortlisted</span>
          </div>
          <div className="stat-number">{stats.shortlisted}</div>
          <div className="stat-footer-text">In interview rounds</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Selected Interns</span>
          </div>
          <div className="stat-number">{stats.selectedInterns}</div>
          <div className="stat-footer-text"><span className="stat-trend-lime">Onboarded</span> with mentor</div>
        </div>
      </div>

      {/* Candidate Applications Review */}
      <div className="card-panel" style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Applicant Screening & Decision Queue
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Internship</th>
                <th>Applied Date</th>
                <th>Skill Match</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td style={{ fontWeight: 600 }}>{app.studentName}</td>
                  <td>{app.internshipTitle}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{app.appliedDate}</td>
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
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {app.status !== 'Shortlisted' && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status !== 'Selected' && (
                        <button
                          type="button"
                          className="btn-lime"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(app._id, 'Selected')}
                        >
                          Select
                        </button>
                      )}
                      {app.status !== 'Rejected' && (
                        <button
                          type="button"
                          className="btn-danger"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Internship Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Internship Opportunity"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-lime"
              onClick={handleCreateInternship}
            >
              Publish Opportunity
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateInternship} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Position Title</label>
            <input
              type="text"
              placeholder="e.g. Full Stack Cloud Engineer Intern"
              value={newInternship.title}
              onChange={(e) => setNewInternship({ ...newInternship, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                placeholder="e.g. Remote / Bengaluru / Hyderabad"
                value={newInternship.location}
                onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                value={newInternship.type}
                onChange={(e) => setNewInternship({ ...newInternship, type: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Stipend (Monthly)</label>
              <input
                type="text"
                placeholder="e.g. ₹35,000 / month"
                value={newInternship.stipend}
                onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                value={newInternship.duration}
                onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (Comma-separated for matching)</label>
            <input
              type="text"
              value={newInternship.requiredSkills}
              onChange={(e) => setNewInternship({ ...newInternship, requiredSkills: e.target.value })}
              placeholder="React, JavaScript, Node.js, MongoDB"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Responsibilities</label>
            <textarea
              rows={3}
              value={newInternship.description}
              onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })}
              placeholder="Outline project scope and technical mentoring environment..."
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
