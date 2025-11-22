import React, { useState, useMemo } from 'react';
import { Ambulance, Incident, AmbulanceStatus, IncidentPriority } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface DashboardProps {
    ambulances: Ambulance[];
    incidents: Incident[];
}

type SortKeyAmbulance = keyof Ambulance | null;
type SortKeyIncident = keyof Incident | null;
type SortDirection = 'asc' | 'desc';

const getStatusColor = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case AmbulanceStatus.EnRoute:
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    case AmbulanceStatus.Busy:
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case AmbulanceStatus.AtHospital:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getPriorityColor = (priority: IncidentPriority) => {
  switch (priority) {
    case IncidentPriority.Critical:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case IncidentPriority.High:
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case IncidentPriority.Medium:
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case IncidentPriority.Low:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const Dashboard: React.FC<DashboardProps> = ({ ambulances, incidents }) => {
    const [ambulanceFilter, setAmbulanceFilter] = useState<AmbulanceStatus | 'All'>('All');
    const [ambulanceSortKey, setAmbulanceSortKey] = useState<SortKeyAmbulance>('id');
    const [ambulanceSortDir, setAmbulanceSortDir] = useState<SortDirection>('asc');
    
    const [incidentFilter, setIncidentFilter] = useState<IncidentPriority | 'All'>('All');
    const [incidentSortKey, setIncidentSortKey] = useState<SortKeyIncident>('priority');
    const [incidentSortDir, setIncidentSortDir] = useState<SortDirection>('desc');

    const handleAmbulanceSort = (key: SortKeyAmbulance) => {
        if (ambulanceSortKey === key) setAmbulanceSortDir(ambulanceSortDir === 'asc' ? 'desc' : 'asc');
        else { setAmbulanceSortKey(key); setAmbulanceSortDir('asc'); }
    };

    const handleIncidentSort = (key: SortKeyIncident) => {
        if (incidentSortKey === key) setIncidentSortDir(incidentSortDir === 'asc' ? 'desc' : 'asc');
        else { setIncidentSortKey(key); setIncidentSortDir('desc'); }
    };

    const sortedAndFilteredAmbulances = useMemo(() => {
        let items = ambulanceFilter === 'All' ? [...ambulances] : ambulances.filter(a => a.status === ambulanceFilter);
        if (ambulanceSortKey) {
            items.sort((a, b) => {
                const valA = a[ambulanceSortKey]; const valB = b[ambulanceSortKey];
                if (valA < valB) return ambulanceSortDir === 'asc' ? -1 : 1;
                if (valA > valB) return ambulanceSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [ambulances, ambulanceFilter, ambulanceSortKey, ambulanceSortDir]);

    const priorityOrder: Record<IncidentPriority, number> = {
        [IncidentPriority.Critical]: 4, [IncidentPriority.High]: 3, [IncidentPriority.Medium]: 2, [IncidentPriority.Low]: 1,
    };

    const sortedAndFilteredIncidents = useMemo(() => {
        let items = incidentFilter === 'All' ? [...incidents] : incidents.filter(i => i.priority === incidentFilter);
        if (incidentSortKey) {
             items.sort((a, b) => {
                const valA = incidentSortKey === 'priority' ? priorityOrder[a.priority] : a[incidentSortKey];
                const valB = incidentSortKey === 'priority' ? priorityOrder[b.priority] : b[incidentSortKey];
                if (valA < valB) return incidentSortDir === 'asc' ? -1 : 1;
                if (valA > valB) return incidentSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [incidents, incidentFilter, incidentSortKey, incidentSortDir]);
    
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            {/* Ambulance Fleet Section */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">🚑 Fleet Status</h2>
                        <p className="text-gray-400 text-sm">{sortedAndFilteredAmbulances.length} units — MediRoute</p>
                    </div>
                    <select 
                      value={ambulanceFilter} 
                      onChange={(e) => setAmbulanceFilter(e.target.value as any)} 
                      className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="All">All Statuses</option>
                        {Object.values(AmbulanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <div className="grid gap-3">
                        {sortedAndFilteredAmbulances.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">No ambulances found</div>
                        ) : (
                          sortedAndFilteredAmbulances.map(amb => (
                            <motion.div 
                              key={amb.id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono font-bold text-white text-lg">{amb.id}</span>
                                    <span className={clsx('px-3 py-1 rounded-lg text-xs font-semibold border', getStatusColor(amb.status))}>
                                      {amb.status}
                                    </span>
                                    <span className="text-gray-400 text-sm">{amb.vehicleType}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    📍 {amb.location.lat.toFixed(4)}, {amb.location.lng.toFixed(4)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-400">Capacity</div>
                                  <div className="text-lg font-bold text-white">{amb.currentPatients}/{amb.capacity}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Incident Log Section */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">📋 Incident Log</h2>
                        <p className="text-gray-400 text-sm">{sortedAndFilteredIncidents.length} incidents</p>
                    </div>
                    <select 
                      value={incidentFilter} 
                      onChange={(e) => setIncidentFilter(e.target.value as any)} 
                      className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="All">All Priorities</option>
                        {Object.values(IncidentPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-3">
                    {sortedAndFilteredIncidents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No incidents</div>
                    ) : (
                      sortedAndFilteredIncidents.map(inc => (
                        <motion.div 
                          key={inc.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm text-gray-400">{inc.id}</span>
                                <span className={clsx('px-3 py-1 rounded-lg text-xs font-semibold border', getPriorityColor(inc.priority))}>
                                  {inc.priority}
                                </span>
                              </div>
                              <p className="text-white font-medium mb-2">{inc.description}</p>
                              <div className="text-xs text-gray-500">
                                📍 {inc.location.lat.toFixed(4)}, {inc.location.lng.toFixed(4)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 mb-1">Unit</div>
                              <div className="font-mono text-sm text-cyan-300">{inc.assignedAmbulanceId || '—'}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;