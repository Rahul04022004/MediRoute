import React from 'react';
import { AmbulanceStatus, IncidentPriority, VehicleType } from '../types';
import { motion } from 'framer-motion';

interface FilterBarProps {
  incidentPriorityFilter: IncidentPriority | 'all';
  setIncidentPriorityFilter: (priority: IncidentPriority | 'all') => void;
  ambulanceStatusFilter: AmbulanceStatus | 'all';
  setAmbulanceStatusFilter: (status: AmbulanceStatus | 'all') => void;
  vehicleTypeFilter: VehicleType | 'all';
  setVehicleTypeFilter: (type: VehicleType | 'all') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  incidentPriorityFilter,
  setIncidentPriorityFilter,
  ambulanceStatusFilter,
  setAmbulanceStatusFilter,
  vehicleTypeFilter,
  setVehicleTypeFilter,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
      {/* Incident Priority Filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🚨</span>
          <label className="text-sm font-bold text-white uppercase tracking-wide">Priority</label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIncidentPriorityFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              incidentPriorityFilter === 'all'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            All
          </motion.button>
          {[IncidentPriority.Critical, IncidentPriority.High, IncidentPriority.Medium, IncidentPriority.Low].map(
            (priority) => (
              <motion.button
                key={priority}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIncidentPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  incidentPriorityFilter === priority
                    ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {priority}
              </motion.button>
            )
          )}
        </div>
      </div>

      {/* Ambulance Status Filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🚑</span>
          <label className="text-sm font-bold text-white uppercase tracking-wide">Status</label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmbulanceStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              ambulanceStatusFilter === 'all'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            All
          </motion.button>
          {[AmbulanceStatus.Available, AmbulanceStatus.EnRoute, AmbulanceStatus.Busy, AmbulanceStatus.AtHospital].map(
            (status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAmbulanceStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  ambulanceStatusFilter === status
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {status}
              </motion.button>
            )
          )}
        </div>
      </div>

      {/* Vehicle Type Filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏥</span>
          <label className="text-sm font-bold text-white uppercase tracking-wide">Type</label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVehicleTypeFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              vehicleTypeFilter === 'all'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            All
          </motion.button>
          {[VehicleType.ALS, VehicleType.BLS].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVehicleTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                vehicleTypeFilter === type
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
