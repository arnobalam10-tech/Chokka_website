import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Loginl.jsx';

// Security Guard: Checks if you have the secret key
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 1. Public Website */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. Protected Admin Panel */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;