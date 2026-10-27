import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { SearchIcon, CheckIcon } from '../../components/Icons.jsx';

export default function VerifyCertificatePage({ onOpenCertificate }) {
  const [certIdInput, setCertIdInput] = useState('INX-2026-8842');
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    if (e) e.preventDefault();
    if (!certIdInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setVerifiedCert(null);

    try {
      const res = await api.verifyCertificate(certIdInput.trim());
      setVerifiedCert(res.certificate);
    } catch (err) {
      setErrorMsg(err.message || 'Certificate not found in registry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-area">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="certificate-badge-lime" style={{ marginBottom: 12 }}>
            OFFICIAL REGISTRY LOOKUP
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            InternovaX Certificate Verification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, margin: '8px auto 0 auto' }}>
            Verify the authenticity of internship credentials and milestone completion records issued across our partner institutions.
          </p>
        </div>

        {/* Search input card */}
        <div className="card-panel" style={{ padding: 28, marginBottom: 28 }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span className="search-icon-pos" style={{ top: 12 }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Enter Certificate ID e.g. INX-2026-8842"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                style={{ width: '100%', paddingLeft: 38, fontSize: 15 }}
              />
            </div>
            <button
              type="submit"
              className="btn-lime"
              disabled={loading}
              style={{ padding: '0 24px' }}
            >
              {loading ? 'Verifying...' : 'Verify Credential'}
            </button>
          </form>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, display: 'flex', gap: 14 }}>
            <span>Example verified ID: <strong style={{ color: 'var(--accent-lime)' }}>INX-2026-8842</strong></span>
            <span>• Tamper-evident cryptographic ledger</span>
          </div>
        </div>

        {/* Verification Result */}
        {errorMsg && (
          <div style={{ background: 'rgba(224, 83, 83, 0.15)', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: 20, borderRadius: 12, textAlign: 'center', marginBottom: 28 }}>
            <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Verification Failed</h4>
            <p style={{ fontSize: 13 }}>{errorMsg}</p>
          </div>
        )}

        {verifiedCert && (
          <div className="card-panel" style={{ border: '2px solid var(--accent-lime)', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-lime)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-lime)' }}>
                    OFFICIALLY AUTHENTICATED
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Registry Status: VALID & ISSUED
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-lime"
                onClick={() => onOpenCertificate && onOpenCertificate(verifiedCert)}
              >
                View Full Certificate
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, background: '#121212', padding: 20, borderRadius: 10, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>STUDENT NAME</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{verifiedCert.studentName}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>CERTIFICATE ID</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                  {verifiedCert.certificateId}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>INTERNSHIP PROGRAM</span>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{verifiedCert.internshipTitle}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>HOST COMPANY</span>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{verifiedCert.company}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>DURATION</span>
                <div style={{ fontSize: 14 }}>{verifiedCert.duration}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>FINAL EVALUATION SCORE</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
                  {verifiedCert.finalScore} / 100
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Issued by {verifiedCert.issuedBy} on {verifiedCert.completionDate}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
