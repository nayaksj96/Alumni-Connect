
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            AlumniConnect
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-300">Welcome, {user.name.split(' ')[0]}!</span>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Dashboard
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout} 
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover transition-colors">
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
       {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card pb-4">
            {user ? (
                <div className="px-4 flex flex-col items-center space-y-4">
                    <span className="text-gray-600 dark:text-gray-300">Welcome, {user.name.split(' ')[0]}!</span>
                    <Link to="/dashboard" className="text-sm font-medium text-primary" onClick={() => setIsMenuOpen(false)}>
                      Go to dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex justify-center items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover transition-colors">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            ) : (
                <div className="px-4 flex flex-col space-y-2">
                    <Link to="/login" className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Sign In</Link>
                    <Link to="/signup" className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover transition-colors">Sign Up</Link>
                </div>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
