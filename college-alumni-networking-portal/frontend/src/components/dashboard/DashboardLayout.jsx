import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Briefcase,
  Calendar,
  Home,
  LogOut,
  MessageSquare,
  Users,
  Menu,
  Shield,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const linkClass = ({ isActive }) =>
  `flex items-center p-3 my-1 rounded-lg transition-colors ${
    isActive ? 'bg-primary/20 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
  }`;

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarSrc =
    user?.profileImage ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email || 'user')}`;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card p-4 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          AlumniConnect
        </h1>
      </div>
      <nav className="flex-1">
        <NavLink to="/dashboard" end className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <Home size={20} />
          <span className="ml-4 font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/directory" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <Users size={20} />
          <span className="ml-4 font-medium">Directory</span>
        </NavLink>
        <NavLink to="/dashboard/jobs" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <Briefcase size={20} />
          <span className="ml-4 font-medium">Jobs</span>
        </NavLink>
        <NavLink to="/dashboard/events" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <Calendar size={20} />
          <span className="ml-4 font-medium">Events</span>
        </NavLink>
        <NavLink to="/dashboard/messages" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <MessageSquare size={20} />
          <span className="ml-4 font-medium">Messages</span>
        </NavLink>
        <NavLink to="/dashboard/profile" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
          <UserCircle size={20} />
          <span className="ml-4 font-medium">Profile</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/dashboard/admin" className={linkClass} onClick={() => setIsSidebarOpen(false)}>
            <Shield size={20} />
            <span className="ml-4 font-medium">Admin</span>
          </NavLink>
        )}
      </nav>
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center p-3 my-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-4 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  const title =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'alumni'
        ? 'Alumni'
        : 'Student';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-0 z-40 w-64 lg:hidden"
            >
              <Sidebar />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex-shrink-0">
          <button type="button" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold hidden sm:block">{title} workspace</h1>
          <div className="flex items-center space-x-4">
            <Bell size={20} className="text-gray-500 dark:text-gray-400" />
            <div className="flex items-center space-x-2">
              <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-medium hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
