import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Commissions from './pages/Commissions';
import MLMTree from './pages/MLMTree';
import VipLevels from './pages/VipLevels';
import ReferralApprovals from './pages/ReferralApprovals';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="deposits" element={user ? <Deposits /> : <Navigate to="/login" />} />
        <Route path="withdrawals" element={user ? <Withdrawals /> : <Navigate to="/login" />} />
        <Route path="commissions" element={user ? <Commissions /> : <Navigate to="/login" />} />
        <Route path="mlm-tree" element={user ? <MLMTree /> : <Navigate to="/login" />} />
        <Route path="referral-approvals" element={user ? <ReferralApprovals /> : <Navigate to="/login" />} />
        <Route path="vip-levels" element={user ? <VipLevels /> : <Navigate to="/login" />} />
        
        {/* Admin Routes */}
        <Route path="admin" element={user?.role === 'admin' || user?.role === 'super_admin'  || user?.role === 'transaction_admin' ?<AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="admin/users" element={user?.role === 'super_admin' || user?.role === 'transaction_admin' ?<AdminUsers /> : <Navigate to="/dashboard" />} />
        <Route path="admin/transactions" element={ user?.role === 'super_admin' || user?.role === 'transaction_admin' ? <AdminTransactions /> : <Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
}

export default App;