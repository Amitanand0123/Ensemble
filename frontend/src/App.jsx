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

// BrowserRouter (aliased as Router): Enables client-side routing using HTML5 history API.
// Routes: A wrapper that holds all <Route> elements.
// Route: Defines individual route paths and their corresponding components.
// Navigate: Used for programmatic redirects.

const App = () => {
  return (
    <Router> {/* Main component wrapped in a Router to enable client-side routing. */}
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            {/* --- Public Routes ---: These routes are accessible to everyone (unauthenticated users too). */}
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


// const App = () => (
//   <Router>
//     <div className="min-h-screen bg-gray-900 text-white">
//       <Navbar />
//       <main className="flex-grow pt-20">
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="login" element={<Login />} />
//           <Route path="register" element={<Registration />} />
//           <Route path="verify-email" element={<VerifyEmail />} />
//           <Route path="forgot-password" element={<ForgotPassword />} />
//           <Route path="reset-password/:token" element={<ResetPassword />} />
//           <Route path="auth/callback" element={<AuthCallback />} />

//           {/* Protected (all child routes require auth) */}
//           <Route element={<ProtectedRoute />}>
//             <Route path="dashboard" element={<WorkspaceDashboard />} />

//             {/* Admin-only under Protected */}
//             <Route element={<AdminRoute />}>
//               <Route path="workspaces/create" element={<CreateWorkspace />} />
//               <Route path="admin/users" element={<AdminUserList />} />
//             </Route>

//             <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
//             <Route path="workspaces/:workspaceId/projects/:projectId" element={<ProjectDetail />} />
//             <Route path="profile/:userId" element={<UserProfile />} />
//           </Route>

//           {/* Redirects & catch-all */}
//           <Route path="workspaces" element={<Navigate to="/dashboard" replace />} />
//           <Route path="profile" element={<Navigate to="/profile/me" replace />} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>
//       <Footer />
//       <ChatbotButton />
//       <GlobalChatHandler />
//     </div>
//   </Router>
// );

// export default App;
