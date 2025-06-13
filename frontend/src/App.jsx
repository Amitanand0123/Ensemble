import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import VerifyEmail from './components/auth/VerifyEmail.jsx';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* --- Protected Routes --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WorkspaceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces/create"
              element={
                <ProtectedRoute>
                  <AdminRoute> {/* Only admins can access the dedicated create page */}
                    <CreateWorkspace />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces/:workspaceId"
              element={
                <ProtectedRoute>
                  <WorkspaceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces/:workspaceId/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
             <Route
                path="/profile/:userId"
                element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                }
             />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminUserList />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            {/* --- Redirects & Catch-all --- */}
            <Route path="/workspaces" element={<Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatbotButton/>
        <GlobalChatHandler/>
      </div>
    </Router>
  );
};

export default App;