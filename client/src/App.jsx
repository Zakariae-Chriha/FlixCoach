import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Training from './pages/Training';
import Nutrition from './pages/Nutrition';
import FoodLog from './pages/FoodLog';
import Sleep from './pages/Sleep';
import Mental from './pages/Mental';
import Progress from './pages/Progress';
import Reports from './pages/Reports';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import CoachApply from './pages/CoachApply';
import AdminDashboard from './pages/AdminDashboard';
import CoachSecretary from './pages/CoachSecretary';
import CoachDashboard from './pages/CoachDashboard';
import MyBookings from './pages/MyBookings';
import Community from './pages/Community';
import GroupActivities from './pages/GroupActivities';
import Pricing from './pages/Pricing';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CookieBanner from './components/CookieBanner';
import LoadingScreen from './components/LoadingScreen';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a27',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#d946ef', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
        }}
      />
      <CookieBanner />
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/coach/apply" element={<CoachApply />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="training" element={<Training />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="food-log" element={<FoodLog />} />
          <Route path="sleep" element={<Sleep />} />
          <Route path="mental" element={<Mental />} />
          <Route path="progress" element={<Progress />} />
          <Route path="reports" element={<Reports />} />
          <Route path="coaches" element={<Coaches />} />
          <Route path="coaches/:id" element={<CoachProfile />} />
          <Route path="coach-secretary" element={<CoachSecretary />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="coach-dashboard" element={<CoachDashboard />} />
          <Route path="community" element={<Community />} />
          <Route path="activities" element={<GroupActivities />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HelmetProvider>
  );
}
