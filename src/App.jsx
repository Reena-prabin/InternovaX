import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import CertificateModal from './components/CertificateModal.jsx';

// Public Landing / Home Page
import HomePage from './pages/public/HomePage.jsx';

// Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import InternshipsPage from './pages/student/InternshipsPage.jsx';
import ApplicationsPage from './pages/student/ApplicationsPage.jsx';
import ProgressPage from './pages/student/ProgressPage.jsx';
import MentorPage from './pages/student/MentorPage.jsx';
import MessagesPage from './pages/student/MessagesPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';
import SettingsPage from './pages/student/SettingsPage.jsx';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage.jsx';

// Role Dashboards
import CompanyDashboard from './pages/company/CompanyDashboard.jsx';
import MentorDashboard from './pages/mentor/MentorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function AppContent() {
  const { user, loading, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Sidebar open/close state: simple toggle for both laptop and mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inx_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth > 768;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('inx_sidebar_open', String(next));
      return next;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    localStorage.setItem('inx_sidebar_open', 'false');
  };

  // Automatically sync dashboard tab when role is toggled
  useEffect(() => {
    if (role === 'company' && activeTab === 'dashboard') {
      setActiveTab('company_dashboard');
    } else if (role === 'mentor' && activeTab === 'dashboard') {
      setActiveTab('mentor_dashboard');
    } else if (role === 'admin' && activeTab === 'dashboard') {
      setActiveTab('admin_dashboard');
    } else if (role === 'student' && ['company_dashboard', 'mentor_dashboard', 'admin_dashboard'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role]);

  function handleSearchChange(term) {
    setSearchTerm(term);
    if (term.trim() && activeTab !== 'internships') {
      setActiveTab('internships');
    }
  }

  // If initial auth is verifying
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            InternovaX<span style={{ color: 'var(--accent-lime)' }}>.</span>
          </div>
          <div style={{ fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Initializing Internship Platform...
          </div>
        </div>
      </div>
    );
  }

  // 1. If NOT signed in: Show Home Page with Sign In & Create Account
  if (!user) {
    return (
      <>
        <HomePage onOpenCertificate={(cert) => setViewingCertificate(cert)} />
        {viewingCertificate && (
          <CertificateModal
            certificate={viewingCertificate}
            isOpen={Boolean(viewingCertificate)}
            onClose={() => setViewingCertificate(null)}
          />
        )}
      </>
    );
  }

  // 2. If SIGNED IN: Render current active view in Dashboard
  function renderView() {
    switch (activeTab) {
      // Student views
      case 'dashboard':
        return (
          <StudentDashboard
            setActiveTab={setActiveTab}
            onOpenCertificate={(cert) => setViewingCertificate(cert)}
          />
        );
      case 'internships':
      case 'manage_internships':
        return <InternshipsPage />;
      case 'applications':
      case 'all_applications':
        return <ApplicationsPage />;
      case 'progress':
        return (
          <ProgressPage
            onOpenCertificate={(cert) => setViewingCertificate(cert)}
          />
        );
      case 'mentor':
        return <MentorPage setActiveTab={setActiveTab} />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;

      // Public verification
      case 'verify_certificate':
        return (
          <VerifyCertificatePage
            onOpenCertificate={(cert) => setViewingCertificate(cert)}
          />
        );

      // Company views
      case 'company_dashboard':
      case 'review_applications':
        return <CompanyDashboard activeTab={activeTab} />;

      // Mentor views
      case 'mentor_dashboard':
      case 'review_reports':
      case 'evaluations':
        return <MentorDashboard />;

      // Admin views
      case 'admin_dashboard':
      case 'mentor_allocation':
      case 'certificate_manager':
      case 'manage_users':
        return (
          <AdminDashboard
            onOpenCertificate={(cert) => setViewingCertificate(cert)}
          />
        );

      default:
        return (
          <StudentDashboard
            setActiveTab={setActiveTab}
            onOpenCertificate={(cert) => setViewingCertificate(cert)}
          />
        );
    }
  }

  return (
    <div className="app-container">
      {/* Backdrop overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Collapsible Sidebar without visible side scrollbar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className={`main-wrapper ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Topbar
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <main>
          {renderView()}
        </main>
      </div>

      {/* Reusable Certificate Modal */}
      {viewingCertificate && (
        <CertificateModal
          certificate={viewingCertificate}
          isOpen={Boolean(viewingCertificate)}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
