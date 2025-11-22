import React from 'react';
import { Ambulance, AmbulanceStatus } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AmbulanceListProps {
  ambulances: Ambulance[];
}

const getStatusColor = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', dot: 'bg-green-500' };
    case AmbulanceStatus.EnRoute:
      return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-500' };
    case AmbulanceStatus.Busy:
      return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-300', dot: 'bg-orange-500' };
    case AmbulanceStatus.AtHospital:
      return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-500' };
    default:
      return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300', dot: 'bg-gray-500' };
  }
};

const AmbulanceItem: React.FC<{ ambulance: Ambulance }> = ({ ambulance }) => {
  const statusColor = getStatusColor(ambulance.status);
  const capacityPercentage = (ambulance.currentPatients / ambulance.capacity) * 100;
  const isOccupied = ambulance.status === AmbulanceStatus.Busy && ambulance.destination; // Has patient, heading to hospital
  
  const statusIcons: Record<AmbulanceStatus, string> = {
    [AmbulanceStatus.Available]: '✓',
    [AmbulanceStatus.EnRoute]: '→',
    [AmbulanceStatus.Busy]: '⚡',
    [AmbulanceStatus.AtHospital]: '🏥',
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className={clsx('p-4 rounded-xl border-2 transition-all', statusColor.bg, statusColor.border, 'hover:border-opacity-100 hover:bg-opacity-40')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center font-bold', statusColor.bg, statusColor.border, 'border-2')}>
            {statusIcons[ambulance.status]}
          </div>
          <div className="flex-1">
            <p className="font-mono font-bold text-white">{ambulance.id}</p>
            <p className="text-xs text-gray-400">{ambulance.vehicleType}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={clsx('px-3 py-1 rounded-lg text-xs font-semibold border', statusColor.bg, statusColor.border, statusColor.text)}>
            {ambulance.status}
          </span>
          {isOccupied && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/30 border border-red-500/50 text-red-300 animate-pulse">
              🚨 Occupied
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Capacity</span>
            <span className="text-xs text-gray-300 font-mono">{ambulance.currentPatients}/{ambulance.capacity}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercentage}%` }}
              className={clsx('h-full transition-all', statusColor.dot === 'bg-green-500' ? 'bg-green-500' : statusColor.dot === 'bg-cyan-500' ? 'bg-cyan-500' : statusColor.dot === 'bg-orange-500' ? 'bg-orange-500' : 'bg-blue-500')}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">📍 {ambulance.location.lat.toFixed(3)}, {ambulance.location.lng.toFixed(3)}</p>
      </div>
    </motion.div>
  );
};

const AmbulanceList: React.FC<AmbulanceListProps> = ({ ambulances }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">
        🚑 Fleet ({ambulances.length})
      </h2>
      <div className="max-h-96 overflow-y-auto pr-2 -mr-2 space-y-3">
        <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
          {ambulances.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No ambulances</div>
          ) : (
            ambulances.map(ambulance => (
              <AmbulanceItem key={ambulance.id} ambulance={ambulance} />
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AmbulanceList;