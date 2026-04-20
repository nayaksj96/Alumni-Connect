
import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Calendar, Users } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
  >
    <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-dark-bg bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute top-0 left-0 -z-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Connect. Grow. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Relive.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            Join your exclusive alumni network. Reconnect with old friends, discover new opportunities, and stay in touch with your alma mater.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <Link to="/signup">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary rounded-full shadow-lg hover:bg-primary-hover transition-all duration-300 transform hover:scale-105">
                Join The Network <ArrowRight className="ml-2" />
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50 dark:bg-dark-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Why Join AlumniConnect?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                Unlock a world of possibilities and stay connected to the community that shaped you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Users size={24} />} 
                title="Alumni Directory" 
                description="Find and reconnect with classmates from any batch. Filter by name, year, major, or location." 
              />
              <FeatureCard 
                icon={<Briefcase size={24} />} 
                title="Job Board" 
                description="Explore career opportunities posted by fellow alumni and trusted partner companies." 
              />
              <FeatureCard 
                icon={<Calendar size={24} />} 
                title="Events & Meetups" 
                description="Stay updated on official reunions, local meetups, webinars, and other exclusive alumni events." 
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
