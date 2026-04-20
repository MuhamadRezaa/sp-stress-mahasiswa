import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import PADashboard from "./pages/Dashboard/PADashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAssignPA from "./pages/admin/AdminAssignPA";
import AdminData from "./pages/admin/AdminData";
import AdminDataDetail from "./pages/admin/AdminDataDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import DataInputWizard from "./pages/student/DataInputWizard";
import History from "./pages/student/History";
import HistoryDetail from "./pages/student/HistoryDetail";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Layout utama — semua halaman yang butuh sidebar/header */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Home: redirect sesuai role */}
            <Route index path="/" element={<RoleRedirect />} />

            {/* Profile (semua role) */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* ── Student ── */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/input" element={
              <ProtectedRoute requiredRole="student">
                <DataInputWizard />
              </ProtectedRoute>
            } />
            <Route path="/student/history" element={
              <ProtectedRoute requiredRole="student">
                <History />
              </ProtectedRoute>
            } />
            <Route path="/student/history/:date" element={
              <ProtectedRoute requiredRole="student">
                <HistoryDetail />
              </ProtectedRoute>
            } />

            {/* ── Dosen PA ── */}
            <Route path="/pa" element={
              <ProtectedRoute requiredRole="pa">
                <PADashboard />
              </ProtectedRoute>
            } />

            {/* ── Admin ── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/assign-pa" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAssignPA />
              </ProtectedRoute>
            } />
            <Route path="/admin/data" element={
              <ProtectedRoute requiredRole="admin">
                <AdminData />
              </ProtectedRoute>
            } />
            <Route path="/admin/data/:studentId/:date" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDataDetail />
              </ProtectedRoute>
            } />
          </Route>

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
