import React, { useState } from 'react';
import { Incident, IncidentPriority, IncidentStatus } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface IncidentHistoryProps {
  incidents: Incident[];
}

const getPriorityColor = (priority: IncidentPriority) => {
  switch (priority) {
    case IncidentPriority.Critical:
      return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' };
    case IncidentPriority.High:
      return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' };
    case IncidentPriority.Medium:
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' };
    case IncidentPriority.Low:
      return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' };
    default:
      return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', dot: 'bg-gray-500' };
  }
};

const getStatusColor = (status: IncidentStatus) => {
  switch (status) {
    case IncidentStatus.Pending:
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300', badge: 'bg-yellow-500/40' };
    case IncidentStatus.Dispatched:
      return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/40' };
    case IncidentStatus.OnScene:
      return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-300', badge: 'bg-orange-500/40' };
    case IncidentStatus.Resolved:
      return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', badge: 'bg-green-500/40' };
    case IncidentStatus.Archived:
      return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300', badge: 'bg-gray-500/40' };
    default:
      return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300', badge: 'bg-gray-500/40' };
  }
};

const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const IncidentHistory: React.FC<IncidentHistoryProps> = ({ incidents }) => {
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');

  const filteredIncidents = incidents.filter(inc => 
    filter === 'all' ? inc.status !== IncidentStatus.Archived : inc.status === filter
  );

  const archivedIncidents = incidents.filter(inc => inc.status === IncidentStatus.Archived);

  const formatDuration = (createdAt: number, resolvedAt?: number) => {
    const end = resolvedAt || Date.now();
    const durationMs = end - createdAt;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', IncidentStatus.Pending, IncidentStatus.Dispatched, IncidentStatus.OnScene, IncidentStatus.Resolved].map(status => {
          const isAll = status === 'all';
          const isActive = filter === status;
          const colors = isAll ? null : getStatusColor(status as IncidentStatus);
          
          return (
            <motion.button
              key={status}
              onClick={() => setFilter(status as IncidentStatus | 'all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold transition-all border',
                isActive && colors ? colors.text : 'text-gray-400 hover:text-white',
                isActive && colors ? `${colors.bg} ${colors.border}` : 'hover:bg-white/5 border-white/10'
              )}
            >
              {isAll ? 'All Active' : status}
            </motion.button>
          );
        })}
      </div>

      {/* Incidents List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">📭</div>
            <p>No incidents</p>
          </div>
        ) : (
          filteredIncidents.map((incident, idx) => {
            const priorityColor = getPriorityColor(incident.priority);
            const statusColor = getStatusColor(incident.status);
            
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={clsx(
                  'border rounded-lg p-3 backdrop-blur-sm transition-all cursor-pointer',
                  statusColor.bg,
                  statusColor.border
                )}
              >
                {/* Header: ID + Priority + Status */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', priorityColor.dot)}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-bold text-white truncate">
                        {incident.id}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getRelativeTime(incident.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', priorityColor.text, priorityColor.bg, priorityColor.border, 'border')}>
                      {incident.priority}
                    </span>
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', statusColor.text, statusColor.badge)}>
                      {incident.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-white/90 mb-2 line-clamp-2 break-words">
                  {incident.description}
                </p>

                {/* Details Row */}
                <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                  <div className="flex gap-3 flex-wrap">
                    {incident.assignedAmbulanceId && (
                      <div className="flex items-center gap-1">
                        <span>🚑</span>
                        <span className="font-mono">{incident.assignedAmbulanceId}</span>
                      </div>
                    )}
                    {incident.etaMinutes !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{incident.etaMinutes} min</span>
                      </div>
                    )}
                  </div>
                  {incident.status === IncidentStatus.Resolved && incident.resolvedAt && (
                    <span className="text-green-400 font-semibold">
                      {formatDuration(incident.createdAt, incident.resolvedAt)}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Archived Section */}
      {archivedIncidents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            📦 Archived ({archivedIncidents.length})
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {archivedIncidents.slice(0, 10).map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/5 rounded px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono">{incident.id}</span>
                  <span className="text-gray-500">{getRelativeTime(incident.createdAt)}</span>
                </div>
              </motion.div>
            ))}
            {archivedIncidents.length > 10 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{archivedIncidents.length - 10} more archived
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentHistory;
