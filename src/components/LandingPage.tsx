import React, { useState } from 'react';
import { MapPinIcon } from './icons/MapPinIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onLogin: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -8 }}
        className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center transition-all hover:bg-white/8 hover:border-primary/30"
    >
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="text-primary mb-5 bg-primary/10 p-4 rounded-xl"
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-3 leading-tight">{title}</h3>
        <p className="text-gray-300 text-base leading-relaxed">{children}</p>
    </motion.div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && password.trim()) onLogin();
        else setError('Please enter operator credentials.');
    };

    return (
        <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] bg-[length:200%_200%] animate-background-pan -z-10"></div>
            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-16">
                     <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
                        className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-400/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight"
                    >
                      MediRoute
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                    >
                      Intelligent ambulance routing and dispatch powered by AI. Fast response. Smart decisions. Lives saved.
                    </motion.p>
                </header>

                <main>
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <FeatureCard icon={<MapPinIcon className="w-8 h-8" />} title="Live Fleet Tracking" delay={0.4}>
                            See all ambulances in real-time. Know exactly where your team is and where they're headed.
                        </FeatureCard>
                        <FeatureCard icon={<BrainCircuitIcon className="w-8 h-8" />} title="Smart Dispatch" delay={0.5}>
                            AI analyzes incidents and recommends the best ambulance. Save precious minutes.
                        </FeatureCard>
                        <FeatureCard icon={<ChartBarIcon className="w-8 h-8" />} title="Performance Insights" delay={0.6}>
                            Track response times, utilization rates, and critical metrics that matter.
                        </FeatureCard>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="max-w-md mx-auto bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/10"
                    >
                        <h2 className="text-3xl font-bold text-white mb-2 text-center">Sign In</h2>
                        <p className="text-gray-400 text-center mb-8 text-sm">Enter your operator credentials</p>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <input 
                                  type="email" 
                                  id="email" 
                                  value={email} 
                                  onChange={(e) => { setEmail(e.target.value); setError(''); }} 
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" 
                                  placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <input 
                                  type="password" 
                                  id="password" 
                                  value={password} 
                                  onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" 
                                  placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
                            <motion.button 
                              type="submit"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
                            >
                                Access System
                            </motion.button>
                        </form>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;