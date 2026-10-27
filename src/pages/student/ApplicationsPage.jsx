import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await api.getApplications({
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(id) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.withdrawApplication(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Application Tracking</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Monitor real-time candidate statuses and employer interview updates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {['All', 'Shortlisted', 'Selected', 'Under Review', 'Applied', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter === status ? 'btn-lime' : 'btn-secondary'}
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Internship Title</th>
              <th>Company</th>
              <th>Applied Date</th>
              <th>Skill Match</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  Loading applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No applications found for this filter.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
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
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '5px 12px' }}
                      onClick={() => {
                        setSelectedApp(app);
                        setModalOpen(true);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Application Record"
          footer={
            <>
              {selectedApp.status === 'Applied' && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleWithdraw(selectedApp._id)}
                >
                  Withdraw Application
                </button>
              )}
              <button
                type="button"
                className="btn-lime"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedApp.internshipTitle}</h3>
                <div style={{ color: 'var(--accent-lime)', fontSize: 13, fontWeight: 600 }}>{selectedApp.company}</div>
              </div>
              <span className={`badge-status badge-${selectedApp.status.toLowerCase().replace(' ', '')}`}>
                {selectedApp.status}
              </span>
            </div>

            <div style={{ background: '#121212', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>APPLIED ON:</span>
                  <div>{selectedApp.appliedDate}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>COMPUTED MATCH:</span>
                  <div style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>{selectedApp.matchScore}%</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                Reviewer Notes:
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: '#181818', padding: 12, borderRadius: 8 }}>
                {selectedApp.notes || 'Your application is progressing normally through the evaluation pipeline.'}
              </p>
            </div>

            {selectedApp.coverLetter && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Submitted Cover Note:
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{selectedApp.coverLetter}"
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
