import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { DEFAULT_CHAIN } from "./utils/thirdwebConfig";
import { client } from "./utils/thirdwebClient";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
import RoleAssignerLayout from "./components/layout/RoleAssignerLayout";
import "./App.css";
import { ToastContainer } from "react-toastify";
// Import your page components
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersManagement from "./pages/Admin/UserManagement/UsersManagement";
import UserDetails from "./pages/Admin/UserManagement/Userdetails"; // Add this import
import ContactManagement from "./pages/Admin/ContactManagement";
import Blog from "./pages/Blogs/Blog";
import Blogdetails from "./pages/Blogs/Blogdetails";
import BlogForm from "./pages/Blogs/BlogForm";
import BlogManagement from "./pages/Admin/BlogManagement";
import PoliceDashboard from "./pages/Police/PoliceDashboard";
import LawyerDashboard from "./pages/Lawyer/LawyerDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import ForensicDashboard from "./pages/Forensic/ForensicDashboard";
import Evidence from "./pages/Evidence";
import Cases from "./pages/Cases";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import SecurityPolicy from "./pages/legal/SecurityPolicy";
import LawPenal from "./pages/Lawyer/LawPenal"; // Import LawPenal component
import APIStatus from "./pages/Admin/APIStatus";
import DatabaseBackup from "./pages/Admin/DatabaseBackup/DatabaseBackup";
import ChatbotEnhanced from "./pages/Chatbot/ChatbotEnhanced";
import RoleRequestForm from "./pages/RoleRequestForm";
import RoleRequestManagement from "./pages/Admin/RoleRequestManagement";
import EvidenceVerification from "./pages/Admin/EvidenceVerification";
import RoleAssignerDashboard from "./pages/RoleAssigner/RoleAssignerDashboard";
import RoleAssignerRequests from "./pages/RoleAssigner/RoleAssignerRequests";
import RoleAssignerRequestDetail from "./pages/RoleAssigner/RoleAssignerRequestDetail";
import CaseFilingForm from "./pages/CaseFilingForm";
import CaseReport from "./pages/CaseReport";
import MyCases from "./pages/MyCases";
import PoliceEvidenceUploadIPFS from "./pages/Police/PoliceEvidenceUploadIPFS";
import PoliceCreateCase from "./pages/Police/PoliceCreateCase";
import PoliceCasesOnchain from "./pages/Police/PoliceCasesOnchain";
import ScrollTop from "./components/layout/ScrollTop";

// Protected Route Component

const ProtectedRoute = ({
  children,
  adminOnly = false,
  roleAssignerOnly = false,
}) => {
  const { isAuthenticated, user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!user || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (roleAssignerOnly && user?.role !== "role_assigner") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Smart Redirect Component for root route
const SmartRedirect = () => {
  const { isAuthenticated, user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (isAuthenticated && user) {
    const dashboardRoutes = {
      admin: "/admin-dashboard",
      police: "/police-dashboard",
      lawyer: "/lawyer-dashboard",
      judge: "/judge-dashboard",
      forensic_expert: "/forensic-dashboard",
      user: "/dashboard",
    };
    const redirectPath = dashboardRoutes[user.role] || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Navigate to="/login" replace />;
};

// Layout Component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 mt-16">{children}</main>
      <ScrollTop />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <Footer />
      <ChatbotEnhanced />
    </div>
  );
};

// Public Layout Component (without header/footer)
const PublicLayout = ({ children }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

// Placeholder components for missing admin pages
const AdminEvidence = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Evidence Monitor - Coming Soon</h1>
  </div>
);
const AdminReports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Reports & Analytics - Coming Soon</h1>
  </div>
);
const AdminSecurityAudit = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Security Audit - Coming Soon</h1>
  </div>
);
const AdminSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">System Settings - Coming Soon</h1>
  </div>
);
const AdminBackup = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Database Backup - Coming Soon</h1>
  </div>
);

function App() {
  return (
    <ThirdwebProvider client={client} supportedChains={[DEFAULT_CHAIN]}>
      <AuthProvider>
        <WalletProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <Login />
                  </PublicLayout>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicLayout>
                    <Register />
                  </PublicLayout>
                }
              />

              {/* Protected Routes with Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Dashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/police-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PoliceDashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/police/upload-evidence-ipfs"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PoliceEvidenceUploadIPFS />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/police/create-case"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PoliceCreateCase />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/police/cases-onchain"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PoliceCasesOnchain />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/lawyer-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <LawyerDashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/judge-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <JudgeDashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/forensic-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ForensicDashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/evidence"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Evidence />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cases"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Cases />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ContactUs />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <AboutUs />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Users />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Profile />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/security"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Security />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/role-request"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <RoleRequestForm />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Role Assigner Routes */}
              <Route
                path="/role-assigner/dashboard"
                element={
                  <ProtectedRoute roleAssignerOnly>
                    <RoleAssignerLayout>
                      <RoleAssignerDashboard />
                    </RoleAssignerLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/role-assigner/requests"
                element={
                  <ProtectedRoute roleAssignerOnly>
                    <RoleAssignerLayout>
                      <RoleAssignerRequests />
                    </RoleAssignerLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/role-assigner/requests/:id"
                element={
                  <ProtectedRoute roleAssignerOnly>
                    <RoleAssignerLayout>
                      <RoleAssignerRequestDetail />
                    </RoleAssignerLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/role-assigner/my-verifications"
                element={
                  <ProtectedRoute roleAssignerOnly>
                    <RoleAssignerLayout>
                      <RoleAssignerRequests />
                    </RoleAssignerLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/file-case"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <CaseFilingForm />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-cases"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <MyCases />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/case-report/:caseId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <CaseReport />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes with AdminLayout */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users-management"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <UsersManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Add the new UserDetails route */}
              <Route
                path="/admin/user-details/:userId"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <UserDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/contact-management"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <ContactManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/blog-management"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <BlogManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/api-status"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <APIStatus />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/backup"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <DatabaseBackup />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/role-requests"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <RoleRequestManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/evidence"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminEvidence />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/evidence-verification"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <EvidenceVerification />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReports />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/security"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminSecurityAudit />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/backup"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminBackup />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Legal Routes */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/security" element={<SecurityPolicy />} />

              {/* Default Redirect - Smart redirect based on auth status */}
              <Route path="/" element={<SmartRedirect />} />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <AuthenticatedLayout>
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                          404
                        </h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <a
                          href="/dashboard"
                          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Go to Dashboard
                        </a>
                      </div>
                    </div>
                  </AuthenticatedLayout>
                }
              />

              {/* Lawyer Specific Routes */}
              <Route
                path="/lawyer/law-penal"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <LawPenal />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Blog Routes - Public */}
              <Route
                path="/blog"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Blog />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <PublicLayout>
                    <Blogdetails />
                  </PublicLayout>
                }
              />

              {/* Blog Creation/Edit Routes - Protected */}
              <Route
                path="/blog/create"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BlogForm />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/blog/edit/:id"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BlogForm />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user/blogs"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BlogForm mode="manage" />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Blog Management Routes */}
              <Route
                path="/admin/blogs"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AuthenticatedLayout>
                      <BlogManagement />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/blogs/edit/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AuthenticatedLayout>
                      <BlogForm mode="admin" />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </ThirdwebProvider>
  );
}

export default App;
