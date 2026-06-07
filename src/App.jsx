import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ChatBox from './components/ChatBox';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import Payment from './pages/Payment';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import SupportDashboard from './pages/SupportDashboard';

function Guard({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
  if (role === 'organizer' && !['admin', 'organizer'].includes(user.role)) return <Navigate to="/" replace />;
  if (role === 'support' && !['admin', 'support'].includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Guard><Payment /></Guard>} />
        <Route path="/my-tickets" element={<Guard><MyTickets /></Guard>} />
        <Route path="/profile" element={<Guard><Profile /></Guard>} />
        <Route path="/checkin" element={<Guard role="admin"><CheckIn /></Guard>} />
        <Route path="/organizer" element={<Guard role="organizer"><OrganizerDashboard /></Guard>} />
        <Route path="/events/create" element={<Guard role="organizer"><CreateEvent /></Guard>} />
        <Route path="/admin/*" element={<Guard role="admin"><AdminDashboard /></Guard>} />
        <Route path="/support" element={<Guard role="support"><SupportDashboard /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBox />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1510', color: '#faf7f2',
                border: '1px solid rgba(201,168,76,.3)',
                fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '13px',
              },
              success: { iconTheme: { primary: '#c9a84c', secondary: '#1a1510' } },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
