import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { TaskProvider } from './contexts/TaskContext';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <TaskProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <HomePage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
          <ToastContainer position="top-right" autoClose={3000} />
        </TaskProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
