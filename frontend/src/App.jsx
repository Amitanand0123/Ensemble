import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthCallback from './components/auth/AuthCallback.jsx';
import Navbar from './components/landing/Navbar.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import Footer from './components/landing/Footer.jsx';
import { Login, Registration, ForgotPassword, ResetPassword } from './components/auth/index.js';
import WorkspaceDashboard from './components/workspace/WorkspaceDashboard.jsx';
import WorkspaceDetail from './components/workspace/WorkspaceDetail.jsx';
import CreateWorkspace from './components/workspace/CreateWorkspace.jsx';
import ProjectDetail from './components/project/ProjectDetail.jsx';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import ChatbotButton from './components/chatbot/ChatbotButton.jsx';
import AdminUserList from './components/admin/AdminUserList.jsx';
import AdminRoute from './components/routes/AdminRoute.jsx';
import UserProfile from './components/user/UserProfile.jsx';
import GlobalChatHandler from './components/layout/GlobalChatHandler.jsx';
import MainLayout from './components/layout/MainLayout.jsx';

const authPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback'
];

const LandingPageWrapper = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-16">
        <LandingPage />
      </main>
      <Footer />
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = authPaths.some(path => location.pathname.startsWith(path));
  const isLandingPage = location.pathname === '/';

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {/* --- Landing Page with Navbar --- */}
        <Route
          path="/"
          element={<LandingPageWrapper />}
        />

        {/* --- Auth Pages (no navbar, no sidebar) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* --- Protected Routes with Sidebar --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WorkspaceDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/create"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout>
                  <CreateWorkspace />
                </MainLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WorkspaceDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId/projects/:projectId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout>
                  <AdminUserList />
                </MainLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* --- Redirects & Catch-all --- */}
        <Route path="/workspaces" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global components - only show on authenticated pages with sidebar */}
      {!isAuthPage && !isLandingPage && (
        <>
          <ChatbotButton />
          <GlobalChatHandler />
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
