import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import Modal from '../../components/Modal.jsx';
import { CheckIcon, PlusIcon, CertificateIcon } from '../../components/Icons.jsx';

export default function ProgressPage({ onOpenCertificate }) {
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    week: 5,
    title: '',
    tasksCompleted: '',
    challenges: '',
    learning: '',
    nextWeekPlan: '',
    documentName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    setLoading(true);
    try {
      const [repRes, evalRes, certRes] = await Promise.all([
        api.getReports(),
        api.getEvaluations(),
        api.getCertificates()
      ]);
      setReports(repRes.reports || []);
      setEvaluations(evalRes.evaluations || []);
      setCertificates(certRes.certificates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReport(e) {
    e.preventDefault();
    if (!formData.title || !formData.tasksCompleted) {
      alert('Please fill out the report title and completed tasks');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitReport(formData);
      setStatusMsg(`Week ${formData.week} report submitted successfully for mentor review!`);
      setSubmitModalOpen(false);
      setFormData({
        week: formData.week + 1,
        title: '',
        tasksCompleted: '',
        challenges: '',
        learning: '',
        nextWeekPlan: '',
        documentName: ''
      });
      loadProgress();
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const activeEvaluation = evaluations[0] || null;
  const activeCertificate = certificates[0] || null;

  return (
    <div className="content-area">
      {/* Header and Current Internship Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Internship Progress & Weekly Milestones</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Active Internship: <strong style={{ color: 'var(--accent-lime)' }}>FinTech Cloud Labs</strong> — Full Stack Web Developer Intern
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {activeCertificate && (
            <button
              type="button"
              className="btn-lime"
              onClick={() => onOpenCertificate && onOpenCertificate(activeCertificate)}
            >
              <CertificateIcon className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
          )}

          <button
            type="button"
            className="btn-lime"
            onClick={() => setSubmitModalOpen(true)}
          >
            <PlusIcon />
            <span>Submit Weekly Report</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      {/* Progress Cards: Evaluation summary */}
      {activeEvaluation && (
        <div className="card-panel" style={{ marginBottom: 24, borderLeft: '4px solid var(--accent-lime)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="card-tag">FINAL EVALUATION COMPLETED</span>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>
                Performance Assessment by {activeEvaluation.evaluatorName}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>FINAL COMPOSITE SCORE</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                {activeEvaluation.finalScore} / 100
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, background: '#121212', padding: 14, borderRadius: 8, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>TECHNICAL SKILLS</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>{activeEvaluation.scores?.technicalSkills}/100</div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>WORK QUALITY</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>{activeEvaluation.scores?.workQuality}/100</div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>OVERALL PERF.</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>{activeEvaluation.scores?.overallPerformance}/100</div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>COMMUNICATION</span>
              <div style={{ fontWeight: 700 }}>{activeEvaluation.scores?.communication}/100</div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>PUNCTUALITY</span>
              <div style={{ fontWeight: 700 }}>{activeEvaluation.scores?.punctuality}/100</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            "{activeEvaluation.feedback}"
          </p>
        </div>
      )}

      {/* Weekly Reports Timeline & Table */}
      <div className="card-panel">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Weekly Submission History</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Report Title</th>
                <th>Submission Date</th>
                <th>Document</th>
                <th>Reviewer Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No reports submitted yet.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                        Week {r.week}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {r.submittedDate || 'Pending'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {r.documentName ? (
                        <span style={{ color: 'var(--accent-lime)' }}>📄 {r.documentName}</span>
                      ) : (
                        'None attached'
                      )}
                    </td>
                    <td>
                      {r.mentorReview ? (
                        <span style={{ fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                          {r.mentorReview.score}/100
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Awaiting Review</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status ${r.status === 'Approved' ? 'badge-shortlisted' : (r.status === 'Submitted' ? 'badge-review' : 'badge-applied')}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => setSelectedReport(r)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Week ${selectedReport.week}: ${selectedReport.title}`}
          footer={
            <button
              type="button"
              className="btn-lime"
              onClick={() => setSelectedReport(null)}
            >
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Tasks Completed:
              </span>
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
                {selectedReport.tasksCompleted || 'N/A'}
              </p>
            </div>

            {selectedReport.challenges && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Challenges Encountered:
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedReport.challenges}
                </p>
              </div>
            )}

            {selectedReport.learning && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Key Learnings:
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedReport.learning}
                </p>
              </div>
            )}

            {selectedReport.nextWeekPlan && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Next Week Plan:
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedReport.nextWeekPlan}
                </p>
              </div>
            )}

            {/* Mentor Review Box */}
            {selectedReport.mentorReview ? (
              <div style={{ background: '#121212', border: '1px solid rgba(183, 255, 60, 0.25)', padding: 14, borderRadius: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-lime)' }}>
                    Review by {selectedReport.mentorReview.mentorName}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-lime)' }}>
                    Score: {selectedReport.mentorReview.score}/100
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  "{selectedReport.mentorReview.feedback}"
                </p>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Reviewed on: {selectedReport.mentorReview.reviewedDate}
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, background: '#161616', borderRadius: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                Pending review from technical mentor.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Submit Report Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Weekly Progress Report"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSubmitModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-lime"
              disabled={submitting}
              onClick={handleSubmitReport}
            >
              {submitting ? 'Submitting...' : 'Submit to Mentor'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Week #</label>
              <input
                type="number"
                min="1"
                max="24"
                style={{ width: '100%' }}
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input
                type="text"
                placeholder="e.g. Database Indexing & API Migration"
                style={{ width: '100%' }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work & Tasks Completed</label>
            <textarea
              rows={3}
              style={{ width: '100%' }}
              placeholder="Detail specific deliverables and PRs completed this week..."
              value={formData.tasksCompleted}
              onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technical Challenges Faced</label>
            <input
              type="text"
              placeholder="e.g. Cross-origin cookies, async race conditions..."
              style={{ width: '100%' }}
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Learnings & Takeaways</label>
            <input
              type="text"
              placeholder="e.g. Mastered MongoDB aggregation pipelines..."
              style={{ width: '100%' }}
              value={formData.learning}
              onChange={(e) => setFormData({ ...formData, learning: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Plan For Next Week</label>
            <input
              type="text"
              placeholder="e.g. Finalize load tests and prepare deployment script..."
              style={{ width: '100%' }}
              value={formData.nextWeekPlan}
              onChange={(e) => setFormData({ ...formData, nextWeekPlan: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attached Document / Artifact Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. week5_architecture_design.pdf"
              style={{ width: '100%' }}
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
