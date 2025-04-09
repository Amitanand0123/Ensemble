// --- START OF FILE frontend/src/App.jsx ---

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback.jsx';
import Navbar from './components/landing/Navbar.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import Footer from './components/landing/Footer.jsx';
import { Login, Registration, ForgotPassword, ResetPassword } from './components/auth/index.js';
import WorkspaceDashboard from './components/workspace/WorkspaceDashboard.jsx';
import WorkspaceDetail from './components/workspace/WorkspaceDetail.jsx'; // Shows Workspace info + Tabs (ProjectList, Members, etc.)
import CreateWorkspace from './components/workspace/CreateWorkspace.jsx';
import ProjectDetail from './components/project/ProjectDetail.jsx'; // Shows Project info + Tabs (Tasks, Settings, etc.)
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import ChatbotButton from './components/chatbot/ChatbotButton.jsx';
import AdminUserList from './components/admin/AdminUserList.jsx';
import AdminRoute from './components/routes/AdminRoute.jsx';
import UserProfile from './components/user/UserProfile.jsx'; // Import UserProfile
import GlobalChatHandler from './components/layout/GlobalChatHandler.jsx';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white"> {/* Consistent background */}
        <Navbar />
        <main className="flex-grow pt-20"> {/* Adjust pt value based on Navbar height */}
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* --- Protected Routes --- */}

            {/* Main Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WorkspaceDashboard />
                </ProtectedRoute>
              }
            />

            {/* Create Workspace */}
            <Route
              path="/workspaces/create"
              element={
                <ProtectedRoute>
                  <CreateWorkspace />
                </ProtectedRoute>
              }
            />

            {/* Workspace Detail Page - Renders ONLY workspace info */}
            <Route
              path="/workspaces/:workspaceId"
              element={
                <ProtectedRoute>
                  {/* This component now only shows the workspace card, its tabs (ProjectList, Members, Files, Settings, Chat) */}
                  <WorkspaceDetail />
                </ProtectedRoute>
              }
            />

            {/* Project Detail Page - Renders ONLY project info */}
            {/* This is now a SEPARATE top-level protected route */}
            <Route
              path="/workspaces/:workspaceId/projects/:projectId"
              element={
                <ProtectedRoute>
                  {/* This component shows the project card, its tabs (Tasks, Files, Settings, Chat) */}
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />

             {/* User Profile Route */}
             <Route
                path="/profile/:userId" // Use :userId param, can be 'me' or an actual ID
                element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                }
             />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute> {/* Ensure logged in */}
                  <AdminRoute>   {/* Ensure is admin */}
                    <AdminUserList />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            {/* --- Redirects & Catch-all --- */}
            {/* Redirect base /workspaces to /dashboard */}
            <Route path="/workspaces" element={<Navigate to="/dashboard" replace />} />
             {/* Redirect base /profile to /profile/me */}
             <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
            {/* Catch-all for unmatched routes */}
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
// --- END OF FILE frontend/src/App.jsx ---