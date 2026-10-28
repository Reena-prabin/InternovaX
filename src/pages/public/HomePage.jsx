import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  InternshipsIcon,
  ProgressIcon,
  MentorIcon,
  CertificateIcon,
  CheckIcon,
  ArrowRightIcon,
  SearchIcon
} from '../../components/Icons.jsx';
import { api } from '../../services/api.js';

export default function HomePage({ onOpenCertificate }) {
  const { login, register } = useAuth();

  const [authMode, setAuthMode] = useState('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [regCompany, setRegCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [certQuery, setCertQuery] = useState('');
  const [certResult, setCertResult] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certSearched, setCertSearched] = useState(false);

  const goToAuth = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');

    document.getElementById('auth-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Email/password login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment,
        company: regCompany
      });
    } catch (err) {
      setErrorMsg(
        err.message || 'Registration failed. Email may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = () => {
    setErrorMsg('');
    window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/google`);
  };

  // GitHub OAuth login
  const handleGitHubLogin = () => {
    setErrorMsg('');
    window.location.assign(`${import.meta.env.VITE_API_URL}/api/auth/github`);
  };

  // Certificate lookup
  const handleVerifyLookup = async (e) => {
    e.preventDefault();

    if (!certQuery.trim()) return;

    setCertLoading(true);
    setCertSearched(true);
    setCertResult(null);

    try {
      const res = await api.verifyCertificate(certQuery.trim());
      setCertResult(res.certificate);
    } catch (err) {
      setCertResult(null);
    } finally {
      setCertLoading(false);
    }
  };

  // Google and GitHub buttons
  const OAuthButtons = () => (
    <div className="oauth-section">
      <div className="oauth-divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <div className="oauth-buttons">
        <button
          type="button"
          className="oauth-btn google-oauth-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.75 7.18l7.73 6C44.43 38.03 46.98 31.88 46.98 24.55z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.89 23.89 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>

          <span>Google</span>
        </button>

        <button
          type="button"
          className="oauth-btn github-oauth-btn"
          onClick={handleGitHubLogin}
          disabled={loading}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 0.9C5.85 0.9 0.9 5.85 0.9 12c0 4.9 3.18 9.06 7.59 10.53.56.1.76-.24.76-.54v-2.1c-3.09.67-3.74-1.31-3.74-1.31-.51-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.65 10.65 0 0 1 5.57 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.07v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 23.1 12C23.1 5.85 18.15.9 12 .9Z"
            />
          </svg>

          <span>GitHub</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="homepage-wrapper">
      {/* Navigation */}
      <header className="home-navbar">
        <div className="home-nav-container">
          <div className="home-brand">
            <img
              src="/internovax-logo.png"
              alt="InternovaX Logo"
              className="home-brand-logo"
            />

            <span className="brand-name">
              InternovaX
              <span className="brand-accent-dot">.</span>
            </span>

            <span className="home-brand-tag">
              INTERNSHIP PLATFORM
            </span>
          </div>

          <nav className="home-nav-links">
            <a href="#features">Features</a>
            <a href="#roles">Ecosystem</a>
            <a href="#verify-section">Verify Certificate</a>
            <a href="#auth-section">Access Portal</a>
          </nav>

          <div className="home-nav-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => goToAuth('signin')}
            >
              Sign In
            </button>

            <button
              type="button"
              className="btn-lime"
              onClick={() => goToAuth('register')}
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="hero-eyebrow-pill">
            <span className="eyebrow-dot" />
            CENTRALIZED INTERNSHIP MANAGEMENT PLATFORM
          </div>

          <h1 className="hero-main-title">
            Streamline Internships from Application to{' '}
            <span className="text-lime-highlight">
              Verified Certification
            </span>
          </h1>

          <p className="hero-subtext">
            A unified MERN-stack platform connecting students,
            companies, faculty mentors, and academic administrators.
            Track weekly progress, conduct mid-term &amp; final
            evaluations, and issue cryptographically verifiable
            digital credentials.
          </p>

          <div className="hero-actions-row">
            <button
              type="button"
              className="btn-lime hero-btn-main"
              onClick={() => goToAuth('register')}
            >
              <span>Create Free Account</span>
              <ArrowRightIcon />
            </button>

            <button
              type="button"
              className="btn-secondary hero-btn-secondary"
              onClick={() => goToAuth('signin')}
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Sign In and Create Account */}
      <section id="auth-section" className="home-auth-section">
        <div className="auth-card-container">
          <div className="auth-card-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${
                authMode === 'signin' ? 'active' : ''
              }`}
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
            >
              Sign In to Account
            </button>

            <button
              type="button"
              className={`auth-tab-btn ${
                authMode === 'register' ? 'active' : ''
              }`}
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
            >
              Create New Account
            </button>
          </div>

          <div className="auth-card-body">
            {errorMsg && (
              <div className="auth-error-banner" role="alert">
                {errorMsg}
              </div>
            )}

            {/* Sign In */}
            {authMode === 'signin' && (
              <form
                onSubmit={handleLoginSubmit}
                className="auth-form"
              >
                <div className="form-group">
                  <label className="form-label">
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-lime auth-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? 'Authenticating...'
                    : 'Sign In to Dashboard'}
                </button>

                <OAuthButtons />

                <div className="auth-switch-text">
                  Don't have an account yet?{' '}

                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                  >
                    Create Account here
                  </button>
                </div>
              </form>
            )}

            {/* Create Account */}
            {authMode === 'register' && (
              <form
                onSubmit={handleRegisterSubmit}
                className="auth-form"
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@organization.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Role</label>

                  <select
                    className="form-control"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="student">
                      Student (Apply &amp; Track Progress)
                    </option>

                    <option value="company">
                      Company / Host Employer (Post &amp; Hire)
                    </option>

                    <option value="mentor">
                      Faculty Mentor (Supervise &amp; Evaluate)
                    </option>

                    <option value="admin">
                      Administrator (Allocate &amp; Issue Credentials)
                    </option>
                  </select>
                </div>

                {regRole === 'student' && (
                  <div className="form-group">
                    <label className="form-label">
                      Academic Department / Major
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science, AI Systems"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                    />
                  </div>
                )}

                {regRole === 'company' && (
                  <div className="form-group">
                    <label className="form-label">
                      Company / Organization Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Apex Robotics Labs"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      required
                    />
                  </div>
                )}

                {regRole === 'mentor' && (
                  <div className="form-group">
                    <label className="form-label">
                      Department / Specialization
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Software Systems Engineering"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-lime auth-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating Account...'
                    : 'Create Account & Enter Dashboard'}
                </button>

                <OAuthButtons />

                <div className="auth-switch-text">
                  Already have an account?{' '}

                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                    }}
                  >
                    Sign In here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="home-features-section">
        <div className="home-section-header">
          <span className="section-eyebrow">
            PLATFORM ARCHITECTURE
          </span>

          <h2 className="section-heading">
            Everything Needed for Modern Internship Governance
          </h2>

          <p className="section-subtext">
            Designed to eliminate fragmented spreadsheets,
            lost emails, and unverified paper evaluations.
          </p>
        </div>

        <div className="features-grid-4">
          <div className="feature-card">
            <div className="feature-icon-circle">
              <InternshipsIcon />
            </div>

            <h3 className="feature-title">
              Smart Matching &amp; Applications
            </h3>

            <p className="feature-desc">
              Automatic skill-matching engine matches candidate
              profiles with verified corporate listings.
              One-click application tracking with real-time
              status updates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-circle">
              <ProgressIcon />
            </div>

            <h3 className="feature-title">
              Weekly Progress Journals
            </h3>

            <p className="feature-desc">
              Structured weekly task logging, blocker
              identification, and supervisor sign-offs.
              Real-time progress rings track completed
              milestones against university graduation criteria.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-circle">
              <MentorIcon />
            </div>

            <h3 className="feature-title">
              Mentor Pairing &amp; Rubrics
            </h3>

            <p className="feature-desc">
              Dynamic mentor allocation matrix. Formal mid-term
              and final performance evaluations graded across
              technical competence, autonomy, and professional
              communication.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-circle">
              <CertificateIcon />
            </div>

            <h3 className="feature-title">
              Tamper-Proof Certificates
            </h3>

            <p className="feature-desc">
              Instant issuance of cryptographic certificates
              with unique registry IDs, SHA-256 verification
              hashes, and public QR lookups that guarantee
              authenticity to employers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Public Certificate Verification */}
      <section
        id="verify-section"
        className="home-verify-section"
      >
        <div className="verify-banner-card">
          <div className="verify-badge">
            VERIFIED CREDENTIAL REGISTRY
          </div>

          <h2 className="verify-title">
            Verify an InternovaX Certificate in Real-Time
          </h2>

          <p className="verify-desc">
            Employers, academic bodies, and recruiters
            can verify any issued certificate instantly
            without signing in.
          </p>

          <form
            onSubmit={handleVerifyLookup}
            className="verify-input-group"
          >
            <input
              type="text"
              className="verify-input"
              placeholder="Enter Certificate ID to verify"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
            />

            <button
              type="submit"
              className="btn-lime"
              disabled={certLoading}
            >
              <SearchIcon />

              <span>
                {certLoading
                  ? 'Verifying...'
                  : 'Verify Credential'}
              </span>
            </button>
          </form>

          {certSearched && certResult && (
            <div className="verify-result-card success">
              <div className="result-header">
                <span className="verified-badge-pill">
                  <CheckIcon /> VALID &amp; AUTHENTIC
                </span>

                <span className="result-cert-id">
                  {certResult.certificateId}
                </span>
              </div>

              <div className="result-body-grid">
                <div>
                  <span className="res-label">RECIPIENT</span>
                  <div className="res-val">
                    {certResult.studentName}
                  </div>
                </div>

                <div>
                  <span className="res-label">INTERNSHIP</span>
                  <div className="res-val">
                    {certResult.internshipTitle}
                  </div>
                </div>

                <div>
                  <span className="res-label">HOST COMPANY</span>
                  <div className="res-val">
                    {certResult.company}
                  </div>
                </div>

                <div>
                  <span className="res-label">GRADE</span>
                  <div className="res-val text-lime">
                    {certResult.grade}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  textAlign: 'right'
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onOpenCertificate?.(certResult)}
                >
                  View Official Digital Certificate
                </button>
              </div>
            </div>
          )}

          {certSearched && !certLoading && !certResult && (
            <div className="verify-result-card not-found">
              No verified certificate found matching ID
              {' "'}{certQuery}{'"'}. Please verify the code format.
            </div>
          )}
        </div>
      </section>

      {/* Roles Ecosystem */}
      <section id="roles" className="home-roles-section">
        <div className="home-section-header">
          <span className="section-eyebrow">
            FOUR INTEGRATED PERSONAS
          </span>

          <h2 className="section-heading">
            Designed for Every Stakeholder
          </h2>
        </div>

        <div className="roles-grid-4">
          <div className="role-showcase-card">
            <div className="role-card-badge student-badge">
              STUDENT
            </div>

            <h4>Internship Seekers</h4>

            <ul>
              <li><CheckIcon /> Browse verified listings</li>
              <li><CheckIcon /> Track application pipeline</li>
              <li><CheckIcon /> Submit weekly progress logs</li>
              <li><CheckIcon /> Receive verified certificate</li>
            </ul>
          </div>

          <div className="role-showcase-card">
            <div className="role-card-badge company-badge">
              COMPANY
            </div>

            <h4>Host Employers</h4>

            <ul>
              <li><CheckIcon /> Publish internship listings</li>
              <li><CheckIcon /> Review applicant profiles</li>
              <li><CheckIcon /> Sign off on weekly milestones</li>
              <li><CheckIcon /> Conduct employer evaluations</li>
            </ul>
          </div>

          <div className="role-showcase-card">
            <div className="role-card-badge mentor-badge">
              MENTOR
            </div>

            <h4>Academic Supervisors</h4>

            <ul>
              <li><CheckIcon /> Supervise assigned students</li>
              <li><CheckIcon /> Review weekly progress reports</li>
              <li><CheckIcon /> Provide technical feedback</li>
              <li><CheckIcon /> Grade mid-term &amp; final rubrics</li>
            </ul>
          </div>

          <div className="role-showcase-card">
            <div className="role-card-badge admin-badge">
              ADMIN
            </div>

            <h4>Department Heads</h4>

            <ul>
              <li><CheckIcon /> Dynamic mentor allocations</li>
              <li><CheckIcon /> Oversee university-wide metrics</li>
              <li><CheckIcon /> Approve certificate issuance</li>
              <li><CheckIcon /> Manage user roles &amp; permissions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-left">
            <div className="footer-brand-row">
              <img
                src="/internovax-logo.png"
                alt="InternovaX Logo"
                className="footer-brand-logo"
              />

              <div className="brand-name">
                InternovaX
                <span className="brand-accent-dot">.</span>
              </div>
            </div>

            <p className="footer-motto">
              The unified standard for modern internship
              lifecycle management and monitoring.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-status-indicator">
              <span className="status-ping" />
              <span>All Systems Operational</span>
            </div>

            <div className="footer-copyright">
              © 2026 InternovaX Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}