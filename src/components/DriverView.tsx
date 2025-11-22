import React, { useState } from 'react';
import { Ambulance, AmbulanceStatus } from '../types';
// FIX: Import AnimatePresence from framer-motion.
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface DriverViewProps {
  ambulances: Ambulance[];
  setAmbulances: React.Dispatch<React.SetStateAction<Ambulance[]>>;
}

const DriverView: React.FC<DriverViewProps> = ({ ambulances, setAmbulances }) => {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string | null>(null);

  const selectedAmbulance = ambulances.find(a => a.id === selectedAmbulanceId);

  const handleStatusUpdate = (newStatus: AmbulanceStatus) => {
    if (!selectedAmbulanceId) return;
    setAmbulances(prev =>
      prev.map(amb =>
        amb.id === selectedAmbulanceId ? { ...amb, status: newStatus } : amb
      )
    );
  };
  
  const statusOptions: AmbulanceStatus[] = [
    AmbulanceStatus.Available,
    AmbulanceStatus.Busy,
    AmbulanceStatus.AtHospital,
  ];
  
  const getStatusColorClasses = (status: AmbulanceStatus) => {
    switch(status) {
        case AmbulanceStatus.Available: return 'bg-status-available text-background shadow-status-available/30';
        case AmbulanceStatus.Busy: return 'bg-status-busy text-background shadow-status-busy/30';
        case AmbulanceStatus.AtHospital: return 'bg-status-athospital text-white shadow-status-athospital/30';
        default: return 'bg-muted/80';
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-2xl mx-auto bg-background-light rounded-xl shadow-2xl p-6 lg:p-8 border border-primary/20 shadow-glow-primary"
    >
      <h2 className="text-3xl font-bold text-center text-primary mb-6 text-shadow-glow-primary">Driver Mode</h2>
      
      <div className="mb-6">
        <label htmlFor="ambulance-select" className="block text-lg font-medium text-muted mb-2">Select Your Vehicle</label>
        <select
          id="ambulance-select"
          value={selectedAmbulanceId ?? ''}
          onChange={(e) => setSelectedAmbulanceId(e.target.value)}
          className="w-full bg-background border border-primary/30 rounded-lg p-3 text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>-- Select Ambulance ID --</option>
          {ambulances.map(amb => (
            <option key={amb.id} value={amb.id}>{amb.id}</option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {selectedAmbulance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/50 p-6 rounded-lg overflow-hidden"
          >
            <h3 className="text-xl font-semibold text-center text-white mb-2">Current Status for <span className="font-mono text-primary">{selectedAmbulance.id}</span></h3>
            <p className="text-center text-2xl font-bold text-primary mb-6">{selectedAmbulance.status}</p>
            
            <h4 className="text-lg font-medium text-center text-muted mb-4">Update Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statusOptions.map(status => (
                   <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={selectedAmbulance.status === status}
                      className={clsx(
                        'w-full font-bold py-4 px-4 rounded-lg shadow-lg transform transition-transform focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
                         getStatusColorClasses(status),
                         selectedAmbulance.status !== status ? 'hover:scale-105 hover:opacity-90' : ''
                      )}
                   >
                      {status}
                  </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DriverView;