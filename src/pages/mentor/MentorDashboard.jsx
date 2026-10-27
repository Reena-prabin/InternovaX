import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedStudents: 3,
    pendingReviews: 1,
    reportsSubmitted: 4,
    completedReviews: 3
  });

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);

  // Review state
  const [reviewScore, setReviewScore] = useState(95);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState('Approved');

  // Evaluation state
  const [evalScores, setEvalScores] = useState({
    technicalSkills: 92,
    communication: 90,
    workQuality: 94,
    punctuality: 95,
    overallPerformance: 93
  });
  const [evalFeedback, setEvalFeedback] = useState('Superb diligence and deep technical initiative.');
  const [recommendCertificate, setRecommendCertificate] = useState(true);

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMentorData();
  }, [user]);

  async function loadMentorData() {
    try {
      const [sRes, rRes] = await Promise.all([
        api.getDashboardStats(),
        api.getReports()
      ]);
      if (sRes.stats) setStats(sRes.stats);
      if (rRes.reports) setReports(rRes.reports);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveReview(e) {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await api.reviewReport(selectedReport._id, {
        score: reviewScore,
        feedback: reviewFeedback,
        status: reviewStatus
      });
      setReviewModalOpen(false);
      setSuccessMsg(`Successfully reviewed Week ${selectedReport.week} report!`);
      loadMentorData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveEvaluation(e) {
    e.preventDefault();
    try {
      const res = await api.submitEvaluation({
        studentId: 'usr_student_1',
        scores: evalScores,
        feedback: evalFeedback,
        recommendationForCertificate: recommendCertificate
      });
      setEvaluationModalOpen(false);
      setSuccessMsg(`Final evaluation saved! Calculated final score: ${res.finalScore}/100.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="content-area">
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">MENTOR SUPERVISION DASHBOARD</h2>
          <p className="welcome-description">
            Track student milestones, review submitted weekly reports, provide written technical feedback, and issue final completion evaluations.
          </p>
        </div>
        <button
          type="button"
          className="btn-lime"
          onClick={() => setEvaluationModalOpen(true)}
        >
          Conduct Final Evaluation
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          {successMsg}
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Assigned Students</span>
          </div>
          <div className="stat-number">{stats.assignedStudents}</div>
          <div className="stat-footer-text"><span className="stat-trend-lime">Active</span> under your guidance</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Pending Reviews</span>
          </div>
          <div className="stat-number">{stats.pendingReviews}</div>
          <div className="stat-footer-text">Awaiting your feedback</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Reports Submitted</span>
          </div>
          <div className="stat-number">{stats.reportsSubmitted}</div>
          <div className="stat-footer-text">Total weekly submissions</div>
        </div>

        <div className="stat-card">
          <div className="stat-header-row">
            <span className="stat-label">Completed Reviews</span>
          </div>
          <div className="stat-number">{stats.completedReviews}</div>
          <div className="stat-footer-text"><span className="stat-trend-lime">75%</span> turnaround rate</div>
        </div>
      </div>

      {/* Student Progress Reports Review List */}
      <div className="card-panel">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Student Weekly Submissions Pending Mentor Action
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Week</th>
                <th>Title</th>
                <th>Submitted Date</th>
                <th>Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.studentName || 'Student'}</td>
                  <td>
                    <span style={{ color: 'var(--accent-lime)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      Week {r.week}
                    </span>
                  </td>
                  <td>{r.title}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.submittedDate || 'Pending'}</td>
                  <td>
                    {r.mentorReview ? (
                      <span style={{ color: 'var(--accent-lime)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {r.mentorReview.score}/100
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Not graded</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-status ${r.status === 'Approved' ? 'badge-shortlisted' : 'badge-review'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-lime"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => {
                        setSelectedReport(r);
                        setReviewScore(r.mentorReview ? r.mentorReview.score : 95);
                        setReviewFeedback(r.mentorReview ? r.mentorReview.feedback : 'Great progress on deliverables!');
                        setReviewModalOpen(true);
                      }}
                    >
                      {r.mentorReview ? 'Edit Review' : 'Grade & Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade and Review Modal */}
      {selectedReport && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Review Week ${selectedReport.week}: ${selectedReport.title}`}
          footer={
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setReviewModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-lime"
                onClick={handleSaveReview}
              >
                Save Review
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#121212', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Student Deliverables Completed:
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                {selectedReport.tasksCompleted}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Review Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(parseInt(e.target.value, 10))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  <option value="Approved">Approved</option>
                  <option value="Revision Requested">Revision Requested</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Written Mentor Feedback & Recommendations</label>
              <textarea
                rows={3}
                style={{ width: '100%' }}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Detail technical strengths and areas for next milestone..."
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Conduct Evaluation Modal */}
      <Modal
        isOpen={evaluationModalOpen}
        onClose={() => setEvaluationModalOpen(false)}
        title="Conduct Final Performance Evaluation"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEvaluationModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-lime"
              onClick={handleSaveEvaluation}
            >
              Calculate & Issue Score
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Score the intern across the 5 core evaluation areas. The system automatically computes the weighted composite score and generates the verified certificate record.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Technical Skills (30%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={evalScores.technicalSkills}
                onChange={(e) => setEvalScores({ ...evalScores, technicalSkills: parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Work Quality (25%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={evalScores.workQuality}
                onChange={(e) => setEvalScores({ ...evalScores, workQuality: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Overall Performance (20%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={evalScores.overallPerformance}
                onChange={(e) => setEvalScores({ ...evalScores, overallPerformance: parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Communication (15%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={evalScores.communication}
                onChange={(e) => setEvalScores({ ...evalScores, communication: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Punctuality & Discipline (10%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={evalScores.punctuality}
              onChange={(e) => setEvalScores({ ...evalScores, punctuality: parseInt(e.target.value, 10) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qualitative Assessment</label>
            <textarea
              rows={2}
              style={{ width: '100%' }}
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={recommendCertificate}
              onChange={(e) => setRecommendCertificate(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-lime)' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Recommend for Official InternovaX Completion Certificate
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
