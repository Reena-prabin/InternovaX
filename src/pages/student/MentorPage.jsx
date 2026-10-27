import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { MessagesIcon } from '../../components/Icons.jsx';

export default function MentorPage({ setActiveTab }) {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    loadMentorDetails();
  }, []);

  async function loadMentorDetails() {
    setLoading(true);
    try {
      const [mentorsRes, reportsRes] = await Promise.all([
        api.getMentors(),
        api.getReports()
      ]);

      const primary = (mentorsRes.mentors && mentorsRes.mentors[0]) || null;
      setMentor(primary);

      const reviewed = (reportsRes.reports || []).filter(r => r.mentorReview);
      setRecentReports(reviewed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-area">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Assigned Technical Mentor</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Guidance, weekly milestone reviews, and performance evaluations.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading mentor data...
        </div>
      ) : mentor ? (
        <div className="mentor-layout-grid">
          {/* Mentor Profile Card */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="user-avatar-circle" style={{ width: 64, height: 64, fontSize: 22, borderColor: 'var(--accent-lime)' }}>
                {mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{mentor.name}</h3>
                <div style={{ color: 'var(--accent-lime)', fontSize: 13, fontWeight: 600 }}>{mentor.company}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{mentor.department}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>EMAIL</span>
                <div style={{ color: 'var(--text-primary)', fontSize: 13 }}>{mentor.email}</div>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SUPERVISED INTERNSHIP</span>
                <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                  Full Stack Web Developer Intern
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>MENTOR RATING</span>
                <div style={{ color: 'var(--accent-lime)', fontSize: 13, fontWeight: 700 }}>
                  ★ {mentor.rating || 4.95} / 5.0 (Industry Verified)
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Technical Expertise:
              </div>
              <div className="skill-tags-row">
                {(mentor.expertise || []).map((exp) => (
                  <span key={exp} className="skill-tag matched">
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-lime"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveTab('messages')}
            >
              <MessagesIcon className="sidebar-icon" />
              <span>Send Direct Message</span>
            </button>
          </div>

          {/* Feedback & Review Activity */}
          <div className="card-panel">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              Recent Mentor Feedback & Review Log
            </h3>

            {recentReports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No feedback records available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentReports.map((r) => (
                  <div key={r._id} style={{ background: '#121212', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                        Week {r.week}: {r.title}
                      </span>
                      <span style={{ color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>
                        Score: {r.mentorReview.score}/100
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                      "{r.mentorReview.feedback}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>Reviewed on: {r.mentorReview.reviewedDate}</span>
                      <span style={{ color: 'var(--accent-lime)' }}>Status: Approved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-panel">
          <p style={{ color: 'var(--text-secondary)' }}>No mentor currently assigned.</p>
        </div>
      )}
    </div>
  );
}
