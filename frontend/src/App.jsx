import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Landing components
import Navbar from './components/landing/Navbar.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import Footer from './components/landing/Footer.jsx';

// Auth components
import { Login, Registration, ForgotPassword, ResetPassword } from './components/auth/index.js';

// Dashboard & Workspace components
import WorkspaceDashboard from './components/workspace/WorkspaceDashboard.jsx';
import { 
  WorkspaceDetail, 
  CreateWorkspace, 
  WorkspaceSettings  
} from './components/workspace/index.js';

// Project components
import {
  ProjectDetail,
  CreateTask,
  TaskBoard,
  ProjectSettings,
} from './components/project/index.js';

// Chat components
import { ChatWindow } from './components/chat/index.js';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Dashboard Route */}
            <Route path="/dashboard" element={<WorkspaceDashboard />} />

            {/* Workspace Routes */}
            <Route path="/workspaces">
                <Route index element={<WorkspaceDashboard />} />
                <Route path="create" element={<CreateWorkspace />} />
                <Route path=":workspaceId" element={<WorkspaceDetail />}>
                    {/* Project Routes within Workspace are also correctly nested, keep them */}
                    <Route path="projects">
                        <Route path=":projectId" element={<ProjectDetail />} />
                        <Route path=":projectId/board" element={<TaskBoard />} />
                        <Route path=":projectId/settings" element={<ProjectSettings />} />
                        <Route path=":projectId/tasks/create" element={<CreateTask />} />
                    </Route>
                    {/* Chat Routes within Workspace are also correctly nested, keep them */}
                    <Route path="chat" element={<ChatWindow />} />
                </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
