import React from 'react';
import Modal from './Modal.jsx';

export default function CertificateModal({ certificate, isOpen, onClose }) {
  if (!certificate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Certificate of Completion"
      maxWidth={720}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            className="btn-lime"
            onClick={onClose}
          >
            Done
          </button>
        </>
      }
    >
      <div className="certificate-card">
        <div className="certificate-inner-border">
          <div className="certificate-badge-lime">VERIFIED CREDENTIAL • INTERNOVAX</div>
          
          <h2 className="certificate-title">CERTIFICATE OF APPRECIATION</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
            This officially certifies that
          </div>

          <div className="certificate-recipient">
            {certificate.studentName || 'Student'}
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            has successfully completed all milestones and weekly project obligations for the professional position of
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '14px 0 6px 0' }}>
            {certificate.internshipTitle}
          </div>

          <div style={{ fontSize: 14, color: 'var(--accent-lime)', fontWeight: 600 }}>
            at {certificate.company}
          </div>

          <div className="certificate-details-grid">
            <div>
              <div className="cert-meta-item-label">Duration</div>
              <div className="cert-meta-item-val">{certificate.duration || '12 Weeks'}</div>
            </div>
            <div>
              <div className="cert-meta-item-label">Final Evaluation</div>
              <div className="cert-meta-item-val" style={{ color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                {certificate.finalScore ? `${certificate.finalScore} / 100` : '93.8 / 100'}
              </div>
            </div>
            <div>
              <div className="cert-meta-item-label">Completion Date</div>
              <div className="cert-meta-item-val">{certificate.completionDate || '2026-04-25'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30, paddingTop: 10 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Dr. Sarah Jenkins</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Technical Mentor</div>
              <div style={{ width: 140, height: 1, backgroundColor: '#333333', marginTop: 4 }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '1px solid var(--accent-lime-border)', background: 'rgba(183, 255, 60, 0.05)', padding: '6px 12px', borderRadius: 6, marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--accent-lime)', fontWeight: 800 }}>SECURITY SEAL</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SHA256-AUTHENTICATED</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>InternovaX Directorate</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Academic & Industry Board</div>
              <div style={{ width: 140, height: 1, backgroundColor: '#333333', marginTop: 4, marginLeft: 'auto' }} />
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Certificate ID: <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>{certificate.certificateId}</span> • Public verification available
          </div>
        </div>
      </div>
    </Modal>
  );
}
