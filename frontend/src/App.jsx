import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Super Admin Pages
import SuperAdminOverview from './pages/superAdmin/SuperAdminOverview';
import UserManagement from './pages/superAdmin/UserManagement';
import AdmissionOverview from './pages/superAdmin/AdmissionOverview';
import FeeManagementOverview from './pages/superAdmin/FeeManagementOverview';
import LeaveApprovals from './pages/superAdmin/LeaveApprovals';
import PayrollManagement from './pages/superAdmin/PayrollManagement';
import AuditLogs from './pages/superAdmin/AuditLogs';

// Admission Cell Pages
import AdmissionDashboard from './pages/admissionCell/AdmissionDashboard';
import NewAdmission from './pages/admissionCell/NewAdmission';
import StudentManagement from './pages/admissionCell/StudentManagement';
import CourseConfigView from './pages/admissionCell/CourseConfigView';

// Fee Operation Pages
import FeeOperationDashboard from './pages/feeOperation/FeeOperationDashboard';
import OfflineCollection from './pages/feeOperation/OfflineCollection';
import FeeStructures from './pages/feeOperation/FeeStructures';
import ScholarshipsAndFines from './pages/feeOperation/ScholarshipsAndFines';
import TransactionHistory from './pages/feeOperation/TransactionHistory';
import FeeReports from './pages/feeOperation/FeeReports';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyFeeSchedule from './pages/student/MyFeeSchedule';
import OnlinePayment from './pages/student/OnlinePayment';
import PaymentReceipts from './pages/student/PaymentReceipts';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import SubmitLeave from './pages/teacher/SubmitLeave';
import LeaveHistory from './pages/teacher/LeaveHistory';
import MySalaryPayslips from './pages/teacher/MySalaryPayslips';

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to assigned role home
    const roleRoutes = {
      SUPER_ADMIN: '/super-admin',
      ADMISSION_CELL: '/admission-cell',
      FEE_OPERATION: '/fee-operation',
      STUDENT: '/student',
      TEACHER: '/teacher',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleRoutes = {
    SUPER_ADMIN: '/super-admin',
    ADMISSION_CELL: '/admission-cell',
    FEE_OPERATION: '/fee-operation',
    STUDENT: '/student',
    TEACHER: '/teacher',
  };

  return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="admissions" element={<AdmissionOverview />} />
            <Route path="fees" element={<FeeManagementOverview />} />
            <Route path="leaves" element={<LeaveApprovals />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>

          {/* Admission Cell Routes */}
          <Route
            path="/admission-cell"
            element={
              <ProtectedRoute allowedRoles={['ADMISSION_CELL', 'SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdmissionDashboard />} />
            <Route path="new" element={<NewAdmission />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="courses" element={<CourseConfigView />} />
          </Route>

          {/* Fee Operation Routes */}
          <Route
            path="/fee-operation"
            element={
              <ProtectedRoute allowedRoles={['FEE_OPERATION', 'SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FeeOperationDashboard />} />
            <Route path="collect" element={<OfflineCollection />} />
            <Route path="structures" element={<FeeStructures />} />
            <Route path="concessions" element={<ScholarshipsAndFines />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="reports" element={<FeeReports />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="schedule" element={<MyFeeSchedule />} />
            <Route path="pay" element={<OnlinePayment />} />
            <Route path="receipts" element={<PaymentReceipts />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="apply-leave" element={<SubmitLeave />} />
            <Route path="leaves" element={<LeaveHistory />} />
            <Route path="payslips" element={<MySalaryPayslips />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
