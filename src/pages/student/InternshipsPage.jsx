import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import { SearchIcon, CheckIcon } from '../../components/Icons.jsx';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadInternships();
  }, [typeFilter]);

  async function loadInternships() {
    setLoading(true);
    try {
      const res = await api.getInternships({
        type: typeFilter !== 'All' ? typeFilter : undefined,
        search: search || undefined
      });
      setInternships(res.internships || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadInternships();
  }

  async function handleApply() {
    if (!selectedInternship) return;
    setApplyLoading(true);
    setErrorMsg('');
    try {
      await api.apply({
        internshipId: selectedInternship._id,
        coverLetter
      });
      setSuccessMsg(`Successfully applied for "${selectedInternship.title}"!`);
      setApplyModalOpen(false);
      setCoverLetter('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <div className="content-area">
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Available Internship Opportunities</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Explore verified industry positions with automatic skill match ranking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} className="topbar-search-box">
            <span className="search-icon-pos">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="search-input"
              style={{ width: 240 }}
              placeholder="Search title, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px 14px' }}
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(224, 83, 83, 0.15)', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      {/* Grid of Internships */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading internships...
        </div>
      ) : internships.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-secondary)' }}>No internships found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {internships.map((item) => (
            <div key={item._id} className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span className="badge-match-lime">
                    {item.matchScore}% Match
                  </span>
                  {item.isRecommended && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent-lime)', fontWeight: 700, textTransform: 'uppercase' }}>
                      ★ Recommended for you
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {item.stipend}
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                {item.title}
              </h3>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {item.company} • {item.location} ({item.type})
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                {item.description.length > 130 ? item.description.substring(0, 130) + '...' : item.description}
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Required Skills:
                </div>
                <div className="skill-tags-row">
                  {(item.requiredSkills || []).map((skill) => (
                    <span key={skill} className="skill-tag matched">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Deadline: {item.deadline || 'Rolling'}
                </span>
                <button
                  type="button"
                  className="btn-lime"
                  onClick={() => {
                    setSelectedInternship(item);
                    setApplyModalOpen(true);
                  }}
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internship Details & Application Modal */}
      {selectedInternship && (
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={selectedInternship.title}
          maxWidth={640}
          footer={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setApplyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-lime"
                disabled={applyLoading}
                onClick={handleApply}
              >
                {applyLoading ? 'Submitting...' : 'Confirm Application'}
              </button>
            </>
          }
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-lime)' }}>
                {selectedInternship.company}
              </span>
              <span className="badge-match-lime">
                {selectedInternship.matchScore}% Skill Match
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#121212', padding: 14, borderRadius: 8, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>LOCATION:</span>
                <div style={{ fontWeight: 600 }}>{selectedInternship.location}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>DURATION:</span>
                <div style={{ fontWeight: 600 }}>{selectedInternship.duration}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>COMPENSATION:</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-lime)' }}>{selectedInternship.stipend}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>APPLICATION DEADLINE:</span>
                <div style={{ fontWeight: 600 }}>{selectedInternship.deadline}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Description
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedInternship.description}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Eligibility
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {selectedInternship.eligibility}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Personal Statement / Cover Letter Note (Optional)
              </label>
              <textarea
                rows={3}
                style={{ width: '100%' }}
                placeholder="Mention why your skills make you a stellar candidate..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}