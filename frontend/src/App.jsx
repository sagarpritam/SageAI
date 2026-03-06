import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scans from './pages/Scans';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Plan from './pages/Plan';
import Settings from './pages/Settings';
import Schedules from './pages/Schedules';
import ForgotPassword from './pages/ForgotPassword';
import AutoFix from './pages/AutoFix';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('sageai_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scans" element={<Scans />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/autofix" element={<AutoFix />} />
          <Route path="/team" element={<Team />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

