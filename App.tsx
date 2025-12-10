import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, DataProvider, ToastProvider, useAuth } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Estimator from './pages/Estimator';
import InvoicePreview from './pages/InvoicePreview';
import ToastContainer from './components/Toast';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/estimator" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          {/* Admin Only */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Inventory />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Access */}
          <Route 
            path="/estimator" 
            element={
              <ProtectedRoute>
                <Estimator />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Full Screen View for Print */}
        <Route 
          path="/preview" 
          element={
            <ProtectedRoute>
              <InvoicePreview />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;