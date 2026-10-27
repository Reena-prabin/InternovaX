import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReminders, setWeeklyReminders] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="content-area">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Account & System Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Manage your security preferences, notification triggers, and user configurations.
        </p>
      </div>

      {saved && (
        <div style={{ background: 'rgba(183, 255, 60, 0.12)', border: '1px solid var(--accent-lime)', color: 'var(--accent-lime)', padding: '12px 18px', borderRadius: 8, marginBottom: 20 }}>
          Preferences saved successfully!
        </div>
      )}

      <div className="settings-layout-grid">
        {/* Account Info Card */}
        <div className="card-panel">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
            Account Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>ACCOUNT ID</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{user?._id || 'usr_student_1'}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>EMAIL ADDRESS</span>
              <div style={{ fontSize: 13 }}>{user?.email || 'student@internovax.com'}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE ROLE</span>
              <div style={{ fontSize: 13, color: 'var(--accent-lime)', fontWeight: 700, textTransform: 'uppercase' }}>
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="card-panel">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-lime)' }}>
            Notification Triggers
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-lime)' }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>Application Status Alerts</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Receive instant alerts when an application is shortlisted or reviewed.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={weeklyReminders}
                onChange={(e) => setWeeklyReminders(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-lime)' }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>Weekly Progress Report Reminders</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Get automated reminders 3 days before weekly milestone submissions.
                </div>
              </div>
            </label>

            <button type="submit" className="btn-lime" style={{ alignSelf: 'flex-start', marginTop: 10 }}>
              Save Notification Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
