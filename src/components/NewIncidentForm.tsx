import React, { useState } from 'react';
import { IncidentPriority, Location } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface NewIncidentFormProps {
  onSubmit: (description: string, priority: IncidentPriority, location: Location) => void;
  onClose: () => void;
  isLoading: boolean;
  incidentLocation: Location;
}

const NewIncidentForm: React.FC<NewIncidentFormProps> = ({ onSubmit, onClose, isLoading, incidentLocation }) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>(IncidentPriority.Medium);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description, priority, incidentLocation);
    }
  };

  const getPriorityColor = (p: IncidentPriority) => {
    switch (p) {
      case IncidentPriority.Critical:
        return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', activeBg: 'bg-red-500/40 border-red-500' };
      case IncidentPriority.High:
        return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', activeBg: 'bg-orange-500/40 border-orange-500' };
      case IncidentPriority.Medium:
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', activeBg: 'bg-yellow-500/40 border-yellow-500' };
      case IncidentPriority.Low:
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', activeBg: 'bg-blue-500/40 border-blue-500' };
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', activeBg: 'bg-gray-500/40 border-gray-500' };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl w-full max-w-md border border-white/20 shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">📍 Report New Incident</h2>
            <p className="text-xs text-gray-400 mt-1">Provide details for AI dispatch</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Location Display */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-1">Selected Location</label>
              <p className="font-mono text-sm text-white">
                {incidentLocation.lat.toFixed(6)}, {incidentLocation.lng.toFixed(6)}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">Incident Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="e.g., Multi-vehicle collision, cardiac event, traffic accident"
                required
                autoFocus
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Priority Level</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(IncidentPriority).map(p => {
                  const colors = getPriorityColor(p);
                  const isActive = priority === p;
                  return (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={clsx(
                        'px-3 py-2.5 text-sm font-semibold rounded-lg transition-all border',
                        isActive
                          ? `${colors.activeBg} text-white`
                          : `${colors.bg} border-white/20 ${colors.text} hover:border-white/40`
                      )}
                    >
                      {p}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white/5 px-6 py-4 flex justify-end items-center gap-3 rounded-b-xl border-t border-white/10">
            <motion.button 
              type="button" 
              onClick={onClose} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all" 
              disabled={isLoading}
            >
              Cancel
            </motion.button>
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
              disabled={isLoading}
            >
              {isLoading ? '⏳ Dispatching...' : '🚀 Dispatch'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewIncidentForm;