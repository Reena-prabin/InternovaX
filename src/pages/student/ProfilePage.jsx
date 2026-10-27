import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { CheckIcon } from '../../components/Icons.jsx';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    university: '',
    degree: '',
    graduationYear: '',
    gpa: '',
    skillsInput: '',
    resumeUrl: '',
    resumeName: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await api.getProfile();
      const p = res.profile || {};
      setProfile(p);
      setFormData({
        name: user?.name || p.name || 'Student',
        bio: user?.bio || '',
        phone: user?.phone || '+1 (555) 234-5678',
        location: user?.location || 'San Francisco, CA',
        university: p.university || 'State Institute of Technology',
        degree: p.degree || 'B.S. in Computer Science',
        graduationYear: p.graduationYear || '2026',
        gpa: p.gpa || '3.85',
        skillsInput: (p.skills || ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express.js']).join(', '),
        resumeUrl: p.resumeUrl || '',
        resumeName: p.resumeName || 'student_resume_2026.pdf'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await api.updateProfile({
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        university: formData.university,
        degree: formData.degree,
        graduationYear: formData.graduationYear,
        gpa: formData.gpa,
        skills: skillsArray,
        resumeUrl: formData.resumeUrl,
        resumeName: formData.resumeName
      });

      setProfile(res.profile);
      setSaveSuccess(true);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const completionPct = profile?.profileCompletion || 85;

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Student Profile Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Keep your credentials up to date to boost employer algorithm matching scores.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            PROFILE STRENGTH
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-lime)' }}>
            {completionPct}% Complete
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          Profile successfully saved and match matrix re-indexed!
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading profile...
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="profile-layout-grid">
            {/* Left Main Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 1. Personal Information */}
              <div className="card-panel">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
                  1. Personal & Contact Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Bio / Summary</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%' }}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Briefly state your technical aspirations and track..."
                  />
                </div>
              </div>

              {/* 2. Education */}
              <div className="card-panel">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
                  2. Academic Credentials
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">University / College</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree Program</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GPA (Cumulative)</label>
                    <input
                      type="text"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Skills */}
              <div className="card-panel">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
                  3. Technical & Domain Skills
                </h3>

                <div className="form-group">
                  <label className="form-label">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skillsInput}
                    onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                    placeholder="React, JavaScript, Node.js, MongoDB, Express.js..."
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Tip: Add at least 5 skills to trigger maximum match score recommendations.
                  </div>
                </div>

                <div className="skill-tags-row" style={{ marginTop: 10 }}>
                  {formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="skill-tag matched">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Resume & Documents */}
              <div className="card-panel">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
                  4. Resume & Verification Documents
                </h3>

                <div className="form-group">
                  <label className="form-label">Resume Document Name / Identifier</label>
                  <input
                    type="text"
                    value={formData.resumeName}
                    onChange={(e) => setFormData({ ...formData, resumeName: e.target.value })}
                    placeholder="student_resume_2026.pdf"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Online URL / Portfolio Link</label>
                  <input
                    type="text"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="https://github.com/student or portfolio URL"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-lime"
                disabled={saving}
                style={{ padding: '14px 28px', fontSize: 15 }}
              >
                {saving ? 'Updating Profile...' : 'Save Profile Changes'}
              </button>
            </div>

            {/* Right Progress Review Checklist */}
            <div>
              <div className="card-panel" style={{ position: 'sticky', top: 90 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                  Profile Completion Metrics
                </h4>

                <div className="progress-track-horizontal" style={{ marginBottom: 16 }}>
                  <div className="progress-fill-lime" style={{ width: `${completionPct}%` }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="checklist-indicator completed">
                      <CheckIcon />
                    </div>
                    <span>Personal & Contact Info (25%)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="checklist-indicator completed">
                      <CheckIcon />
                    </div>
                    <span>Education Credentials (25%)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="checklist-indicator completed">
                      <CheckIcon />
                    </div>
                    <span>Skills Matrix (25%)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className={`checklist-indicator ${formData.resumeName || formData.resumeUrl ? 'completed' : 'pending'}`}>
                      {formData.resumeName || formData.resumeUrl ? <CheckIcon /> : '•'}
                    </div>
                    <span>Resume Uploaded (25%)</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 20, paddingTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  A completed profile ensures that your applications receive priority shortlisting by partner organizations.
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
