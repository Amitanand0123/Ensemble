import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout/Landing
import Navbar from './components/landing/Navbar.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import Footer from './components/landing/Footer.jsx';

// Auth
import { Login, Registration, ForgotPassword, ResetPassword } from './components/auth/index.js';

// Workspace
import WorkspaceDashboard from './components/workspace/WorkspaceDashboard.jsx';
import WorkspaceDetail from './components/workspace/WorkspaceDetail.jsx'; // Shows Workspace info + Tabs (ProjectList, Members, etc.)
import CreateWorkspace from './components/workspace/CreateWorkspace.jsx';

// Project
import ProjectDetail from './components/project/ProjectDetail.jsx'; // Shows Project info + Tabs (Tasks, Settings, etc.)
// Other project components like TaskBoard, ProjectSettings are likely rendered *within* ProjectDetail via Tabs

// Routing Helper
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import ChatbotButton from './components/chatbot/ChatbotButton.jsx';

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

            {/* --- Redirects & Catch-all --- */}
            {/* Redirect base /workspaces to /dashboard */}
            <Route path="/workspaces" element={<Navigate to="/dashboard" replace />} />
            {/* Catch-all for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>
        <Footer />
        <ChatbotButton/>
      </div>
    </Router>
  );
};

export default App;