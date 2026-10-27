import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import { CheckIcon, PlusIcon } from '../../components/Icons.jsx';

export default function AdminDashboard({ onOpenCertificate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 18,
    totalCompanies: 6,
    activeInternships: 6,
    pendingApplications: 7,
    activeMentors: 3,
    certificatesIssued: 1
  });

  const [activeSubTab, setActiveSubTab] = useState('allocations'); // allocations | users | certificates
  const [allocations, setAllocations] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual allocation modal
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('usr_student_1');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [user]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [sRes, aRes, mRes, cRes, uRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAllocations(),
        api.getMentors(),
        api.getCertificates(),
        api.getAllUsers()
      ]);
      if (sRes.stats) setStats(sRes.stats);
      if (aRes.allocations) setAllocations(aRes.allocations);
      if (mRes.mentors) {
        setMentors(mRes.mentors);
        if (mRes.mentors.length > 0 && !selectedMentorId) {
          setSelectedMentorId(mRes.mentors[0]._id);
        }
      }
      if (cRes.certificates) setCertificates(cRes.certificates);
      if (uRes.users) setUsers(uRes.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 1-Click Rule-Based Automated Mentor Allocation
  async function handleAutoAllocate() {
    try {
      const res = await api.autoAllocateMentor({
        studentId: selectedStudentId || 'usr_student_1',
        internshipId: 'int_1'
      });
      setNotice(res.message);
      loadAdminData();
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      alert(err.message);
    }
  }

  // Manual allocation
  async function handleManualAllocate(e) {
    e.preventDefault();
    try {
      const res = await api.allocateMentor({
        studentId: selectedStudentId,
        mentorId: selectedMentorId,
        internshipId: 'int_1'
      });
      setAllocModalOpen(false);
      setNotice(res.message);
      loadAdminData();
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="content-area">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">SYSTEM ADMINISTRATOR CONSOLE</h2>
          <p className="welcome-description">
            Complete institutional control: mentor workload balancing, automated matching algorithms, applicant oversight, and credential certification.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAutoAllocate}
          >
            ⚡ Run Auto-Allocation Engine
          </button>
          <button
            type="button"
            className="btn-lime"
            onClick={() => setAllocModalOpen(true)}
          >
            <PlusIcon />
            <span>Assign Mentor</span>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          {notice}
        </div>
      )}

      {/* 6 Stats Summary */}
      <div className="admin-stats-grid">
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Students</span>
          <div className="stat-number" style={{ fontSize: 24 }}>{stats.totalStudents}</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Companies</span>
          <div className="stat-number" style={{ fontSize: 24 }}>{stats.totalCompanies}</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Internships</span>
          <div className="stat-number" style={{ fontSize: 24 }}>{stats.activeInternships}</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Pending Apps</span>
          <div className="stat-number" style={{ fontSize: 24 }}>{stats.pendingApplications}</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Mentors</span>
          <div className="stat-number" style={{ fontSize: 24 }}>{stats.activeMentors}</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <span className="stat-label">Certificates</span>
          <div className="stat-number" style={{ fontSize: 24, color: 'var(--accent-lime)' }}>{stats.certificatesIssued}</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border-card)', paddingBottom: 12 }}>
        <button
          type="button"
          className={activeSubTab === 'allocations' ? 'btn-lime' : 'btn-secondary'}
          onClick={() => setActiveSubTab('allocations')}
        >
          Mentor Allocation Matrix ({allocations.length})
        </button>
        <button
          type="button"
          className={activeSubTab === 'users' ? 'btn-lime' : 'btn-secondary'}
          onClick={() => setActiveSubTab('users')}
        >
          User Registry ({users.length})
        </button>
        <button
          type="button"
          className={activeSubTab === 'certificates' ? 'btn-lime' : 'btn-secondary'}
          onClick={() => setActiveSubTab('certificates')}
        >
          Verified Certificates ({certificates.length})
        </button>
      </div>

      {/* 1. Mentor Allocation Table */}
      {activeSubTab === 'allocations' && (
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>
              Active Student - Mentor Allocations
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Auto-balancing active intern count per mentor (Max 5/mentor)
            </span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assigned Mentor</th>
                  <th>Internship</th>
                  <th>Assigned Date</th>
                  <th>Allocation Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.studentName}</td>
                    <td style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>{a.mentorName}</td>
                    <td>{a.internshipTitle}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.assignedDate}</td>
                    <td>
                      <span style={{ fontSize: 11, background: '#222', padding: '3px 8px', borderRadius: 4 }}>
                        {a.method || 'Manual'}
                      </span>
                    </td>
                    <td>
                      <span className="badge-status badge-selected">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. User Directory */}
      {activeSubTab === 'users' && (
        <div className="card-panel">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
            Registered Users & Role Permissions
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Affiliation / Company</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: u.role === 'admin' ? 'rgba(255, 100, 100, 0.15)' : (u.role === 'student' ? 'rgba(183, 255, 60, 0.15)' : '#222'),
                        color: u.role === 'student' ? 'var(--accent-lime)' : '#fff'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.company || u.department || 'State Institute of Technology'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {u._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Certificates Log */}
      {activeSubTab === 'certificates' && (
        <div className="card-panel">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
            Official Issued Credentials
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Certificate ID</th>
                  <th>Student Name</th>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Issue Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', fontWeight: 700 }}>
                      {c.certificateId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.studentName}</td>
                    <td>{c.internshipTitle}</td>
                    <td>{c.company}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-lime)' }}>
                      {c.finalScore}/100
                    </td>
                    <td style={{ fontSize: 12 }}>{c.completionDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-lime"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => onOpenCertificate && onOpenCertificate(c)}
                      >
                        Inspect Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocate Mentor Modal */}
      <Modal
        isOpen={allocModalOpen}
        onClose={() => setAllocModalOpen(false)}
        title="Manual Mentor Allocation"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setAllocModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-lime"
              onClick={handleManualAllocate}
            >
              Assign Mentor
            </button>
          </>
        }
      >
        <form onSubmit={handleManualAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="usr_student_1">Student (student@internovax.com)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Technical Mentor</label>
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              style={{ width: '100%' }}
            >
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.company} - Active Interns: {m.activeInternsCount || 0}/{m.maxCapacity || 5})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Internship Program</label>
            <input
              type="text"
              value="Full Stack Web Developer Intern"
              disabled
              style={{ width: '100%', opacity: 0.7 }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
