import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DataInputWizard from "./pages/student/DataInputWizard";
import History from "./pages/student/History";
import HistoryDetail from "./pages/student/HistoryDetail";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - Protected */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<StudentDashboard />} />

            {/* Profile */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* Student Pages */}
            <Route path="/student/input" element={<DataInputWizard />} />
            <Route path="/student/history" element={<History />} />
            <Route path="/student/history/:date" element={<HistoryDetail />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Redirect /login to /signin */}
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
