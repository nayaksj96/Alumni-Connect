import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader, GraduationCap, BookOpen } from 'lucide-react';

const dashboardPathForRole = (role) => {
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard';
};

const AuthPage = ({ isLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
    major: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const signupNotice = isLogin && location.state?.fromSignup;

  useEffect(() => {
    if (!isLogin) return;
    const email = location.state?.email;
    if (typeof email !== 'string' || !email) return;
    setFormData((prev) => ({ ...prev, email: prev.email || email }));
  }, [isLogin, location.state?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        graduationYear: Number(formData.graduationYear),
        branch: formData.major,
        major: formData.major,
        role: formData.role,
      });
    }

    if (!result.success) {
      setError(result.message || 'Authentication failed. Please check your credentials.');
      return;
    }

    if (isLogin) {
      const role = result.user?.role || 'student';
      navigate(dashboardPathForRole(role), { replace: true });
    } else {
      navigate('/login', {
        replace: true,
        state: {
          fromSignup: true,
          email: formData.email,
        },
      });
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 100 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-dark-bg bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ type: 'tween' }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isLogin ? 'Sign in to continue to your network.' : 'Join as a student or alumni.'}
            </p>
          </div>

          {signupNotice && (
            <div
              role="status"
              className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-800 dark:text-green-200"
            >
              Account created successfully. Sign in with your email and password to open your dashboard.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">I am joining as</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    name="graduationYear"
                    placeholder="Graduation Year"
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="major"
                    placeholder="Branch / Major (e.g., Computer Science)"
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 text-white font-semibold bg-primary rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" /> : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <Link to={isLogin ? '/signup' : '/login'} className="font-medium text-primary hover:underline ml-1">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
