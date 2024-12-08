import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import HealthRecords from './pages/HealthRecords';
import QueueTracking from './pages/QueueTracking';
import Chat from './pages/Chat';
import SymptomChecker from './pages/SymptomChecker';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" /> : <Register />
      } />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/appointments" element={
        <PrivateRoute>
          <Layout>
            <Appointments />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/prescriptions" element={
        <PrivateRoute>
          <Layout>
            <Prescriptions />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/health-records" element={
        <PrivateRoute>
          <Layout>
            <HealthRecords />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/queue" element={
        <PrivateRoute>
          <Layout>
            <QueueTracking />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/chat" element={
        <PrivateRoute>
          <Layout>
            <Chat />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/symptom-checker" element={
        <PrivateRoute>
          <Layout>
            <SymptomChecker />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;