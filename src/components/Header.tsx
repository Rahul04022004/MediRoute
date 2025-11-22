import React from 'react';
import { SteeringWheelIcon } from './icons/SteeringWheelIcon';
import { AmbulanceDispatchLogo } from './icons/AmbulanceDispatchLogo';
import { motion } from 'framer-motion';

interface HeaderProps {
  onLogout: () => void;
  onToggleMode: () => void;
  currentMode: 'dispatcher' | 'driver';
  onReportIncident?: () => void;
  onToggleSimulation?: () => void;
  isSimulationRunning?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onToggleMode, currentMode, onReportIncident, onToggleSimulation, isSimulationRunning }) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-black/40 backdrop-blur-md sticky top-0 z-50 border-b border-white/5"
    >
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
        >
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20 transform transition-transform hover:scale-110">
                <AmbulanceDispatchLogo className="text-white" size="sm" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight">
                MediRoute
              </h1>
              <p className="text-xs text-gray-400 font-medium">Smart Ambulance Dispatch</p>
            </div>
        </motion.div>
        <div className="flex items-center space-x-3">
          {currentMode === 'dispatcher' && onToggleSimulation && (
            <motion.button 
              onClick={onToggleSimulation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 font-semibold py-2.5 px-5 rounded-lg text-sm transition-all border focus:outline-none focus:ring-2 ${
                isSimulationRunning 
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border-purple-500/30 hover:border-purple-500/50 focus:ring-purple-500/30' 
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20 focus:ring-cyan-400/50'
              }`}
              aria-label="Toggle simulation"
            >
              <span>{isSimulationRunning ? '▶️' : '⏸️'}</span>
              <span className="hidden sm:inline">Demo</span>
            </motion.button>
          )}
          {currentMode === 'dispatcher' && onReportIncident && (
            <motion.button 
              onClick={onReportIncident}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-semibold py-2.5 px-5 rounded-lg text-sm transition-all border border-red-500/30 hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/30 shadow-md shadow-red-500/10"
              aria-label="Report new incident"
            >
              <span>🚨</span>
              <span>New Incident</span>
            </motion.button>
          )}
          <motion.button 
            onClick={onToggleMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            aria-label={`Switch to ${currentMode === 'dispatcher' ? 'Driver' : 'Dispatcher'} View`}
          >
            <SteeringWheelIcon className="w-5 h-5" />
            <span className="hidden sm:inline">
              {currentMode === 'dispatcher' ? 'Driver' : 'Dispatch'} View
            </span>
          </motion.button>
          <motion.button 
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400/30"
          >
            Sign Out
          </motion.button>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </motion.header>
  );
};

export default Header;